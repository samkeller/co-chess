# Co-Chess

Faire s'affronter aux échecs des joueurs interchangeables, humains ou bots, et regarder les parties se jouer sur un échiquier. Le but premier est de pouvoir écrire facilement de nouveaux bots.

## Language

**Partie** (Game) :
Une partie d'échecs, de la position initiale jusqu'à son résultat, opposant deux Joueurs.
_Avoid_ : match, round

**Camp** (Side) :
Blancs ou Noirs, la place qu'un Joueur occupe dans une Partie.
_Avoid_ : couleur (pour désigner le joueur), équipe

**Joueur** (Player) :
Ce qui occupe un Camp et fournit un coup quand c'est son tour. Humain et Bot sont interchangeables : la Partie ne sait pas lequel elle fait jouer.
_Avoid_ : IA, adversaire, engine

**Humain** (Human) :
Un Joueur dont les coups sont saisis par une personne sur l'échiquier.
_Avoid_ : user, joueur (seul, pour dire humain)

**Bot** :
Un Joueur dont les coups sont choisis par un algorithme. Deux réglages différents du même algorithme (par exemple une profondeur 2 et une profondeur 4) sont deux Bots distincts.
_Avoid_ : IA, engine, stratégie (pour désigner le bot lui-même)

**Algorithme** (Algorithm) :
Le code d'un Bot, écrit une fois. Combiné à une configuration en données, il donne un Bot.
_Avoid_ : stratégie, IA

**Préréglage** (Preset) :
Un Algorithme associé à un nom et à une configuration donnée, proposé dans les listes de choix des Joueurs.
_Avoid_ : profil, template

**Forfait** (Forfeit) :
Défaite d'un Bot qui joue un coup illégal, plante ou dépasse son temps limite.
_Avoid_ : disqualification, crash

**Moteur de règles** (Rules engine) :
Ce qui connaît la position, les coups légaux et le résultat d'une Partie. Il ne choisit jamais de coup.
_Avoid_ : engine (ambigu avec les moteurs d'échecs type Stockfish), logique
