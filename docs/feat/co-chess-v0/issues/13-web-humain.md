# web : l'Humain joue

Type: task
Status: resolved
Blocked by: 12

## Question

- Ajouter « Humain » aux listes déroulantes.
- `HumanPlayer` dont `nextMove` se résout quand l'Humain joue sur l'échiquier, par glisser ou par clic.
- Surlignage des coups légaux de la pièce sélectionnée (`squareStyles`).
- Plateau verrouillé pendant le tour d'un Bot.
- Choix de la pièce de promotion.
- Orientation du plateau du côté de l'Humain.
- Un coup illégal est refusé, sans forfait.

Fait quand on gagne ou perd une partie contre le Glouton dans le navigateur.

## Answer

Fait le 2026-11-23 : 6 tests sur `HumanPlayer` et un test d'UI où l'Humain joue en cliquant. **La vérification visuelle reste à faire par l'humain.**

- `players/human-player.ts` : `nextMove` reste en attente jusqu'à `play(move)`, qui renvoie `false` si le coup est illégal. On a aussi `needsPromotion(move)`. Le `signal` d'annulation est pris en compte. Côté UI, c'est une source externe (`subscribe`/`getSnapshot` = la vue de la partie pendant son tour).
- `Board.tsx` :
  - on joue par glisser ou par clic (pièce, puis case) ;
  - les coups légaux sont surlignés ;
  - le glisser n'est autorisé que pendant le tour de l'Humain, et seulement pour ses pièces ;
  - un sélecteur s'affiche pour la promotion (Dame, Tour, Fou, Cavalier) ;
  - le plateau est orienté du côté de l'Humain s'il y en a un seul.
- « Humain » est ajouté aux listes déroulantes. L'Humain n'a pas de limite de temps, et les Bots gardent leurs 5 s.
