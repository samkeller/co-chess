import {
  dataOf,
  type GameResult,
  type GameView,
  type Move,
  type Player,
  type Preset,
  type Side,
} from '@co-chess/core';
import type { FromWorker, ToWorker } from './protocol.ts';

const createBotWorker = () =>
  new Worker(new URL('./bot.worker.ts', import.meta.url), { type: 'module', name: 'bot' });

/**
 * Un Bot qui tourne dans son propre Web Worker : l'interface reste fluide pendant qu'il réfléchit,
 * et on peut le couper net (`terminate`) quand son coup n'est plus attendu.
 */
export class WorkerBotPlayer implements Player {
  private readonly preset: Preset;
  private readonly worker: Worker;
  private pending: { resolve: (m: FromWorker) => void; reject: (e: Error) => void } | null = null;

  constructor(preset: Preset, createWorker: () => Worker = createBotWorker) {
    this.preset = preset;
    this.worker = createWorker();
    this.worker.onmessage = ({ data }: MessageEvent<FromWorker>) => this.settle(data);
    this.worker.onerror = (event) => {
      event.preventDefault();
      this.fail(new Error(event.message || 'Erreur dans le Worker du Bot.'));
    };
  }

  async onGameStart(game: GameView, side: Side): Promise<void> {
    const { algorithm, config } = this.preset;
    await this.request({ type: 'start', algorithm, config, game: dataOf(game), side });
  }

  async nextMove(game: GameView, signal?: AbortSignal): Promise<Move> {
    const onAbort = () => this.terminate(new Error('Coup annulé.'));
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      const reply = await this.request({ type: 'move', game: dataOf(game) });
      if (reply.type !== 'move') throw new Error(`Réponse inattendue du Worker : ${reply.type}`);
      return reply.move;
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }
  }

  onGameEnd(result: GameResult): void {
    this.worker.postMessage({ type: 'end', result } satisfies ToWorker);
    // Laisse au Bot le temps de traiter la fin, puis libère le Worker.
    setTimeout(() => this.terminate(new Error('Partie terminée.')), 1000);
  }

  private request(message: ToWorker): Promise<FromWorker> {
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      this.worker.postMessage(message);
    });
  }

  private settle(message: FromWorker): void {
    if (message.type === 'error') return this.fail(new Error(message.message));
    const pending = this.pending;
    this.pending = null;
    pending?.resolve(message);
  }

  private fail(error: Error): void {
    const pending = this.pending;
    this.pending = null;
    pending?.reject(error);
  }

  private terminate(reason: Error): void {
    this.worker.terminate();
    this.fail(reason);
  }
}
