# Design

## Identité

**Un club d'échecs, le soir.** On vient regarder des bots s'affronter, ou les défier. Ambiance : salle sombre et chaude, échiquier ivoire et feutre vert, laiton pour ce qui demande l'attention. Pas de codes de tableau de bord SaaS.

## Décisions

- **Thème sombre par défaut** : la lumière est sur l'échiquier, pas autour.
- **Une seule couleur d'accent, le laiton** (`primaryColor: 'brass'`) : action principale, sélection, dernier coup joué. Le **rouge** est réservé à l'échec.
- **Gris « encre » chauds** : la palette `dark` de Mantine est remplacée par des tons bruns.
- **Typographie** : titres en serif (Palatino, Georgia), comme une feuille de partie ; texte en police système ; coups en chasse fixe. Uniquement des polices système, rien à télécharger.
- **Favicon et logo** : un coin d'échiquier ivoire et vert avec un pion de laiton (`apps/web/public/favicon.svg`).

## Conventions

- **Tout passe par Mantine** : `theme.ts`, les composants et leurs props de style. Pas de fichier CSS.
- **Couleurs de l'échiquier** : l'objet `board` de [`theme.ts`](../apps/web/src/theme.ts) (cases, dernier coup, sélection, échec, points et anneaux de coups possibles). Ce sont les seules couleurs écrites en dur.
- **Hiérarchie des cases** : dernier coup < échec < sélection < coups possibles. Un point pour un déplacement, un anneau pour une prise.
- **Boutons** : `filled` (laiton) pour l'action principale d'un écran, `light` pour une action de jeu (Pause), `default` pour le reste.
- **Surfaces** : `Paper withBorder` pour les panneaux, `Overlay` flouté sur l'échiquier pour les moments forts (promotion, fin de partie).
- **Camps** : toujours accompagnés de leur pastille (`SideSwatch`), aux couleurs des cases.
