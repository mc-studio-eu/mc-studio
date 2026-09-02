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

## Storyboard (43 s — 1285 frames @ 30 fps)

Le film raconte une histoire, il n'énumère pas des compétences : les gens →
ce qu'ils apportent → ce qu'ils demandent vraiment → ce qu'on livre → la
preuve → l'invitation.

| # | Scène | Frames | Intention |
|---|-------|--------|-----------|
| 01 | `Opening` | 0–165 | Quatre vrais clients en collage de portraits. « Derrière chaque marque, il y a quelqu'un. » |
| 02 | `Tension` | 165–375 | Leurs problématiques réelles flottent en cartes autour de la phrase « Personne ne vient nous voir pour un site. » |
| 03 | `Turn` | 375–501 | Le basculement : « On vient nous voir pour être choisi. » / « Le reste, c'est notre métier. » |
| 04 | `Showcase` | 501–845 | Personal, CRM R&A Energy, Arises, Shika en mockup navigateur + second écran |
| 05 | `Wall` | 845–985 | Les 10 réalisations volent en grille, la caméra recule |
| 06 | `Testimonial` | 985–1125 | Le portrait de Yazid et son avis Google, cité mot pour mot |
| 07 | `Outro` | 1125–1285 | Carton clair : « Pour les gens qui construisent. » + wordmark, CTA, business.mc-studio.eu |

## Le fond ne s'arrête jamais

`ColorField` interpole entre deux palettes sur toute la durée d'une scène, et
les scènes s'enchaînent dans l'ordre du voyage lumineux :

`ember → amber → rose → night → warm → glow → dawn`

Le film part donc du noir chaud et finit dans la lumière. Les palettes sont
dans `src/palette.ts` : changer une couleur suffit à réaccorder tout le film.

## Rien d'inventé

`src/story.ts` ne contient que du réel : les portraits et rôles des clients,
leurs problématiques telles que documentées dans `app/data/projects.ts`
(`challenges`), et l'avis Google publié dans `i18n/locales/fr.json`. Aucune
phrase n'est mise dans la bouche de quelqu'un.

## Structure

```
src/
  Video.tsx        # montage : edit list + HUD + flashs de coupe
  Reframe.tsx      # crops sociaux (1:1, 9:16) avec fond flouté
  Root.tsx         # les 3 compositions
  projects.ts      # portfolio du reel, calqué sur app/data/projects.ts
  theme.ts         # tokens de marque
  palette.ts       # le voyage colorimétrique du film
  story.ts         # les personnes et leurs mots (tous réels)
  stage.tsx        # dimensions de scène (16:9) partagées entre les crops
  components/      # Logo, Text, Frames (navigateur/mobile), ColorField, Transitions
  scenes/          # Opening, Tension, Turn, Showcase, Wall, Testimonial, Outro
```

`public/` est un lien symbolique vers le `public/` du site Nuxt : les captures
projets et les avatars sont donc toujours ceux de production, sans duplication.

## Mettre à jour le portfolio

Ajouter une entrée dans `src/projects.ts` (les mêmes champs que
`app/data/projects.ts`). Elle apparaît automatiquement dans le mur de la scène
`Wall` ; pour lui donner une scène complète, ajouter son slug à `featured` et
allonger `TIMELINE.showcase` de 86 frames dans `src/Video.tsx`.

Un projet phare sans capture mobile peut fournir `secondary` : une seconde
capture desktop s'affiche alors en carte décalée à la place du mobile.
