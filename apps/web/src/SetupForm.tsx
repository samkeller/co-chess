import { registry } from '@co-chess/bots';
import type { Side } from '@co-chess/core';
import { Button, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { useState, type FormEvent } from 'react';
import { sideName } from './describe-result.ts';
import { SideSwatch } from './PlayerPlate.tsx';
import type { PlayerChoice } from './players/choice.ts';

export type Matchup = Record<Side, PlayerChoice>;

const HUMAN = 'human';
const presets = registry.presets;

/** Valeur d'une option : 'human', ou l'index du Préréglage. */
const choiceOf = (value: string): PlayerChoice =>
  value === HUMAN ? { kind: 'human' } : { kind: 'bot', preset: presets[Number(value)]! };

const options = [
  { group: 'Humain', items: [{ value: HUMAN, label: 'Humain' }] },
  { group: 'Bots', items: presets.map((p, i) => ({ value: String(i), label: p.name })) },
];

/** Choisir qui joue chaque Camp, puis lancer la Partie. */
export function SetupForm({ onStart }: { onStart: (matchup: Matchup) => void }) {
  const [selected, setSelected] = useState<Record<Side, string>>({
    white: '0',
    black: String(Math.min(1, presets.length - 1)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onStart({ white: choiceOf(selected.white), black: choiceOf(selected.black) });
  };

  return (
    <Paper component="form" onSubmit={submit} withBorder p="xl" maw={440} mx="auto" mt="xl">
      <Stack gap="lg">
        <div>
          <Title order={2}>Nouvelle partie</Title>
        </div>
        {(['white', 'black'] as const).map((side) => (
          <Select
            key={side}
            label={sideName(side)}
            data={options}
            value={selected[side]}
            onChange={(value) => value && setSelected({ ...selected, [side]: value })}
            allowDeselect={false}
            leftSection={<SideSwatch side={side} />}
          />
        ))}
        <Button type="submit" size="md">
          Lancer la partie
        </Button>
      </Stack>
    </Paper>
  );
}
