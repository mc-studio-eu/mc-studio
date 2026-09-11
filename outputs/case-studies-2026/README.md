# Case studies MC Studio : réécriture (septembre 2026)

11 case studies réécrites selon la structure : Hero → Le client → Le challenge → Les objectifs → Notre approche → La solution → Focus features → Le résultat → Témoignage → CTA.

**➡️ Version à intégrer maintenant : [copy-final-v1.md](copy-final-v1.md)**. Les 11 textes, sans marqueur ni chiffre non confirmé.

Chaque fichier projet contient la version enrichie, à compléter plus tard : A. Diagnostic · B. Informations manquantes · C. Structure · D. Copy final · E. Suggestions visuelles · F. 3 headlines alternatives.

| # | Projet | Fichier | Format recommandé |
|---|---|---|---|
| 01 | Maison AWL | [01-maison-awl.md](01-maison-awl.md) | Long (projet phare Creators) |
| 02 | Personal | [02-personal.md](02-personal.md) | Long |
| 03 | Shika Consulting | [03-shika-consulting.md](03-shika-consulting.md) | Long (projet phare Business) |
| 04 | CRM R&A Energy | [04-crm-ra-energy.md](04-crm-ra-energy.md) | Long (projet phare outil métier) |
| 05 | AMG Promotion | [05-amg-promotion.md](05-amg-promotion.md) | Moyen |
| 06 | Arises | [06-arises.md](06-arises.md) | Moyen |
| 07 | Souji Nova | [07-souji-nova.md](07-souji-nova.md) | Court |
| 08 | R&A Energy (site) | [08-ra-energy.md](08-ra-energy.md) | Moyen, lié au CRM |
| 09 | Sotraya | [09-sotraya.md](09-sotraya.md) | Moyen |
| 10 | MC Studio Creator | [10-mc-studio-creator.md](10-mc-studio-creator.md) | Court, à étiqueter « Projet interne » |
| 11 | Fontaines VTC | [11-fontaines-vtc.md](11-fontaines-vtc.md) | Court |

---

## Diagnostic transversal

### Ce qui fonctionne déjà
- La structure contexte → challenge → approche → solution → résultat existe déjà. La plupart des portfolios de studios s'arrêtent à des captures d'écran.
- Plusieurs headlines racontent déjà une transformation. Maison AWL, Sotraya et Souji Nova sont bonnes et ont été conservées.
- Le ton est sobre, avec peu de superlatifs.
- 6 projets sur 11 ont un témoignage client réel.

### Ce qui manque pour convaincre un prospect à 5-20 k€
1. **Aucune preuve chiffrée**, à part les 180 000 abonnés de Maison AWL. Les 11 sections « Le résultat » reprennent la même formule (« X dispose désormais de… »). Un acheteur lit ça comme « pas de résultat ».
2. **Aucune donnée de cadrage** : durée, périmètre (pages, écrans), stack, année. C'est la première chose qu'un prospect cherche pour se projeter sur son budget et son délai.
3. **« La solution » n'est qu'une liste de livrables.** Rien ne relie une fonctionnalité à une valeur business. La nouvelle section *Focus features* comble ce manque.
4. **Il n'y a ni section Objectifs, ni CTA propre à chaque projet.**
5. **Des faits forts présents dans le code du site ont disparu de ta nouvelle version** (voir ci-dessous).

### Faits déjà présents dans le code du site, mais absents de ta version
Je les ai réintégrés dans le copy. **Ils sont à valider**, puisqu'ils viennent du site et pas de ton brief.

| Projet | Fait | Source |
|---|---|---|
| Maison AWL | **10 000 utilisateurs, 5,5 % de conversion audience → users** | `i18n/locales/fr-creator.json` (`case_study.stats`) |
| Maison AWL | Créatrice : Célia. Prestataires **formés à sa méthode**. Home organizing + batch cooking | `app/data/creator.ts`, `app/data/projects.ts` |
| CRM R&A Energy | Nuxt + Supabase, API SIRET et adresse, **vérification Google Calendar + temps de trajet**, **5 rôles appliqués jusqu'à la base**, carte des tournées, historique automatique | `projects.ts` |
| CRM R&A Energy | Avant : doublons, RDV intenables faute de temps de trajet, pas d'historique, données sensibles visibles par tous | `projects.ts` |
| CRM R&A Energy | 6 modules visibles : Tableau de bord, Prospects, Planning, Carte des RDV, Équipe, Paramètres | capture `crm-planning.png` |
| AMG Promotion | Références **Groupe SEB, ALTRAD, Police Nationale**. Entreprise de 20 à 50 personnes | `fr.json`, `projects.ts` |
| Sotraya | Fondateur Daris Rabouhi, **audit gratuit de 30 min**, démo avant/après + scénario d'onboarding automatisé | `projects.ts` |
| Personal | Bilingue FR/EN, feed, favoris, moments personnels, Remix, brouillons légende/carrousel/Reel, **ne publie jamais à la place du créateur** | `projects.ts` |
| Shika | Navigation par **profil d'association** et par service, page Tarifs, blog, clients partout en France | `projects.ts` + capture `process.webp` |
| Arises | Promesse du site : « Turn chaotic tasks into a balanced schedule », avant/après Work / Life | capture `arises-before-after.png` |
| R&A Energy | **Témoignage de Yazid C. (co-fondateur)**, le plus complet du site, absent de ta version | `fr.json` |

