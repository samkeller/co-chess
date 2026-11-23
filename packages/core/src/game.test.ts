import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Game } from './game.ts';
import type { GameView } from './game-view.ts';
import type { Player } from './player.ts';
import type { Move } from './types.ts';

const move = (uci: string): Move => ({ from: uci.slice(0, 2), to: uci.slice(2, 4) });

/** Un Joueur qui joue une suite de coups écrite d'avance. */
function scripted(...moves: string[]): Player {
  let i = 0;
  return { nextMove: async () => move(moves[i++]!) };
}

/** Le mat du berger inversé : les Noirs matent au 4e demi-coup. */
const foolsMate = () => ({ white: scripted('f2f3', 'g2g4'), black: scripted('e7e5', 'd8h4') });

describe('Game', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('joue la Partie jusqu’au mat et donne le résultat', async () => {
    const game = new Game({ ...foolsMate(), moveDelayMs: 0 });

    const result = await game.start();

    expect(result).toEqual({ kind: 'checkmate', winner: 'black' });
    const snapshot = game.getSnapshot();
    expect(snapshot.status).toBe('over');
    expect(snapshot.result).toEqual(result);
    expect(snapshot.history).toHaveLength(4);
    expect(snapshot.lastMove).toEqual({ from: 'd8', to: 'h4' });
  });

  test('l’instantané donne la liste des coups en notation algébrique', async () => {
    const game = new Game({ ...foolsMate(), moveDelayMs: 0 });

    await game.start();

    expect(game.getSnapshot().sanMoves).toEqual(['f3', 'e5', 'g4', 'Qh4#']);
  });

  test('prévient les abonnés à chaque coup, avec un nouvel instantané à chaque fois', async () => {
    const game = new Game({ ...foolsMate(), moveDelayMs: 0 });
    const seen: number[] = [];
    game.subscribe(() => seen.push(game.getSnapshot().history.length));

    await game.start();

    expect(seen).toEqual([0, 1, 2, 3, 4]);
  });

  test('l’instantané garde la même référence tant que rien ne change', () => {
    const game = new Game(foolsMate());

    expect(game.getSnapshot()).toBe(game.getSnapshot());
  });

  test('un abonné désabonné n’est plus prévenu', async () => {
    const game = new Game({ ...foolsMate(), moveDelayMs: 0 });
    const listener = vi.fn();
    const unsubscribe = game.subscribe(listener);
    unsubscribe();

    await game.start();

    expect(listener).not.toHaveBeenCalled();
  });

  describe('délai de lecture', () => {
    test('chaque coup prend au moins le délai, même si le Joueur répond tout de suite', async () => {
      const game = new Game({ ...foolsMate(), moveDelayMs: 500 });
      const plies = () => game.getSnapshot().history.length;

      void game.start();
      await vi.advanceTimersByTimeAsync(499);
      expect(plies()).toBe(0);
      await vi.advanceTimersByTimeAsync(1);
      expect(plies()).toBe(1);
      await vi.advanceTimersByTimeAsync(1500);
      expect(game.getSnapshot().result).toEqual({ kind: 'checkmate', winner: 'black' });
    });

    test('le temps de réflexion du Joueur compte dans le délai', async () => {
      const white: Player = {
        nextMove: () => new Promise((resolve) => setTimeout(() => resolve(move('e2e4')), 300)),
      };
      const game = new Game({ white, black: scripted('e7e5'), moveDelayMs: 500 });

      void game.start();
      await vi.advanceTimersByTimeAsync(500);

      expect(game.getSnapshot().history).toHaveLength(1);
    });

    test('le délai peut être changé pendant la Partie', async () => {
      const game = new Game({ ...foolsMate(), moveDelayMs: 2000 });

      void game.start();
      game.setMoveDelay(0);
      await vi.advanceTimersByTimeAsync(2000);

      expect(game.getSnapshot().status).toBe('over');
    });
  });

  describe('pause et abandon', () => {
    test('en pause, aucun coup n’est appliqué ; à la reprise, la Partie continue', async () => {
      const game = new Game({ ...foolsMate(), moveDelayMs: 0 });

      const result = game.start();
      game.pause();
      await vi.advanceTimersByTimeAsync(10_000);
      expect(game.getSnapshot().status).toBe('paused');
      expect(game.getSnapshot().history).toHaveLength(0);

      game.resume();

      expect(await result).toEqual({ kind: 'checkmate', winner: 'black' });
    });

    test('abandonner termine la Partie et annule le coup attendu', async () => {
      let signal: AbortSignal | undefined;
      const thinking: Player = {
        nextMove: (_game: GameView, s?: AbortSignal) => {
          signal = s;
          return new Promise<Move>(() => {});
        },
      };
      const game = new Game({ white: thinking, black: scripted(), moveTimeoutMs: null });

      const result = game.start();
      await vi.advanceTimersByTimeAsync(0);
      game.abort();

      expect(await result).toEqual({ kind: 'aborted' });
      expect(game.getSnapshot().status).toBe('over');
      expect(signal?.aborted).toBe(true);
    });

    test('abandonner une Partie en pause la termine', async () => {
      const game = new Game({ ...foolsMate(), moveDelayMs: 0 });

      const result = game.start();
      game.pause();
      game.abort();

      expect(await result).toEqual({ kind: 'aborted' });
    });
  });

  describe('début et fin de Partie', () => {
    test('chaque Joueur est prévenu du début (avec son Camp) puis de la fin', async () => {
      const calls: string[] = [];
      const observed = (player: Player): Player => ({
        nextMove: (game, signal) => {
          calls.push(`coup ${game.side}`);
          return player.nextMove(game, signal);
        },
        onGameStart: (_game, side) => void calls.push(`début ${side}`),
        onGameEnd: (result) => void calls.push(`fin ${result.kind}`),
      });
      const { white, black } = foolsMate();
      const game = new Game({ white: observed(white), black: observed(black), moveDelayMs: 0 });

      await game.start();

      expect(calls.slice(0, 3)).toEqual(['début white', 'début black', 'coup white']);
      expect(calls.slice(-2)).toEqual(['fin checkmate', 'fin checkmate']);
    });

    test('un Joueur qui plante au démarrage perd par Forfait', async () => {
      const black: Player = {
        ...scripted(),
        onGameStart: () => {
          throw new Error('pas prêt');
        },
      };
      const game = new Game({ white: scripted('e2e4'), black, moveDelayMs: 0 });

      expect(await game.start()).toEqual({
        kind: 'forfeit',
        winner: 'white',
        reason: expect.stringMatching(/pas prêt/),
      });
    });
  });

  describe('Forfait', () => {
    test('un Joueur qui joue un coup illégal perd par Forfait', async () => {
      const game = new Game({ white: scripted('e2e5'), black: scripted(), moveDelayMs: 0 });

      expect(await game.start()).toEqual({
        kind: 'forfeit',
        winner: 'black',
        reason: expect.stringMatching(/illégal/),
      });
    });

    test('un Joueur qui plante perd par Forfait', async () => {
      const crashing: Player = {
        nextMove: async () => {
          throw new Error('boum');
        },
      };
      const game = new Game({ white: scripted('e2e4'), black: crashing, moveDelayMs: 0 });

      expect(await game.start()).toEqual({
        kind: 'forfeit',
        winner: 'white',
        reason: expect.stringMatching(/boum/),
      });
    });

    test('un Joueur qui dépasse son temps perd par Forfait, et son signal est annulé', async () => {
      let signal: AbortSignal | undefined;
      const slow: Player = {
        nextMove: (_game: GameView, s?: AbortSignal) => {
          signal = s;
          return new Promise<Move>(() => {});
        },
      };
      const game = new Game({
        white: slow,
        black: scripted(),
        moveDelayMs: 0,
        moveTimeoutMs: 1000,
      });

      const result = game.start();
      await vi.advanceTimersByTimeAsync(1000);

      expect(await result).toEqual({
        kind: 'forfeit',
        winner: 'black',
        reason: expect.stringMatching(/temps/),
      });
      expect(signal?.aborted).toBe(true);
    });

    test('un Camp sans limite de temps peut réfléchir indéfiniment', async () => {
      const thinking: Player = { nextMove: () => new Promise<Move>(() => {}) };
      const game = new Game({
        white: thinking,
        black: scripted(),
        moveDelayMs: 0,
        moveTimeoutMs: { white: null, black: 1000 },
      });

      void game.start();
      await vi.advanceTimersByTimeAsync(60_000);

      expect(game.getSnapshot().status).toBe('running');
    });
  });
});
