# MC Studio Creator — Votre audience. Votre application.

Nouvelle composition indépendante : **McStudioCreator**, 1920 × 1080,
30 images/s, 30 secondes. Texte français. Film sans bande sonore.
Le premier showreel reste disponible sous son nom d'origine.

## Prévisualiser et exporter

Depuis le dossier `motion` :

```bash
npm run dev               # choisir McStudioCreator
npm run review:creator    # images clés dans out/creator/review/
npm run render:creator    # out/creator/mc-studio-creator.mp4
npm run typecheck
```

Pour vérifier un passage précis :
`npm run review:creator -- --frames=128,218,310,428,593,758`.

## Direction et montage

Lilas et blanc cassé, Inter en grands caractères, surlignages, collages
légèrement inclinés et panneaux qui se déploient. Les logos, textures et
captures proviennent des assets réels de MC Studio Creator.

| Temps | Séquence |
| --- | --- |
| 0–4 s | « Votre audience est déjà là. » — plateformes sociales en collage |
| 4–7 s | « Créons votre application. » — signature Creator |
| 7–14 s | Maison AWL — présentation, puis application et version mobile |
| 14–19,5 s | Personal — de la promesse à l'interface réelle |
| 19,5–25 s | Analyser, valider, construire, lancer, grandir |
| 25–30 s | « Faites grandir votre univers. » — logo Creator et mc-studio.eu |

Les entrées se recouvrent sur 15 images. Les animations sont déterministes,
pilotées par la frame Remotion. Aucun projet, résultat client ou revenu n'est
inventé. Les interfaces présentées sont les captures originales du portfolio.

## Modifier

- `src/creator/CreatorVideo.tsx` : montage, durées, textes et scènes nommées.
- `src/creator/design.tsx` : palette, titrage, cadres et signature.
- `src/creator/assets.ts` : références aux originaux, sans duplication.
- `scripts/render.mjs` : rendu commun ; option `--creator` pour ce film.

La direction s'appuie sur `app/pages/creators.vue`, le positionnement de
`i18n/locales/fr-creator-world.json`, et les assets de `public/assets/creator/`.
Les captures Personal proviennent de `public/img/project/personal/`.
La page en ligne `/creators` n'a pas pu être chargée lors de cette réalisation ;
les sources locales du site ont servi de référence. Aucun nouvel accès Figma
n'a été nécessaire pour cette direction distincte.

Les polices locales et leurs licences sont réutilisées. Aucun nouveau package
ni téléchargement d'asset n'est nécessaire sur cet environnement déjà installé.
