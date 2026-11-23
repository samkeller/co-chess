import { Game } from '@co-chess/core';
import { registry } from '@co-chess/bots';
import { beforeAll, expect, test } from 'vitest';
import type { FromWorker, ToWorker } from './protocol.ts';
import { WorkerBotPlayer } from './worker-bot-player.ts';

/**
 * Un faux Worker branché sur le VRAI code du Worker (bot.worker.ts). Chaque message est copié
 * avec structuredClone, comme entre deux fils : le protocole est vérifié de bout en bout.
 */
type WorkerScope = {
  onmessage: ((event: { data: ToWorker }) => void) | null;
  postMessage(message: FromWorker): void;
};

let scope: WorkerScope;
const terminated: FakeWorker[] = [];

class FakeWorker {
  onmessage: ((event: { data: FromWorker }) => void) | null = null;
  onerror = null;
  private alive = true;

  constructor() {
    scope.postMessage = (message) => {
      if (this.alive) queueMicrotask(() => this.onmessage?.({ data: structuredClone(message) }));
    };
  }

  postMessage(message: ToWorker) {
    if (this.alive) queueMicrotask(() => scope.onmessage?.({ data: structuredClone(message) }));
  }

  terminate() {
    this.alive = false;
    terminated.push(this);
  }
}

beforeAll(async () => {
  scope = { onmessage: null, postMessage: () => {} };
  (globalThis as unknown as { self: WorkerScope }).self = scope;
  await import('./bot.worker.ts');
});

const workerPlayer = (name: string) => {
  const preset = registry.presets.find((p) => p.name === name)!;
  return new WorkerBotPlayer(preset, () => new FakeWorker() as unknown as Worker);
};

// Un seul Bot passe par le Worker à la fois : le faux Worker partage le module bot.worker.ts,
// alors que chaque vrai Worker a le sien.
test('un Bot dans son Worker joue une Partie jusqu’au bout', async () => {
  const game = new Game({
    white: workerPlayer('Aléatoire'),
    black: registry.create(registry.presets[1]!),
    moveDelayMs: 0,
  });

  const result = await game.start();

  expect(['checkmate', 'draw']).toContain(result.kind);
  expect(game.getSnapshot().history.length).toBeGreaterThan(0);
});

test('abandonner la Partie coupe le Worker du Bot qui réfléchit', async () => {
  // Le Worker ne répondra jamais : son coup est perdu dans le vide.
  const silent = new WorkerBotPlayer(registry.presets[0]!, () => {
    const worker = new FakeWorker();
    worker.postMessage = (message: ToWorker) => {
      if (message.type === 'start')
        queueMicrotask(() => worker.onmessage?.({ data: { type: 'ready' } }));
    };
    return worker as unknown as Worker;
  });
  const game = new Game({
    white: silent,
    black: registry.create(registry.presets[1]!),
    moveTimeoutMs: null,
  });
  terminated.length = 0;

  const result = game.start();
  await new Promise((resolve) => setTimeout(resolve, 10));
  game.abort();

  expect(await result).toEqual({ kind: 'aborted' });
  expect(terminated.length).toBeGreaterThan(0);
});
