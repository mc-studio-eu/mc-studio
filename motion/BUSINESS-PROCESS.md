# MC Studio Business — Une méthode claire

Troisième film : **McStudioBusinessProcess**, 30 secondes, 1920 × 1080,
30 images/s. Français, sans audio. Export indépendant :
`out/business/mc-studio-business-process.mp4`.

## Prévisualisation et export

Depuis `motion` :

```bash
npm run dev                  # sélectionner McStudioBusinessProcess
npm run review:business      # images clés
npm run render:business      # MP4 complet
npm run typecheck
```

Vérification ciblée :
`npm run review:business -- --frames=83,203,323,473,623,773`.

## Contenu

Un film explicatif sur la collaboration, sans captures de portfolio.
Une ligne de progression relie cinq étapes sur un fond quadrillé ivoire,
avec la typographie Host Grotesk, des traits noirs et l'or MC Studio.

| Temps | Message | Schéma animé |
| --- | --- | --- |
| 0–3 s | Un projet ambitieux. Une méthode claire. | Apparition du fil conducteur |
| 3–7 s | D'abord, vous écouter. | Contexte → objectifs → priorités |
| 7–11 s | Un cadre clair. Avant de créer. | Proposition : périmètre, budget, planning |
| 11–16 s | Vous voyez. Vous ajustez. Vous validez. | Maquette abstraite et boucle de retours |
| 16–21 s | On construit. On vérifie. | Design → développement → tests |
| 21–26 s | On lance. On avance. | Validation, mise en ligne et livraison |
| 26–30 s | Du premier échange au lancement. | Signature MC Studio Business |

## Sources et limites

Le récit synthétise le processus Business existant :

- `i18n/locales/fr.json` : `process` (découverte, proposition, kickoff) et
  `faq.items.2` / `faq.items.5` (validations, retours et collaboration).
- `app/data/offers.ts` : cadrage, design et livraison des offres Business.
- https://mc-studio.eu/business : design, développement, mise en ligne et
  vérification qualité.

Les cinq étapes sont une synthèse éditoriale du parcours complet, et ne
remplacent pas les trois étapes de démarrage présentées sur le site.
Les cartes, documents et maquettes sont des **schémas de méthode**, sans
client, budget, délai, métrique ou interface produit inventés. Le film ne
promet pas un volume de maintenance ou d'évolutions incluses après livraison.

## Modification

`src/business/BusinessProcess.tsx` contient les scènes nommées, la palette,
les composants de diagramme et `BUSINESS_TIMELINE`.
`src/business/assets.ts` est volontairement vide : seuls le wordmark existant
et les deux polices locales sont nécessaires. Le script de rendu partagé
utilise `--business` et conserve des sorties séparées pour les trois films.
