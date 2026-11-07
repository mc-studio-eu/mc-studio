# Portail client MC Studio

## Parcours

L’admin ouvre `/portal/admin`, crée une fiche client et son premier projet, puis peut ajouter d’autres projets depuis cette fiche. Les projets et leurs ressources sont gérés séparément. Il peut inviter plusieurs personnes au niveau du client (jusqu’à 20 adresses à la fois), copier les liens individuels ou déclencher leur envoi via Resend. La fiche équipe affiche tous les membres et les invitations en attente ou expirées, avec renvoi et annulation. Chaque membre accède aux projets de son organisation. Le client accepte l’invitation, crée son mot de passe et retrouve son espace sur `/portal`.

- Accueil : étape, progression, échéance, actions attendues et dernières nouvelles.
- Suivi : quatre phases et journal des changements, dépôts et retours.
- Paiements : liens HTTPS de tout prestataire (Stripe, etc.), montant en euros, échéance et statut confirmé manuellement par MC Studio. Aucun prélèvement ni vérification bancaire automatique. Un clic ne marque jamais un paiement comme réglé.
- Fichiers : liens et vrais fichiers ajoutés par l’admin, dépôts du client, documents et téléchargements authentifiés. 50 Mo par fichier, 500 Mo par projet. Les fichiers archivés restent comptabilisés. La progression du transfert puis l’enregistrement sont affichés dans le portail ; voir [les détails du dépôt](portal-files.md).
- Maquettes : liens externes, validation ou demande de modifications avec commentaire, historique par ressource dans le journal.
- Liens utiles : URLs HTTPS par projet.
- Wiki : articles texte et liens, spécifiques au projet ou partagés avec tous les clients. Trois guides de démarrage sont créés au premier accès admin, puis modifiables/archivables.
- Analytics : lien Google Analytics/Looker Studio et, avec le compte de service configuré, visiteurs actifs, sessions et pages vues sur les 30 derniers jours complets. Aucun chiffre simulé n’apparaît en cas d’absence de connexion.

Le client peut sélectionner parmi les projets de son organisation ; à l’ouverture, le portail choisit le projet modifié le plus récemment. L’administration affiche chaque client une seule fois et donne accès à tous ses projets. Un compte client appartient à une organisation. Les ressources archivées sont masquées et conservées en base.

## Neon / PostgreSQL

Projet demandé : `falling-smoke-03454305`, branche `br-blue-art-agohe6mf`.

1. Dans cette branche Neon, copier la connexion de la base MC Studio (connexion poolée recommandée).
2. Ajouter `DATABASE_URL` dans `.env` en local et dans les secrets du serveur en production. Conserver les paramètres TLS de Neon. Ne jamais utiliser de variable `NUXT_PUBLIC_` pour ce secret.
3. Exécuter `npm run portal:migrate-neon`. Le script crée le schéma dédié `mc_portal`, sans modifier les tables de l’application existante. Il copie la base SQLite locale dans une transaction et arrête la migration si un enregistrement distant portant le même identifiant diffère. Les données sources et une sauvegarde cohérente sont conservées.
4. Créer un administrateur avec `npm run portal:create-admin` si nécessaire. Le script demande le mot de passe dans le terminal sans l’afficher.
5. Configurer `NUXT_PUBLIC_SITE_URL` sur l’URL HTTPS canonique utilisée par les clients.

Le driver `pg` utilise un pool limité à cinq connexions par processus. Les transactions sont attachées à une même connexion. L’initialisation du schéma est protégée par un verrou PostgreSQL. En production, l’absence de `DATABASE_URL` provoque une erreur explicite : pas de repli silencieux sur SQLite. SQLite reste disponible en développement avec `NUXT_PORTAL_DB_PATH`.

### Fichiers

