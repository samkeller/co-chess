import { registry } from '@co-chess/bots';
import type { Player } from '@co-chess/core';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { App } from './App.tsx';
import type { BotFactory } from './players/choice.ts';

/** Comme un vrai Worker, chaque réponse arrive dans une tâche séparée. */
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

/** jsdom n'a pas de Worker : les Bots jouent dans le même fil pendant les tests. */
const inThread: BotFactory = (preset) => {
  const bot = registry.create(preset);
  return {
    nextMove: async (game) => {
      await nextTask();
      return bot.nextMove(game);
    },
  };
};

/** Des Joueurs qui jouent le mat du berger inversé, quel que soit le choix. */
const foolsMate = (): BotFactory => {
  const scripts = [
    ['f2f3', 'g2g4'],
    ['e7e5', 'd8h4'],
  ];
  let created = 0;
  return () => {
    const moves = scripts[created++]!;
    let i = 0;
    const player: Player = {
      nextMove: async () => {
        await nextTask();
        const uci = moves[i++]!;
        return { from: uci.slice(0, 2), to: uci.slice(2, 4) };
      },
    };
    return player;
  };
};

const moveList = () => screen.getByRole('list', { name: 'Coups joués' });

test('on choisit deux Bots, on lance la Partie, on la regarde et on la contrôle', async () => {
  const user = userEvent.setup();
  render(<App createBot={inThread} initialMoveDelayMs={0} />);

  await user.selectOptions(screen.getByLabelText('Blancs'), 'Aléatoire');
  await user.selectOptions(screen.getByLabelText('Noirs'), 'Glouton');
  await user.click(screen.getByRole('button', { name: 'Lancer la partie' }));

  await screen.findByText(/Trait aux/);
  await expect.poll(() => within(moveList()).queryAllByRole('listitem').length).toBeGreaterThan(1);

  await user.click(screen.getByRole('button', { name: 'Pause' }));
  expect(await screen.findByText('En pause.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reprendre' }));
  expect(await screen.findByText(/Trait aux/)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  expect(screen.getByRole('button', { name: 'Lancer la partie' })).toBeInTheDocument();
});

test('le résultat et les coups s’affichent en fin de Partie', async () => {
  const user = userEvent.setup();
  render(<App createBot={foolsMate()} initialMoveDelayMs={0} />);

  await user.click(screen.getByRole('button', { name: 'Lancer la partie' }));

  expect(await screen.findByText('Échec et mat : les Noirs gagnent.')).toBeInTheDocument();
  expect(
    within(moveList())
      .getAllByRole('listitem')
      .map((li) => li.textContent),
  ).toEqual(['f3 e5', 'g4 Qh4#']);
});

const square = (id: string) => document.querySelector<HTMLElement>(`[data-square="${id}"]`)!;

test('l’Humain joue en cliquant ; un coup illégal est ignoré ; le Bot répond', async () => {
  const user = userEvent.setup();
  render(<App createBot={inThread} initialMoveDelayMs={0} />);

  await user.selectOptions(screen.getByLabelText('Blancs'), 'Humain');
  await user.selectOptions(screen.getByLabelText('Noirs'), 'Glouton');
  await user.click(screen.getByRole('button', { name: 'Lancer la partie' }));
  await screen.findByText('Trait aux Blancs.');

  await user.click(square('e2'));
  await user.click(square('e5'));
  expect(within(moveList()).queryAllByRole('listitem')).toHaveLength(0);

  await user.click(square('e2'));
  await user.click(square('e4'));

  await expect
    .poll(() => within(moveList()).queryAllByRole('listitem')[0]?.textContent)
    .toMatch(/^e4 \S+/);
  expect(await screen.findByText('Trait aux Blancs.')).toBeInTheDocument();
});
