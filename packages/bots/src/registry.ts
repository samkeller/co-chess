import { BotRegistry } from '@co-chess/core';
import { GreedyBot } from './greedy.ts';
import { MinimaxBot } from './minimax.ts';
import { RandomBot } from './random.ts';

/**
 * Tous les Bots disponibles. Ajouter un Bot = ajouter sa classe à `algorithms`, puis un ou
 * plusieurs Préréglages à `presets` (ce sont eux qui apparaissent dans les listes de choix).
 */
export const registry = new BotRegistry(
  [RandomBot, GreedyBot, MinimaxBot],
  [
    { algorithm: 'random', name: 'Aléatoire', config: {} },
    { algorithm: 'greedy', name: 'Glouton', config: {} },
    { algorithm: 'minimax', name: 'Minimax (prof. 1)', config: { depth: 1 } },
    { algorithm: 'minimax', name: 'Minimax (prof. 2)', config: { depth: 2 } },
  ],
);
