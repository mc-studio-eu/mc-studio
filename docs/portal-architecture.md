# Portail client MC Studio

## Parcours

L’admin ouvre `/portal/admin`, crée une fiche client et son projet, puis ajoute les ressources dans les onglets de la fiche. Il peut générer une invitation et copier son lien ou déclencher son envoi via Resend. Le client accepte l’invitation, crée son mot de passe et retrouve son espace sur `/portal`.

- Accueil : étape, progression, échéance, actions attendues et dernières nouvelles.
- Suivi : quatre phases et journal des changements, dépôts et retours.
- Paiements : liens HTTPS de tout prestataire (Stripe, etc.), montant en euros, échéance et statut confirmé manuellement par MC Studio. Aucun prélèvement ni vérification bancaire automatique. Un clic ne marque jamais un paiement comme réglé.
- Fichiers : liens et vrais fichiers ajoutés par l’admin, dépôts du client, documents et téléchargements authentifiés. 10 Mo par fichier, 100 Mo par projet. Les fichiers archivés restent comptabilisés.
- Maquettes : liens externes, validation ou demande de modifications avec commentaire, historique par ressource dans le journal.
- Liens utiles : URLs HTTPS par projet.
- Wiki : articles texte et liens, spécifiques au projet ou partagés avec tous les clients. Trois guides de démarrage sont créés au premier accès admin, puis modifiables/archivables.
- Analytics : lien Google Analytics/Looker Studio et, avec le compte de service configuré, visiteurs actifs, sessions et pages vues sur les 30 derniers jours complets. Aucun chiffre simulé n’apparaît en cas d’absence de connexion.

Le client peut sélectionner parmi les projets de son organisation. L’administration existante présente le projet le plus récemment mis à jour par organisation. Un compte client appartient à une organisation. Les ressources archivées sont masquées et conservées en base.

## Neon / PostgreSQL

Projet demandé : `falling-smoke-03454305`, branche `br-blue-art-agohe6mf`.

1. Dans cette branche Neon, copier la connexion de la base MC Studio (connexion poolée recommandée).
2. Ajouter `DATABASE_URL` dans `.env` en local et dans les secrets du serveur en production. Conserver les paramètres TLS de Neon. Ne jamais utiliser de variable `NUXT_PUBLIC_` pour ce secret.
3. Exécuter `npm run portal:migrate-neon`. Le script crée le schéma dédié `mc_portal`, sans modifier les tables de l’application existante. Il copie la base SQLite locale dans une transaction et arrête la migration si un enregistrement distant portant le même identifiant diffère. Les données sources et une sauvegarde cohérente sont conservées.
4. Créer un administrateur avec `npm run portal:create-admin` si nécessaire. Le script demande le mot de passe dans le terminal sans l’afficher.
5. Configurer `NUXT_PUBLIC_SITE_URL` sur l’URL HTTPS canonique utilisée par les clients.

Le driver `pg` utilise un pool limité à cinq connexions par processus. Les transactions sont attachées à une même connexion. L’initialisation du schéma est protégée par un verrou PostgreSQL. En production, l’absence de `DATABASE_URL` provoque une erreur explicite : pas de repli silencieux sur SQLite. SQLite reste disponible en développement avec `NUXT_PORTAL_DB_PATH`.

### Fichiers

Cette première version conserve les petits fichiers en base (base64) pour rendre les dépôts persistants sans dépendre du disque d’un serveur. Le téléchargement passe par une API qui vérifie l’utilisateur et l’organisation. Aucun URL public de fichier n’est créé ; les fichiers sont servis en pièce jointe avec `nosniff`. Pour des vidéos et volumes importants, migrer les contenus vers un stockage objet privé et conserver les métadonnées dans Neon. La limite d’upload de l’hébergeur/proxy doit permettre au moins 11 Mo.

## Google Analytics

Configurer `GOOGLE_SERVICE_ACCOUNT_JSON` avec le JSON du compte de service dans les secrets du serveur. Activer Google Analytics Data API dans son projet Google et lui donner le rôle Lecteur sur chaque propriété GA4 concernée. Dans la fiche client, rubrique Analytics, renseigner l’identifiant numérique de propriété (pas l’identifiant de mesure G-…) et le lien du rapport. Les demandes passent côté serveur avec un scope de lecture et un cache de cinq minutes. Les clients ne peuvent pas interroger une propriété arbitraire : seuls les identifiants enregistrés par l’admin dans leur espace sont utilisés.

Documentation : https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport

## Sécurité et exploitation

