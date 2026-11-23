import { describe, expect, test } from 'vitest';
import { viewOf } from './game-view.ts';
import { Position } from './position.ts';

describe('GameView', () => {
  const afterMoves = (...moves: string[]) => {
    const position = Position.initial();
    for (const m of moves) position.play({ from: m.slice(0, 2), to: m.slice(2, 4) });
    return position;
  };

  test('décrit la position du point de vue du Camp au trait', () => {
    const data = afterMoves('e2e4').toData();

    expect(data.side).toBe('black');
    expect(data.ply).toBe(1);
    expect(data.history).toEqual([{ from: 'e2', to: 'e4' }]);
    expect(data.legalMoves).toHaveLength(20);
  });

  test('traverse structuredClone (frontière d’un Worker) sans rien perdre', () => {
    const data = afterMoves('e2e4', 'e7e5').toData();

    expect(structuredClone(data)).toEqual(data);
  });

  test('position() reconstruit une copie jouable, indépendante et fidèle à l’historique', () => {
    const shuffle = ['g1f3', 'g8f6', 'f3g1', 'f6g8'];
    const original = afterMoves(...shuffle, 'g1f3', 'g8f6', 'f3g1');
    const view = viewOf(structuredClone(original.toData()));

    const copy = view.position();
    copy.play({ from: 'f6', to: 'g8' });

    expect(copy.result()).toEqual({ kind: 'draw', reason: 'threefold-repetition' });
    expect(original.history).toHaveLength(7);
    expect(view.position().history).toHaveLength(7);
  });
});
