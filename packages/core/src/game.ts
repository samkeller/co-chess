import { viewOf } from './game-view.ts';
import type { Player } from './player.ts';
import { Position } from './position.ts';
import type { GameResult, Move, Side } from './types.ts';

export interface GameOptions {
  white: Player;
  black: Player;
  /** Délai MINIMUM entre deux coups, pour suivre la Partie à l'œil. 0 en headless. */
  moveDelayMs?: number;
  /**
   * Temps limite pour fournir un coup, au-delà duquel le Joueur perd par Forfait. Un nombre pour
   * les deux Camps, ou une valeur par Camp ; `null` = pas de limite (typiquement l'Humain).
   */
  moveTimeoutMs?: number | null | Partial<Record<Side, number | null>>;
}

export const DEFAULT_MOVE_DELAY_MS = 500;
export const DEFAULT_MOVE_TIMEOUT_MS = 5000;

export type GameStatus = 'idle' | 'running' | 'paused' | 'over';

/** Instantané immuable de la Partie, pour l'UI (`useSyncExternalStore`) ou tout observateur. */
export interface GameSnapshot {
  readonly status: GameStatus;
  readonly fen: string;
  readonly turn: Side;
  /** Le Camp au trait est-il en échec ? */
  readonly inCheck: boolean;
  readonly history: readonly Move[];
  /** Les coups en notation algébrique standard, pour l'affichage. */
  readonly sanMoves: readonly string[];
  readonly lastMove: Move | null;
  readonly result: GameResult | null;
}

const other = (side: Side): Side => (side === 'white' ? 'black' : 'white');

/** Ce que la boucle obtient en demandant son coup à un Joueur. */
type Answer = { move: Move } | { forfeit: string } | { aborted: true };

/**
 * L'orchestrateur d'une Partie. Headless : il demande son coup au Joueur au trait, le fait
 * valider par le Moteur de règles, l'applique, respecte le délai de lecture et détecte la fin.
 * Il ne sait pas si un Joueur est un Humain ou un Bot.
 */
export class Game {
  private readonly position = Position.initial();
  private readonly players: Record<Side, Player>;
  private readonly timeouts: Record<Side, number | null>;
  private moveDelayMs: number;

  private snapshot: GameSnapshot;
  private readonly listeners = new Set<() => void>();

  private paused = false;
  private aborted = false;
  /** Le coup en cours de demande : annulé à l'abandon. */
  private pending: AbortController | null = null;
  /** Réveille la boucle quand elle attend (délai modifié, reprise, abandon). */
  private wake: (() => void) | null = null;

  constructor(options: GameOptions) {
    this.players = { white: options.white, black: options.black };
    this.moveDelayMs = options.moveDelayMs ?? DEFAULT_MOVE_DELAY_MS;
    this.timeouts = resolveTimeouts(options.moveTimeoutMs);
    this.snapshot = this.takeSnapshot('idle', null);
  }

  // --- Observation (compatible useSyncExternalStore : fonctions liées, instantané stable) ---

  getSnapshot = (): GameSnapshot => this.snapshot;

  /** S'abonner aux changements. Renvoie la fonction de désabonnement. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // --- Contrôles ---

  /** Lance la Partie. La promesse se résout avec le résultat quand elle se termine. */
  async start(): Promise<GameResult> {
    if (this.snapshot.status !== 'idle') throw new Error('La Partie a déjà été lancée.');
    this.update('running', null);
    const result = (await this.prepare()) ?? (await this.loop());
    this.update('over', result);
    await Promise.allSettled(
      [this.players.white, this.players.black].map(async (p) => p.onGameEnd?.(result)),
    );
    return result;
  }

  pause(): void {
    if (this.snapshot.status !== 'running') return;
    this.paused = true;
    this.update('paused', null);
  }

  resume(): void {
    if (this.snapshot.status !== 'paused') return;
    this.paused = false;
    this.update('running', null);
    this.wake?.();
  }

  /** Termine la Partie sans vainqueur et annule le coup attendu. */
  abort(): void {
    if (this.snapshot.status === 'over') return;
    this.aborted = true;
    this.pending?.abort();
    this.wake?.();
  }

  /** Change le délai minimum entre deux coups, y compris pour le coup en cours. */
  setMoveDelay(ms: number): void {
    this.moveDelayMs = Math.max(0, ms);
    this.wake?.();
  }

