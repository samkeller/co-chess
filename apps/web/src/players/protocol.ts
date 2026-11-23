// Messages échangés entre la page et le Worker d'un Bot. Que de la donnée (structuredClone).
import type { GameData, GameResult, Move, Side } from '@co-chess/core';

export type ToWorker =
  | { type: 'start'; algorithm: string; config: object; game: GameData; side: Side }
  | { type: 'move'; game: GameData }
  | { type: 'end'; result: GameResult };

export type FromWorker =
  { type: 'ready' } | { type: 'move'; move: Move } | { type: 'error'; message: string };
