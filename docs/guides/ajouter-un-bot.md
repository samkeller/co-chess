# Ajouter un bot

Un **Bot** = un **Algorithme** (une classe que tu écris) + une **configuration** (des données).
Vocabulaire : [CONTEXT.md](../../CONTEXT.md).

## 1. Écrire l'Algorithme

Crée `packages/bots/src/<mon-bot>.ts` (ou un dossier `packages/bots/src/<mon-bot>/` avec un `index.ts` si le bot grossit) :

```ts
import { Bot, type GameView, type Move } from '@co-chess/core';

type Config = { prudence: number };

export class MonBot extends Bot<Config> {
  static meta = {
    id: 'mon-bot', // identifiant stable de l'Algorithme
    name: 'Mon bot',
    defaults: { prudence: 0.5 }, // configuration par défaut
  };

  async nextMove(game: GameView): Promise<Move> {
    // this.config.prudence est disponible, déjà fusionné avec les valeurs par défaut.
    return this.pickRandom(game.legalMoves);
  }
}
```

## 2. L'enregistrer

Dans `packages/bots/src/registry.ts` :

- ajoute `MonBot` à la liste des Algorithmes ;
- ajoute un ou plusieurs **Préréglages**. Ce sont eux qui apparaissent dans les listes de choix de l'app :

```ts
{ algorithm: 'mon-bot', name: 'Mon bot (prudent)', config: { prudence: 0.9 } },
```

Lance `pnpm dev` : ton bot est dans les listes déroulantes.

## Ce que reçoit `nextMove(game)`

À chaque tour, la **vue complète** de la Partie, du point de vue du Camp au trait :

| Champ                                  | Contenu                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `game.side`                            | ton Camp : `'white'` ou `'black'`                                                                                                                                        |
| `game.legalMoves`                      | les coups légaux : `{ from, to, promotion?, san, piece, captured? }`                                                                                                     |
| `game.fen`, `game.history`, `game.ply` | la position, les coups joués, le nombre de demi-coups                                                                                                                    |
| `game.position()`                      | une **copie jouable** de la position : `play(move)`, `undo()`, `legalMoves()`, `result()`, `turn`, `fen`. Chaque appel renvoie une nouvelle copie, modifie-la librement. |

Renvoie un des `game.legalMoves` (ou `{ from, to, promotion? }`).

## Outils fournis par la classe `Bot`

- `this.config` : ta configuration.
- `this.pickRandom(items)` : un élément au hasard.
- `this.material(game, side?)` : matériel de `side` (par défaut le tien) moins celui de l'adversaire.
- `this.isEndgame(game)`, `this.phase(game)` → `'opening' | 'middlegame' | 'endgame'`.
- Les mêmes fonctions, plus `PIECE_VALUES`, sont exportées par `@co-chess/core`. Elles s'appliquent aussi à une `Position` pendant une recherche : `material(position, position.turn)`.

Exemple complet d'un bot qui cherche en profondeur (`play`/`undo` sur une copie de la position) : [`packages/bots/src/minimax.ts`](../../packages/bots/src/minimax.ts).

## État et étapes facultatives

Le Bot est créé **une fois par Partie** (dans un Web Worker). Ses champs d'instance persistent donc d'un coup à l'autre : phase en cours, cache, arbre de recherche…

- `onGameStart(game, side)` : préparer l'état avant le premier coup ;
- `onGameEnd(result)` : réagir à la fin.

Tu n'as **pas** besoin de suivre la position toi-même : `nextMove` reçoit toujours la vue complète.

## Règles

- **La configuration est de la donnée pure** : nombres, chaînes, tableaux, objets. Pas de fonction : elle est refusée à la construction, parce qu'elle doit voyager vers le Worker, se stocker et pouvoir être générée.
- **Pas de DOM ni de React** : le bot tourne dans un Worker, et plus tard aussi sous Node.
- **5 secondes par coup** au maximum. Au-delà, le bot perd par **Forfait**. Il perd aussi s'il joue un coup illégal ou s'il plante.

## Tester son bot en headless

Dans `packages/bots/src/<mon-bot>.test.ts`, puis `pnpm --filter @co-chess/bots test` :

```ts
import { Game, Position, viewOf } from '@co-chess/core';
import { expect, test } from 'vitest';
import { MonBot } from './mon-bot.ts';
import { RandomBot } from './random.ts';

test('trouve le mat du couloir', async () => {
  const game = viewOf(Position.fromFen('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1').toData());
  expect(await new MonBot().nextMove(game)).toMatchObject({ from: 'a1', to: 'a8' });
});

test('joue une Partie complète contre Aléatoire', async () => {
  const game = new Game({ white: new MonBot(), black: new RandomBot(), moveDelayMs: 0 });
  expect(['checkmate', 'draw']).toContain((await game.start()).kind);
});
```
