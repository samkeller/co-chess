# Quel contrat pour un Joueur (pattern Strategy) ?

Type: prototype
Status: resolved
Blocked by: 01, 04

## Question

À quoi ressemble l'interface `Player` qui rend l'Humain et les Bots interchangeables ? Questions à trancher :

- Ce qu'un Joueur reçoit : FEN, objet position de la lib, coups légaux, historique, temps restant ?
- Ce qu'il renvoie : un coup, en asynchrone (Promise) ?
- Comment l'Humain se branche : son coup vient d'un clic ou d'un glisser sur l'échiquier.
- Comment un Bot se déclare : nom affiché, paramètres. Un même algorithme avec deux réglages différents donne deux Bots.
- Comment il s'enregistre pour apparaître dans les listes déroulantes.

Critère clé : écrire un nouveau Bot = un fichier + une ligne. Prototyper deux ou trois variantes d'interface et écrire un bot aléatoire avec chacune, pour comparer.

## Answer

Validé par l'humain le 2026-11-23, après un prototype de trois variantes (A : classe, B : fonction pure `defineBot`, C : état et cycle de vie) puis de la variante retenue (prototype supprimé depuis : `packages/core` en est l'implémentation). La variante B (`defineBot` pur) a été jugée trop naïve. On retient une variante « A+ » : **une classe, construite à partir de données**.

- `interface Player { nextMove(game: GameView): Promise<Move> }`, implémenté par `HumanPlayer` (piloté par l'échiquier) et `WorkerBotPlayer` (qui relaie vers le Worker).
- `abstract class Bot<Config> implements Player` dans `@co-chess/core` :
  - la `config` est fixée une fois à la construction et doit être de la **donnée pure sérialisable** ;
  - des **fonctions génériques partagées** sont disponibles pour tous les bots (`isEndgame()`, matériel, phase…) ;
  - `nextMove(game)` reçoit à chaque tour la **vue complète** de la partie (position, historique, coups légaux), donc le bot n'a pas à suivre la position lui-même ;
  - l'instance garde l'état qu'elle veut (phase, cache, arbre de recherche) ;
  - deux étapes facultatives : `onGameStart` et `onGameEnd`.
- `game.position()` renvoie une copie jouable de la position. L'auteur du bot ne voit jamais chess.js.
- Un bot = **un module** dans `packages/bots` (fichier unique ou dossier) avec `static meta = { id, name, defaults }`. Il peut composer d'autres bots ou briques en interne.
- Le registre contient les algorithmes (une ligne chacun) et des **préréglages en données** `{ algorithm, name, config }`. Les listes déroulantes sont construites à partir des préréglages.
- Dans le Worker : `{ algorithm, config }` est reçu au début de la partie, puis `new Bot(config)` est appelé une fois, et la même instance sert toute la partie. Un bot trop lent est coupé (`terminate`) et perd par forfait.
- **Écarté** :
  - une fonction `computeNextMove` dans la config : elle ne passe pas au Worker, ne se stocke pas et ne se mute pas ;
  - du code source évalué à l'exécution : impossible à muter ;
  - `defineBot` pur (B) : trop naïf pour des bots avec phases et état ;
  - des étapes de cycle de vie obligatoires qui suivent la position (C) : fragile.
- **V2 (hors périmètre)** : les règles de décision **en données** (arbre de conditions et d'actions, fonctions d'évaluation pondérées), interprétées par un `RuleBot`, qui est une simple sous-classe de `Bot`. C'est la base du génome pour la sélection naturelle. Le contrat v0 l'accueille sans modification.
