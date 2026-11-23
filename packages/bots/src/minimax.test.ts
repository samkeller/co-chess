import { Game, Position, viewOf } from '@co-chess/core';
import { expect, test } from 'vitest';
import { MinimaxBot } from './minimax.ts';
import { RandomBot } from './random.ts';
import { registry } from './registry.ts';

const viewAt = (fen: string) => viewOf(Position.fromFen(fen).toData());

test('trouve le mat du couloir', async () => {
  const game = viewAt('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');

  expect(await new MinimaxBot({ depth: 1 }).nextMove(game)).toMatchObject({ from: 'a1', to: 'a8' });
});

test('à profondeur 2, ne prend pas un pion défendu avec sa dame', async () => {
  // Dxd5 gagne un pion… et perd la dame après exd5. La profondeur 1 tombe dans le piège.
  const game = viewAt('4k3/8/4p3/3p4/8/8/8/3QK3 w - - 0 1');
  const queenTakes = { from: 'd1', to: 'd5' };

  expect(await new MinimaxBot({ depth: 1 }).nextMove(game)).toMatchObject(queenTakes);
  expect(await new MinimaxBot({ depth: 2 }).nextMove(game)).not.toMatchObject(queenTakes);
});

test('joue une Partie complète contre Aléatoire', async () => {
  const game = new Game({
    white: new MinimaxBot({ depth: 1 }),
    black: new RandomBot(),
    moveDelayMs: 0,
  });

  expect(['checkmate', 'draw']).toContain((await game.start()).kind);
});

test('ses Préréglages apparaissent dans le registre', () => {
  expect(registry.presets.map((p) => p.name)).toEqual(
    expect.arrayContaining(['Minimax (prof. 1)', 'Minimax (prof. 2)']),
  );
});