Cette première version conserve les fichiers en base (base64) pour rendre les dépôts persistants sans dépendre du disque d’un serveur. Le téléchargement passe par une API qui vérifie l’utilisateur et l’organisation. Aucun URL public de fichier n’est créé ; les fichiers sont servis en pièce jointe avec `nosniff`. Pour des vidéos et volumes importants, migrer les contenus vers un stockage objet privé et conserver les métadonnées dans Neon. La limite d’upload de l’hébergeur/proxy doit permettre au moins 51 Mio. Les images de la médiathèque conservent une limite distincte de 10 Mo par image et 100 Mo par projet.

## Google Analytics

Configurer `GOOGLE_SERVICE_ACCOUNT_JSON` avec le JSON du compte de service dans les secrets du serveur. Activer Google Analytics Data API dans son projet Google et lui donner le rôle Lecteur sur chaque propriété GA4 concernée. Dans la fiche client, rubrique Analytics, renseigner l’identifiant numérique de propriété (pas l’identifiant de mesure G-…) et le lien du rapport. Les demandes passent côté serveur avec un scope de lecture et un cache de cinq minutes. Les clients ne peuvent pas interroger une propriété arbitraire : seuls les identifiants enregistrés par l’admin dans leur espace sont utilisés.

Documentation : https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport

## Sécurité et exploitation

- Invitations à usage unique, expiration après sept jours, jeton uniquement conservé sous forme de hash. La consommation est atomique.
- Sessions en cookies HttpOnly/SameSite=Lax, Secure en production. Mots de passe scrypt avec sel.
- Contrôle du rôle et de l’organisation sur chaque lecture ou écriture de ressource/fichier.
- Pages et réponses privées non mises en cache, `noindex`, `no-referrer`. Le script marketing du site n’est pas chargé sur les pages portail.
- Wiki rendu comme texte, liens HTTPS uniquement, aucun HTML fourni par le client exécuté.
- Le mot de passe oublié utilise un lien temporaire à usage unique (30 minutes), envoyé par e-mail. Son jeton est conservé sous forme de hash. Le changement depuis le compte exige le mot de passe actuel ; les deux parcours révoquent les sessions existantes.
- Resend nécessite `NUXT_RESEND_API_KEY` et un expéditeur vérifié dans `NUXT_CONTACT_FROM`. L’admin reçoit aussi le lien si l’e-mail ne peut pas être envoyé.
- Le portail nécessite un serveur Nuxt/Nitro ; un hébergement purement statique ne suffit pas.

## Vérification de cette livraison

Compilation Nuxt et parcours API avec base temporaire isolée : connexion, création client, invitation à usage unique, refus d’accès à une autre organisation, dépôt/téléchargement privé, validation des URLs, retour de maquette, statut paiement, wiki commun, analytics non configuré et archivage. Vérification visuelle du portail dans le navigateur local.

Les connexions externes Neon et GA4 ne sont considérées activées qu’après configuration des accès et vérification réelle. Le lien de console Neon seul ne fournit pas d’identifiants de connexion.

## Équipe, actions attendues et livrables

L’administration attribue à chaque membre client un rôle **lecteur**, **contributeur** ou **décideur**. Les comptes existants deviennent contributeurs par défaut. Un décideur actif doit ensuite être désigné pour chaque projet : seul ce compte peut valider une maquette ou demander formellement des modifications. Les contributions et commentaires restent ouverts aux contributeurs. Les décisions successives sont conservées avec leur auteur et leur date.

La suspension d’un membre révoque ses sessions et ses liens de réinitialisation, empêche une nouvelle connexion et conserve ses commentaires. La suspension ou le passage en lecteur libère ses demandes de fichiers et ses livrables affectés ; l’administration peut les réattribuer. La suspension ou la perte du rôle décideur retire sa désignation. La réactivation exige une nouvelle connexion et une nouvelle désignation si nécessaire.

L’accueil présente **À faire pour vous**, calculé à partir des données du projet : demandes de fichiers ouvertes, maquettes à valider par le décideur, paiements attendus et jalons affectés au membre. Ces actions sont indépendantes de la limite du journal d’activité. Les lecteurs peuvent consulter le projet sans effectuer de mutations métier.

