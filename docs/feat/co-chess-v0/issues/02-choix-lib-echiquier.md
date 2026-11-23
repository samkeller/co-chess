# Quelle lib pour le composant échiquier ?

Type: research
Status: resolved
Blocked by:

## Question

L'échiquier affiché s'appuiera sur une lib existante. **Laquelle ?** Comparer brièvement react-chessboard et chessground (avec son wrapper React s'il en existe un maintenu), plus une troisième seulement si elle s'impose.

Critères : compatibilité React 19, saisie d'un coup par l'Humain (drag et/ou clic), affichage des coups légaux, animation des coups joués par un Bot, plateau en lecture seule pendant le tour d'un Bot, orientation, licence (chessground est en GPL : quel impact ?), légèreté, et capacité à afficher plusieurs petits plateaux (grille V2).

Vérifier aussi la licence des images de pièces actuelles (`src/game/lib/pieces/img/Chess_*t60.png`, a priori Wikimedia) : faut-il les garder, les attribuer ou les remplacer par les pièces fournies par la lib ?

Recherche courte : une recommandation argumentée.

## Answer

**react-chessboard** (v5.12.4, MIT, peer `react ^19`, publié le 2026-11-22) : composant React natif qui couvre drag/clic, animation du diff de position, lecture seule (`allowDragging: false`) et orientation. Les coups légaux sont surlignés via `squareStyles` à partir de notre moteur.
chessground est plus léger (meilleur pour la grille V2) mais en **GPL-3.0** (oblige à publier l'app sous GPL), et sans wrapper React maintenu (le dernier date de 2022, React ≤ 18). Perf de la grille V2 avec react-chessboard en lecture seule : à valider par un prototype.
Pièces actuelles : PNG Wikimedia de Cburnett, **CC BY-SA 3.0** (identiques octet pour octet) → les supprimer au profit des pièces MIT de react-chessboard (ou les créditer si on les garde).
