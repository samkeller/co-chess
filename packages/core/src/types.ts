// Types du domaine. Tous sont de la donnée pure : ils traversent la frontière d'un Worker
// (structuredClone) et peuvent être stockés tels quels.

/** Un Camp. */
export type Side = 'white' | 'black';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

/** Case en notation algébrique : 'e4'. */
export type Square = string;

/** Ce qu'un Joueur renvoie. */
export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
}

/**
 * Les données d'une Partie, vues par le Camp au trait. `startFen` + `history` suffisent à
 * reconstruire exactement la position, y compris ce qu'il faut pour la triple répétition.
 */
export interface GameData {
  /** Le Camp au trait, c'est-à-dire celui du Joueur interrogé. */
  side: Side;
  /** Nombre de demi-coups joués. */
  ply: number;
  fen: string;
  startFen: string;
  history: Move[];
  legalMoves: LegalMove[];
}

export type DrawReason =
  'stalemate' | 'threefold-repetition' | 'fifty-moves' | 'insufficient-material';

/** Une fin de partie constatée sur l'échiquier par le Moteur de règles. */
export type BoardResult =
  { kind: 'checkmate'; winner: Side } | { kind: 'draw'; reason: DrawReason };

/** Comment une Partie s'est terminée : sur l'échiquier, par Forfait ou par abandon. */
export type GameResult =
  BoardResult | { kind: 'forfeit'; winner: Side; reason: string } | { kind: 'aborted' };

/** Un coup légal tel que le Moteur de règles le décrit, enrichi pour aider les Bots. */
export interface LegalMove extends Move {
  /** Notation algébrique standard : 'Nf3', 'exd5', 'O-O'. */
  san: string;
  piece: PieceType;
  captured?: PieceType;
}
