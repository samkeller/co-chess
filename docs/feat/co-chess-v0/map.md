# Carte : Co-Chess v0

Label : `wayfinder:map` · Tracker : Markdown local (tickets dans [issues/](issues/))

## Destination

Une **v0 jouable dans le navigateur**, sur une base moderne et à jour. On choisit Blancs/Noirs = {Humain | Bot} via des listes déroulantes, puis on **voit** la partie se jouer sur un échiquier jusqu'au mat, au pat ou à la nulle (règles FIDE complètes). En bot contre bot, la vitesse est réglable. Au moins deux bots sont fournis (aléatoire, glouton), avec un guide « comment ajouter un bot » (un fichier + une ligne d'enregistrement). Le moteur est testé. La structure permet au jeu de devenir un composant d'une application plus large en V2 **sans réorganisation de l'arborescence**.

## Notes

- **La carte inclut l'exécution** (dérogation au mode « planification seule ») : les tickets d'implémentation sortent de la zone floue au fil des décisions.
- **Refonte libre** : dépendances, outillage et architecture peuvent tous être remis en question. Une remise en question = un ticket.
- Vocabulaire : [CONTEXT.md](../../../CONTEXT.md). Le pattern Strategy s'applique au **Joueur** : Humain et Bot sont interchangeables.
- Skills à consulter : `domain-modeling` (garder CONTEXT.md à jour), `codebase-design` (interfaces, découpage), `tdd` pour le moteur et l'orchestration.
- Préférence : pas de roue réinventée. On prend des libs éprouvées pour les règles et l'échiquier, et on garde le code maison pour ce qui fait la valeur du projet : les Joueurs, les Bots, l'orchestration.
- Décision « navigateur ou client/serveur » **déléguée** à l'agent : il la tranche avec des arguments écrits, et l'humain peut la contester.
- **Vision V2** (contexte, hors périmètre) : projet « fun » de dev, uniquement les échecs. Une centaine de parties visibles en même temps, génération automatique de Players, sélection naturelle, un vrai backend. La v0 ne doit pas l'empêcher : configuration des Bots sous forme de données sérialisables (génome), pool de Workers possible.
- Hébergement et CI : **GitHub** (le remote `origin` pointe encore vers GitLab).

## Decisions so far

<!-- une ligne par ticket résolu : [titre](lien) : résumé en une ligne -->

- [Quelle lib pour le Moteur de règles ?](issues/01-choix-lib-moteur-de-regles.md) : chess.js 1.4.x (BSD-2), encapsulé derrière l'interface du Moteur de règles. chessops est écarté (GPL-3, pas de triple répétition).
- [Quelle lib pour le composant échiquier ?](issues/02-choix-lib-echiquier.md) : react-chessboard 5.x (MIT, React 19). chessground est écarté (GPL-3, pas de wrapper React maintenu). Les PNG Cburnett (CC BY-SA) sont remplacés par les pièces de la lib. La performance de la grille V2 reste à prototyper.
- [Quelle chaîne d'outils cible ?](issues/03-chaine-outils-cible.md) : Vite 8, TS 7.0, Vitest 5 + testing-library, Oxlint + Prettier (ESLint écarté, incompatible TS 7), pnpm 12, Node 26 LTS, CI GitHub Actions en un seul job. La liste des restes de CRA à supprimer est dans le ticket.
- [Où tournent les Joueurs : navigateur, Web Worker ou client/serveur ?](issues/04-ou-tournent-les-joueurs.md) : pas de serveur en v0. Partie et Humain dans le fil principal, chaque Bot dans un Web Worker (on peut le couper s'il est trop lent). Contrat asynchrone, données copiables vers le Worker, cœur et bots exécutables partout.
- [Quelle structure de repo pour que le jeu soit un composant dès la v0 ?](issues/05-structure-du-repo.md) : monorepo pnpm `packages/core` + `packages/bots` + `apps/web`, paquets source sans build (`erasableSyntaxOnly`), toute la doc dans `docs/`, README minimal. La V2 ajoute des dossiers sans rien déplacer.
- [Quel contrat pour un Joueur (pattern Strategy) ?](issues/06-contrat-player.md) : `Player.nextMove(game): Promise<Move>`. Classe de base `Bot<Config>` avec une config en données sérialisables fixée à la construction, des fonctions génériques partagées, la vue complète à chaque tour et un état libre. Un bot = un module, le registre contient algorithmes et préréglages en données. Pas de fonction dans la config.
- [Qui orchestre une Partie, et garde-t-on Redux ?](issues/07-etat-et-orchestration.md) : `Game` headless dans core (`subscribe`/`getSnapshot` → `useSyncExternalStore`), Redux supprimé. Forfait si un Bot joue un coup illégal, plante ou dépasse les 5 s. Délai de lecture minimum de 500 ms. Contrôles v0 : vitesse, pause, nouvelle partie.
- [Squelette du monorepo et outillage](issues/08-squelette-monorepo.md) : fait. Toutes les vérifications passent, `core` et `bots` sont compilés sans DOM ni types Node, Node 26 importe les paquets en source.
- [core : Moteur de règles, GameView et classe Bot](issues/09-core-moteur-et-contrat-bot.md) : fait (26 tests). chess.js est isolé dans `Position`. Types en données pures avec `Side` = `'white'`/`'black'`. Classe `Bot<Config>` et `BotRegistry`.
- [core : orchestrateur Game](issues/10-core-orchestrateur-game.md) : fait (16 tests). Temps limite par Camp (`null` pour l'Humain). Le contrat `Player` est complété : `nextMove(game, signal)` et `onGameStart(game, side)`.
- [bots : Aléatoire et Glouton, et partie headless](issues/11-bots-aleatoire-et-glouton.md) : fait. Une dizaine de lignes par Bot, registre en une ligne par Algorithme. Une partie headless va jusqu'au bout.
- [web : regarder une partie bot contre bot](issues/12-web-bot-contre-bot.md) : fait (Worker, configuration, échiquier, vitesse, pause, liste des coups, résultat). Vérification visuelle humaine en attente.
- [web : l'Humain joue](issues/13-web-humain.md) : fait (`HumanPlayer`, clic ou glisser, coups légaux surlignés, promotion, orientation du plateau). Vérification visuelle humaine en attente.
- [Guide « ajouter un bot », éprouvé par un troisième bot](issues/14-guide-ajouter-un-bot.md) : `docs/guides/ajouter-un-bot.md`, éprouvé par `MinimaxBot` (prof. 1 et 2). Ajout de `Position.undo()`.

## Not yet specified

<!-- Vide : toute la zone floue est passée en tickets d'implémentation (08 à 15). -->

## Out of scope

- Grille de N parties simultanées (V2).
- Backend de persistance, historique des parties, Elo, winrates, statistiques (V2).
- Règles de décision en données (`RuleBot`, langage de règles, schéma de génome pour la sélection naturelle) : relève de la V2. Le contrat `Bot<Config>` du [ticket 06](issues/06-contrat-player.md) l'accueille sans modification.
- Pas à pas, relecture d'une partie terminée, export PGN : plus tard (voir [ticket 07](issues/07-etat-et-orchestration.md)).
- Humain contre humain : ce n'est pas un objectif de la v0, même s'il est peut-être gratuit.
