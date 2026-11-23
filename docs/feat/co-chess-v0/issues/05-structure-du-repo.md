# Quelle structure de repo pour que le jeu soit un composant dès la v0 ?

Type: grilling
Status: resolved
Blocked by: 03, 04

## Question

Quelle arborescence et quel découpage en modules ou paquets permettent qu'en V2 le jeu d'échecs devienne un composant parmi d'autres (grille de parties, backend, Elo) **sans réorganiser les fichiers** ?

Options : un monorepo avec workspaces (par exemple `packages/chess-core`, `packages/bots`, `apps/web`) ou un paquet unique avec des frontières de dossiers strictes. Préciser ce qui est headless et ce qui dépend de React, et où vivent les Bots et le guide « ajouter un bot ».

## Answer

Validé par l'humain le 2026-11-23.

**Monorepo pnpm, avec des paquets source (sans étape de build) :**

```
packages/core   @co-chess/core  Moteur de règles (chess.js), contrat Player, orchestration de Partie. Headless : ni DOM ni React.
packages/bots   @co-chess/bots  Les Bots et le registre. Dépend de core uniquement.
apps/web        @co-chess/web   App React : configuration, échiquier (react-chessboard), Humain, adaptateur Worker. Dépend de core et bots.
docs/                           Toute la doc, dont le guide « ajouter un bot ». Le README racine est minimal (lancer le projet + liens).
```

- Pas de paquet `ui` séparé : la grille V2 sera un écran de `apps/web`, pas une autre app.
- Les `exports` des paquets pointent sur `src/index.ts`. Vite et Node 26 lisent directement le TypeScript. `erasableSyntaxOnly` est activé (pas d'`enum` ni de `namespace`). Chaque paquet garde ses propres scripts `test` et `typecheck`, et `tsc -b` vérifie tout depuis la racine. Un build pourra être ajouté par paquet si la V2 en a besoin.
- La V2 **ajoute** des dossiers (`apps/server`, éventuellement un paquet pour les matchs en masse ou l'évolution), sans rien déplacer.
- L'ancien `src/`, `index.html` et le reste sont supprimés. Seul `favicon.ico` est conservé, dans `apps/web/public/`.
- Contexte V2 transmis par l'humain : on reste sur les échecs. Objectifs : une centaine de parties visibles en même temps, la génération automatique de Players, la sélection naturelle et un vrai backend. Conséquences : la configuration d'un Bot doit être de la donnée sérialisable (un génome), et l'adaptateur Worker ne doit pas empêcher un pool de Workers plus tard.
