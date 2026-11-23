import { describe, expect, test } from 'vitest';
import { isEndgame, material, phase } from './analysis.ts';
import { Position } from './position.ts';

const fen = (f: string) => ({ fen: f });
const START = Position.initial().fen;
const WHITE_UP_A_QUEEN = 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const ROOK_ENDGAME = '8/8/4k3/8/8/4K3/8/R7 w - - 0 60';
const MIDDLEGAME = 'r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R2QKB1R w KQ - 0 20';

describe('material', () => {
  test('est équilibré dans la position initiale', () => {
    expect(material(fen(START), 'white')).toBe(0);
  });

  test('compte l’avantage du point de vue du Camp demandé', () => {
    expect(material(fen(WHITE_UP_A_QUEEN), 'white')).toBe(9);
    expect(material(fen(WHITE_UP_A_QUEEN), 'black')).toBe(-9);
  });
});

describe('isEndgame', () => {
  test('pas en début de partie', () => {
    expect(isEndgame(fen(START))).toBe(false);
  });

  test('oui quand il ne reste presque plus de pièces', () => {
    expect(isEndgame(fen(ROOK_ENDGAME))).toBe(true);
  });
});

describe('phase', () => {
  test('ouverture, milieu de partie et finale', () => {
    expect(phase(fen(START))).toBe('opening');
    expect(phase(fen(MIDDLEGAME))).toBe('middlegame');
    expect(phase(fen(ROOK_ENDGAME))).toBe('endgame');
  });
});
