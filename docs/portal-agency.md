# Pilotage de l’agence — intégration des trois premiers lots

Le portail conserve les espaces clients existants et ajoute trois rubriques à
`/portal/admin` : **Aujourd’hui**, **CRM & finances** et **Automatisations**.
L’administration ouvre Aujourd’hui par défaut. Les anciens liens vers un client,
un projet ou une ressource conservent leur destination.

## Parcours opérationnel

1. Créer un contact commercial sans lui attribuer d’accès au portail. Une demande
   valide du formulaire public est également enregistrée dans le CRM. Les
   nouvelles demandes d’un même contact restent des opportunités distinctes ; un
   envoi identique rejoué le même jour est dédupliqué. Le message d’origine est
   conservé dans l’historique. La réception est réussie si elle est conservée dans
   le CRM, même si l’e-mail interne échoue ; l’e-mail reste un secours si la base
   du portail n’est pas disponible. Aucun accès n’est créé par ce formulaire.
2. Qualifier l’opportunité, sa provenance, son montant HT et la prochaine action.
   Le statut Réseau permet de conserver les relations sans les traiter comme des
   ventes. Préparer les notes de call et conserver leur source.
3. Préparer des versions de devis et contrats avec périmètre, exclusions et
   échéancier. La signature est une confirmation manuelle documentée : le portail
   n’est pas un prestataire de signature électronique.
4. Convertir une opportunité gagnée en client/projet. Le rejeu retrouve le même
   projet. Depuis Aujourd’hui, appliquer un modèle au projet vierge ou lancer un
   nouveau projet pour un client existant. L’aperçu montre les dates, étapes et
   pièces attendues avant création. Les invitations gardent leur parcours dédié.
5. Utiliser Aujourd’hui pour suivre les demandes, validations, documents,
   livrables et paiements. Qualifier une demande, affecter un responsable interne,
   définir une échéance et la reporter si nécessaire. Ces informations internes
   ne modifient pas le périmètre ou une validation client.
6. Lancer les relances ou préparer un bilan depuis Automatisations. Les scénarios
   planifiés nécessitent une configuration explicite. Un bilan doit être relu et
   approuvé avant publication. Les pauses bloquent les effets encore en attente.
7. Référencer les factures émises par l’outil de facturation retenu, répartir leurs
   échéances, rapprocher les règlements et remboursements. Un paiement échoué
   reste un événement de suivi et ne réduit pas la somme due. Les temps/coûts
   saisis et les budgets estimés sont présentés séparément.

## Connexions et mise en service

Le code est intégré ; l’ajout de fichiers ou une compilation ne configure pas les
services de production. Avant activation, vérifier sur une organisation pilote :

- connexion PostgreSQL, sauvegarde et restauration dans une base isolée ;
- expéditeur et clé Resend, URL HTTPS canonique ;
- état réel des connexions R2, Figma et analytics déjà utilisées ;
- secret privé de l’ordonnanceur et déclenchement périodique de sa route ;
- prestataire de facturation/signature et éventuel adaptateur de paiement.

Le webhook financier interne est un point d’intégration signé, **pas un connecteur
Stripe ou bancaire prêt à l’emploi**. Son secret est facultatif : sans configuration,
la route refuse les requêtes. Les mouvements manuels restent utilisables et portent
leur provenance. Les ressources de paiement historiques du portail ne sont pas
automatiquement assimilées à des factures ou des encaissements du nouveau registre.
Ne pas saisir deux fois la même créance dans les deux systèmes.

### Adaptateur financier

Un adaptateur autorisé peut envoyer `POST /api/portal/commercial/payment-webhook`,
avec `Content-Type: application/json` et `X-Portal-Signature` contenant le HMAC
SHA-256 hexadécimal du corps JSON exact, signé avec
`PORTAL_PAYMENT_WEBHOOK_SECRET` (au moins 32 octets). Le serveur refuse les charges
de plus de 16 Kio. Exemple de corps à produire par l’adaptateur :

