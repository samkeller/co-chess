import type { GameView } from './game-view.ts';
import type { GameResult, Move, Side } from './types.ts';

/**
 * Un Joueur : ce qui occupe un Camp et fournit un coup quand c'est son tour.
 * Humain et Bot l'implémentent : la Partie ne sait pas lequel elle fait jouer.
 */
export interface Player {
  /**
   * Appelé à chaque tour avec la vue complète de la Partie. `signal` est annulé quand le coup
   * n'est plus attendu (temps dépassé, abandon) : le Joueur peut alors arrêter de chercher.
   */
  nextMove(game: GameView, signal?: AbortSignal): Promise<Move>;
  /** Facultatif : appelé une fois avant le premier coup de la Partie, avec le Camp du Joueur. */
  onGameStart?(game: GameView, side: Side): void | Promise<void>;
  /** Facultatif : appelé une fois quand la Partie se termine, quelle qu'en soit la raison. */
  onGameEnd?(result: GameResult): void | Promise<void>;
}
