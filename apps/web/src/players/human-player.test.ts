import { Position, viewOf } from '@co-chess/core';
import { describe, expect, test } from 'vitest';
import { HumanPlayer } from './human-player.ts';

const start = () => viewOf(Position.initial().toData());
const promotionReady = () => viewOf(Position.fromFen('8/4P3/8/8/8/2k5/8/4K3 w - - 0 1').toData());

describe('HumanPlayer', () => {
  test('n’attend rien tant que ce n’est pas son tour', () => {
    expect(new HumanPlayer().getSnapshot()).toBeNull();
  });

  test('son coup est celui que la personne joue sur l’échiquier', async () => {
    const human = new HumanPlayer();
    const move = human.nextMove(start());

    expect(human.getSnapshot()?.legalMoves).toHaveLength(20);
    expect(human.play({ from: 'e2', to: 'e4' })).toBe(true);

    expect(await move).toEqual({ from: 'e2', to: 'e4' });
    expect(human.getSnapshot()).toBeNull();
  });

  test('un coup illégal est refusé et le tour continue', async () => {
    const human = new HumanPlayer();
    const move = human.nextMove(start());

    expect(human.play({ from: 'e2', to: 'e5' })).toBe(false);
    expect(human.getSnapshot()).not.toBeNull();

    human.play({ from: 'd2', to: 'd4' });
    expect(await move).toEqual({ from: 'd2', to: 'd4' });
  });

  test('une promotion demande de choisir la pièce', async () => {
    const human = new HumanPlayer();
    const move = human.nextMove(promotionReady());

    expect(human.needsPromotion({ from: 'e7', to: 'e8' })).toBe(true);
    expect(human.needsPromotion({ from: 'e1', to: 'e2' })).toBe(false);
    expect(human.play({ from: 'e7', to: 'e8' })).toBe(false);
    expect(human.play({ from: 'e7', to: 'e8', promotion: 'knight' })).toBe(true);

    expect(await move).toEqual({ from: 'e7', to: 'e8', promotion: 'knight' });
  });

  test('quand le coup n’est plus attendu, le tour s’arrête', async () => {
    const human = new HumanPlayer();
    const controller = new AbortController();
    const move = human.nextMove(start(), controller.signal);

    controller.abort();

    await expect(move).rejects.toThrow();
    expect(human.getSnapshot()).toBeNull();
  });

  test('prévient ses abonnés quand son tour commence et se termine', () => {
    const human = new HumanPlayer();
    let notified = 0;
    human.subscribe(() => notified++);

    void human.nextMove(start());
    human.play({ from: 'e2', to: 'e4' });

    expect(notified).toBe(2);
  });
});
