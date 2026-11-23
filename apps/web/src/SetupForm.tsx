import { registry } from '@co-chess/bots';
import type { Side } from '@co-chess/core';
import { useState, type FormEvent } from 'react';
import { sideName } from './describe-result.ts';
import type { PlayerChoice } from './players/choice.ts';

export type Matchup = Record<Side, PlayerChoice>;

const HUMAN = 'human';
const presets = registry.presets;

/** Valeur d'une option : 'human', ou l'index du Préréglage. */
const choiceOf = (value: string): PlayerChoice =>
  value === HUMAN ? { kind: 'human' } : { kind: 'bot', preset: presets[Number(value)]! };

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
    <form className="setup" onSubmit={submit}>
      {(['white', 'black'] as const).map((side) => (
        <label key={side}>
          {sideName(side)}
          <select
            value={selected[side]}
            onChange={(e) => setSelected({ ...selected, [side]: e.target.value })}
          >
            <option value={HUMAN}>Humain</option>
            {presets.map((preset, index) => (
              <option key={preset.name} value={String(index)}>
                {preset.name}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button type="submit">Lancer la partie</button>
    </form>
  );
}