```json
{
  "reference": "identifiant-stable-de-l-evenement",
  "installmentId": "identifiant-reel-de-l-echeance",
  "kind": "receipt",
  "amountCents": 120000,
  "currency": "EUR",
  "occurredOn": "2026-11-17",
  "note": "Référence du règlement vérifiée par le prestataire"
}
```

Les valeurs `receipt`, `refund` et `failed` désignent un encaissement, un
remboursement et un échec. Une référence identique avec le même contenu renvoie le
résultat déjà enregistré ; un contenu contradictoire est refusé. Une signature
correcte prouve la provenance de l’adaptateur configuré, pas la réalité bancaire
d’une valeur saisie manuellement : la vérification chez le prestataire doit
précéder l’envoi de cet événement.

Les notes de call peuvent être structurées depuis les textes fournis ; aucune
synthèse par un fournisseur IA n’est présentée comme activée. L’assistant de
connaissance, la production de code autonome, les abonnements et le studio d’assets
du CDC restent les lots suivants.

## Données et migration

Les schémas supplémentaires sont additifs et initialisés dans la transaction de
connexion SQLite/PostgreSQL. Les tables historiques et les données clients sont
conservées. `scripts/migrate-portal-neon.ts` inclut les nouveaux objets et leurs
clés composées. Le script refuse un conflit au lieu d’écraser un état distant.
Les modèles initiaux de même contenu peuvent avoir des dates de création
différentes sur les deux bases : cette seule différence est ignorée.

Les réglages semences d’une destination entièrement vierge sont remplacés par
ceux de la source. Si la destination possède déjà une exécution, un événement ou
des réglages non par défaut, un conflit exige une comparaison des deux états.
Vérifier les scénarios importés avant d’activer l’ordonnanceur. Les références à des factures et leurs
mouvements restent historisées même si un projet est supprimé.

## Vérification

Les scripts de test des nouveaux modules utilisent des bases temporaires. Les
tests HTTP désactivent l’envoi d’e-mails et ne chargent pas `.env`.

```sh
npm run build -- --dotenv /dev/null
node --experimental-strip-types scripts/test-portal-contact-intake.mjs
node --experimental-strip-types scripts/test-portal-studio.mjs
node --experimental-strip-types scripts/test-portal-commercial.mjs
node scripts/test-portal-operations.mjs
node scripts/test-portal-workflows.mjs
```

Les suites HTTP utilisent le serveur de développement : le serveur compilé
conserve le garde-fou de production qui refuse une base SQLite.
Les connexions externes et le comportement PostgreSQL doivent également être
vérifiés dans l’environnement de recette avant déploiement.

### Résultats de la recette locale — 17 novembre 2026

- Compilation de production réussie avec un fichier d’environnement vide.
- 18 groupes de vérification des parcours historiques réussis.
- 6 groupes HTTP d’automatisations réussis : accès, concurrence, pauses,
  annulation des rappels résolus, validation des bilans, reprises et leases.
- Tests CRM/finance réussis sur base temporaire, puis contrôles HTTP de droits,
  d’origine, du cockpit/onboarding et du HMAC financier sur le corps exact.
- 5 groupes de tests d’onboarding réussis, plus capture publique et préservation
  des contacts archivés ou dont l’adresse a changé.
- Navigateur : connexion, navigation Clients, création projet depuis modèle,
  contact/opportunité, pause/reprise et brouillon de bilan vérifiés sur données
  fictives. Mobile et édition de devis non vérifiés visuellement.
- Revue indépendante du code réalisée ; aucun point bloquant restant identifié.

Cette recette ne vaut pas validation d’une base PostgreSQL réelle, d’un connecteur
bancaire ou de l’envoi effectif d’e-mails. Aucun déploiement de production n’a été
effectué. Le build signale notamment des avertissements de dépendances Nuxt et
des binaires Sharp locaux ; il termine avec un code de sortie 0.