  // --- Boucle de jeu ---

  /** Prévient chaque Joueur du début de Partie. Un Joueur qui plante ici perd par Forfait. */
  private async prepare(): Promise<GameResult | null> {
    for (const side of ['white', 'black'] as const) {
      try {
        await this.players[side].onGameStart?.(viewOf(this.position.toData()), side);
      } catch (error) {
        return { kind: 'forfeit', winner: other(side), reason: crashReason(error) };
      }
    }
    return null;
  }

  private async loop(): Promise<GameResult> {
    for (;;) {
      const boardResult = this.position.result();
      if (boardResult) return boardResult;
      if (this.aborted) return { kind: 'aborted' };

      const side = this.position.turn;
      const askedAt = Date.now();
      const answer = await this.ask(side);
      await this.waitDelay(askedAt);
      while (this.paused && !this.aborted) await this.sleep(null);

      if (this.aborted || 'aborted' in answer) return { kind: 'aborted' };
      if ('forfeit' in answer)
        return { kind: 'forfeit', winner: other(side), reason: answer.forfeit };
      try {
        this.position.play(answer.move);
      } catch {
        const { from, to } = answer.move;
        return { kind: 'forfeit', winner: other(side), reason: `coup illégal : ${from}-${to}` };
      }
      if (!this.position.result()) this.update(this.snapshot.status, null);
    }
  }

  /** Demande son coup au Joueur de `side`, en appliquant son temps limite. */
  private async ask(side: Side): Promise<Answer> {
    const controller = new AbortController();
    this.pending = controller;
    const limit = this.timeouts[side];
    let timer: number | undefined;

    const timeout = new Promise<Answer>((resolve) => {
      if (limit !== null) {
        timer = setTimeout(() => resolve({ forfeit: `temps dépassé (${limit} ms)` }), limit);
      }
    });
    const aborted = new Promise<Answer>((resolve) =>
      controller.signal.addEventListener('abort', () => resolve({ aborted: true }), { once: true }),
    );
    const move = this.players[side]
      .nextMove(viewOf(this.position.toData()), controller.signal)
      .then(
        (m): Answer => ({ move: m }),
        (error: unknown): Answer => ({ forfeit: crashReason(error) }),
      );

    try {
      return await Promise.race([move, timeout, aborted]);
    } finally {
      clearTimeout(timer);
      this.pending = null;
      controller.abort();
    }
  }

  /** Attend que le délai de lecture soit écoulé depuis `since` (ou un abandon). */
  private async waitDelay(since: number): Promise<void> {
    for (;;) {
      const remaining = since + this.moveDelayMs - Date.now();
      if (remaining <= 0 || this.aborted) return;
      await this.sleep(remaining);
    }
  }

  /** Dort `ms` millisecondes, ou jusqu'à `wake()` ; indéfiniment si `ms` est `null`. */
  private sleep(ms: number | null): Promise<void> {
    return new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        this.wake = null;
        resolve();
      };
      const timer = ms === null ? undefined : setTimeout(done, ms);
      this.wake = done;
    });
  }

  // --- Instantanés ---

  private update(status: GameStatus, result: GameResult | null): void {
    this.snapshot = this.takeSnapshot(status, result);
    for (const listener of this.listeners) listener();
  }

  private takeSnapshot(status: GameStatus, result: GameResult | null): GameSnapshot {
    const history = this.position.history;
    return Object.freeze({
      status,
      fen: this.position.fen,
      turn: this.position.turn,
      inCheck: this.position.inCheck,
      history: Object.freeze(history),
      sanMoves: Object.freeze(this.position.sanHistory),
      lastMove: history.at(-1) ?? null,
      result,
    });
  }
}

function crashReason(error: unknown): string {
  return `plantage : ${error instanceof Error ? error.message : String(error)}`;
}

function resolveTimeouts(option: GameOptions['moveTimeoutMs']): Record<Side, number | null> {
  const value = option === undefined ? DEFAULT_MOVE_TIMEOUT_MS : option;
  if (value === null || typeof value === 'number') return { white: value, black: value };
  return {
    white: value.white === undefined ? DEFAULT_MOVE_TIMEOUT_MS : value.white,
    black: value.black === undefined ? DEFAULT_MOVE_TIMEOUT_MS : value.black,
  };
}
