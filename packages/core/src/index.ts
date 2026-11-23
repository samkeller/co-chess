// @co-chess/core : Moteur de règles, contrat des Joueurs, Bots et orchestration des Parties.
// Headless : aucune dépendance au DOM ni à React. Vocabulaire : CONTEXT.md.
export * from './types.ts';
export { Position, START_FEN } from './position.ts';
export { dataOf, viewOf, type GameView } from './game-view.ts';
export type { Player } from './player.ts';
export { Bot, type BotMeta } from './bot.ts';
export { BotRegistry, type BotClass, type Preset } from './registry.ts';
export {
  isEndgame,
  material,
  nonPawnMaterial,
  phase,
  PIECE_VALUES,
  type Phase,
} from './analysis.ts';
export {
  DEFAULT_MOVE_DELAY_MS,
  DEFAULT_MOVE_TIMEOUT_MS,
  Game,
  type GameOptions,
  type GameSnapshot,
  type GameStatus,
} from './game.ts';
