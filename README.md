# Abbey Road Songbook

Recueil interactif des 17 titres d'*Abbey Road* (The Beatles, 1969) : accords guitare et piano, doigtés en couleur et lecture calée sur le tempo de chaque morceau.

## Lancer l'app

Ouvrez `index.html` dans un navigateur, ou publiez le dépôt avec GitHub Pages. Il n'y a ni étape de build ni dépendance.

## Fonctionnalités

- **17 titres** avec structure complète (intro, couplets, refrains, ponts, solos) et durée de chaque accord en temps.
- **Lecture dans le temps** : tempo réel de chaque morceau (BPM), changements de tempo en cours de morceau (*You Never Give Me Your Money*, *The End*), décompte de 4 temps, métronome, réglage 50–130 %, bouton *Tap* pour se caler sur le disque.
- **Accords au-dessus des paroles**, placés proportionnellement à leur durée sur la ligne. Un `^` dans le texte permet de placer un accord à la main.
- **Diagrammes guitare** : 6 cordes, cordes à vide et étouffées, barrés, et une couleur par doigt (index, majeur, annulaire, auriculaire).
- **Clavier piano** : main droite en position fondamentale avec doigté (1-3-5, 1-2-3-5), main gauche à la basse, mêmes couleurs par doigt.
- **Transposition et capodastre** (par exemple *Here Comes the Sun* en capo 7 avec les formes D, G, A7).
- **Son des accords** (synthé simple) pour entendre la grille.
- **Éditeur de grille** pour corriger un accord, une durée ou une section. Les modifications restent enregistrées dans le navigateur.
- Raccourcis : `Espace` lecture/pause, `←` `→` accord précédent/suivant, `R` retour au début.

## Paroles

Les paroles d'*Abbey Road* sont protégées par le droit d'auteur et ne sont pas incluses. La zone **Coller les paroles**, juste au-dessus de la partition, permet de coller les vôtres (livret, site sous licence) : une ligne de texte par ligne chantée. Elles se placent automatiquement sous les accords et sont enregistrées localement.

## Fiabilité des grilles

Les grilles sont des transcriptions simplifiées. Les titres marqués **« Grille à vérifier »** (surtout le medley de la face B) méritent une vérification à l'oreille. Utilisez *Éditer la grille* pour les corriger.

## Structure

- `index.html` : la page
- `css/style.css` : le thème noir et bleu profond, pixelisé
- `js/chords.js` : théorie des accords, voicings guitare (formes vérifiées à la main, plus un générateur pour les accords transposés), voicings piano
- `js/songs.js` : les grilles des 17 titres
- `js/app.js` : rendu, moteur de lecture, audio, éditeurs
