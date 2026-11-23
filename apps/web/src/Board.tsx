import type { GameSnapshot, Move, PieceType, Player, Side } from '@co-chess/core';
import { useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';
import { HumanPlayer } from './players/human-player.ts';

interface Props {
  snapshot: GameSnapshot;
  players: Record<Side, Player>;
  animationMs: number;
}

const PROMOTIONS: Array<[PieceType, string]> = [
  ['queen', 'Dame'],
  ['rook', 'Tour'],
  ['bishop', 'Fou'],
  ['knight', 'Cavalier'],
];

const SELECTED: CSSProperties = { background: 'rgba(255, 213, 0, 0.5)' };
const TARGET: CSSProperties = {
  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.25) 22%, transparent 24%)',
};

const noHuman = { subscribe: () => () => {}, getSnapshot: () => null };

/** L'échiquier. Quand c'est au tour d'un Humain, on peut y jouer par glisser ou par clic. */
export function Board({ snapshot, players, animationMs }: Props) {
  const toMove = players[snapshot.turn];
  const human = toMove instanceof HumanPlayer ? toMove : null;
  const turn = useSyncExternalStore((human ?? noHuman).subscribe, (human ?? noHuman).getSnapshot);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<Move | null>(null);

  const targets = (from: string) =>
    turn?.legalMoves.filter((m) => m.from === from).map((m) => m.to) ?? [];

  const attempt = (move: Move): boolean => {
    setSelected(null);
    if (!human) return false;
    if (human.needsPromotion(move)) {
      setPromotion(move);
      return false;
    }
    return human.play(move);
  };

  const onSquareClick = ({ square }: { square: string }) => {
    if (!turn) return;
    if (selected && targets(selected).includes(square)) {
      attempt({ from: selected, to: square });
    } else {
      setSelected(targets(square).length > 0 ? square : null);
    }
  };

  const squareStyles: Record<string, CSSProperties> = {};
  if (turn && selected) {
    squareStyles[selected] = SELECTED;
    for (const to of targets(selected)) squareStyles[to] = TARGET;
  }

  const humanSides = (['white', 'black'] as const).filter((s) => players[s] instanceof HumanPlayer);
  const orientation = humanSides.length === 1 ? humanSides[0]! : 'white';
  const sideCode = snapshot.turn === 'white' ? 'w' : 'b';

  return (
    <div className="board">
      <Chessboard
        options={{
          position: snapshot.fen,
          boardOrientation: orientation,
          allowDragging: turn !== null,
          canDragPiece: ({ piece }) => piece.pieceType.startsWith(sideCode),
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare !== null && attempt({ from: sourceSquare, to: targetSquare }),
          onSquareClick,
          squareStyles,
          animationDurationInMs: animationMs,
        }}
      />
      {promotion && (
        <div className="promotion" role="dialog" aria-label="Promotion">
          {PROMOTIONS.map(([piece, label]) => (
            <button
              key={piece}
              onClick={() => {
                setPromotion(null);
                human?.play({ ...promotion, promotion: piece });
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
