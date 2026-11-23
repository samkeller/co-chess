# bots : Aléatoire et Glouton, et partie headless

Type: task
Status: resolved
Blocked by: 10

## Question

Dans `@co-chess/bots`, créer les deux Bots de la v0 :

- **Aléatoire** ;
- **Glouton** : prend la pièce de plus forte valeur, sinon joue un coup aléatoire.

Les enregistrer avec leurs préréglages. Test d'intégration : une `Game` Aléatoire contre Glouton, sans délai, va jusqu'à une fin légale, sans Worker.

## Answer

Fait le 2026-11-23 : 5 tests dans `packages/bots`.

- `RandomBot` (`random.ts`) et `GreedyBot` (`greedy.ts`, avec les valeurs des pièces dans la config). Chacun tient en une dizaine de lignes.
- `registry.ts` : `new BotRegistry([RandomBot, GreedyBot], [préréglages Aléatoire, Glouton])`.
- Ajout dans `core` de la fonction partagée `this.pickRandom(items)` sur `Bot`.
- Test d'intégration : une `Game` Aléatoire contre Glouton, sans délai, va jusqu'à un mat ou une nulle.
