import { DEFAULT_MOVE_DELAY_MS } from '@co-chess/core';
import { useState } from 'react';
import { GameScreen } from './GameScreen.tsx';
import { workerBotFactory, type BotFactory } from './players/choice.ts';
import { SetupForm, type Matchup } from './SetupForm.tsx';

interface Props {
  /** Fabrique des Bots : par défaut, chaque Bot tourne dans un Web Worker. */
  createBot?: BotFactory;
  initialMoveDelayMs?: number;
}

export function App({
  createBot = workerBotFactory,
  initialMoveDelayMs = DEFAULT_MOVE_DELAY_MS,
}: Props) {
  const [matchup, setMatchup] = useState<Matchup | null>(null);

  return (
    <main>
      <h1>Co-Chess</h1>
      {matchup ? (
        <GameScreen
          matchup={matchup}
          createBot={createBot}
          initialMoveDelayMs={initialMoveDelayMs}
          onNewGame={() => setMatchup(null)}
        />
      ) : (
        <SetupForm onStart={setMatchup} />
      )}
    </main>
  );
}
