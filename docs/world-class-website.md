# MC Studio — refonte du studio logiciel

Branche : `feat/world-class-website`. Travail local uniquement, sans fusion ni déploiement.

## Direction

Le brief révisé positionne MC Studio comme le studio logiciel fondé par Mohamed Chettah : applications métier, SaaS et applications/automatisations IA. La stratégie, le design produit et l’ingénierie sont la méthode commune. Personal est un produit propre, distinct des missions clients. Conserver les anciennes routes pour les liens existants, sans en faire les offres principales.

L’identité conservée : fonds presque noirs, or `#F0BF6C`, typographie Host Grotesk/Inter, logo existant, atmosphère de nuages au coucher du soleil. Le récit commercial privilégie les interfaces réelles, le travail livré et le fondateur.

## Sources des projets

Les autres dépôts ont été consultés en lecture seule. Aucun secret, base client ni export commercial n’a été utilisé.

| Projet | Sources locales dans `/Users/mohamedchettah/Project/` | Éléments étayés |
| --- | --- | --- |
| Maison AWL | `maison-awl/apps/api/routes/api.php` | Prestataires, messagerie, propositions, Stripe Connect, missions, avis et litiges. |
| CRM R&A Energy | `crm-r-a-energy/README.md`, `server/utils/rdv-checks.ts`, `server/utils/travel-rule.ts` | Nuxt/Supabase, disponibilité Google Calendar, contraintes de trajet, accès par rôle. Le chiffre ancien de cinq rôles est périmé. |
| Shika Consulting | `shika-consulting/app/pages/`, notamment `tarif.vue` | Parcours associations, services et simulateur tarifaire. Le README décrit une fondation en cours : ne pas déduire le statut de production du code local. |
| Abri Toi | `abri-toi/README.md`, `site/pages/produits/` | Catalogue, réalisations, articles, CMS Sanity et demandes de contact. Pas de nouvelle étude publiée sans visuels suffisants. |
| Newlense | `newlense/README.md`, `app/composables/useNewlense.ts` | Collecte sur borne de la source de découverte, stockage Postgres, tableau de bord et export CSV. |
| Personal | Brief utilisateur révisé, `Personal/`, site public | Produit propre à MC Studio, assistant IA pour créateurs ; les brouillons restent validés par le créateur. |

Les captures utilisées viennent de `public/img/project/`. Les variantes WebP dans `public/img/studio/` conservent les originaux : deux tailles, 640 et 1280 pixels, sans agrandissement. Les résultats commerciaux, revenus, taux de conversion et volumes d’utilisateurs ne sont pas déduits de ces dépôts.

## Fondateur et publications

Sources publiques consultées :

- [Site de Mohamed Chettah](https://mohamedchettah.fr/) : entrepreneur, développeur et designer ; création de MC Studio en 2024, master en ingénierie du web en 2025, développement de Personal.
- [Personal](https://usepersonal.app/) : produit de MC Studio, préparation de contenus dans la voix du créateur, brouillons sans publication automatique.
- Le composant `personal-portfolio/components/Home/SocialMedia.vue` référence les publications réelles sélectionnées sur le site personnel : [premier projet avec une créatrice](https://www.linkedin.com/feed/update/urn:li:activity:7464933521166585856/), [remise des diplômes](https://www.linkedin.com/feed/update/urn:li:activity:7467107715304022016/), [parcours scolaire](https://x.com/MohameDevWeb/status/1975230337425805704).

Les titres décrivent les liens existants ; aucune citation ni mesure d’engagement n’est inventée.

## Contact et SEO

Le formulaire réutilise `POST /api/contact`, y compris sa validation, son honeypot et sa capture CRM/envoi existants. Budget et échéance sont ajoutés au message conservé, sans modifier le schéma du portail. Le calendrier ne charge qu’après ouverture volontaire, avec un lien direct de secours. Aucun message réel n’est envoyé pendant les vérifications.

Les nouvelles pages utilisent `useStudioSeo` pour les métadonnées de partage et la canonique. Le module sitemap existant s’auto-désactivait sous Nuxt 4 ; `/sitemap.xml` est désormais généré par une route Nitro à partir des données des projets, expertises, offres et villes.

## Références visuelles ajoutées au brief

Références consultées : David AI, Topology, Coudac, HEX, Airzon, Mood, Neverbland, Dev Nath et Most Studios. Observation visuelle de David AI, Topology et HEX : narration en chapitres et emphase progressive, grandes compositions typographiques, visuels immersifs, transitions entre séquences. Application recherchée : défilement naturel, reveals discrets et sections produit lisibles ; conserver le noir et l’or MC Studio, sans réutiliser les assets ni les affirmations de ces studios.

## Vérifications intermédiaires

- Contact, liste des expertises et trois pages détail : HTTP 200, titre Open Graph et canonique propres à chaque route.
- Contact à 390 px : pas de débordement horizontal ; tentative d’envoi vide bloquée et focus sur le nom. Aucun envoi valide effectué.
- Calendrier Cal.com : ouverture volontaire affiche le calendrier réel et les disponibilités ; aucune réservation effectuée.
- Expertise applications métier à 390 px : pas de débordement horizontal ni d’image cassée observée.
- Menu mobile : fermeture par Escape et retour du focus au bouton, déverrouillage du défilement.
