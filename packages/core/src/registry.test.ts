import { describe, expect, test } from 'vitest';
import { Bot } from './bot.ts';
import type { GameView } from './game-view.ts';
import { BotRegistry } from './registry.ts';
import type { Move } from './types.ts';

class FirstMoveBot extends Bot<{ depth: number }> {
  static meta = { id: 'first', name: 'Premier coup', defaults: { depth: 1 } };
  async nextMove(game: GameView): Promise<Move> {
    return game.legalMoves[0]!;
  }
}

class LastMoveBot extends Bot {
  static meta = { id: 'last', name: 'Dernier coup', defaults: {} };
  async nextMove(game: GameView): Promise<Move> {
    return game.legalMoves.at(-1)!;
  }
}

describe('BotRegistry', () => {
  const registry = new BotRegistry(
    [FirstMoveBot, LastMoveBot],
    [
      { algorithm: 'first', name: 'Premier (prof. 3)', config: { depth: 3 } },
      { algorithm: 'last', name: 'Dernier', config: {} },
    ],
  );

  test('crée un Bot à partir d’un Algorithme et d’une configuration générée', () => {
    const bot = registry.create('first', { depth: 7 });

    expect(bot).toBeInstanceOf(FirstMoveBot);
    expect(bot.config).toEqual({ depth: 7 });
  });

  test('crée un Bot à partir d’un Préréglage', () => {
    const bot = registry.create(registry.presets[0]!);

    expect(bot).toBeInstanceOf(FirstMoveBot);
    expect(bot.config).toEqual({ depth: 3 });
  });

  test('refuse un Algorithme inconnu', () => {
    expect(() => registry.create('stockfish')).toThrow(/inconnu/);
  });

  test('refuse un Préréglage qui désigne un Algorithme inconnu', () => {
    expect(
      () => new BotRegistry([LastMoveBot], [{ algorithm: 'first', name: 'X', config: {} }]),
    ).toThrow(/inconnu/);
  });

  test('refuse deux Algorithmes avec le même identifiant', () => {
    expect(() => new BotRegistry([LastMoveBot, LastMoveBot], [])).toThrow(/déjà/);
  });
});
