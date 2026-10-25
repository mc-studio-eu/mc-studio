# Audit du CRM MC Studio — point de vue dirigeant d’agence

Date : 19 octobre 2026. Périmètre : application `/portal`, administration, schéma et API associés, fichiers de configuration locaux, base SQLite locale en lecture seule et écran d’administration affiché dans le navigateur.

## Verdict

Le portail possède une base concrète pour livrer et faire valider un projet : espace privé, fichiers, liens de paiement, versions Figma et annotations. Son utilisation comme outil principal de pilotage d’agence reste prématurée. Il manque surtout les prochaines actions, les relances, la gestion commerciale et une vue consolidée des encaissements et de la production. Le point critique est la confiance dans les informations affichées : certains statuts représentent autre chose que ce que leur libellé annonce.

Décision proposée : préparer un pilote accompagné sur un seul client après correction des blocages ci-dessous ; élargir ensuite. Les interfaces existantes sont réutilisables.

## Méthode et limites

- Inspection du code des parcours, des contrôles d’accès, des données et des définitions de compteurs ; observation de l’accueil admin en navigateur.
- Requêtes SELECT sur la base locale, sans modification des comptes, invitations, paiements ou versions.
- Pas d’envoi d’e-mail, de paiement, de déploiement, ni de création de compte client pour cet audit.
- Pas de nouvelle suite de tests exécutée. Les problèmes déduits du code sont distingués des observations locales. Cet audit produit/exploitation ne constitue pas un audit de sécurité exhaustif, une validation juridique ou une preuve de fonctionnement en production.
- Les variables examinées sont celles du `.env` local, sans afficher leurs valeurs. Les éventuels secrets d’un hébergeur distant n’ont pas été inspectés.

## Situation observée

| Élément | État local |
|---|---|
| Organisations / projets | 8 / 8 |
| Administrateurs / comptes clients | 1 / 0 |
| Invitations enregistrées | 0 |
| Ressources actives | 1 maquette en attente, 3 articles wiki |
| Paiements / documents / fichiers actifs | Aucun enregistré |
| Souji Nova | V1 : 2 écrans ; V2 : 14 ; V3 : 1 ; V4 : 8 |
| Stockage des exports Figma | 96 797 782 octets, soit environ 92,3 Mio, hors surcoût base64 |
| Sites du tableau de bord croissance | MC Studio et Souji Nova, propriétés GA4/GSC vides |
| Configuration locale | Figma et clé Resend présents ; DATABASE_URL, compte de service Google et clé CrUX absents ou vides |

Une clé Resend présente ne prouve pas que l’envoi fonctionne : le processus de développement avait été lancé avec une surcharge vide. Aucun envoi réel n’a été tenté. L’absence de compte client ne prouve pas que le parcours d’inscription est défectueux ; elle montre que les données actuelles ne démontrent pas encore une adoption client.

## Constats prioritaires

### 1. P0 avant ouverture externe — finaliser l’exploitation

**Constat :** le fonctionnement observé est local. Le code refuse de démarrer la base en production sans `DATABASE_URL`. Le script de migration réalise une sauvegarde ponctuelle, mais je n’ai pas trouvé de procédure opérationnelle complète de sauvegarde récurrente/restauration dans le périmètre portail.

**Impact agence :** disponibilité, récupération après incident et accès client depuis un lien public ne sont pas établis.

**Action :** configurer Neon, migrer les données existantes, mettre en place l’URL HTTPS canonique, valider l’envoi d’invitations, documenter sauvegarde/restauration et surveillance des erreurs. Remplacer le mot de passe temporaire de développement avant ouverture externe ; prévoir récupération de compte et révocation des accès. Pas besoin de reconstruire ces fonctions si l’hébergement ou un prestataire les assure déjà.

**Preuve :** `server/utils/portal-db.ts:25`, `:68` ; `scripts/migrate-portal-neon.ts` ; configuration locale.

### 2. P1 — le compteur « À valider » est trompeur

**Constat confirmé :** l’accueil admin montre 0, alors qu’une ressource maquette et un avis projet sont `pending`. Le compteur filtre `project.status === 'En validation'`, un champ modifié manuellement, plutôt que les livrables en attente. « Projets en cours » compte également toutes les fiches dont le dernier projet n’est pas terminé, et non un véritable portefeuille de projets actifs.

**Impact :** un retour attendu peut rester invisible.

**Action :** définir séparément projets actifs, livrables à valider, retours reçus, projets bloqués et échéances dépassées ; dériver chaque compteur de sa source. Les cartes doivent ouvrir la liste correspondante.

