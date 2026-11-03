# Interface du portail

La direction artistique reste **anthracite et or**, avec une variante claire. Les couleurs viennent des variables `--portal-*` de `app/assets/css/portal-theme.css`. Le site public conserve ses styles propres.

## Espacements

- Échelle partagée : 4, 8, 12, 16, 24 et 32 px (`--portal-space-1` à `--portal-space-6`).
- Libellé → champ et champ → aide : 8 px (`--portal-field-gap`).
- Entre groupes de formulaire : 24 px (`--portal-section-gap`).
- Définir les marges des paragraphes et des textes d’aide explicitement : le reset Tailwind supprime les marges natives.
- Dans une grille de champs, utiliser `gap` ; ne pas lui ajouter une marge supérieure sur chaque libellé.
- Les contrôles de formulaire et les actions principales ont une hauteur minimale de 44 px. Les libellés et aides restent lisibles, y compris sur mobile.

## Modales

La référence de formulaire privilégie un en-tête sobre, des titres de section discrets en capitales, des séparateurs sur toute la largeur et des actions dorées. L’invitation distingue « Destinataires » et « Accès & permissions ».

L’en-tête, le corps et le pied sont séparés. Une seule zone défile : le corps. Les actions restent accessibles quand le formulaire dépasse la hauteur disponible. Éviter les règles globales qui rétablissent un défilement sur toute la modale.

Vérifier à 390 px de large et sur desktop : aucune collision, aucun débordement horizontal, focus visible, texte d’aide espacé, boutons lisibles. Si les actions ne tiennent pas sur une ligne, leur donner une disposition cohérente plutôt que de laisser un seul bouton prendre deux lignes.

## Vérification avant livraison

Contrôler une modale d’invitation, une création de projet, un formulaire de ressource et les pages Compte, Notifications, Demandes et Jalons, en modes sombre et clair. Vérifier le rendu réellement calculé dans le navigateur : une règle globale plus spécifique peut écraser un style scoped pourtant correct dans le fichier.

Compiler avec `npm run build`. Un push Git et un déploiement réussi sont deux étapes distinctes ; vérifier le statut de l’hébergement avant de conclure que la production sert la dernière interface.
