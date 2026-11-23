// Le Moteur de règles. C'est le SEUL fichier qui importe chess.js : la lib ne fuit pas
// dans l'API publique et peut être remplacée sans toucher aux Bots.
import { Chess, type Move as ChessMove } from 'chess.js';
import type { BoardResult, GameData, LegalMove, Move, PieceType, Side } from './types.ts';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PIECE: Record<string, PieceType> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

const PIECE_CODE: Partial<Record<PieceType, string>> = {
  knight: 'n',
  bishop: 'b',
  rook: 'r',
  queen: 'q',
};

function toLegalMove(m: ChessMove): LegalMove {
  return {
    from: m.from,
    to: m.to,
    ...(m.promotion ? { promotion: PIECE[m.promotion] } : {}),
    san: m.san,
    piece: PIECE[m.piece]!,
    ...(m.captured ? { captured: PIECE[m.captured] } : {}),
  };
}

/** Une position d'échecs jouable. Mutable : `play`/`undo` la modifient. */
export class Position {
  private readonly chess: Chess;
  private readonly played: Move[] = [];
  private readonly sans: string[] = [];
  /** La FEN de départ, avant le premier coup de `history`. */
  readonly startFen: string;

  private constructor(fen: string) {
    this.chess = new Chess(fen);
    this.startFen = this.chess.fen();
  }

  static initial(): Position {
    return new Position(START_FEN);
  }

  /** Position quelconque, décrite en FEN. Lève une erreur si la FEN est invalide. */
  static fromFen(fen: string): Position {
    return new Position(fen);
  }

  /** Rejoue `history` depuis `startFen` : la position obtenue est exacte, répétitions comprises. */
  static fromHistory(history: readonly Move[], startFen: string = START_FEN): Position {
    const position = new Position(startFen);
    for (const move of history) position.play(move);
    return position;
  }

  /** Les données de la Partie à ce stade, copiables vers un Worker. */
  toData(): GameData {
    return {
      side: this.turn,
      ply: this.played.length,
      fen: this.fen,
      startFen: this.startFen,
      history: this.history,
      legalMoves: this.legalMoves(),
    };
  }

  /** La position en FEN. */
  get fen(): string {
    return this.chess.fen();
  }

  /** Le résultat si la partie est terminée sur l'échiquier, sinon `null`. */
  result(): BoardResult | null {
    const c = this.chess;
    if (c.isCheckmate())
      return { kind: 'checkmate', winner: this.turn === 'white' ? 'black' : 'white' };
    if (c.isStalemate()) return { kind: 'draw', reason: 'stalemate' };
    if (c.isInsufficientMaterial()) return { kind: 'draw', reason: 'insufficient-material' };
    if (c.isThreefoldRepetition()) return { kind: 'draw', reason: 'threefold-repetition' };
    if (c.isDrawByFiftyMoves()) return { kind: 'draw', reason: 'fifty-moves' };
    return null;
  }

  /** Le Camp qui a le trait. */
  get turn(): Side {
    return this.chess.turn() === 'w' ? 'white' : 'black';
  }

  /** Les coups joués, en notation algébrique standard ('e4', 'Nf3', 'Qh4#'). */
  get sanHistory(): string[] {
    return this.sans.slice();
  }

  /** Les coups joués depuis le début, dans l'ordre (copie). */
  get history(): Move[] {
    return this.played.slice();
  }

  legalMoves(): LegalMove[] {
    return this.chess.moves({ verbose: true }).map(toLegalMove);
  }

  /** Défait le dernier coup joué (utile aux Bots qui explorent des variantes). */
  undo(): void {
    if (this.played.length === 0) throw new Error('Aucun coup à défaire.');
    this.chess.undo();
    this.played.pop();
    this.sans.pop();
  }

  /** Joue un coup. Lève une erreur, sans rien modifier, si le coup est illégal. */
  play(move: Move): void {
    let san: string;
    try {
      san = this.chess.move({
        from: move.from,
        to: move.to,
        promotion: PIECE_CODE[move.promotion!],
      }).san;
    } catch {
      throw new Error(`Coup illégal : ${move.from}-${move.to} (position ${this.chess.fen()})`);
    }
    this.sans.push(san);
    this.played.push(move.promotion ? { ...move } : { from: move.from, to: move.to });
  }
}
