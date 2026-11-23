import type { GameView, Move, Player } from '@co-chess/core';

type Turn = { game: GameView; resolve: (move: Move) => void; reject: (error: Error) => void };

const sameSquares = (a: Move, b: Move) => a.from === b.from && a.to === b.to;

/**
 * Un Humain : son coup est celui que la personne joue sur l'échiquier. Pour l'UI, c'est une source
 * externe (`subscribe`/`getSnapshot`) : l'instantané est la vue de la Partie pendant son tour.
 */
export class HumanPlayer implements Player {
  private turn: Turn | null = null;
  private readonly listeners = new Set<() => void>();

  nextMove(game: GameView, signal?: AbortSignal): Promise<Move> {
    return new Promise<Move>((resolve, reject) => {
      this.turn = { game, resolve, reject };
      signal?.addEventListener('abort', () => this.end()?.reject(new Error('Coup annulé.')), {
        once: true,
      });
      this.notify();
    });
  }

  /** La vue de la Partie pendant le tour de l'Humain, sinon `null`. */
  getSnapshot = (): GameView | null => this.turn?.game ?? null;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Ce coup amène-t-il un pion à promotion (il faut alors choisir la pièce) ? */
  needsPromotion(move: Move): boolean {
    return this.legal(move).some((m) => m.promotion);
  }

  /** Joue un coup pour l'Humain. Renvoie `false` (et le tour continue) s'il est illégal. */
  play(move: Move): boolean {
    const legal = this.legal(move).find((m) => m.promotion === move.promotion);
    if (!legal) return false;
    this.end()?.resolve(move.promotion ? { ...move } : { from: move.from, to: move.to });
    return true;
  }

  private legal(move: Move) {
    return this.turn?.game.legalMoves.filter((m) => sameSquares(m, move)) ?? [];
  }

  private end(): Turn | null {
    const turn = this.turn;
    this.turn = null;
    if (turn) this.notify();
    return turn;
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}
