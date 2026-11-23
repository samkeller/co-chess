import type { GameResult, Side } from '@co-chess/core';

export const sideName = (side: Side) => (side === 'white' ? 'Blancs' : 'Noirs');

const DRAW_REASONS = {
  stalemate: 'pat',
  'threefold-repetition': 'triple répétition',
  'fifty-moves': 'règle des 50 coups',
  'insufficient-material': 'matériel insuffisant',
} as const;

/** Le résultat d'une Partie, en français. */
export function describeResult(result: GameResult): string {
  switch (result.kind) {
    case 'checkmate':
      return `Échec et mat : les ${sideName(result.winner)} gagnent.`;
    case 'draw':
      return `Partie nulle (${DRAW_REASONS[result.reason]}).`;
    case 'forfeit':
      return `Forfait : les ${sideName(result.winner)} gagnent (${result.reason}).`;
    case 'aborted':
      return 'Partie abandonnée.';
  }
}
