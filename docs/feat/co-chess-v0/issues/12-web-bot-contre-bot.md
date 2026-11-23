# web : regarder une partie bot contre bot

Type: task
Status: resolved
Blocked by: 11

## Question

Dans `apps/web`, première tranche verticale visible :

- `WorkerBotPlayer` et l'entrée du Worker, qui importe le registre. `{ algorithm, config }` est envoyé une fois, et `terminate()` est appelé en cas de temps dépassé ([ticket 04](04-ou-tournent-les-joueurs.md)) ;
- l'écran de configuration avec une liste déroulante par Camp, construite à partir des préréglages ;
- l'échiquier react-chessboard ([ticket 02](02-choix-lib-echiquier.md)), avec animation des coups, branché sur `Game` via `useSyncExternalStore` ;
- les contrôles : vitesse (0 à 2 s, 500 ms par défaut), pause/reprise, nouvelle partie ;
- l'affichage de qui a le trait, de la liste des coups et du résultat en fin de partie (mat, nulle avec sa raison, forfait avec sa raison).

Fait quand on choisit Aléatoire contre Glouton dans le navigateur et qu'on regarde la partie aller au bout.

## Answer

Fait le 2026-11-23. Les tests passent, et le build produit un fichier séparé pour le Worker (`bot.worker-*.js`). **La vérification visuelle dans un vrai navigateur reste à faire par l'humain** : l'agent n'a pas de navigateur.

- `players/protocol.ts`, `players/bot.worker.ts` et `players/worker-bot-player.ts` : le message `start` crée le Bot une seule fois (`registry.create`) et appelle son `onGameStart`. Un `move` correspond à un coup, et `end` termine la partie. Si le signal est annulé, le Worker est coupé (`terminate`).
- Test du protocole : un faux Worker branché sur le **vrai** `bot.worker.ts`, avec chaque message copié par `structuredClone`. Une partie va jusqu'au bout, et l'abandon coupe le Worker.
- `SetupForm` propose une liste déroulante par Camp, construite à partir des Préréglages. `GameScreen` affiche l'échiquier react-chessboard via `useSyncExternalStore`, la vitesse (0 à 2 s), pause/reprise, nouvelle partie, qui a le trait, la liste des coups (SAN, ajoutée à l'instantané de `Game`) et le résultat en français.
- `App` accepte une fabrique de Bots (`createBot`) que l'on peut remplacer. Les tests l'utilisent pour faire jouer les Bots dans le même fil, puisque jsdom n'a pas de Worker.
- Constat : avec des Joueurs du même fil et un délai de 0, la Partie ne rend jamais la main au navigateur. En production, ce n'est pas un problème, car chaque coup de Bot passe par un message de Worker.
