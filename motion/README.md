# MC Studio — Motion Reel (Remotion)

Film de motion design présentant MC Studio et ses réalisations.
Rendu programmatique avec [Remotion](https://remotion.dev) : tout est du React,
donc le reel se re-rend automatiquement quand le portfolio évolue.

## Lancer

```bash
cd motion
npm install
npm run dev          # Remotion Studio (preview + scrub)
```

## Rendre

```bash
npm run render           # 1920×1080 → out/mc-studio-reel.mp4
npm run render:square    # 1080×1080 → out/mc-studio-reel-square.mp4
npm run render:vertical  # 1080×1920 → out/mc-studio-reel-vertical.mp4
```

## Storyboard (55 s — 1650 frames @ 30 fps)

Le film est éditorial et work-first : le travail occupe l'image, la typo se
contente de nommer. Il pose surtout le nouveau positionnement — un studio,
deux voies.

| # | Scène | Frames | Intention |
|---|-------|--------|-----------|
| 01 | `Open` | 0–110 | Wordmark en filigrane géant + « Un studio de design et de développement. » |
| 02 | `TwoWays` | 110–330 | Le positionnement : **Business** et **Creator** côte à côte, chacun avec sa capture, sa promesse et sa preuve |
| 03 | `Trust` | 330–470 | Les logos clients défilent, celui du centre est saisi dans une pastille blanche |
| 04 | `LaneTitle` Business | 470–560 | Carton de chapitre : le nom de la voie et sa promesse |
| 05 | `Reel` Business | 560–966 | 7 captures plein cadre, pastille de discipline en bas à droite |
| 06 | `LaneTitle` Creator | 966–1056 | Même carton, en or |
| 07 | `Reel` Creator | 1056–1346 | 5 captures : communauté, app créateur, design produit, branding |
| 08 | `Numbers` | 1346–1504 | 20+ projets · 180 000 followers · 5/5, chiffre géant sur intitulé fantôme |
| 09 | `Close` | 1504–1650 | Wordmark, les deux voies nommées, et l'unique adresse : mc-studio.eu |

## Une seule adresse

Les deux voies sont nommées tout au long du film, mais le studio n'affiche
qu'une adresse, au carton final : `mc-studio.eu`. Aucun sous-domaine n'apparaît
nulle part.

## La pastille de discipline

Pendant les deux reels, une pastille blanche reste ancrée en bas à droite :
elle nomme la discipline (Branding, Site web, Design produit, Développement,
App créateur, Communauté) et le client. C'est elle qui donne au reel sa
lisibilité — le travail parle, la pastille classe.

## Direction artistique

Éditorial clair, repris de la version light du site :

- Papier `#E8E8E8`, encre `#141414`, gris fantôme `#D2D2D2`
- L'or `#F0BF6C` réservé à la voie Creator, jamais décoratif
- Host Grotesk en display, Inter en UI

## Structure

```
src/
  Video.tsx        # montage : la liste des plans et leurs durées
  Reframe.tsx      # crops sociaux (1:1, 9:16) avec fond flouté
  Root.tsx         # les 3 compositions
  projects.ts      # portfolio du reel, calqué sur app/data/projects.ts
  theme.ts         # tokens de marque
  shots.ts         # l'ordre des plans, leur discipline et leur voie
  stage.tsx        # dimensions de scène (16:9) partagées entre les crops
  components/      # Logo, Text, Editorial (Paper, FullBleed, DisciplinePill, Statement)
  scenes/          # Open, TwoWays, Trust, LaneTitle, Reel, Numbers, Close
```

`public/` est un lien symbolique vers le `public/` du site Nuxt : les captures
projets et les avatars sont donc toujours ceux de production, sans duplication.

## Mettre à jour le portfolio

Ajouter une entrée dans `src/projects.ts` (les mêmes champs que
`app/data/projects.ts`). Elle apparaît automatiquement dans le mur de la scène
`Wall` ; pour lui donner une scène complète, ajouter son slug à `featured` et
allonger `TIMELINE.showcase` de 86 frames dans `src/Video.tsx`.

Pour ajouter un plan au reel, ajouter une entrée dans `src/shots.ts` avec sa
voie (`business` ou `creator`), sa discipline et son cadrage. La durée du reel
suit automatiquement — chaque plan dure 58 frames.