**Preuve :** `app/pages/portal/admin.vue:121`, `server/api/portal/admin/clients/index.get.ts`.

### 3. P1 — les invitations affichent un état non acquis

**Constat confirmé :** huit lignes « Invitation en attente », zéro invitation en base. Le libellé est le texte de remplacement dès qu’aucun utilisateur n’existe. Les coordonnées de contact ne sont pas conservées indépendamment d’une invitation ou d’un compte.

**Impact :** tu peux croire qu’un client a reçu ses accès alors qu’il n’a jamais été invité.

**Action :** états « Non invité », « Lien créé », « E-mail envoyé », « Invitation expirée », « Compte activé ». Enregistrer le résultat d’envoi et le contact dès la création de la fiche. Ajouter une gestion des membres et de leur révocation ; un rôle de contact/validateur devrait être distinct d’un simple accès.

**Preuve :** `app/pages/portal/admin.vue:31`, `server/api/portal/admin/invitations.post.ts`, tables `users`, `invitations`, `organizations`.

### 4. P1 — une nouvelle publication Figma peut masquer des pages attendues

**Constat confirmé :** V2 contient 14 pages, V4 en contient 8. Le portail ouvre la dernière version. L’interface et l’API plafonnent une publication à 8 écrans ; la V2 à 14 a été importée par une opération locale spécifique. Chaque nouvelle version contient seulement la sélection envoyée : les autres pages ne sont pas reportées automatiquement. Elles restent dans l’historique, elles ne sont pas supprimées.

**Impact :** une mise à jour peut être perçue par le client comme la disparition d’une partie du travail. L’interface ne peut pas republier le lot complet de 14 pages en une fois.

**Action :** traiter une version comme un lot complet, précharger la sélection précédente, afficher les pages ajoutées/retirées avant publication et supporter le nombre réel d’écrans. Donner un nom à chaque publication et conserver les annotations par version.

**Preuve :** `server/api/portal/mockups/publish.post.ts:12`, `app/components/PortalMockups.vue:49`, comptage local des écrans par version.

### 5. P1 — aucune boîte de réception opérationnelle

**Constat dans le code :** commentaires, réponses et validations sont enregistrés, mais aucune notification de ces événements ni état lu/non lu n’apparaît dans les routes correspondantes. Seule l’invitation contient un envoi d’e-mail. Une réponse ou une résolution n’ajoute pas non plus d’événement au journal général.

**Impact :** tu dois ouvrir les dossiers manuellement ; le client ne sait pas nécessairement que tu as répondu.

**Action :** une file « À traiter » avec événement, projet, auteur, date, action directe et lecture. Ajouter ensuite des e-mails regroupés et des rappels paramétrables. Chaque envoi doit être traçable et éviter les doublons.

**Preuve :** `server/api/portal/mockups/comment.post.ts`, `review.post.ts`, `publish.post.ts`, `server/api/portal/admin/invitations.post.ts`.

### 6. P1 — l’argent reste réparti dans les fiches clients

**Constat :** les paiements sont des ressources avec un montant, une échéance et un statut manuel. Il n’y a pas de vue globale des sommes attendues/en retard/encaissées, de rapprochement automatique, d’objets devis/factures/avoirs ou d’historique financier structuré. Aucun paiement n’est actuellement saisi.

**Impact :** l’application ne répond pas à « qui dois-je relancer pour être payé ? ».

**Action :** commencer par une vue des échéances avec lien vers la facture dans l’outil de facturation existant, montant, devise, date, paiement confirmé et relance. Le maintien d’une validation manuelle est acceptable si elle est explicitement indiquée et historisée. Les webhooks de paiement viendront si le volume le justifie. Ne pas réimplémenter toute la comptabilité pour résoudre ce besoin.

**Preuve :** table `resources`, `server/utils/portal-resources.ts`, `app/components/PortalResources.vue`.

### 7. P1 — la production repose sur ta mémoire

**Constat :** un projet comporte une phase, un pourcentage, un statut et une date. Il n’y a pas de tâches, responsables, prochaine action, dépendances, blocage, jalons datés ou suivi du temps/coût.

**Impact :** impossible de distinguer un projet qui avance d’un projet bloqué avec un pourcentage inchangé ; aucune visibilité sur la charge ni la rentabilité.

**Action :** ajouter d’abord prochaine action + responsable + échéance + blocage ; une checklist de livrables suffit au départ. Ajouter estimation, temps consommé, budget et coût lorsque ces données seront réellement suivies. Ne pas calculer de marge à partir d’un simple pourcentage d’avancement.

**Preuve :** table `projects`, `server/api/portal/admin/projects/[id].patch.ts`.

