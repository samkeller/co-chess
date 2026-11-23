# core : Moteur de règles, GameView et classe Bot

Type: task
Status: resolved
Blocked by: 08

## Question

Implémenter en TDD (skill `tdd`) dans `@co-chess/core` :

- le **Moteur de règles** qui encapsule chess.js ([ticket 01](01-choix-lib-moteur-de-regles.md)). chess.js ne doit pas fuiter dans l'API publique ;
- les types `Move`, `Side`, `GameView` (position, historique, coups légaux, demi-coup courant), avec `position()` qui renvoie une copie jouable ;
- `interface Player` et `abstract class Bot<Config>` avec `static meta`, la fusion de la config avec `defaults` et des fonctions génériques (`material`, `isEndgame`, `phase`) ([ticket 06](06-contrat-player.md)) ;
- un registre (algorithmes + préréglages en données) et `createBot(algorithm, config)`.

Référence : `prototypes/06-player/variant-a-plus/`. On s'en inspire sans copier-coller aveuglément.

## Answer

Fait le 2026-11-23 en TDD : 26 tests dans `packages/core`.

- `Position` (`position.ts`) est le Moteur de règles et le **seul** fichier qui importe chess.js. Elle offre `initial`, `fromFen`, `fromHistory`, `turn`, `fen`, `history`, `legalMoves`, `play` (lève une erreur si le coup est illégal), `result` et `toData`.
- Types publics en données pures (`types.ts`) :
  - `Side = 'white' | 'black'` et des noms de pièces lisibles (`'knight'`…) plutôt que les codes de chess.js ;
  - `GameData` ;
  - `BoardResult` ;
  - `GameResult`, qui ajoute le forfait et l'abandon.
- `GameView` = `GameData` + `position()`, une copie reconstruite à partir de l'historique, donc fidèle même pour la triple répétition. `viewOf(data)` reconstruit la vue côté Worker.
- `Player`, avec deux étapes facultatives : `onGameStart` et `onGameEnd`.
- `Bot<Config>` : `static meta`, config = `structuredClone(defaults + config)`. Une fonction dans la config est refusée avec un message clair. Les fonctions partagées sont protégées : `material`, `isEndgame`, `phase`.
- `analysis.ts` : les mêmes fonctions en version pure, plus `PIECE_VALUES`.
- `BotRegistry(algorithms, presets)` : `create(preset)` ou `create(algorithm, config)`. Il refuse un Algorithme inconnu ou un doublon.
- `types/runtime.d.ts` déclare les seules fonctions globales communes au navigateur, au Worker et à Node (`structuredClone`, `setTimeout`).