Le suivi comporte des jalons, livrables et éléments de checklist, chacun avec un responsable facultatif, une date, un état et une description du blocage. L’administration crée et modifie ces éléments ; le responsable client peut actualiser son état et son blocage. Les demandes de fichiers peuvent également recevoir un responsable et une date attendue.

## Demandes du client (ancienne rubrique)

La page Demandes a été retirée de l’administration et de l’espace client. Les anciens liens ouvrent la vue d’ensemble ou le suivi du projet. Les données et API existantes sont conservées. Le fonctionnement historique ci-dessous reste documenté ; les demandes de fichiers restent disponibles dans Fichiers.

La rubrique **Demandes** regroupe les demandes propres à chaque projet, séparément des annotations de maquettes. Un contributeur ou décideur peut créer une demande avec un titre et une description, puis échanger avec MC Studio dans son fil de discussion. Les membres de l’organisation peuvent consulter les demandes ; les lecteurs ne peuvent ni créer, ni répondre, ni changer leur état.

Une demande est **Ouverte** ou **Résolue**. Son auteur, tant qu’il dispose d’un droit de contribution, et l’administration peuvent la résoudre ou la rouvrir. Les changements d’état conservent leur auteur et leur date dans le fil ; les messages restent disponibles après résolution. L’administration retrouve la rubrique dans la fiche projet. Les demandes ne sont pas supprimables depuis l’interface.

Les nouvelles demandes et réponses du client notifient l’administration. Les réponses de MC Studio et les changements d’état notifient les membres concernés, selon leurs préférences. Les notifications ouvrent la rubrique Demandes du projet.

Les accès API vérifient l’organisation du projet et l’état actif du compte. Les tables `portal_requests` et `portal_request_messages` sont créées de manière additive et incluses dans la migration vers Neon.

## Dossiers d’assets

Dans **Assets**, l’administration peut créer un dossier de 1 à 80 caractères avec **Nouveau dossier**, puis le choisir lors d’un dépôt d’image. Les dossiers sont propres au projet, conservés dans `portal_asset_folders` et visibles par ses clients. Les cinq dossiers existants restent compatibles. Les noms en doublon sont refusés, indépendamment de la casse ; un dépôt ne peut pas cibler le dossier d’un autre projet. La table est créée de façon additive et incluse dans la migration SQLite → Neon. À l’ouverture de la rubrique, le premier dossier contenant des images est sélectionné.

## Notifications et relances

Les publications de maquettes, commentaires et demandes de fichiers créent des notifications persistantes. Chaque membre règle ses notifications dans le portail, ses e-mails et l’intervalle des relances (0 pour désactiver, de 1 à 30 jours sinon ; 3 jours par défaut). Les e-mails nécessitent la configuration Resend et l’URL canonique `NUXT_PUBLIC_SITE_URL` en HTTPS en production. `PORTAL_EMAIL_DISABLED=1` désactive les envois du portail, y compris invitations et réinitialisations, pour les tests.

Les relances se déclenchent depuis l’administration ou via `POST /api/portal/notifications/remind`. Pour une exécution périodique, configurer le planificateur de l’hébergement pour appeler cette route avec `Authorization: Bearer <PORTAL_REMINDER_SECRET>` ; utiliser un secret serveur d’au moins 24 caractères. Le corps JSON peut être `{}` pour tous les projets ou contenir `projectId`. Le dépôt ne configure pas le planificateur de l’hébergement. Les préférences, les droits, les tâches encore ouvertes et la déduplication sont vérifiés avant de créer une relance.

Les nouvelles tables sont créées de manière additive à l’ouverture de la base et incluses dans le script de migration SQLite → Neon. Aucune attribution automatique du pouvoir de validation n’est faite aux comptes existants : désigner les décideurs dans l’administration après mise à jour.

Pour vérifier les parcours API sans toucher aux données existantes : `node scripts/test-portal-workflows.mjs`. Ce script démarre Nuxt sur le port 4179 (`PORTAL_TEST_PORT` permet de le changer), utilise une base SQLite temporaire et un fichier d’environnement vide, désactive les e-mails, puis nettoie ses fichiers et son serveur. Il couvre les rôles, l’isolation des organisations, la suspension, les mots de passe, les actions attendues et les notifications. La compilation se vérifie avec `npm run build`.

