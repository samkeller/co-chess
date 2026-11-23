import type { GameSnapshot, Move, PieceType, Player, Side } from '@co-chess/core';
import {
  Box,
  Button,
  Group,
  Overlay,
  Paper,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Chessboard, defaultPieces } from 'react-chessboard';
import { describeResult } from './describe-result.ts';
import { HumanPlayer } from './players/human-player.ts';
import { board } from './theme.ts';

interface Props {
  snapshot: GameSnapshot;
  players: Record<Side, Player>;
  orientation: Side;
  animationMs: number;
  onNewGame: () => void;
}

const PROMOTIONS: Array<[PieceType, string, string]> = [
  ['queen', 'Q', 'Dame'],
  ['rook', 'R', 'Tour'],
  ['bishop', 'B', 'Fou'],
  ['knight', 'N', 'Cavalier'],
];

const noHuman = { subscribe: () => () => {}, getSnapshot: () => null };

/** La case du roi de `side`, lue dans la FEN. */
function kingSquare(fen: string, side: Side): string | null {
  const king = side === 'white' ? 'K' : 'k';
  const ranks = fen.split(' ')[0]!.split('/');
  for (const [r, rank] of ranks.entries()) {
    let file = 0;
    for (const ch of rank) {
      if (ch === king) return `${'abcdefgh'[file]}${8 - r}`;
      file += Number(ch) || 1;
    }
  }
  return null;
}

/** L'échiquier. Quand c'est au tour d'un Humain, on peut y jouer par glisser ou par clic. */
export function Board({ snapshot, players, orientation, animationMs, onNewGame }: Props) {
  const toMove = players[snapshot.turn];
  const human = toMove instanceof HumanPlayer ? toMove : null;
  const turn = useSyncExternalStore((human ?? noHuman).subscribe, (human ?? noHuman).getSnapshot);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<Move | null>(null);
  const [showResult, setShowResult] = useState(true);

  const movesFrom = (from: string) => turn?.legalMoves.filter((m) => m.from === from) ?? [];

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
    if (selected && movesFrom(selected).some((m) => m.to === square)) {
      attempt({ from: selected, to: square });
    } else {
      setSelected(movesFrom(square).length > 0 && square !== selected ? square : null);
    }
  };

  // Du plus discret au plus important : un style posé plus bas remplace celui d'au-dessus.
  const squareStyles: Record<string, CSSProperties> = {};
  if (snapshot.lastMove) {
    squareStyles[snapshot.lastMove.from] = { background: board.lastMove };
    squareStyles[snapshot.lastMove.to] = { background: board.lastMove };
  }
  const king = snapshot.inCheck ? kingSquare(snapshot.fen, snapshot.turn) : null;
  if (king) squareStyles[king] = { background: board.check };
  if (turn && selected) {
    squareStyles[selected] = { background: board.selected };
    for (const m of movesFrom(selected)) {
      squareStyles[m.to] = {
        ...squareStyles[m.to],
        backgroundImage: m.captured ? board.captureRing : board.moveDot,
      };
    }
  }

  const color = snapshot.turn === 'white' ? 'w' : 'b';

  return (
    <Box pos="relative">
      <Chessboard
        options={{
          position: snapshot.fen,
          boardOrientation: orientation,
          allowDragging: turn !== null,
          canDragPiece: ({ piece }) => piece.pieceType.startsWith(color),
          onPieceDrag: ({ square }) => setSelected(square),
          onPieceDragCancel: () => setSelected(null),
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare !== null && attempt({ from: sourceSquare, to: targetSquare }),
          onSquareClick,
          squareStyles,
          animationDurationInMs: animationMs,
          boardStyle: {
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
          },
          lightSquareStyle: { backgroundColor: board.light },
          darkSquareStyle: { backgroundColor: board.dark },
          dropSquareStyle: { boxShadow: `inset 0 0 0 4px ${board.selected}` },
          alphaNotationStyle: { fontSize: 11, fontWeight: 600, opacity: 0.8 },
          numericNotationStyle: { fontSize: 11, fontWeight: 600, opacity: 0.8 },
        }}
      />

      {promotion && (
        <Overlay blur={2} center radius={6}>
          <Paper p="md" shadow="xl" role="dialog" aria-label="Promotion">
            <Stack gap="xs" align="center">
              <Text fw={600}>Promotion</Text>
              <Group gap="xs">
                {PROMOTIONS.map(([piece, letter, label]) => (
                  <UnstyledButton
                    key={piece}
                    aria-label={label}
                    w={64}
                    h={64}
                    onClick={() => {
                      setPromotion(null);
                      human?.play({ ...promotion, promotion: piece });
                    }}
                  >
                    {defaultPieces[`${color}${letter}`]?.()}
                  </UnstyledButton>
                ))}
              </Group>
              <Button variant="subtle" size="xs" color="gray" onClick={() => setPromotion(null)}>
                Annuler
              </Button>
            </Stack>
          </Paper>
        </Overlay>
      )}

      {snapshot.result && showResult && (
        <Overlay blur={1} center radius={6} backgroundOpacity={0.45}>
          <Paper p="lg" shadow="xl" maw={340}>
            <Stack align="center" gap="md">
              <Title order={3} ta="center">
                {describeResult(snapshot.result)}
              </Title>
              <Group>
                <Button variant="default" onClick={() => setShowResult(false)}>
                  Revoir l’échiquier
                </Button>
                <Button onClick={onNewGame}>Nouvelle partie</Button>
              </Group>
            </Stack>
          </Paper>
        </Overlay>
      )}
    </Box>
  );
}
