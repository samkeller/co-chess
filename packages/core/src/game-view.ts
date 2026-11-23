import { Position } from './position.ts';
import type { GameData } from './types.ts';

/**
 * Ce qu'un Joueur reçoit à chaque tour : les données de la Partie, plus une position jouable.
 * `position()` renvoie à chaque appel une NOUVELLE copie, que le Joueur peut modifier librement.
 */
export interface GameView extends GameData {
  position(): Position;
}

/** Ne garde que les données d'une vue, par exemple pour l'envoyer à un Worker. */
export function dataOf(game: GameView): GameData {
  const { side, ply, fen, startFen, history, legalMoves } = game;
  return { side, ply, fen, startFen, history, legalMoves };
}

/** Recolle `position()` sur des données (par exemple reçues dans un Worker). */
export function viewOf(data: GameData): GameView {
  return { ...data, position: () => Position.fromHistory(data.history, data.startFen) };
}
