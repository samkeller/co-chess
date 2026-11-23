import { describe, expect, test } from 'vitest';
import { Bot } from './bot.ts';
import type { GameView } from './game-view.ts';
import type { Move } from './types.ts';

type Config = { depth: number; weights: { material: number; mobility: number } };

class TestBot extends Bot<Config> {
  static meta = {
    id: 'test',
    name: 'Bot de test',
    defaults: { depth: 2, weights: { material: 1, mobility: 0.1 } },
  };

  async nextMove(game: GameView): Promise<Move> {
    return game.legalMoves[0]!;
  }
}

describe('Bot', () => {
  test('sans configuration, le Bot prend les valeurs par défaut de son Algorithme', () => {
    expect(new TestBot().config).toEqual({ depth: 2, weights: { material: 1, mobility: 0.1 } });
  });

  test('la configuration fournie remplace les valeurs par défaut', () => {
    const bot = new TestBot({ depth: 4 });

    expect(bot.config).toEqual({ depth: 4, weights: { material: 1, mobility: 0.1 } });
  });

  test('la configuration est copiée : modifier l’objet d’origine ne change pas le Bot', () => {
    const genome = { weights: { material: 1, mobility: 0.5 } };
    const bot = new TestBot(genome);

    genome.weights.mobility = 99;

    expect(bot.config.weights.mobility).toBe(0.5);
  });

  test('une configuration qui contient une fonction est refusée', () => {
    const config = { depth: 2, choose: () => 1 } as unknown as Partial<Config>;

    expect(() => new TestBot(config)).toThrow(/donnée/);
  });
});
