# core : orchestrateur Game

Type: task
Status: resolved
Blocked by: 09

## Question

Implémenter en TDD l'orchestrateur `Game` décidé dans le [ticket 07](07-etat-et-orchestration.md) :

- la boucle de jeu ;
- `onGameStart`/`onGameEnd` ;
- le délai de lecture minimum ;
- le temps limite et le forfait (temps dépassé, coup illégal, plantage) ;
- pause, reprise et abandon ;
- `setMoveDelay` ;
- `subscribe` et `getSnapshot` avec un instantané immuable ;
- toutes les fins de partie.

Tests avec de faux Joueurs, sans Worker ni React (horloge simulée de Vitest pour les délais).

En fin de ticket : supprimer `docs/feat/co-chess-v0/prototypes/`, qui ne sert plus de référence.

## Answer

Fait le 2026-11-23 en TDD : 16 tests sur `Game`, 42 au total dans `core`. Le prototype est supprimé.

- `new Game({ white, black, moveDelayMs = 500, moveTimeoutMs = 5000 })`. `moveTimeoutMs` accepte un nombre, `null` (pas de limite) ou une valeur **par Camp**, par exemple `{ white: null }` pour un Humain chez les Blancs. C'est l'app qui configure, la Partie ne sait toujours pas qui est humain.
- `start()` renvoie une promesse qui se résout avec le `GameResult`. On a aussi `pause()`, `resume()`, `abort()` et `setMoveDelay()`, qui agit aussi sur le coup en cours.
- `subscribe` et `getSnapshot` sont des fonctions liées. L'instantané est figé (`Object.freeze`) et garde la même référence tant que rien ne change, ce qui est compatible avec `useSyncExternalStore`.
- **Petits compléments au contrat `Player`** (ticket 06) :
  - `nextMove(game, signal?)` : le `signal` est annulé quand le coup n'est plus attendu (temps dépassé, abandon). Le `WorkerBotPlayer` s'en servira pour couper son Worker.
  - `onGameStart(game, side)` reçoit le Camp du Joueur.
  - `onGameEnd` est appelé sur les deux Joueurs, quelle que soit la fin. Ses erreurs sont ignorées.
- Forfaits : coup illégal, plantage (y compris dans `onGameStart`), temps dépassé.
