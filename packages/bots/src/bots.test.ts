import { Game, Position, viewOf } from '@co-chess/core';
import { describe, expect, test } from 'vitest';
import { GreedyBot } from './greedy.ts';
import { RandomBot } from './random.ts';
import { registry } from './registry.ts';

const viewAt = (fen: string) => viewOf(Position.fromFen(fen).toData());

describe('Aléatoire', () => {
  test('joue toujours un coup légal', async () => {
    const game = viewAt(Position.initial().fen);
    const bot = new RandomBot();

    for (let i = 0; i < 20; i++) {
      expect(game.legalMoves).toContainEqual(expect.objectContaining(await bot.nextMove(game)));
    }
  });
});

describe('Glouton', () => {
  test('prend la pièce adverse la plus chère', async () => {
    // Le cavalier blanc en d5 peut prendre la dame en c7 ou le pion en e7.
    const game = viewAt('4k3/2q1p3/8/3N4/8/8/8/4K3 w - - 0 1');

    expect(await new GreedyBot().nextMove(game)).toMatchObject({ from: 'd5', to: 'c7' });
  });

  test('sans prise possible, joue un coup légal', async () => {
    const game = viewAt(Position.initial().fen);

    expect(game.legalMoves).toContainEqual(
      expect.objectContaining(await new GreedyBot().nextMove(game)),
    );
  });
});

describe('registre', () => {
  test('propose les Préréglages Aléatoire et Glouton', () => {
    expect(registry.presets.map((p) => p.name)).toEqual(
      expect.arrayContaining(['Aléatoire', 'Glouton']),
    );
  });

  test('une Partie Aléatoire contre Glouton va jusqu’à une fin légale', async () => {
    const [random, greedy] = registry.presets;
    const game = new Game({
      white: registry.create(random!),
      black: registry.create(greedy!),
      moveDelayMs: 0,
    });

    const result = await game.start();

    expect(['checkmate', 'draw']).toContain(result.kind);
  });
});
