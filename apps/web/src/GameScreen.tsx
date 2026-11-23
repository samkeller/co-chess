import {
  DEFAULT_MOVE_TIMEOUT_MS,
  Game,
  material,
  type GameSnapshot,
  type Player,
  type Side,
} from '@co-chess/core';
import {
  Button,
  Divider,
  Group,
  List,
  Paper,
  ScrollArea,
  SimpleGrid,
  Slider,
  Stack,
  Text,
} from '@mantine/core';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Board } from './Board.tsx';
import { sideName } from './describe-result.ts';
import { PlayerPlate } from './PlayerPlate.tsx';
import { createPlayer, type BotFactory, type PlayerChoice } from './players/choice.ts';
import { HumanPlayer } from './players/human-player.ts';
import type { Matchup } from './SetupForm.tsx';

interface Props {
  matchup: Matchup;
  createBot: BotFactory;
  initialMoveDelayMs: number;
  onNewGame: () => void;
}

type Running = { game: Game; players: Record<Side, Player> };

/** Crée la Partie, la lance, et l'abandonne quand l'écran disparaît. */
export function GameScreen({ matchup, createBot, initialMoveDelayMs, onNewGame }: Props) {
  const [running, setRunning] = useState<Running | null>(null);

  useEffect(() => {
    const players = {
      white: createPlayer(matchup.white, createBot),
      black: createPlayer(matchup.black, createBot),
    };
    // L'Humain n'a pas de limite de temps ; les Bots, si.
    const limit = (side: Side) => (matchup[side].kind === 'human' ? null : DEFAULT_MOVE_TIMEOUT_MS);
    const game = new Game({
      ...players,
      moveDelayMs: initialMoveDelayMs,
      moveTimeoutMs: { white: limit('white'), black: limit('black') },
    });
    // La Partie est un système externe : la créer ici supporte le double montage de StrictMode.
    // oxlint-disable-next-line react/set-state-in-effect
    setRunning({ game, players });
    void game.start();
    return () => game.abort();
  }, [matchup, createBot, initialMoveDelayMs]);

  return (
    running && (
      <GameView
        {...running}
        matchup={matchup}
        initialMoveDelayMs={initialMoveDelayMs}
        onNewGame={onNewGame}
      />
    )
  );
}

const playerName = (choice: PlayerChoice) =>
  choice.kind === 'human' ? 'Humain' : choice.preset.name;

function GameView({
  game,
  players,
  matchup,
  initialMoveDelayMs,
  onNewGame,
}: Running & { matchup: Matchup; initialMoveDelayMs: number; onNewGame: () => void }) {
  const snapshot = useSyncExternalStore(game.subscribe, game.getSnapshot);
  const [delay, setDelay] = useState(initialMoveDelayMs);

  // Le plateau est tourné vers l'Humain s'il y en a un seul ; on peut toujours le retourner.
  const humanSides = (['white', 'black'] as const).filter((s) => players[s] instanceof HumanPlayer);
  const [orientation, setOrientation] = useState<Side>(
    humanSides.length === 1 ? humanSides[0]! : 'white',
  );
  const top: Side = orientation === 'white' ? 'black' : 'white';

  const plate = (side: Side) => (
    <PlayerPlate
      side={side}
      name={playerName(matchup[side])}
      advantage={material(snapshot, side)}
      toMove={snapshot.status !== 'over' && snapshot.turn === side}
      thinking={
        snapshot.status === 'running' &&
        snapshot.turn === side &&
        !(players[side] instanceof HumanPlayer)
      }
    />
  );

  return (
    <Group align="flex-start" gap="xl" wrap="wrap" justify="center">
      <Stack gap="xs" w="min(600px, 100%)">
        {plate(top)}
        <Board
          snapshot={snapshot}
          players={players}
          orientation={orientation}
          animationMs={Math.min(300, delay * 0.8)}
          onNewGame={onNewGame}
        />
        {plate(orientation)}
      </Stack>

      <Paper withBorder p="md" w={300}>
        <Stack gap="md">
          <Text fw={600} role="status">
            {status(snapshot)}
          </Text>

          <div>
            <Text size="sm" mb={4}>
              Délai entre les coups : {delay} ms
            </Text>
            <Slider
              min={0}
              max={2000}
              step={100}
              value={delay}
              onChange={(ms) => {
                setDelay(ms);
                game.setMoveDelay(ms);
              }}
              label={(ms) => `${ms} ms`}
              aria-label="Délai entre les coups"
            />
          </div>

          <Group grow>
            {snapshot.status === 'paused' ? (
              <Button onClick={() => game.resume()}>Reprendre</Button>
            ) : (
              <Button
                variant="light"
                onClick={() => game.pause()}
                disabled={snapshot.status !== 'running'}
              >
                Pause
              </Button>
            )}
            <Button variant="default" onClick={() => setOrientation(top)}>
              Retourner
            </Button>
          </Group>
          <Button variant="default" onClick={onNewGame}>
            Nouvelle partie
          </Button>

          <Divider label="Coups" labelPosition="left" />
          <MoveList moves={snapshot.sanMoves} />
        </Stack>
      </Paper>
    </Group>
  );
}

function status(snapshot: GameSnapshot): string {
  if (snapshot.result) return 'Partie terminée.';
  if (snapshot.status === 'paused') return 'En pause.';
  return `Trait aux ${sideName(snapshot.turn)}.`;
}

/** La feuille de partie : coups numérotés, le dernier en évidence, défilement automatique. */
function MoveList({ moves }: { moves: readonly string[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  }, [moves.length]);

  const rows: Array<[string, string | undefined]> = [];
  for (let i = 0; i < moves.length; i += 2) rows.push([moves[i]!, moves[i + 1]]);
  const last = moves.length - 1;

  return (
    <ScrollArea h={280} viewportRef={viewport}>
      <List listStyleType="none" aria-label="Coups joués">
        {rows.map(([white, black], i) => (
          <List.Item key={i}>
            <SimpleGrid cols={3} spacing={0} ff="monospace" fz="sm">
              <Text c="dimmed" ff="monospace" fz="sm">
                {i + 1}.
              </Text>
              <Text ff="monospace" fz="sm" c={2 * i === last ? 'brass' : undefined}>
                {white}
              </Text>
              <Text ff="monospace" fz="sm" c={2 * i + 1 === last ? 'brass' : undefined}>
                {black}
              </Text>
            </SimpleGrid>
          </List.Item>
        ))}
      </List>
    </ScrollArea>
  );
}
