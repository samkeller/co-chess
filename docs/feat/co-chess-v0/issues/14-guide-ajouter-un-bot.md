# Guide « ajouter un bot », éprouvé par un troisième bot

Type: task
Status: resolved
Blocked by: 12

## Question

Écrire `docs/guides/ajouter-un-bot.md` : le contrat `Bot<Config>`, les fonctions génériques disponibles, `nextMove` et la vue de la partie, l'état d'instance, les étapes facultatives, l'enregistrement et les préréglages. Préciser les règles à respecter : config en données pures, pas de DOM, temps limite, forfait sur coup illégal. Expliquer comment tester son bot en headless.

**Éprouver le guide** en ajoutant un troisième bot en suivant uniquement le guide : un Minimax avec deux préréglages de profondeur. Corriger le guide là où ça coince. Lier le guide depuis le README racine.

## Answer

Fait le 2026-11-23. Le guide est dans [docs/guides/ajouter-un-bot.md](../../../guides/ajouter-un-bot.md), avec un lien depuis le README.

**Éprouvé** en ajoutant `MinimaxBot` (négamax + alpha-bêta, config `{ depth }`, préréglages « prof. 1 » et « prof. 2 ») : un fichier, plus une ligne d'Algorithme et deux lignes de Préréglages dans le registre. 4 tests : mat du couloir, piège de la dame que la profondeur 2 évite, partie complète, préréglages présents.

Frictions trouvées et corrigées :

- il manquait `Position.undo()` pour les recherches : ajouté dans `core`, avec des tests ;
- le guide ne disait pas que les fonctions d'analyse s'appliquent aussi à une `Position` pendant la recherche : ajouté, avec un lien vers `minimax.ts` comme exemple ;
- l'exemple de test du guide montrait une position qui n'était pas un mat : remplacée par le mat du couloir.
