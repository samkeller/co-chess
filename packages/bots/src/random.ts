import { Bot, type GameView, type Move } from '@co-chess/core';

/** Joue un coup légal au hasard. */
export class RandomBot extends Bot {
  static meta = { id: 'random', name: 'Aléatoire', defaults: {} };

  async nextMove(game: GameView): Promise<Move> {
    return this.pickRandom(game.legalMoves);
  }
}
