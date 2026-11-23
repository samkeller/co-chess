import type { Player, Preset } from '@co-chess/core';
import { HumanPlayer } from './human-player.ts';
import { WorkerBotPlayer } from './worker-bot-player.ts';

/** Ce que l'utilisateur choisit pour un Camp. */
export type PlayerChoice = { kind: 'human' } | { kind: 'bot'; preset: Preset };

/** Fabrique le Joueur d'un Bot. Remplaçable (tests, futurs modes d'exécution). */
export type BotFactory = (preset: Preset) => Player;

/** Par défaut, chaque Bot tourne dans son propre Web Worker. */
export const workerBotFactory: BotFactory = (preset) => new WorkerBotPlayer(preset);

export function createPlayer(choice: PlayerChoice, createBot: BotFactory): Player {
  return choice.kind === 'human' ? new HumanPlayer() : createBot(choice.preset);
}