### 8. P1 — le multi-projet n’est pas utilisable depuis l’administration

**Constat :** l’API admin ne retourne que le projet le plus récemment modifié par organisation. La création d’un client crée nécessairement une nouvelle organisation et son premier projet. Pas de parcours identifié pour ajouter un second projet à une organisation existante ou parcourir ses anciens projets. Le client possède pourtant un sélecteur de projets.

**Impact :** une seconde mission risque d’entraîner une fiche client dupliquée ou des modifications manuelles de base.

**Action :** garder l’entrée « Clients » souhaitée, avec une liste des projets dans chaque fiche et une action « Nouveau projet ». Inutile de réintroduire le lien global « Projets » retiré à ta demande.

**Preuve :** `server/api/portal/admin/clients/index.get.ts:17`, `index.post.ts`, `server/api/portal/client/project.get.ts`.

### 9. P1 — perte possible de brouillons et suivi incomplet des décisions

**Constat dans le code :** changer d’écran vide le commentaire et la réponse en cours sans protection. La validation peut être remplacée par un nouveau choix sur la même version ; un journal textuel existe, mais pas de registre structuré des décisions. Résoudre une annotation ne conserve ni auteur de la résolution ni date de résolution. Tous les membres clients autorisés peuvent valider.

**Impact :** travail de rédaction perdu et difficulté à déterminer qui a donné le dernier accord, sur quel périmètre et après quelles réserves.

**Action :** conserver le brouillon par écran ou demander avant abandon ; désigner le validateur ; enregistrer chaque décision avec version, périmètre, auteur, date et réserves. Afficher un récapitulatif explicite avant confirmation. L’accord de maquette ne doit pas être présenté comme une signature contractuelle.

**Preuve :** `app/components/PortalMockups.vue:45`, `server/api/portal/mockups/review.post.ts`, `comment.post.ts` et schéma.

### 10. P1 avant usage régulier — coût du stockage et des imports

**Constat :** environ 92,3 Mio d’images pour les quatre versions Souji Nova, dans un quota de 200 Mio. Le base64 augmente encore la taille stockée. Chaque aperçu de collection utilise l’image complète ; les images sont livrées avec `no-store`. L’import est synchrone et n’a pas de clé d’idempotence ou de progression persistante.

**Impact :** navigation mobile lourde, base gonflée et reprises d’import difficiles après une interruption. Une nouvelle tentative peut créer une version supplémentaire.

**Action :** miniatures dédiées, stockage objet privé avec métadonnées en base, politique de conservation compréhensible, import en tâche de fond avec progression/reprise et idempotence. Préserver l’autorisation par projet.

**Preuve :** `mockup_screens.image_data`, `server/api/portal/mockups/screens/[id].get.ts`, `publish.post.ts`, couverture dans `PortalMockups.vue`.

## Couverture des autres besoins d’agence

| Domaine | Ce qui existe | Ce qui manque / décision proposée |
|---|---|---|
| Acquisition commerciale | Fiches clients | Prospects, opportunités, montant, probabilité, origine, prochaine relance, gagné/perdu. Prioritaire seulement si ce portail doit aussi remplacer le CRM commercial actuel. |
| Relation client | Invitation et accès par organisation | Coordonnées persistantes, plusieurs contacts visibles, rôles décisionnaire/comptable/validateur, notes privées et historique de relation. |
| Documents et contrats | Liens et fichiers privés | Type de document, version, auteur, date de partage, statut de lecture/accord. Lier l’outil de signature existant si nécessaire. |
| Changements de périmètre | Commentaires de maquette | Transformer un retour en demande cadrée : inclus/hors périmètre, coût, délai, approbation. C’est une protection de la marge. |
| Fichiers | Dépôts authentifiés, limites de taille | Dossiers, recherche par métadonnées, versions et restauration des archives. Les archives restent comptées dans le quota. |
| Maquettes | Snapshots, historique, annotations, réponses | Corrections du lot complet, brouillons, traçabilité, notifications ; recherche de page et visibilité des commentaires sur les autres écrans à améliorer. |
| Livraison | Dernière phase du projet | Checklist recette, accord final, solde, transfert des accès, documentation et date de début de maintenance. |
| Maintenance / récurrence | Pas d’objet dédié | Contrat, prochaine échéance, demande support, responsable et renouvellement. À introduire après le flux projet initial. |
| Wiki | Guides partagés et propres au projet | Modèles utiles par prestation, responsable, date de mise à jour ; rattacher les guides au moment où le client en a besoin. |
| Croissance web | Connecteurs préparés et liens d’outils | Sources volontairement non configurées ; ne pas traiter cela comme un bug. Ahrefs/Plausible/Clarity sont des liens externes. Relier les sites aux clients/projets pour éviter une deuxième liste indépendante. |
| Pilotage d’agence | Compteurs de clients/projets | Encaissements, retards, charge, prochaine action, validations, budget consommé. Les statistiques web répondent à un autre besoin. |

