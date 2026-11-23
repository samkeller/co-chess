import { isEndgame, material, phase, type Phase } from './analysis.ts';
import type { GameView } from './game-view.ts';
import type { Player } from './player.ts';
import type { GameResult, Move, Side } from './types.ts';

/** Ce que chaque Algorithme déclare sur lui-même (`static meta`). */
export interface BotMeta<Config extends object> {
  /** Identifiant stable de l'Algorithme, utilisé par le registre et les Préréglages. */
  id: string;
  /** Nom affiché. */
  name: string;
  /** Configuration par défaut : de la donnée pure. */
  defaults: Config;
}

/**
 * Classe de base de tous les Bots. Un Bot = un Algorithme (la sous-classe) + une configuration.
 *
 * La configuration est fixée une fois à la construction. Elle doit être de la DONNÉE PURE
 * (pas de fonction ni d'instance de classe) : elle voyage vers un Worker, se stocke, se génère.
 */
export abstract class Bot<Config extends object = Record<string, never>> implements Player {
  readonly config: Config;

  constructor(config: Partial<Config> = {}) {
    const { meta } = this.constructor as unknown as { meta: BotMeta<Config> };
    try {
      this.config = structuredClone({ ...meta.defaults, ...config });
    } catch (cause) {
      throw new Error(
        `La configuration du Bot « ${meta.id} » doit être de la donnée pure (pas de fonction).`,
        { cause },
      );
    }
  }

  /** À écrire par l'auteur du Bot : choisir un coup parmi `game.legalMoves`. */
  abstract nextMove(game: GameView, signal?: AbortSignal): Promise<Move>;

  /** Facultatif : préparer l'état du Bot avant le premier coup. */
  onGameStart?(game: GameView, side: Side): void | Promise<void>;

  /** Facultatif : réagir à la fin de la Partie. */
  onGameEnd?(result: GameResult): void | Promise<void>;

  // --- Fonctions génériques, partagées par tous les Bots (voir analysis.ts) ---

  /** Matériel du Camp au trait (ou de `side`) moins celui de l'adversaire. */
  protected material(game: GameView, side: Side = game.side): number {
    return material(game, side);
  }

  protected isEndgame(game: GameView): boolean {
    return isEndgame(game);
  }

  protected phase(game: GameView): Phase {
    return phase(game);
  }

  /** Un élément tiré au hasard (par exemple parmi `game.legalMoves`). */
  protected pickRandom<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('pickRandom : liste vide.');
    return items[Math.floor(Math.random() * items.length)]!;
  }
}
