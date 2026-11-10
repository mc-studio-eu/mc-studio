# Roadmap du portail

La Roadmap remplace le suivi par jalons dans les espaces client et administrateur.
Elle réutilise la session du portail, l’isolation par organisation, les ressources
du projet et la file persistante de notifications.

## Organisation et permissions

Le planning suit la hiérarchie projet, phases, étapes et validations. Les phases
et leurs dates sont configurées par l’administrateur ; aucun calendrier type
n’est imposé aux nouveaux projets. Les étapes peuvent référencer des ressources
du même projet et des étapes dont elles dépendent.

Le bloc « Prérequis » d’une phase liste les étapes requises d’autres phases du
même projet et donne accès à leurs détails. L’administrateur les sélectionne
dans le formulaire de la phase. Chaque étape doit être terminée pour que la phase
ou une de ses étapes passe en cours, en attente de validation ou à l’état terminé.
Si un prérequis est rouvert, les statuts déjà enregistrés sont conservés et les
transitions suivantes attendent sa clôture. Retirez une étape des prérequis avant
de l’archiver.

Seul MC Studio modifie la planification. Le client consulte le planning et les
livrables ; le décideur désigné pour le projet répond aux demandes de validation.
Les lecteurs et les contributeurs ne peuvent pas approuver à sa place.

Les statuts sont `planned`, `in_progress`, `awaiting_validation`, `blocked` et
`done`. La progression mesure les étapes terminées, sans utiliser le temps
écoulé. Les vues semaine, mois et globale représentent le même planning.

## Reprise des jalons

La migration additive s’exécute à l’ouverture de la base, dans la transaction de
schéma. Elle conserve les anciennes données et importe les éléments dans une
phase « Étapes existantes », avec leurs identifiants, responsables, échéances,
descriptions et blocages. Un marqueur par projet rend la reprise idempotente :
un redémarrage ne duplique pas les étapes et ne recrée pas un élément supprimé.
Les anciens
points d’écriture des jalons sont retirés du parcours ; ils ne constituent plus
un deuxième système de planification.

Une sauvegarde de la base avant déploiement reste nécessaire pour permettre un
retour arrière. Ne pas supprimer la table historique `portal_milestones` lors du
déploiement de cette fonctionnalité.

## Validations asynchrones

Chaque demande conserve le contenu soumis, sa date, son auteur et les références
de livrables. Une décision conserve l’auteur, la date et le commentaire. Demander
des modifications permet de préparer une nouvelle demande sans effacer la
précédente. Une échéance dépassée n’est jamais une approbation.

L’historique fige le texte de la demande et les métadonnées du lien ou de la
ressource jointe. Il ne copie pas le fichier ni les versions visuelles d’une
maquette : la validation détaillée d’une version de maquette conserve son
parcours existant dans la rubrique Maquettes.

Les notifications utilisent les préférences existantes. Les relances passent par
le mécanisme existant `/api/portal/notifications/remind` ; son ordonnanceur doit
être configuré séparément dans l’environnement de production.

## Dates et déploiement

Les endpoints sont regroupés sous `/api/portal/roadmap` :

| Route | Usage |
| --- | --- |
| `GET /roadmap?projectId=…` | Planning, ressources associables, permissions et indicateurs du projet. |
| `POST /roadmap/phases` | Création d’une phase avec ses prérequis facultatifs `prerequisiteStepIds`. |
| `PATCH /roadmap/phases/:id` | Modification des dates, du contenu, du statut, de l’ordre ou des prérequis. |
| `DELETE /roadmap/phases/:id` | Retrait de la phase du planning actif. |
| `POST /roadmap/steps` | Création d’une étape. |
| `PATCH /roadmap/steps/:id` | Modification, déplacement entre phases ou réordonnancement. |
| `DELETE /roadmap/steps/:id` | Retrait de l’étape du planning actif. |
| `POST /roadmap/steps/:id/validation` | Soumission d’une nouvelle demande de validation. |
| `POST /roadmap/validations/:id/decision` | Approbation ou demande de modifications par le décideur. |

Les dates de planning sont des dates calendaires `YYYY-MM-DD`, sans heure. Les
horodatages d’historique sont conservés séparément. Les périodes qui se
chevauchent sont autorisées ; les dates impossibles et les intervalles inversés
sont refusés. Un élément sans dates reste consultable sans inventer de planning.
Une phase sans dates explicites est représentée d’après les dates de ses étapes.
La livraison prévisionnelle configurée du projet reste distincte de l’étendue
du calendrier, qui englobe toutes les étapes.

Le schéma est additif et compatible avec les adaptateurs SQLite de développement
et PostgreSQL de production. La compilation et les tests doivent être exécutés
sur une base isolée, sans charger les identifiants de production :

```sh
npm run build -- --dotenv /dev/null
node scripts/test-portal-workflows.mjs
node --experimental-strip-types scripts/test-portal-roadmap-dates.mjs
```

Le module ne nécessite pas l’activation de Cloudflare R2. Les fichiers déjà
présents dans les ressources peuvent être associés aux étapes et aux demandes.
