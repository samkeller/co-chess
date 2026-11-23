# Co-Chess

Faire s'affronter aux échecs des Joueurs interchangeables (humains ou bots) et regarder les parties se jouer.

## Démarrer

Prérequis : Node 26 (`.nvmrc`) et pnpm 12.

```sh
pnpm install
pnpm dev          # http://localhost:3006
```

Vérifications : `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## Structure

- `packages/core` : Moteur de règles, contrat des Joueurs, orchestration des Parties (headless)
- `packages/bots` : les Bots
- `apps/web` : l'application React

**Écrire un bot** : [docs/guides/ajouter-un-bot.md](docs/guides/ajouter-un-bot.md).

Vocabulaire : [CONTEXT.md](CONTEXT.md).
