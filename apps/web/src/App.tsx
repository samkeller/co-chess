import { DEFAULT_MOVE_DELAY_MS } from '@co-chess/core';
import { AppShell, Container, Group, Image, Title } from '@mantine/core';
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
    <AppShell header={{ height: 64 }} padding="lg">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" gap="sm">
            <Image src="/favicon.svg" w={30} h={30} alt="" />
            <Title order={1} size="h3">
              Co-Chess
            </Title>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
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
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
