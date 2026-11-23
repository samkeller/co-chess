# Squelette du monorepo et outillage

Type: task
Status: resolved
Blocked by:

## Question

Remplacer l'ancien projet par le squelette décidé, sans aucune logique métier. Fait quand `pnpm install && pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` passe à la racine.

- Supprimer `src/`, `index.html`, `App.css`, `package-lock.json` et tous les restes de CRA listés dans le [ticket 03](03-chaine-outils-cible.md). Garder `favicon.ico` dans `apps/web/public/`.
- `pnpm-workspace.yaml`, `packageManager: pnpm@12.x`, `.nvmrc` = 26, `"type": "module"`.
- `packages/core`, `packages/bots` et `apps/web`, chacun avec son `package.json` (exports vers `src/index.ts`) et ses scripts `test` et `typecheck` ([ticket 05](05-structure-du-repo.md)).
- TypeScript 7, tsconfig de base partagé avec `erasableSyntaxOnly`, références de projets et `tsc -b`.
- Vite 8 + plugin-react 6 pour `apps/web`. Vitest 5 partout. jsdom + testing-library pour `apps/web` uniquement.
- Oxlint + Prettier.
- `apps/web` affiche une page vide « Co-Chess ».
- README racine minimal (prérequis, commandes, lien vers `docs/`).

Prérequis de poste : Node 26 (la machine est en 24.13). Si Node 26 n'est pas installé, le signaler à l'humain plutôt que de contourner.

## Answer

Fait le 2026-11-23. `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` passe, et Node 26 importe `@co-chess/core` directement en source.

- Supprimé : `src/`, `index.html`, `package-lock.json`, l'ancien `tsconfig`, `vite.config.ts` et le README CRA. `favicon.ico` est déplacé dans `apps/web/public/`.
- Racine : `pnpm-workspace.yaml` (avec un **catalog** pour aligner typescript, vitest et @types/node), `packageManager: pnpm@12.21.0`, `.nvmrc` = 26, `tsconfig.base.json` partagé, `tsc -b` via des références de projets, `oxlint --type-aware`, Prettier (`singleQuote`, largeur 100), README minimal.
- `tsconfig.base.json` : `lib: ES2023` **sans DOM ni types Node** pour `core` et `bots`, ce qui fait respecter le caractère headless par le compilateur. Ajout de `noUncheckedIndexedAccess` en plus du template.
- `apps/web` : Vite 8 (port 3006 conservé), Vitest + jsdom + jest-dom, une page « Co-Chess » et son test.
- Les prototypes et dossiers de docs sont exclus du lint et du format.
