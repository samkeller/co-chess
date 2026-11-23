import {
  DEFAULT_MOVE_TIMEOUT_MS,
  Game,
  type GameSnapshot,
  type Player,
  type Side,
} from '@co-chess/core';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Board } from './Board.tsx';
import { describeResult, sideName } from './describe-result.ts';
import { createPlayer, type BotFactory } from './players/choice.ts';
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
      <GameView {...running} initialMoveDelayMs={initialMoveDelayMs} onNewGame={onNewGame} />
    )
  );
}

function GameView({
  game,
  players,
  initialMoveDelayMs,
  onNewGame,
}: Running & { initialMoveDelayMs: number; onNewGame: () => void }) {
  const snapshot = useSyncExternalStore(game.subscribe, game.getSnapshot);
  const [delay, setDelay] = useState(initialMoveDelayMs);

  const changeDelay = (ms: number) => {
    setDelay(ms);
    game.setMoveDelay(ms);
  };

  return (
    <div className="game">
      <Board snapshot={snapshot} players={players} animationMs={Math.min(300, delay * 0.8)} />

      <aside className="panel">
        <p className="status" role="status">
          {status(snapshot)}
        </p>

        <div className="controls">
          <label>
            Délai entre les coups : {delay} ms
            <input
              type="range"
              min={0}
              max={2000}
              step={100}
              value={delay}
              onChange={(e) => changeDelay(Number(e.target.value))}
            />
          </label>
          {snapshot.status === 'paused' ? (
            <button onClick={() => game.resume()}>Reprendre</button>
          ) : (
            <button onClick={() => game.pause()} disabled={snapshot.status !== 'running'}>
              Pause
            </button>
          )}
          <button onClick={onNewGame}>Nouvelle partie</button>
        </div>

        <MoveList moves={snapshot.sanMoves} />
      </aside>
    </div>
  );
}

function status(snapshot: GameSnapshot): string {
  if (snapshot.result) return describeResult(snapshot.result);
  if (snapshot.status === 'paused') return 'En pause.';
  return `Trait aux ${sideName(snapshot.turn)}.`;
}

function MoveList({ moves }: { moves: readonly string[] }) {
  const rows: Array<[string, string | undefined]> = [];
  for (let i = 0; i < moves.length; i += 2) rows.push([moves[i]!, moves[i + 1]]);
  return (
    <ol className="moves" aria-label="Coups joués">
      {rows.map(([white, black], i) => (
        <li key={i}>
          {white} {black}
        </li>
      ))}
    </ol>
  );
}
