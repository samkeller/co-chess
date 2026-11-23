# Quelle lib pour le Moteur de règles ?

Type: research
Status: resolved
Blocked by:

## Question

Le Moteur de règles s'appuiera sur une lib existante (règles FIDE complètes : roque, prise en passant, promotion, échec, mat, pat, triple répétition, 50 coups, matériel insuffisant). **Laquelle ?** Comparer brièvement chess.js et chessops, plus une troisième candidate seulement si elle s'impose.

Critères : règles complètes, types TypeScript natifs, fonctionne sans DOM (navigateur, Worker, Node), vitesse de génération des coups suffisante pour des bots de recherche simples (minimax peu profond), maintenance active, licence compatible, et facilité d'exposer une position à un Bot (FEN, liste de coups légaux).

Recherche courte : une recommandation argumentée, pas un état de l'art.

## Answer

**chess.js** (1.4.x, BSD-2-Clause), encapsulé derrière l'interface du Moteur de règles.

- Licence permissive. chessops est GPL-3, ce qui imposerait la GPL à co-chess.
- Règles FIDE complètes fournies, y compris la triple répétition et les 50 coups. chessops ne gère pas la répétition.
- API directe pour les Bots (`fen()`, `moves({ verbose })`, `move()`/`undo()`, `hash()`), TypeScript natif, aucune dépendance, fonctionne en Node, en navigateur et en Worker.
- Limite : plus lent que les bitboards de chessops. Suffisant en V0 ; l'encapsulation permet de changer d'implémentation pour la simulation de masse en V2.