## Frictions transversales

- **Aperçu client absent :** `/portal` redirige un administrateur vers `/portal/admin`. Un aperçu client autorisé et clairement identifié aiderait à préparer un dossier avant invitation, sans créer de session au nom du client.
- **Navigation non persistante :** fiche sélectionnée, sous-onglet et visionneuse reposent surtout sur l’état Vue. Un rechargement perd le contexte. Introduire des routes client/projet/livrable/version/commentaire exploitables dans les notifications, avec contrôle d’accès serveur.
- **Données admin périssables :** le parent admin n’écoute pas l’événement `changed` de `PortalResources` ; une nouvelle publication ne rafraîchit pas nécessairement sa fiche récapitulative. Centraliser le rafraîchissement des statuts.
- **Archives :** l’API sait masquer une ressource, mais aucun parcours de restauration n’est exposé. Les maquettes versionnées ont une interface spécialisée sans commande d’archivage. Prévoir la gestion du cycle de vie et un export de dossier.
- **Cohérence visuelle :** conserver le système sombre demandé et réduire les couches CSS successives. Éviter une nouvelle refonte avant stabilisation des parcours. Vérifier plus tard contraste, clavier et mobile sur le parcours client réel ; l’observation admin seule ne suffit pas à les certifier.
- **Accès équipe :** modèle limité à admin/client, avec les administrateurs ayant accès à l’ensemble. Avant d’ajouter des freelances, prévoir des rôles/missions restreints.
- **Résilience auth :** récupération autonome absente ; limitation des tentatives en mémoire d’un processus, donc pas une protection partagée entre instances. Renforcer à l’ouverture publique en fonction de l’hébergement, sans supposer une fuite constatée.

## Ce qui mérite d’être conservé

1. Les contrôles serveur par rôle/organisation et les téléchargements privés constituent une bonne base architecturale ; leur efficacité exhaustive reste à valider avant production.
2. Les snapshots Figma conservés indépendamment des URL temporaires évitent de faire dépendre les anciennes validations du fichier Figma courant.
3. Le client possède un espace cohérent pour les ressources, les retours et les paiements.
4. Les analytics affichent un état de connexion absent plutôt que des chiffres fictifs.
5. Les liens de paiement ne passent pas automatiquement à « réglé » après un clic.

## Ordre de réalisation recommandé

### Lot 1 — rendre le portail fiable pour un pilote

- Corriger les compteurs et les états d’invitation.
- Publier un lot Figma complet de 14 pages depuis l’interface, avec aperçu des retraits.
- Préserver les brouillons, rendre les changements de validation traçables.
- Préparer Neon, domaine HTTPS, accès, récupération, sauvegarde et restauration.
- Ajouter un aperçu client ; effectuer ensuite un parcours contrôlé avec un compte de pilote.

**Critères de sortie :** maquette en attente = entrée visible dans la file de validation ; client jamais invité = « Non invité » ; nouvelle version complète conservant le bon nombre de pages ; un client accède uniquement à ses données ; un dossier restauré depuis sauvegarde est lisible.

### Lot 2 — faire gagner du temps au dirigeant

- Accueil « À traiter » : relances, retards, retours, fichiers attendus.
- Notifications avec état lu/non lu et liens profonds.
- Contacts et plusieurs projets par client.
- Prochaine action, responsable, échéance et blocage.
- Vue des échéances financières et confirmations de règlement.

**Critère de sortie :** en ouvrant l’accueil, tu sais quels clients relancer, quoi livrer et quels paiements suivre sans parcourir huit dossiers.

### Lot 3 — protéger la marge et développer l’agence

- Demandes hors périmètre, budget/temps/coûts, livraison et maintenance.
- Pipeline commercial si l’outil doit couvrir l’avant-vente.
- Connexion des statistiques lorsque tu fourniras les accès, comme convenu.
- Stockage et imports adaptés au volume, puis automatisations guidées par l’usage réel.

## Recommandation de propriétaire

Prioriser les informations qui conduisent à une action et les confirmations fiables. Le prochain investissement utile est un accueil « À traiter » adossé à des données correctes, après correction des blocages de publication et d’accès. Les chiffres d’audience et les nouveaux raffinements visuels peuvent attendre.
