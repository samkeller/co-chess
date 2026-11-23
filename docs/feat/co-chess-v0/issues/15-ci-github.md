# CI GitHub et bascule du remote

Type: task
Status: claimed
Blocked by: 08

## Question

- `.github/workflows/ci.yml` en un seul job, selon le [ticket 03](03-chaine-outils-cible.md) : checkout, pnpm/action-setup, setup-node avec `.nvmrc`, puis install `--frozen-lockfile`, lint, format:check, typecheck, test et build.
- Bascule du remote `origin` de GitLab vers GitHub. **HITL** : l'humain crée (ou indique) le repo GitHub, puis on pousse. Aucun push sans son accord.

Fait quand la CI est verte sur GitHub.
