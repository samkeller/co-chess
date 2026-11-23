import { describe, expect, test } from 'vitest';
import { Position } from './position.ts';

describe('Position', () => {
  test('la position initiale offre 20 coups légaux aux Blancs', () => {
    const position = Position.initial();

    expect(position.turn).toBe('white');
    expect(position.legalMoves()).toHaveLength(20);
  });

  test('jouer un coup passe le trait et l’ajoute à l’historique', () => {
    const position = Position.initial();

    position.play({ from: 'e2', to: 'e4' });

    expect(position.turn).toBe('black');
    expect(position.history).toEqual([{ from: 'e2', to: 'e4' }]);
  });

  test('un coup illégal est refusé et ne modifie pas la position', () => {
    const position = Position.initial();

    expect(() => position.play({ from: 'e2', to: 'e5' })).toThrow(/illégal/);
    expect(position.turn).toBe('white');
    expect(position.history).toEqual([]);
  });

  test('défaire un coup revient exactement à la position précédente', () => {
    const position = Position.initial();
    const before = position.fen;
    position.play({ from: 'g1', to: 'f3' });

    position.undo();

    expect(position.fen).toBe(before);
    expect(position.history).toEqual([]);
    expect(position.sanHistory).toEqual([]);
  });

  test('défaire sans coup joué est refusé', () => {
    expect(() => Position.initial().undo()).toThrow();
  });

  describe('résultat', () => {
    const play = (position: Position, ...moves: string[]) => {
      for (const m of moves) position.play({ from: m.slice(0, 2), to: m.slice(2, 4) });
      return position;
    };

    test('aucun résultat tant que la partie continue', () => {
      expect(Position.initial().result()).toBeNull();
    });

    test('mat du berger inversé : les Noirs gagnent', () => {
      const position = play(Position.initial(), 'f2f3', 'e7e5', 'g2g4', 'd8h4');

      expect(position.result()).toEqual({ kind: 'checkmate', winner: 'black' });
    });

    test('pat', () => {
      const position = Position.fromFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');

      expect(position.result()).toEqual({ kind: 'draw', reason: 'stalemate' });
    });

    test('triple répétition', () => {
      const shuffle = ['g1f3', 'g8f6', 'f3g1', 'f6g8'];
      const position = play(Position.initial(), ...shuffle, ...shuffle);

      expect(position.result()).toEqual({ kind: 'draw', reason: 'threefold-repetition' });
    });

    test('matériel insuffisant', () => {
      const position = Position.fromFen('8/8/4k3/8/8/4K3/8/8 w - - 0 1');

      expect(position.result()).toEqual({ kind: 'draw', reason: 'insufficient-material' });
    });

    test('règle des 50 coups', () => {
      const position = play(Position.fromFen('8/8/4k3/8/8/4K3/8/R7 w - - 99 80'), 'a1a2');

      expect(position.result()).toEqual({ kind: 'draw', reason: 'fifty-moves' });
    });
  });
});
