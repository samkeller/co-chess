import { Bot, PIECE_VALUES, type GameView, type Move } from '@co-chess/core';

type Config = { values: Record<string, number> };

/** Prend la pièce adverse la plus chère possible, sinon joue au hasard. */
export class GreedyBot extends Bot<Config> {
  static meta = { id: 'greedy', name: 'Glouton', defaults: { values: { ...PIECE_VALUES } } };

  async nextMove(game: GameView): Promise<Move> {
    const value = (m: (typeof game.legalMoves)[number]) =>
      m.captured ? (this.config.values[m.captured] ?? 0) : -1;
    const best = Math.max(...game.legalMoves.map(value));
    return this.pickRandom(game.legalMoves.filter((m) => value(m) === best));
  }
}