### Formulations trop génériques, à supprimer partout
- « dispose désormais d'une présence digitale… » (5 occurrences)
- « direction artistique plus premium », « image plus premium » : il faut dire *au niveau de quoi* (des clients ? des concurrents ?).
- « expérience responsive », « performance », « design responsive » présentés comme des livrables : c'est le minimum attendu. À garder seulement avec un chiffre (score Lighthouse).
- « rassurer sans surcharger », « renforcer la perception de son expertise », « soutenir commercialement le niveau de ses prestations ».
- La tournure « X ne consiste pas simplement à Y » revient 3 fois et perd sa force.
- « Une marque, un site et un produit pensés comme un même système » sert à la fois pour Arises et pour Personal.

---

## Recommandations stratégiques

1. **Hiérarchiser.** Pour vendre entre 5 et 20 k€, quatre projets portent la preuve : Maison AWL, CRM R&A Energy, Shika, Personal. Ils méritent le format long et la première place de la grille. Les autres gardent la même structure, en version condensée.
2. **Présenter R&A Energy comme un seul client, en deux chapitres.** Un client qui revient après son site pour confier son outil métier, c'est la meilleure preuve de confiance du portfolio. Il faut lier les deux pages (« Chapitre 1 : le site » → « Chapitre 2 : le CRM »).
3. **Assumer que MC Studio Creator est un projet interne.** Mélangé aux projets clients sans étiquette, il affaiblit la crédibilité de la grille. Deux options : l'étiqueter « Projet interne », ou le déplacer vers la page Creators / À propos.
4. **Clarifier le statut de Personal** : client externe, produit MC Studio ou co-construction ? Un prospect se posera la question.
5. **Refaire certaines captures.**
   - `crm-planning.png` montre un planning vide (« Aucun RDV cette semaine »), la barre Nuxt DevTools et ton nom en admin. À refaire avec des données de démo.
   - Il faut aussi vérifier qu'aucune capture CRM n'expose de vraies données prospects (RGPD).
   - AMG et Fontaines VTC n'ont qu'une seule image chacun.
   - Maison AWL n'a aucune capture desktop dans `projects.ts`.
6. **Corriger un nom** : « Jean francois Fialaire » dans `projects.ts` devient « Jean-François Fialaire ».
7. **Le lien Sotraya** pointe vers `sotraya.vercel.app`. Pour un prospect, ça fait projet non terminé. Il faut le domaine définitif, s'il existe.
8. **Chiffre de 10 000 utilisateurs (Maison AWL)** : retiré le 11/09/2026 des anciens fichiers `fr-creator.json` / `en-creator.json`. Ces fichiers ne sont plus chargés par aucune page, et le `/creators` en ligne ne l'affichait pas. S'il est confirmé plus tard, c'est la meilleure preuve du site et il faudra le mettre en avant.

---

## Informations à récupérer pour TOUS les projets
- Année et durée du projet (en semaines)
- Périmètre : nombre de pages ou d'écrans
- Stack technique
- Score Lighthouse mobile actuel (2 minutes sur PageSpeed Insights, tu peux le faire toi-même)
- Analytics / Search Console : trafic et demandes de contact sur les 3 mois avant et après la mise en ligne
- Un témoignage enrichi (script ci-dessous)

## Script pour obtenir des témoignages exploitables
Les témoignages actuels tiennent en une ou deux lignes et parlent de satisfaction, pas de valeur. À envoyer par WhatsApp :

> Bonjour [Prénom], on met à jour la page de notre projet ensemble sur notre site. Est-ce que tu pourrais répondre en 2-3 phrases à ces 3 questions ? Un vocal suffit, on retranscrit et on te fait valider.
> 1. Quelle était la situation avant le projet ? Qu'est-ce qui te bloquait ?
> 2. Pourquoi avoir choisi MC Studio ?
> 3. Qu'est-ce qui a changé depuis la mise en ligne ? (demandes reçues, temps gagné, image auprès de tes clients, chiffres si tu en as)
