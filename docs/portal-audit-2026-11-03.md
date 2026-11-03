# Audit du portail — 3 novembre 2026

Revue du code et des parcours de l’administration, de l’espace client, des invitations, fichiers, Assets, maquettes et paiements. Ce document décrit les comportements visibles dans le dépôt ; il ne mesure pas les performances en production et ne constitue pas un audit de sécurité exhaustif.

## Modification livrée avec cette revue

La fiche client présente tous les comptes de son équipe et toutes les invitations non acceptées, y compris expirées. L’admin peut inviter jusqu’à 20 adresses à la fois, voir le résultat pour chaque adresse, copier les liens, réessayer les erreurs et renvoyer ou annuler une invitation. Chaque personne crée son propre compte. Les doublons sont dédupliqués dans le formulaire et les comptes existants sont signalés sans interrompre les autres invitations.

Le modèle d’accès reste celui du portail : un compte appartient à une organisation et voit ses projets. Inviter une personne ne restreint donc pas son accès au seul projet affiché. Ce périmètre est indiqué dans le formulaire et la fiche équipe.

## Points qui fonctionnent déjà

- Ressources et fichiers privés par organisation, comptes nominatifs, sessions et invitations à usage unique.
- Plusieurs projets par client, avancement, échéance et journal d’activité.
- Maquettes versionnées, annotations, discussions, validation, ajout/remplacement et réorganisation des pages.
- Assets et prompt IA par projet, demandes de fichiers et visite de découverte mémorisée par compte.
- Échéances de paiement et rapports Analytics quand leurs sources sont configurées.

## Ajouts recommandés, par ordre de priorité

| Priorité | Constat dans le code | Ajout proposé | Utilité |
| --- | --- | --- | --- |
| 1 | Tous les membres d’une organisation partagent les mêmes actions. La validation de maquette conserve un seul état et un seul validateur, remplacés à chaque avis (`server/api/portal/mockups/review.post.ts`). | Rôles **décideur**, **contributeur**, **lecteur** ; validation finale réservée au décideur et historique des décisions. | Éviter des avis contradictoires quand plusieurs personnes travaillent sur le même projet. |
| 1 | Les demandes de fichiers et publications alimentent le journal mais ne déclenchent pas d’e-mail ; l’envoi d’e-mail du portail est utilisé pour les invitations. | Notifications de nouvelle maquette, réponse et demande de fichier, avec préférences individuelles et relance configurable. | Le client sait qu’une action l’attend sans devoir ouvrir le portail chaque jour. |
| 1 | L’accueil affiche surtout des ressources et un avancement. Les demandes de fichiers sont dans Fichiers ; le journal est limité aux 30 derniers événements (`resources/index.get.ts`). | Un bloc **À faire pour vous** : fichier attendu, maquette à valider, échéance à régler, responsable et date attendue. | Donner une prochaine action claire à chaque personne. |
| 1 | Les invitations peuvent maintenant être annulées, mais aucun parcours ne suspend un compte déjà activé ; les droits couvrent toute l’organisation (`portal-resources.ts`). | Suspension d’un membre avec révocation des sessions, réactivation et, si nécessaire, sélection des projets accessibles. Conserver les auteurs des commentaires. | Retirer l’accès d’un prestataire ou d’un ancien collaborateur sans effacer l’historique. |
| 2 | Le mot de passe oublié renvoie vers l’assistance ; aucune route de réinitialisation n’est présente. | Réinitialisation du mot de passe par lien temporaire et changement du mot de passe depuis le compte. | Rendre les clients autonomes et réduire le support. |
| 2 | Le suivi repose sur quatre phases fixes et un pourcentage saisi par l’admin (`app/pages/portal/index.vue`). | Livrables, jalons datés et checklist des contenus, avec blocages et responsable. | Expliquer concrètement ce qui est terminé et ce qui retarde la livraison. |
| 2 | Tous les clients de l’organisation peuvent supprimer un fichier du projet ; la suppression est définitive (`files/[id].delete.ts`). | Corbeille et restauration ; suppression réservée à l’auteur ou à l’admin ; historique des remplacements. | Prévenir les pertes accidentelles entre membres. |
| 2 | Les paiements sont marqués réglés manuellement et les liens acceptent différents prestataires. | Factures/reçus téléchargeables ; synchronisation de paiement via webhook pour le prestataire retenu. | Réduire les vérifications manuelles et faciliter la comptabilité. |
| 3 | Les petits fichiers et écrans sont conservés en base ; limites de 10 Mo par fichier et 100 Mo par projet pour les fichiers. | Stockage objet privé, progression d’upload, quota visible et dépôts multiples. | Accepter des contenus volumineux sans alourdir la base. |
| 3 | La visite suit les étapes Suivant/Précédent ; un clic libre sur une rubrique ne synchronise pas son texte (`app/pages/portal/index.vue`). | Visite contextuelle synchronisée au menu, mettant en évidence l’action utile de la page, et aide accessible sur mobile. | Garder l’explication cohérente pendant une exploration libre. |

Ordre conseillé pour les prochaines livraisons : **rôles et validation → actions attendues et notifications → autonomie des comptes → jalons et documents**. Le choix dépend du volume réel de clients et de demandes de support.

## Vérifications de la modification

Compilation Nuxt et vérifications API sur une base SQLite temporaire avec envoi d’e-mail désactivé : invitations distinctes, deux acceptations dans un même espace, liste des membres et invitations, remplacement d’un lien, annulation, usage unique, doublon, refus des actions d’administration à un client et refus d’accès à une autre organisation. L’envoi Resend réel et le déploiement en production ne sont pas couverts par ces vérifications locales.
