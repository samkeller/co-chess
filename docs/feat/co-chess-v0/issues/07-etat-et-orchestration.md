# Qui orchestre une Partie, et garde-t-on Redux ?

Type: grilling
Status: resolved
Blocked by: 01, 06

## Question

Qui fait avancer une Partie : demander son coup au Joueur dont c'est le tour, le valider auprès du Moteur de règles, l'appliquer, détecter la fin, gérer le délai de lecture ? Et comment l'UI React observe-t-elle cet état ?

Options : garder Redux Toolkit, utiliser un store léger (Zustand, ou un store maison via `useSyncExternalStore`), ou un orchestrateur headless qui émet des événements. L'orchestrateur doit rester utilisable sans React : grille V2, serveur éventuel, matchs headless.

## Answer

Validé par l'humain le 2026-11-23.

**Un orchestrateur `Game` headless dans `@co-chess/core`. L'UI s'y abonne via `useSyncExternalStore`. Redux est supprimé** (`@reduxjs/toolkit`, `react-redux`, `src/store`).

- API : `new Game({ white, black, moveDelayMs, moveTimeoutMs })`, avec `start()`, `pause()`, `resume()`, `abort()` et `setMoveDelay(ms)`. Pour l'observation : `subscribe(listener)` et `getSnapshot()`, qui renvoie un instantané immuable `{ fen, history, turn, status, result, lastMove }`.
- Boucle : le Joueur au trait reçoit `nextMove(view)`, puis le coup est validé, appliqué, la fin de partie est vérifiée, et on attend le délai de lecture s'il n'est pas déjà écoulé.
- `Game` appelle `onGameStart`/`onGameEnd` (facultatifs dans `Player`) sur les deux Joueurs. Un bot se comporte ainsi de la même façon dans un Worker et hors Worker.
- Coup illégal d'un Bot, plantage ou temps dépassé : **forfait** (le Worker est coupé). Un coup illégal de l'Humain est simplement refusé par l'échiquier, et l'Humain n'a pas de limite de temps.
- Fins de partie : mat, pat, triple répétition, 50 coups, matériel insuffisant (via chess.js), plus forfait et abandon (`abort`).
- Valeurs par défaut :
  - `moveDelayMs` = 500. C'est un délai _minimum_ entre deux coups, réglable de 0 à 2 s dans l'UI, et 0 en headless.
  - `moveTimeoutMs` = 5000 pour un Bot.
- Contrôles de lecture v0 : vitesse, pause/reprise, nouvelle partie. Le pas à pas et la relecture d'une partie terminée sont pour plus tard.
- La grille V2 = N instances de `Game`, chacune observée par sa case.