## Maquettes Figma et annotations

Configurer `FIGMA_ACCESS_TOKEN` dans l’environnement privé du serveur, avec le droit Figma `file_content:read`. Redémarrer le serveur après modification. Ce jeton n’est jamais envoyé au navigateur. L’administrateur ouvre **Maquettes → Importer depuis Figma**, colle un lien et sélectionne jusqu’à 8 cadres, puis publie. Les cadres dans les pages ou sections sont proposés. Une nouvelle version d’une maquette doit venir du même fichier Figma.

Les exports PNG sont copiés dans la base privée : les URL temporaires Figma ne servent pas de stockage. Chaque publication fige la version source Figma. Limites : 12 Mo par écran, 200 Mo de maquettes par projet. La publication est atomique ; si un export échoue, aucune version partielle n’est créée. Les images sont accessibles uniquement à l’organisation du projet et aux administrateurs. Les nouvelles tables sont incluses dans la migration SQLite → Neon.

Le client peut zoomer, placer des annotations, répondre et résoudre/rouvrir une discussion. Les coordonnées sont normalisées sur chaque écran. La validation porte sur la dernière version publiée ; les commentaires et les validations précédentes restent dans l’historique. Les commentaires sont propres au portail, sans synchronisation vers Figma. Les exports sont des images fixes : les interactions d’un prototype ne sont pas reproduites. La mise à jour est déclenchée par « Nouvelle version » ; aucune synchronisation automatique n’est activée.

## MCP des retours maquettes

Le portail expose un serveur MCP HTTP stateless à `https://<domaine-du-portail>/api/portal/mcp`. Définir `PORTAL_MCP_TOKEN` comme secret serveur (au moins 32 octets aléatoires, par exemple `openssl rand -hex 32`) et fournir aux clients MCP l’URL et l’en-tête `Authorization: Bearer <token>`. Ne pas préfixer ce secret par `NUXT_PUBLIC_`. Le jeton donne un accès administrateur aux projets, retours clients et captures de maquettes : le conserver dans le gestionnaire de secrets du client MCP et le renouveler en le remplaçant côté serveur. Les requêtes avec un en-tête `Origin` ne sont acceptées que si son hôte correspond à celui du portail.

Outils exposés : `list_portal_projects` pour choisir le projet, `get_mockup_feedback` pour lire les versions, écrans, annotations et réponses, `get_mockup_screen` pour obtenir une capture PNG, et `complete_mockup_feedback` pour résoudre les annotations ciblées et ajouter un compte rendu au journal. N’appeler le dernier outil qu’après avoir effectivement appliqué les changements. L’agent connecté peut ensuite modifier le code du projet et utiliser une intégration Figma autorisée pour appliquer les retours à la maquette. Le serveur du portail ne modifie pas directement les fichiers Figma.

## Croissance & performance (administration)

La rubrique `/portal/admin?tab=growth` est réservée aux administrateurs. `growth_sites` conserve les sites et leurs identifiants de sources. MC Studio est proposé par défaut ; « Ajouter un site » permet de suivre les clients dans la même administration sans leur exposer ces rapports.

- **GA4** : configurer `GOOGLE_SERVICE_ACCOUNT_JSON` côté serveur, activer Analytics Data API et donner au compte de service accès en lecture à chaque propriété. Saisir l’identifiant numérique GA4 dans les sources du site. Les visiteurs actifs sont calculés par GA4 sur la période, sans sommer les visiteurs quotidiens. Les événements clés sont les événements désignés comme tels dans la propriété ; ils ne sont pas assimilés à des prospects ou des ventes.
- **Search Console** : activer Search Console API, accorder au même compte de service l’accès à la propriété, puis saisir son identifiant exact (`sc-domain:…` ou URL de propriété). Données Google Web finalisées ; les requêtes anonymisées sont absentes du classement des 10 premières requêtes. CTR et position moyenne viennent du rapport agrégé Google, pas d’une moyenne des lignes.
- **CrUX** : activer Chrome UX Report API et définir `CRUX_API_KEY` dans l’environnement privé. Le rapport affiche les 75es percentiles mobile LCP, INP et CLS, avec la fenêtre réelle fournie par CrUX (indépendante du filtre 7/28/90 jours). Une origine peu visitée peut ne pas avoir de données.
- **Ahrefs, Plausible, Clarity** : liens vers les rapports externes uniquement dans cette version, pas d’import automatique de leurs chiffres.

