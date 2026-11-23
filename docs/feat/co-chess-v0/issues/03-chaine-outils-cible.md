# Quelle chaîne d'outils cible ?

Type: research
Status: resolved
Blocked by:

## Question

Quelle chaîne d'outils adopter pour repartir sur une base à jour ? Points à trancher :

- **Vite** 6 → 8 et `@vitejs/plugin-react` 4 → 6 : changements cassants, configuration minimale.
- **TypeScript** 5.9 ou 7 (compilateur en Go) : est-ce mûr pour un projet Vite + React, avec quel support éditeur et quels pièges ?
- **Tests** : Vitest (évident avec Vite ?) et testing-library pour l'UI.
- **Lint et format** : ESLint (config flat) + Prettier, ou Biome ?
- **Gestionnaire de paquets** : npm ou pnpm, en tenant compte d'un éventuel monorepo (workspaces) à décider dans le ticket 05.
- Version de **Node** cible et CI GitHub Actions minimale.
- La **liste des restes de CRA** à supprimer : `react-app-env.d.ts`, `eslintConfig react-app`, le test jest orphelin, `target es5`, `moduleResolution node`, `@types/redux*`, etc.

Livrer une recommandation par point, avec les versions précises.

## Answer

- **Vite `^8.3.8` + `@vitejs/plugin-react` `^6.3.0`** : la config actuelle n'utilise aucune option retirée, donc rien à migrer. On garde la config minimale `plugins: [react()]`.
- **TypeScript `~7.0.2`** : stable, actif par défaut dans VS Code et retenu par le template officiel Vite. `tsconfig` à réécrire d'après le template : `es5`, `moduleResolution: node` et `baseUrl` sont supprimés, et `types: []` est désormais la valeur par défaut, donc il faut déclarer `vite/client`.
- **Tests** : Vitest `^5.1.1` + jsdom `^31.0.1` + @testing-library/react `^16.3.3`, /dom `^10.4.2`, /jest-dom `^8.0.0` (setup `@testing-library/jest-dom/vitest`), /user-event `^14.6.13`.
- **Lint** : Oxlint `^1.94.0` + `oxlint-tsgolint` (type-aware), comme le template officiel Vite. Format : Prettier `^3.10.1`. ESLint est écarté, car typescript-eslint 8.73 ne gère pas TS 7.0. Biome `2.6.8` reste une alternative acceptable.
- **pnpm `12.21.0`** (`packageManager`), avec workspaces si le ticket 05 retient le monorepo. Corepack n'est plus livré avec Node ≥ 25.
- **Node 26 LTS** (26.13.1, `.nvmrc`). CI : un job `checkout@v7` → `pnpm/action-setup@v6` → `setup-node@v7`, puis install, lint, format:check, typecheck, test, build.
- **Restes de CRA** : `react-app-env.d.ts`, `App.test.tsx`, `eslintConfig`, `browserslist`, `@types/jest|redux|redux-thunk|react-redux`, `redux`/`redux-thunk` en direct, `tsconfig` CRA, README/index.html/App.css/.gitignore CRA, `favicon.ico` à déplacer dans `public/`, `package-lock.json`. Reliquats Redux morts : `store/reducer.ts`, `store/type.d.ts`.
