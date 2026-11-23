# CI GitHub et bascule du remote

Type: task
Status: resolved
Blocked by: 08

## Question

- `.github/workflows/ci.yml` en un seul job, selon le [ticket 03](03-chaine-outils-cible.md) : checkout, pnpm/action-setup, setup-node avec `.nvmrc`, puis install `--frozen-lockfile`, lint, format:check, typecheck, test et build.
- Bascule du remote `origin` de GitLab vers GitHub. **HITL** : l'humain crée (ou indique) le repo GitHub, puis on pousse. Aucun push sans son accord.

Fait quand la CI est verte sur GitHub.

## Answer

Fait le 2026-11-23. `.github/workflows/ci.yml` tourne en un seul job, avec la version de pnpm lue dans `packageManager` et Node lu dans `.nvmrc`. L'humain avait déjà basculé `origin` vers https://github.com/samkeller/co-chess. La branche `feat/v0` a été poussée, et la [PR #1](https://github.com/samkeller/co-chess/pull/1) a une CI **verte** (24 s).

Ajout : `.gitattributes` (`eol=lf`), sinon les fins de ligne CRLF de Windows feraient échouer `format:check` en local.