Rapports GA4/Search Console sur 7, 28 ou 90 jours, fin à J−3 pour limiter les données provisoires ; comparaison avec la période précédente de même durée. GA4 suit le fuseau de la propriété ; Search Console suit le fuseau Pacifique. Actualisation à l’ouverture ou sur demande, cache serveur de cinq minutes, sans tâche planifiée. Les données manquantes restent indisponibles et ne sont pas remplacées par des chiffres de démonstration. Les priorités appliquent des règles affichées (seuils CrUX, baisse des sessions >20 %, absence d’événements clés) ; elles ne prétendent pas établir des causes.

Les identifiants publics des propriétés sont modifiables dans l’administration ; les clés restent dans l’environnement du serveur. Redémarrer après ajout/modification des clés. Aucune source réelle Google n’était configurée lors de la création de cette rubrique : les connexions nécessitent les accès du propriétaire.

## Questionnaire de satisfaction

Le client ouvre **Satisfaction** dans la navigation de son espace (`/portal?tab=satisfaction`). Le questionnaire du projet reprend les rubriques de fin de mission : satisfaction globale, collaboration, livrable, témoignage, recommandation et dernier retour. Les informations du projet, de l’organisation et du répondant viennent du compte connecté ; aucune réponse n’est préremplie. Les contributeurs et décideurs peuvent envoyer une réponse par personne et par projet ; les lecteurs consultent uniquement le questionnaire. Après envoi, le client retrouve son propre retour enregistré. Les réponses des autres membres ne lui sont pas exposées.

Dans l’administration, ouvrir **Clients → un client → le projet**, puis l’onglet **Satisfaction** dans les ressources du projet. **Modifier le questionnaire** permet de changer le titre, les descriptions, les sections, l’ordre, les questions, leur type (texte libre, note de 1 à 10 ou choix unique), leur caractère obligatoire et les choix proposés. Les liens d’avis Google et de recommandation sont modifiables et peuvent être masqués en les laissant vides. Cliquer sur **Enregistrer le questionnaire** pour publier les changements pour ce projet ; **Aperçu client** montre le rendu du brouillon. **Réponses reçues** permet de lire chaque retour. Limites : 20 sections, 50 questions par section, 100 questions au total, 2 à 20 options par question à choix.

Les tables additives `portal_satisfaction_surveys` et `portal_satisfaction_responses` sont compatibles SQLite/PostgreSQL et incluses dans la migration SQLite → Neon. Avant la première personnalisation, le questionnaire par défaut est fourni avec la révision 0. Chaque enregistrement incrémente la révision ; une modification ou un envoi depuis une version dépassée est refusé pour éviter d’écraser un changement ou de répondre aux mauvaises questions. Chaque réponse conserve le questionnaire complet, ses liens et les informations du répondant au moment de l’envoi. Les éditions ultérieures ne changent donc pas les retours déjà reçus. Les réponses envoyées ne sont pas modifiables et aucun avis ni témoignage n’est publié automatiquement.

Vérification : `node scripts/test-portal-workflows.mjs` couvre aussi les permissions, l’isolation des projets, les validations du questionnaire et des réponses, les conflits de révision, les doubles envois concurrents et la conservation des réponses après modification. `PORTAL_TEST_DEBUG=1` affiche les journaux du serveur de test. La suite utilise uniquement sa base temporaire et son fichier d’environnement vide.