- Invitations à usage unique, expiration après sept jours, jeton uniquement conservé sous forme de hash. La consommation est atomique.
- Sessions en cookies HttpOnly/SameSite=Lax, Secure en production. Mots de passe scrypt avec sel.
- Contrôle du rôle et de l’organisation sur chaque lecture ou écriture de ressource/fichier.
- Pages et réponses privées non mises en cache, `noindex`, `no-referrer`. Le script marketing du site n’est pas chargé sur les pages portail.
- Wiki rendu comme texte, liens HTTPS uniquement, aucun HTML fourni par le client exécuté.
- Le mot de passe oublié reste géré par contact avec MC Studio via WhatsApp.
- Resend nécessite `NUXT_RESEND_API_KEY` et un expéditeur vérifié dans `NUXT_CONTACT_FROM`. L’admin reçoit aussi le lien si l’e-mail ne peut pas être envoyé.
- Le portail nécessite un serveur Nuxt/Nitro ; un hébergement purement statique ne suffit pas.

## Vérification de cette livraison

Compilation Nuxt et parcours API avec base temporaire isolée : connexion, création client, invitation à usage unique, refus d’accès à une autre organisation, dépôt/téléchargement privé, validation des URLs, retour de maquette, statut paiement, wiki commun, analytics non configuré et archivage. Vérification visuelle du portail dans le navigateur local.

Les connexions externes Neon et GA4 ne sont considérées activées qu’après configuration des accès et vérification réelle. Le lien de console Neon seul ne fournit pas d’identifiants de connexion.

## Maquettes Figma et annotations

Configurer `FIGMA_ACCESS_TOKEN` dans l’environnement privé du serveur, avec le droit Figma `file_content:read`. Redémarrer le serveur après modification. Ce jeton n’est jamais envoyé au navigateur. L’administrateur ouvre **Maquettes → Importer depuis Figma**, colle un lien et sélectionne jusqu’à 8 cadres, puis publie. Les cadres dans les pages ou sections sont proposés. Une nouvelle version d’une maquette doit venir du même fichier Figma.

Les exports PNG sont copiés dans la base privée : les URL temporaires Figma ne servent pas de stockage. Chaque publication fige la version source Figma. Limites : 12 Mo par écran, 200 Mo de maquettes par projet. La publication est atomique ; si un export échoue, aucune version partielle n’est créée. Les images sont accessibles uniquement à l’organisation du projet et aux administrateurs. Les nouvelles tables sont incluses dans la migration SQLite → Neon.

Le client peut zoomer, placer des annotations, répondre et résoudre/rouvrir une discussion. Les coordonnées sont normalisées sur chaque écran. La validation porte sur la dernière version publiée ; les commentaires et les validations précédentes restent dans l’historique. Les commentaires sont propres au portail, sans synchronisation vers Figma. Les exports sont des images fixes : les interactions d’un prototype ne sont pas reproduites. La mise à jour est déclenchée par « Nouvelle version » ; aucune synchronisation automatique n’est activée.

## Croissance & performance (administration)

La rubrique `/portal/admin?tab=growth` est réservée aux administrateurs. `growth_sites` conserve les sites et leurs identifiants de sources. MC Studio est proposé par défaut ; « Ajouter un site » permet de suivre les clients dans la même administration sans leur exposer ces rapports.

- **GA4** : configurer `GOOGLE_SERVICE_ACCOUNT_JSON` côté serveur, activer Analytics Data API et donner au compte de service accès en lecture à chaque propriété. Saisir l’identifiant numérique GA4 dans les sources du site. Les visiteurs actifs sont calculés par GA4 sur la période, sans sommer les visiteurs quotidiens. Les événements clés sont les événements désignés comme tels dans la propriété ; ils ne sont pas assimilés à des prospects ou des ventes.
- **Search Console** : activer Search Console API, accorder au même compte de service l’accès à la propriété, puis saisir son identifiant exact (`sc-domain:…` ou URL de propriété). Données Google Web finalisées ; les requêtes anonymisées sont absentes du classement des 10 premières requêtes. CTR et position moyenne viennent du rapport agrégé Google, pas d’une moyenne des lignes.
- **CrUX** : activer Chrome UX Report API et définir `CRUX_API_KEY` dans l’environnement privé. Le rapport affiche les 75es percentiles mobile LCP, INP et CLS, avec la fenêtre réelle fournie par CrUX (indépendante du filtre 7/28/90 jours). Une origine peu visitée peut ne pas avoir de données.
- **Ahrefs, Plausible, Clarity** : liens vers les rapports externes uniquement dans cette version, pas d’import automatique de leurs chiffres.

Rapports GA4/Search Console sur 7, 28 ou 90 jours, fin à J−3 pour limiter les données provisoires ; comparaison avec la période précédente de même durée. GA4 suit le fuseau de la propriété ; Search Console suit le fuseau Pacifique. Actualisation à l’ouverture ou sur demande, cache serveur de cinq minutes, sans tâche planifiée. Les données manquantes restent indisponibles et ne sont pas remplacées par des chiffres de démonstration. Les priorités appliquent des règles affichées (seuils CrUX, baisse des sessions >20 %, absence d’événements clés) ; elles ne prétendent pas établir des causes.

Les identifiants publics des propriétés sont modifiables dans l’administration ; les clés restent dans l’environnement du serveur. Redémarrer après ajout/modification des clés. Aucune source réelle Google n’était configurée lors de la création de cette rubrique : les connexions nécessitent les accès du propriétaire.
