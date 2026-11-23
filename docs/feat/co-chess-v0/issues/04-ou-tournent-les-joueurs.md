# Où tournent les Joueurs : navigateur, Web Worker ou client/serveur ?

Type: grilling
Status: resolved
Blocked by: 01

## Question

Où s'exécutent les Parties et les Bots en v0 ? Trois options : tout dans le thread principal du navigateur, Bots dans un Web Worker, ou Parties et Bots côté serveur avec l'échiquier en client.

Décision **déléguée à l'agent** : il propose une réponse argumentée (coût en v0, impact sur la V2 avec sa grille de N parties et son backend Elo, blocage de l'UI par un Bot lent, facilité d'écrire un bot), puis l'humain valide ou conteste.

## Answer

Décision proposée par l'agent et validée par l'humain le 2026-11-23.

**Pas de serveur en v0. La Partie et l'Humain tournent dans le fil principal du navigateur, et chaque Bot tourne dans un Web Worker.**

- **Pourquoi pas le fil principal** : un Bot qui réfléchit gèle l'interface (plus d'animation, pas de pause possible), et une boucle infinie ne peut pas être arrêtée.
- **Pourquoi le Worker** : l'interface reste fluide, et un Bot trop lent ou planté peut être coupé avec `worker.terminate()`, ce qui permet de le déclarer perdant. Vite le prend en charge nativement. Pour la grille V2, ça donne N Bots en parallèle sur plusieurs cœurs.
- **Pourquoi pas de serveur** : ce serait du coût (backend, déploiement, websocket) sans gain en v0. Un backend V2 pourra exécuter les mêmes fichiers de bots sous Node (worker_threads).

**Contraintes qui en découlent :**

- Contrat `Player` (ticket 06) : le coup est **asynchrone** (Promise). Les données transmises au Bot doivent pouvoir être copiées vers le Worker (FEN, historique), donc pas d'instance chess.js : le Bot reconstruit la sienne.
- Écrire un bot = écrire une fonction pure, sans DOM. Un adaptateur unique (`WorkerBotPlayer`) l'exécute dans un Worker, et le Worker reste invisible pour l'auteur du bot. Une option pour exécuter le bot dans le fil principal, pratique pour le débogage, est possible.
- Structure (ticket 05) : le cœur du jeu et les bots doivent être exécutables partout (navigateur, Worker, Node), sans dépendance au DOM ni à React.
