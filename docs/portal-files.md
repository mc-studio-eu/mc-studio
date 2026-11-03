# Dépôt de fichiers du portail

Les fichiers acceptent **50 Mio par dépôt, 500 Mio par projet**, archives incluses.
La médiathèque conserve **10 Mio par image, 100 Mio par projet**. Un Mio vaut
1024 × 1024 octets. Les quotas incluent les réservations des transferts en cours.

## Stockage objet optionnel

Le stockage reste désactivé tant que les quatre variables serveur `R2_ENDPOINT`,
`R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` ne sont pas configurées.
Aucune ressource Cloudflare ni souscription n'est créée par le code. **Le palier
gratuit R2 n'impose pas un plafond de facturation à zéro : ne pas activer R2 sans
accord explicite sur sa facturation.** Les identifiants doivent être limités au
bucket privé du portail, avec lecture/écriture/suppression ; aucun accès public.

Le navigateur envoie seulement des métadonnées JSON à `POST /api/portal/uploads/init`.
Après vérification de la session, de l'organisation, du rôle et du quota, il reçoit
une URL PUT signée par le SDK AWS officiel, valable cinq minutes. Les fichiers
partent directement vers R2. Les utilisateurs lecteurs ne peuvent pas déposer ;
les assets restent réservés à MC Studio. Les réservations expirent après 15 minutes.

`POST /api/portal/uploads/complete` vérifie par HEAD la taille exacte, le type et
l'ETag. Le serveur copie ensuite le staging vers une clé finale propre à cette
tentative, avec `CopySourceIfMatch`. La clé finale n'est jamais communiquée dans
une URL d'écriture. Même un PUT rejoué ne peut modifier le fichier enregistré.
Une transaction verrouille le projet, revérifie le quota et la demande de fichier,
puis crée la ressource, sa référence objet et l'activité. La confirmation est
idempotente ; une réponse perdue peut être redemandée avec le même `uploadId`.
L'initialisation accepte une `clientKey` unique par utilisateur et dépôt.

Les téléchargements passent d'abord par les routes authentifiées existantes,
puis répondent par une redirection privée vers un GET signé valable 60 secondes.
Cela contourne aussi la limite de réponse de 4,5 Mo de Vercel. Une personne qui
possède l'URL peut lire l'objet pendant ces 60 secondes ; ne pas journaliser les
URLs signées. Les anciennes données base64 restent lisibles par les mêmes routes
et ne sont pas migrées ni supprimées. Leur téléchargement reste soumis à la limite
de réponse Vercel : les anciens fichiers volumineux nécessitent une migration.

## Configuration du bucket

Le bucket reste privé (pas de r2.dev ni domaine public). Configurer les origines
exactes de production et, si nécessaire, localhost. Exemple de règle CORS :

```json
[{
  "AllowedOrigins": ["https://mc-studio.eu", "https://www.mc-studio.eu"],
  "AllowedMethods": ["PUT", "GET", "HEAD"],
  "AllowedHeaders": ["Content-Type", "Content-Length"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}]
```

Adapter ces domaines aux véritables origines du portail. Le SDK signe le type et
la longueur ; le navigateur ajoute sa longueur HTTP lui-même. Les métadonnées
JSON et les réponses de contrôle restent petites. Les préfixes sont
`portal/staging/` et `portal/objects/` ; ne jamais appliquer une expiration globale
au préfixe final.

Ajouter une règle lifecycle qui supprime **uniquement `portal/staging/` après un
jour**. Le serveur tente aussi de supprimer le staging après confirmation. Une
copie interrompue ou une confirmation concurrente peut laisser un objet final
sans référence : `portal_objects` le conserve pour nettoyage. Les références sont
détachées automatiquement quand une ressource, un asset ou un projet est supprimé.

Exécuter régulièrement le script de nettoyage avec la même configuration privée :

```sh
node --env-file=.env --experimental-strip-types scripts/cleanup-portal-r2.ts
node --env-file=.env --experimental-strip-types scripts/cleanup-portal-r2.ts --apply
```

La première commande affiche seulement les comptes. La seconde supprime les objets
sans référence vieux de 24 heures et le staging expiré depuis 24 heures. Les reçus
d'idempotence finalisés sont conservés 30 jours. Une erreur de suppression conserve
la ligne pour un prochain passage. Ne pas changer de bucket/endpoint pour une base
existante sans migrer ses objets. Aucune planification automatique n'est créée.

## Mode local et configuration absente

Sans R2, le développement local conserve le dépôt multipart en base64 (environ
33 % de volume supplémentaire). Le parseur Node et la borne de lecture restent
utilisés. En production le fallback est explicitement limité à **3 Mio** afin de
rester sous la limite de requête Vercel. Les gros fichiers affichent une erreur de
configuration R2 et ne signalent jamais un faux succès. La progression indique
les octets transférés, puis la confirmation de l'enregistrement.

Validation : `npm run build` et `node scripts/test-portal-workflows.mjs`.
Les tests utilisent une base locale isolée et le transport multipart ; ils ne
configurent ni ne facturent un stockage distant. Le transfert R2 réel reste
à vérifier sur un stockage configuré.

Références : [URL signées R2](https://developers.cloudflare.com/r2/api/s3/presigned-urls/),
[CORS](https://developers.cloudflare.com/r2/buckets/cors/),
[copies conditionnelles](https://developers.cloudflare.com/r2/api/s3/extensions/).
