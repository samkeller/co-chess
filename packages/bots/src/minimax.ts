import { Bot, material, type GameView, type Move, type Position } from '@co-chess/core';

type Config = { depth: number };

const MATE = 1_000_000;

/** Cherche `depth` demi-coups en avant (négamax + élagage alpha-bêta), en comptant le matériel. */
export class MinimaxBot extends Bot<Config> {
  static meta = { id: 'minimax', name: 'Minimax', defaults: { depth: 2 } };

  async nextMove(game: GameView): Promise<Move> {
    const position = game.position();
    // Mélangés pour varier les parties entre coups de même valeur.
    const moves = [...game.legalMoves].sort(() => Math.random() - 0.5);
    let best = moves[0]!;
    let bestScore = -Infinity;
    for (const move of moves) {
      position.play(move);
      const score = -this.negamax(position, this.config.depth - 1, -Infinity, -bestScore);
      position.undo();
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    return best;
  }

  /** Score de la position du point de vue du Camp au trait. */
  private negamax(position: Position, depth: number, alpha: number, beta: number): number {
    const result = position.result();
    // Mat : le Camp au trait a perdu (plus tôt c'est, pire c'est).
    if (result) return result.kind === 'checkmate' ? -MATE - depth : 0;
    if (depth <= 0) return material(position, position.turn);

    for (const move of position.legalMoves()) {
      position.play(move);
      const score = -this.negamax(position, depth - 1, -beta, -alpha);
      position.undo();
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }
    return alpha;
  }
}
