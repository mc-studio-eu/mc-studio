# Automatisations du portail

Dans l’administration, ouvrez **Automatisations** et sélectionnez un projet pour lancer une relance ou préparer un bilan. La planification récurrente se règle par scénario et est désactivée à l’installation.

- **Relances** vérifie les demandes de fichiers, les validations, les paiements et les étapes attribuées. Elle tient compte des préférences, des rôles et du dernier rappel de chaque membre. Un rappel en attente de courriel est annulé si l’action est clôturée ou si son destinataire n’est plus concerné au moment de la vérification avant envoi.
- **Bilan hebdomadaire** prépare un brouillon le vendredi à partir du journal de la semaine écoulée, avec un état de la roadmap et des actions en attente relevé à l’heure de génération. La période couvre les sept jours civils UTC précédant le vendredi. Ouvrez le brouillon dans les exécutions récentes, puis utilisez **Valider et prévenir le client** pour publier les notifications selon les préférences des membres du projet.

Une pause globale, par projet ou par scénario suspend les lancements, les reprises et les notifications par courriel encore en attente dans le périmètre. Un appel déjà parti vers le fournisseur peut aboutir. La désactivation de la planification arrête la création automatique de nouvelles exécutions. Une pause bloque aussi les exécutions déjà en file.

Le journal affiche les changements de configuration et les tentatives. Une exécution échouée est retentée après une minute, puis après cinq minutes. La reprise d’une exécution interrompue commence à l’expiration d’un bail de deux minutes. Après trois tentatives, le bouton **Rejouer** crée une exécution liée à la précédente. **Vérifier et reprendre** peut traiter une exécution en file arrivée à échéance sans attendre le prochain passage de l’ordonnanceur.

Les courriels des automatisations ont leur propre suivi. Une réponse favorable indique l’acceptation par le fournisseur. Une réponse incertaine est retentée au maximum trois fois au total dans les 23 heures suivant la première tentative, avec la même clé et le même contenu. Au-delà, le tableau affiche un résultat incertain. [Durée de conservation des clés d’idempotence de Resend](https://resend.com/changelog/idempotency-keys).

## Ordonnanceur

Configurez `PORTAL_OPERATIONS_SECRET` sur le serveur avec une valeur aléatoire d’au moins 32 octets. Stockez la même valeur dans le gestionnaire de secrets de l’ordonnanceur. Programmez un appel HTTPS toutes les cinq minutes à l’adresse de votre portail.

```sh
printf 'Authorization: Bearer %s\n' "$PORTAL_OPERATIONS_SECRET" |
  curl --fail-with-body --silent --show-error --max-time 30 \
    --request POST --header @- "${PORTAL_BASE_URL%/}/api/portal/operations/tick"
```

Le passage enregistre son horodatage, récupère un maximum de vingt exécutions interrompues, inscrit jusqu’à vingt projets par scénario et démarre au maximum dix exécutions prêtes. Il traite aussi jusqu’à quatre courriels en attente. Les passages successifs continuent de vider la file, qui survit au redémarrage. La date UTC empêche de recréer une relance planifiée dans la même journée. Le projet et la période empêchent de recréer le bilan de la même semaine. Après une interruption de l’ordonnanceur, il reprend les exécutions en file et couvre la journée ou la période courante au passage suivant.

L’ancien appel `POST /api/portal/notifications/remind` avec `PORTAL_REMINDER_SECRET` reste utilisable et respecte les pauses. Si vous configurez le nouvel ordonnanceur pour les relances, retirez l’ancien déclenchement récurrent pour éviter des passages redondants.

## Vérification

Le tableau des connexions montre la dernière exécution authentifiée de l’ordonnanceur, les résultats courriel enregistrés et la présence d’une configuration serveur pour les autres intégrations. L’accès aux services externes et la livraison finale se vérifient chez chaque fournisseur.

`node scripts/test-portal-operations.mjs` utilise une base SQLite temporaire et désactive les envois de courriels. Il couvre les droits d’accès, l’idempotence, les pauses, la validation du bilan, les reprises et le rejeu.
