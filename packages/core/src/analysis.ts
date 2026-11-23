// Fonctions d'analyse génériques, utilisables par tous les Bots (et exposées sur la classe Bot).
// Elles ne lisent que la FEN : elles marchent sur une GameView comme sur de simples données.
import type { PieceType, Side } from './types.ts';

export type Phase = 'opening' | 'middlegame' | 'endgame';

/** Valeur classique des pièces, en pions. */
export const PIECE_VALUES: Readonly<Record<PieceType, number>> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

const FEN_PIECE: Record<string, PieceType> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

type HasFen = { fen: string };

function* pieces({ fen }: HasFen): Generator<{ type: PieceType; side: Side }> {
  for (const ch of fen.split(' ')[0] ?? '') {
    const type = FEN_PIECE[ch.toLowerCase()];
    if (type) yield { type, side: ch === ch.toLowerCase() ? 'black' : 'white' };
  }
}

/** Matériel de `side` moins celui de l'adversaire. */
export function material(
  game: HasFen,
  side: Side,
  values: Readonly<Record<PieceType, number>> = PIECE_VALUES,
): number {
  let score = 0;
  for (const piece of pieces(game)) {
    score += piece.side === side ? values[piece.type] : -values[piece.type];
  }
  return score;
}

/** Matériel total hors pions et rois, les deux Camps confondus (62 au départ). */
export function nonPawnMaterial(game: HasFen): number {
  let total = 0;
  for (const { type } of pieces(game)) {
    if (type !== 'pawn') total += PIECE_VALUES[type];
  }
  return total;
}

/** Finale : il reste au plus l'équivalent d'une tour et d'un fou de chaque côté. */
export function isEndgame(game: HasFen): boolean {
  return nonPawnMaterial(game) <= 16;
}

/** Ouverture pendant les 10 premiers coups, finale selon `isEndgame`, milieu de partie sinon. */
export function phase(game: HasFen): Phase {
  if (isEndgame(game)) return 'endgame';
  const fullMove = Number(game.fen.split(' ')[5] ?? 1);
  return fullMove <= 10 ? 'opening' : 'middlegame';
}
