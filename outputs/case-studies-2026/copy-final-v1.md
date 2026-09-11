# Case studies MC Studio : copy final v1 (publiable)

Version sans informations complémentaires : aucun chiffre non confirmé, aucune durée, aucun marqueur à compléter.
Chaque phrase s'appuie uniquement sur ce qui est déjà connu (ton brief et les contenus déjà présents sur le site).

Les fichiers `01-…` à `11-…` restent la version enrichie, à compléter plus tard (sections B).

Ordre recommandé dans la grille : Maison AWL · CRM R&A Energy · Shika Consulting · Personal · AMG Promotion · R&A Energy · Sotraya · Arises · Souji Nova · Fontaines VTC · MC Studio Creator.

---

## 01 — Maison AWL

**Catégorie** : Marketplace de services · Produit créateur

# Transformer une audience de 180 000 personnes en un produit qui lui appartient.

Célia avait la communauté et l'expertise. Nous avons construit la plateforme qui connecte ses abonnés aux prestataires formés à sa méthode, du premier message jusqu'au paiement.

- 180 000 abonnés au lancement
- Marketplace web · 3 espaces : client, prestataire, admin
- Cadrage, UX/UI, développement, lancement
- Paiements via Stripe Connect

### Le client
Maison AWL est l'univers créé par Célia autour du home organizing. Sur les réseaux sociaux, elle partage sa méthode avec 180 000 abonnés. En parallèle, elle forme des prestataires à son métier et à ses standards de service.

Au moment du projet, sa communauté demandait de plus en plus de prestations à domicile.

### Le challenge
La demande existait. Les prestataires formés aussi. Il manquait l'endroit où les deux se rencontrent.

Sans cet espace, la relation restait sur des plateformes que Maison AWL ne contrôle pas : ni les données, ni la transaction, ni l'expérience.

Et chaque prestation réalisée sous le nom Maison AWL engage la réputation de Célia.

Il ne s'agissait donc pas de « faire une app », mais de construire une marketplace crédible des deux côtés. Un particulier doit pouvoir faire confiance à la personne qui entre chez lui. Un prestataire doit être sûr d'être payé.

### Les objectifs
- Créer un actif numérique qui ne dépend pas des algorithmes des réseaux sociaux.
- Mettre en relation la communauté avec des prestataires formés à la méthode Maison AWL.
- Gérer toute la transaction dans la plateforme : proposition, paiement, suivi, litiges.
- Activer la communauté existante dès le lancement.

### Notre approche
**01 — Cadrer avant de dessiner**
Une marketplace réunit trois acteurs aux intérêts différents : le client, le prestataire et Maison AWL. Nous avons d'abord défini les rôles, les étapes et les règles entre eux. Chaque écran dessiné ensuite répond à une étape de ce modèle.

**02 — Deux parcours, une seule marque**
Un particulier veut trouver vite quelqu'un de fiable près de chez lui. Un prestataire veut des demandes sérieuses et un paiement garanti. Nous avons conçu deux parcours distincts dans le même univers visuel, pour que la plateforme reste reconnaissable comme Maison AWL des deux côtés.

**03 — Garder la transaction dans la plateforme**
Si la proposition et le paiement se font ailleurs, la plateforme devient un simple annuaire : la relation sort, et la donnée avec. Nous avons intégré propositions commerciales, paiement et suivi dans le produit. Maison AWL maîtrise ainsi toute la chaîne.

**04 — Traiter la confiance comme une fonctionnalité**
Avis, gestion des contestations, espace d'administration : ce ne sont pas des options. Ce sont les mécanismes qui permettent à Célia de garantir un niveau de service sans être présente à chaque intervention.

### La solution
Une marketplace complète, du premier contact au paiement, conçue pour trois utilisateurs : le particulier, le prestataire et l'équipe Maison AWL.

**Côté client** : Onboarding · Recherche et filtres géographiques · Messagerie · Réception des propositions · Paiement · Suivi de la prestation · Avis

**Côté prestataire** : Onboarding · Profil professionnel · Messagerie · Propositions commerciales · Suivi des prestations · Encaissement via Stripe Connect

**Côté Maison AWL** : Espace d'administration · Gestion des contestations

**Notre périmètre** : Cadrage produit · UX/UI · Identité produit · Développement · Lancement

### Focus features
**Stripe Connect : le paiement comme preuve de sérieux**
Plutôt que de laisser client et prestataire s'arranger entre eux, le paiement passe par la plateforme. Le client paie dans un cadre qu'il connaît. Le prestataire est payé sans avoir à relancer. Maison AWL garde la maîtrise de chaque transaction.

**La proposition commerciale intégrée**
Une prestation de home organizing ne se vend pas sur catalogue : chaque intérieur est différent. Le prestataire échange avec le client dans la messagerie, puis lui envoie une proposition directement dans la plateforme. Le client accepte et paie sans quitter Maison AWL.

**Avis et contestations : protéger la marque de Célia**
Chaque intervention se fait sous le nom Maison AWL. Les avis rendent la qualité visible pour les clients suivants. La gestion des contestations offre un cadre en cas de désaccord, au lieu d'un échange de messages sans issue. La marque peut grandir sans que Célia supervise chaque prestation.

### Le résultat
Maison AWL a lancé sa plateforme auprès de 180 000 abonnés.

Sa communauté a maintenant un endroit pour trouver, réserver, payer et évaluer des prestataires formés à la méthode de Célia. Maison AWL possède la relation, la donnée et la transaction.

C'est aussi la première démonstration de notre thèse Creators : la distribution d'un créateur est le point de départ d'un produit.

### CTA
## Votre communauté vous demande déjà plus que du contenu ?
Parlons du produit que vous pourriez construire pour elle.

**Parler de mon projet →**

---

## 02 — CRM R&A Energy

**Catégorie** : CRM sur mesure · Outil métier

# Remplacer les fichiers Excel par un CRM qui vérifie chaque rendez-vous avant qu'il soit posé.

Après son site, R&A Energy nous a confié son outil interne : un CRM qui réunit prospection, rendez-vous et tournées terrain, construit sur son processus commercial réel.

- Application web sur mesure · Nuxt + Supabase
- 6 modules · 5 rôles utilisateurs
- Intégration Google Calendar + calcul du temps de trajet
- Deuxième projet avec le client

### Le client
R&A Energy est courtier en énergie pour les professionnels. Son équipe de 10 à 20 personnes réunit téléprospecteurs, commerciaux terrain et apporteurs d'affaires.

Nous avions déjà conçu son identité et son site. Quand la croissance a rendu les fichiers partagés ingérables, l'équipe est revenue vers nous pour son outil métier.

→ *Chapitre 1 : l'identité et le site de R&A Energy*

### Le challenge
La prospection vivait dans des fichiers Excel et des agendas séparés.

Les conséquences étaient concrètes : des doublons, des rendez-vous posés sans tenir compte du trajet du commercial, aucun historique des échanges, des informations sensibles visibles par tout le monde.

Chaque rendez-vous impossible à honorer, c'est un prospect qualifié qui refroidit.

Un CRM générique aurait obligé l'équipe à changer sa façon de travailler. Nous avons fait l'inverse.

### Les objectifs
- Centraliser prospects, rendez-vous et documents dans un seul outil.
- Supprimer les rendez-vous impossibles à tenir (conflit d'agenda ou trajet irréaliste).
- Donner à chaque rôle exactement ce qu'il doit voir, rien de plus.
- Faire adopter l'outil par une équipe habituée à Excel.

### Notre approche
**01 — Cartographier le processus avant de coder**
Nous avons suivi le parcours d'un prospect de bout en bout : création par un téléprospecteur, qualification, prise de rendez-vous, visite terrain. Chaque écran du CRM correspond à une étape de ce parcours. Rien n'a été ajouté simplement parce que « les CRM l'ont ».

**02 — Mettre la contrainte terrain dans le logiciel**
Stocker des prospects, n'importe quel outil sait le faire. Ce qui manquait à R&A Energy, c'était des rendez-vous fiables. Nous avons donc placé la vérification au moment exact où le rendez-vous est posé : agenda du commercial et temps de trajet réel.

**03 — Cloisonner par rôle, jusqu'à la base de données**
Un téléprospecteur, un commercial et un apporteur d'affaires n'ont pas besoin des mêmes informations. Cinq rôles, avec des permissions appliquées au niveau de la base : chacun ne voit que ses fiches, ses rendez-vous et ses documents. Quand les données sont commerciales, masquer un bouton ne suffit pas.

**04 — Réduire la saisie pour obtenir l'adoption**
Un outil jugé lourd finit abandonné au profit d'Excel. Les fiches se complètent automatiquement via les API SIRET et adresse, et l'historique d'activité s'écrit tout seul. Moins de saisie, plus de chances que l'outil soit utilisé chaque jour.

### La solution
Un CRM web construit sur le processus commercial de R&A Energy, du premier appel à la visite terrain.

**6 modules** : Tableau de bord · Prospects · Planning · Carte des RDV · Équipe · Paramètres

- Pipeline de prospects
- Fiches enrichies automatiquement (SIRET, adresse), commentaires, documents
- Historique d'activité automatique
- Prise de rendez-vous avec vérification Google Calendar et temps de trajet
- Planning de l'équipe commerciale
- Carte des rendez-vous et des tournées
- 5 rôles aux permissions distinctes
- Interface utilisable sur mobile
- Stack : Nuxt + Supabase

### Focus features
**Le rendez-vous vérifié**
Quand un téléprospecteur pose un rendez-vous, le CRM vérifie en direct deux choses : le créneau est libre dans le Google Calendar du commercial, et le trajet depuis le rendez-vous précédent est réaliste. Le téléprospecteur voit immédiatement si le créneau est tenable. Le prospect qualifié rencontre un commercial à l'heure, au lieu d'un rendez-vous reporté.

**La carte des rendez-vous**
Les rendez-vous de la semaine s'affichent sur une carte. Le responsable voit la répartition géographique d'un coup d'œil et peut regrouper les visites par zone, plutôt que de faire traverser la région à un commercial pour un seul rendez-vous.

**Des données cloisonnées par rôle**
Chaque rôle a son périmètre, appliqué jusque dans la base de données. R&A Energy peut ainsi ouvrir l'outil à des partenaires externes sans exposer son fichier client. L'outil accompagne la croissance de l'équipe sans créer de risque.

### Le résultat
**6** modules · **5** rôles · **3** intégrations (Google Calendar, API SIRET, API adresse)

R&A Energy a remplacé ses fichiers partagés par un seul outil, construit sur son propre processus. Les rendez-vous sont vérifiés avant d'être posés, les données sont cloisonnées et l'historique s'écrit seul.

Et ce projet est né d'un premier site. Pour nous, le meilleur indicateur de confiance, c'est un client qui revient.

### Témoignage
*Sur notre premier projet ensemble :*
> « MC Studio a réalisé notre site internet et le résultat est excellent. Travail rapide, professionnel et très soigné. Le site est moderne, fluide et parfaitement adapté à notre activité. »
>
> **Yazid C.**, Co-fondateur de R&A Energy

### CTA
## Votre équipe commerciale travaille encore sur des fichiers Excel partagés ?
On construit l'outil qui suit votre processus, et pas l'inverse.

**Parler de mon projet →**

---

## 03 — Shika Consulting

**Catégorie** : Site web · Expertise comptable

# Transformer l'expertise d'un cabinet spécialisé en un site qui répond avant même le premier rendez-vous.

Shika Consulting accompagne les associations partout en France. Nous avons conçu un site de 14 pages qui oriente chaque visiteur selon son profil et lui donne une première estimation grâce à des simulateurs.

- Site web · 14 pages sur mesure
- Architecture, UX/UI, copywriting, développement
- Simulateurs, dont un simulateur de budget
- Navigation par profil d'association

### Le client
Shika Consulting est un cabinet d'expertise comptable et de commissariat aux comptes spécialisé dans le secteur associatif. Il accompagne des associations partout en France sur leurs enjeux comptables, financiers, juridiques et organisationnels.

C'est un positionnement étroit et choisi. Une force, à condition qu'on le comprenne tout de suite.

### Le challenge
L'expertise était là : comptabilité, audit, conseil, juridique, avec les obligations propres aux associations.

Mais une association qui cherche un cabinet ne compare pas des expertises. Elle se pose deux questions : « Connaissent-ils des structures comme la nôtre ? Combien ça va coûter ? »

Avec 14 pages et de nombreux contenus pédagogiques, le risque était clair : tout montrer, et que personne ne trouve sa réponse.

### Les objectifs
- Rendre la spécialisation associative évidente dès le premier écran.
- Structurer 14 pages pour que chaque profil d'association trouve son chemin.
- Expliquer des obligations techniques sans jargon.
- Faire progresser le visiteur vers l'estimation, puis vers le rendez-vous.

### Notre approche
**01 — Organiser par visiteur, pas par organigramme**
Un cabinet pense en services : comptabilité, audit, juridique. Une association pense en situations. Nous avons structuré la navigation autour de deux entrées, les profils d'association et les services. Chacun se reconnaît avant de lire le détail de l'offre.

**02 — Traduire sans simplifier**
Le public n'est pas expert, le sujet l'est. Chaque page part du besoin concret de l'association, puis explique ce que le cabinet prend en charge. L'expertise reste entière : seul l'ordre de lecture change.

**03 — Répondre avant le contact**
Prendre rendez-vous avec un expert-comptable est un engagement. Beaucoup de visiteurs veulent d'abord savoir si c'est accessible pour eux. Les simulateurs leur donnent une première réponse sans quitter le site, et transforment l'hésitation en raison de prendre contact.

**04 — Montrer les prix**
Le site intègre une page Tarifs. Des repères tarifaires lèvent l'une des premières objections et filtrent les demandes en amont : une association qui prend rendez-vous connaît déjà l'ordre de grandeur.

**05 — Un univers chaleureux pour un métier réputé austère**
Bleu nuit, beige, orange et illustrations pédagogiques : un univers sérieux sans froideur, cohérent avec un cabinet proche du terrain associatif. Les chiffres clés et les témoignages ancrent la crédibilité.

### La solution
Un site de 14 pages conçu comme un parcours : comprendre la spécialisation, se reconnaître, estimer, prendre rendez-vous.

- Architecture de contenu : navigation par profil d'association et par service
- Copywriting
- Direction artistique et UX/UI (illustrations, chiffres clés)
- Simulateurs, dont un simulateur de budget
- Page Tarifs
- Parcours de prise de rendez-vous
- Témoignages et preuves
- Développement responsive
- SEO technique et performance

### Focus features
**Le simulateur de budget**
Plutôt que de demander tout de suite un rendez-vous, le site propose un simulateur de budget. L'association obtient une première estimation en autonomie et arrive au rendez-vous avec une idée claire du cadre. Pour le cabinet, c'est un premier filtre avant même l'appel.

**L'entrée par profil d'association**
Le menu « Associations » permet à chaque visiteur de trouver la page qui correspond à sa structure. Il se reconnaît dans les situations et les obligations décrites avant même de lire l'offre. C'est la preuve de spécialisation la plus directe : ce cabinet connaît des associations comme la sienne.

**Un parcours qui mène toujours au rendez-vous**
Le bouton « Prendre rendez-vous » reste accessible dans la navigation, et les simulateurs, les tarifs et les témoignages y ramènent. Chaque page a une sortie claire. Le visiteur convaincu n'a jamais à chercher comment passer à l'étape suivante.

### Le résultat
**14** pages · **2** entrées de navigation (profil / service) · **Simulateurs** intégrés au parcours

Le site de Shika Consulting fait désormais une partie du travail commercial. Il affirme la spécialisation, répond aux premières questions de prix et oriente vers le rendez-vous.

### Témoignage
> « Très content de mon site internet réalisé avec MC STUDIO ! Je recommande à 200 % ! »
>
> **Nouri Yahi**, Fondateur de Shika Consulting

### CTA
## Votre expertise est solide, mais votre site ne l'explique pas encore ?

**Parler de mon projet →**

---

## 04 — Personal

**Catégorie** : SaaS IA · Branding · Product design · Développement

# Aider les créateurs à publier mieux, sans devenir des machines à contenu.

Un SaaS IA qui part de ce qui fonctionne dans la niche du créateur et de ce qu'il a vécu, pour préparer des brouillons qui lui ressemblent. Nous avons construit la marque, le site et le produit.

- SaaS IA bilingue FR / EN
- Marque + landing + application
- 3 formats : légende, carrousel, script de Reel
- Aucune publication automatique : le créateur garde la main

### Le client
Personal s'adresse aux créateurs qui veulent publier régulièrement sans perdre ce qui les rend reconnaissables : leur voix, leurs histoires, leurs opinions.

Le produit part d'une conviction : l'IA doit servir la singularité d'un créateur, pas la lisser.

### Le challenge
Les outils IA savent produire du texte. Surtout le même texte pour tout le monde.

Pour un créateur, c'est un risque direct : un contenu générique ne crée ni attachement ni différence, et l'audience le sent.

Personal devait tenir deux promesses qui semblent opposées : faire gagner du temps grâce aux données et à l'IA, sans jamais produire un contenu que n'importe qui aurait pu publier.

### Les objectifs
- Proposer régulièrement des idées fondées sur ce qui fonctionne dans la niche du créateur.
- Transformer son vécu en contenus qui lui ressemblent.
- Réduire le temps entre l'inspiration et le brouillon.
- Rendre une mécanique complexe évidente dès les premières minutes.

### Notre approche
**01 — Partir du créateur, pas du prompt**
Un outil générique commence par une page blanche et un champ de texte. Personal commence par le créateur : son positionnement, ses sujets, sa voix, ses références. Ce profil, le Creator DNA, sert de filtre à tout ce que le produit propose ensuite.

**02 — Remplacer l'intuition par des signaux**
Les idées trouvées au hasard coûtent du temps et performent mal. Le produit fait remonter les contenus et les angles qui fonctionnent déjà dans l'univers du créateur. Chaque idée part d'une preuve, pas d'une supposition.

**03 — Relier chaque idée à un vécu**
Un format qui marche chez un autre ne suffit pas. Le Remix croise ce format avec les moments, les histoires et les opinions du créateur. C'est ce qui empêche le contenu d'être une copie.

**04 — Accélérer sans retirer le contrôle**
Personal va jusqu'au brouillon (angle, script, carrousel, légende), mais jamais jusqu'à la publication. Le créateur relit, modifie, décide. C'est un choix produit assumé : la confiance dans l'outil en dépend.

**05 — Une marque qui tient la promesse du produit**
Sur un marché d'outils IA qui se ressemblent, Personal devait se reconnaître au premier regard. Nous avons créé une identité éditoriale et contrastée : symbole signature, typographie expressive, palette ivoire, noir et corail. Elle est déclinée du site jusqu'à l'interface : le site promet une voix, le produit la tient.

### La solution
Un produit qui réunit veille, inspiration et création dans un seul espace, et une marque construite pour le porter.

**Marque** : Positionnement · Identité visuelle (symbole, typographie, palette) · Direction artistique

**Acquisition** : Landing page animée · Copywriting

**Produit** : Onboarding et Creator DNA · Feed de contenus performants dans la niche · Favoris · Moments personnels · Remix · Expérience conversationnelle avec l'IA · Génération de brouillons (légende, carrousel, script de Reel)

**Technique** : Application bilingue FR / EN · Authentification · Interface responsive

### Focus features
**Le feed : partir de ce qui marche**
Plutôt que de demander au créateur « de quoi veux-tu parler ? », Personal lui montre ce qui performe déjà dans sa niche. Il enregistre ce qui l'inspire. La page blanche disparaît, et chaque idée part d'un signal réel.

**Le Remix : un format éprouvé, une histoire personnelle**
Le créateur choisit un contenu qui fonctionne et le croise avec l'un de ses propres moments. Le produit s'appuie sur ce qui fait marcher le format et le reconstruit à partir de son vécu. Le résultat a une chance de performer, et personne d'autre n'aurait pu le publier.

**Du brouillon, jamais de publication**
Personal prépare une légende, un carrousel ou un script, mais ne publie jamais. Ce n'est pas une limite, c'est la promesse : un créateur ne confie pas sa voix à un outil qui agit sans lui.

### Le résultat
**2** langues · **3** formats de contenu · Marque, site et application livrés ensemble

Personal est passé d'une conviction à un produit en ligne : une marque, un site et une application bilingue, construits autour d'un seul principe.

**L'IA amplifie la singularité du créateur. Elle ne la remplace pas.**

### CTA
## Vous avez une idée de SaaS et besoin de la marque, du produit et du code au même endroit ?

**Parler de mon projet →**

---

## 05 — AMG Promotion

**Catégorie** : Site web · B2B · Objets promotionnels

# Mettre le site d'AMG Promotion au niveau de ses clients : Groupe SEB, ALTRAD, Police Nationale.

AMG Promotion conçoit textiles, goodies et objets personnalisés pour des organisations de premier plan. Nous avons repensé son site pour que la qualité perçue corresponde à celle des projets livrés.

- Refonte du site
- Direction artistique, UX/UI, copywriting, développement
- Client B2B · équipe de 20 à 50 personnes

### Le client
AMG Promotion accompagne entreprises et institutions dans la création de textiles, goodies et objets promotionnels personnalisés. Parmi ses clients : Groupe SEB, ALTRAD, la Police Nationale.

Une équipe de 20 à 50 personnes, avec un savoir-faire reconnu par des grands comptes.

### Le challenge
Quand un acheteur de grand compte découvre un fournisseur, il le juge d'abord sur son site.

AMG avait les références et la qualité d'exécution. Son site précédent ne le montrait pas encore au même niveau : l'offre était difficile à parcourir pour un nouveau visiteur, et les contenus clés manquaient de hiérarchie.

Dans l'objet promotionnel, le risque est double : trop de produits, trop de possibilités. Un site qui montre tout finit par ne rien vendre.

### Les objectifs
- Crédibiliser AMG dès le premier écran auprès d'acheteurs B2B.
- Rendre l'offre lisible : ce qu'AMG produit, et pour quels besoins.
- Placer les références et les réalisations au centre.
- Faciliter la demande de devis.

### Notre approche
**01 — Aligner l'image sur les clients**
Un acheteur qui travaille pour un groupe industriel compare AMG à ses propres standards. Nous avons construit une direction artistique plus sobre : plus d'espace, une hiérarchie nette. AMG est perçu au niveau des marques qu'il équipe.

**02 — Organiser par besoin, pas par catalogue**
AMG peut produire une gamme très large. Le site présente d'abord les grandes catégories et les besoins auxquels elles répondent. Le détail vient ensuite, dans l'échange commercial. Un visiteur doit savoir en quelques secondes si AMG peut répondre à sa demande, pas parcourir un catalogue.

**03 — Faire parler les références**
Dans ce secteur, le premier frein est la confiance : délais, qualité, rendu final. Les références clients et les réalisations répondent à la question que l'acheteur ne pose pas : « Savent-ils gérer une commande comme la mienne ? »

### La solution
Un site qui présente AMG comme le partenaire de grands comptes et amène l'acheteur jusqu'à la demande de devis.

- Direction artistique
- Architecture et hiérarchie de contenu
- Copywriting
- Présentation des catégories de produits
- Mise en avant des références et des réalisations
- Appels à l'action vers la demande de devis
- Développement responsive

### Focus features
**Les références comme argument principal**
Groupe SEB, ALTRAD, Police Nationale : ces noms font plus pour la crédibilité d'AMG qu'un paragraphe de présentation. Le site en fait sa preuve principale. L'acheteur est rassuré avant même d'avoir lu l'offre.

**Des catégories plutôt qu'un catalogue**
Plutôt que d'exposer toute la gamme, le site organise l'offre en grandes catégories. Le visiteur identifie vite ce qui le concerne et arrive à la demande de devis avec un besoin déjà formulé. L'échange commercial démarre plus vite.

### Le résultat
Le site d'AMG Promotion montre aujourd'hui en ligne le niveau qu'elle démontre déjà chez ses clients. Il ne se contente plus de décrire ce qu'elle fabrique : il montre pour qui, et comment lancer une commande.

### Témoignage
> « Efficacité et très bonne compréhension de nos attentes. »

> « La création de notre site est une réussite ! Nous recommandons vraiment MC Studio ! Efficacité et très bonne compréhension de nos attentes. »
>
> **Jean-François Fialaire**, Fondateur d'AMG Promotion

### CTA
## Votre site ne reflète plus le niveau de vos clients ?

**Parler de mon projet →**

---

## 06 — R&A Energy

**Catégorie** : Branding · Landing page · Copywriting · *Chapitre 1*

# Rendre simple une expertise qui ne l'est pas.

R&A Energy optimise les contrats d'énergie des professionnels. Nous avons créé son identité et une landing page qui explique le métier en quelques écrans et amène le prospect jusqu'au rendez-vous.

- Logo + identité visuelle
- Landing page · Copywriting
- Client B2B · équipe de 10 à 20 personnes
- Premier projet avant le CRM sur mesure

### Le client
R&A Energy est courtier en énergie pour les professionnels. Son métier : aider les entreprises à optimiser leurs contrats d'énergie.

Une équipe de 10 à 20 personnes, sur un marché où le prospect a rarement le temps de comprendre les détails.

### Le challenge
Prix, fournisseurs, contrats, conditions : pour la plupart des dirigeants, le marché de l'énergie est opaque.

Pour un courtier, c'est un paradoxe : plus l'expertise est technique, plus elle est difficile à vendre en ligne. Et un prospect qui ne comprend pas l'offre ne prend pas rendez-vous.

Le site devait réduire la complexité sans réduire la crédibilité.

### Les objectifs
Le prospect devait comprendre rapidement :
- ce que fait R&A Energy ;
- pourquoi faire appel à eux ;
- comment se déroule l'accompagnement ;
- quelle est l'étape suivante.

### Notre approche
**01 — Le problème avant le marché**
La page parle d'abord de la situation du prospect et du bénéfice de l'accompagnement. Le détail du marché vient ensuite, pour ceux qui le cherchent. Un dirigeant ne veut pas un cours sur l'énergie : il veut savoir si l'appel vaut son temps.

**02 — Une identité qui inspire le sérieux**
Sur un marché de l'énergie où le démarchage est souvent perçu comme agressif, un courtier doit se distinguer au premier regard. Le logo et la direction artistique positionnent R&A Energy comme un conseil, pas comme un vendeur.

**03 — Montrer le déroulé**
Une section dédiée explique les étapes de l'accompagnement. Rendre visible ce qui se passe après le premier appel réduit la peur de s'engager.

**04 — Un parcours commercial, sans pression**
Chaque section mène à la prise de contact, sans formules agressives. Le prospect avance à son rythme, et l'étape suivante reste toujours évidente.

### La solution
Une identité et une landing page qui transforment une offre technique en décision simple : prendre rendez-vous.

- Logo et identité visuelle
- Direction artistique
- Positionnement et copywriting
- Landing page
- Section « comment ça marche » : les étapes de l'accompagnement
- Éléments de réassurance
- Parcours vers la prise de rendez-vous

### Focus features
**La section « comment ça marche »**
Plutôt que d'expliquer le marché de l'énergie, la page montre ce que R&A Energy fait pour le prospect, étape par étape. Le prospect sait à quoi il s'engage avant d'appeler. Le premier échange commence sur une base claire.

**Une identité conçue pour la confiance**
Le logo et le système visuel donnent à R&A Energy l'image d'un cabinet de conseil. Dans un secteur où le prospect se méfie par défaut, c'est la première objection levée, avant même la lecture.

### Le résultat
R&A Energy explique aujourd'hui son métier en quelques écrans, avec une image à la hauteur de son conseil.

Le signe le plus fort est venu ensuite : l'équipe nous a confié la conception de son CRM sur mesure.

→ *Chapitre 2 : le CRM R&A Energy*

### Témoignage
> « Travail rapide, professionnel et très soigné. »

> « MC Studio a réalisé notre site internet et le résultat est excellent. Travail rapide, professionnel et très soigné. Le site est moderne, fluide et parfaitement adapté à notre activité. »
>
> **Yazid C.**, Co-fondateur de R&A Energy

### CTA
## Votre offre est technique et vos prospects décrochent avant de comprendre ?

**Parler de mon projet →**

---

## 07 — Sotraya

**Catégorie** : Landing page · B2B · Automatisation

# Rendre tangible une offre d'automatisation qui, par nature, ne se voit pas.

Sotraya connecte les outils et automatise les opérations des entreprises. Nous avons conçu une landing page qui montre ce qui change au quotidien avant de parler de technologie, et qui mène à un audit gratuit de 30 minutes.

- Landing page B2B
- UX/UI · Copywriting
- Démonstrations avant/après et scénario d'onboarding
- Conversion : audit gratuit de 30 min

### Le client
Fondée par Daris Rabouhi, Sotraya connecte les outils d'une entreprise, fait circuler les données entre eux et automatise les tâches répétitives.

Automatisation, intégrations, IA, outils métier sur mesure : une offre large, destinée à des dirigeants qui n'ont pas toujours les mots pour décrire leur besoin.

### Le challenge
L'automatisation a un problème commercial : sa valeur peut être énorme, mais elle est invisible.

Un dirigeant ne cherche pas « un workflow entre son CRM et sa facturation ». Il veut arrêter de ressaisir les mêmes informations à plusieurs endroits.

Parler d'API et d'intégrations, c'est perdre ce lecteur. Il fallait lui montrer sa propre journée, en mieux.

### Les objectifs
- Expliquer l'automatisation par ses usages concrets.
- Présenter plusieurs expertises comme une seule offre cohérente.
- Mettre en valeur la méthode.
- Faire de l'audit gratuit le premier pas naturel.

### Notre approche
**01 — Partir des tâches, pas des outils**
La page s'organise autour de situations que chaque entreprise reconnaît : onboarding client, CRM, documents, facturation, suivi. Le lecteur se reconnaît avant d'entendre parler de technologie.

**02 — Montrer au lieu d'expliquer**
Une comparaison avant/après et un scénario d'onboarding automatisé montrent l'information qui circule entre les outils. L'invisible devient visible : le prospect voit ce qu'il achète.

**03 — Réduire le premier engagement**
Un projet d'automatisation inquiète : coût, durée, perturbation des équipes. Plutôt qu'un simple « contactez-nous », la page propose un audit gratuit de 30 minutes pour identifier les premières opportunités. Le premier pas est concret, limité dans le temps, sans risque.

### La solution
Une landing page qui vend la conséquence de l'automatisation, pas sa mécanique.

- Positionnement et proposition de valeur
- Architecture de la landing
- Présentation de l'offre : automatisation, intégrations, IA, outils métier
- Comparaison avant/après
- Scénario d'onboarding automatisé
- Présentation de la méthode
- Réassurance
- Appels à l'action vers l'audit de 30 minutes, répartis sur la page

### Focus features
**Le scénario d'onboarding**
Plutôt que de lister des intégrations, la page déroule un cas : un nouveau client arrive, et l'information circule d'un outil à l'autre sans ressaisie. Le prospect projette le scénario sur sa propre entreprise et arrive à l'audit avec des exemples en tête.

**L'avant/après**
Deux versions de la même situation, côte à côte : avec des outils déconnectés, puis avec des systèmes qui travaillent ensemble. Le gain de temps devient visible sans chiffre abstrait.

**L'audit de 30 minutes comme CTA**
Une vente d'automatisation est complexe. Un rendez-vous de 30 minutes, gratuit et centré sur les opportunités du prospect, ne l'est pas. Le CTA transforme une décision lourde en premier pas facile.

### Le résultat
Un visiteur de Sotraya ne découvre plus une liste d'outils. Il voit sa propre organisation avec moins de ressaisie, et un moyen simple d'aller plus loin : 30 minutes d'audit.

### CTA
## Votre offre est puissante, mais difficile à expliquer ?

**Parler de mon projet →**

---

## 08 — Arises

**Catégorie** : SaaS IA · Branding · Landing page · Product design

# Transformer un concept IA en un SaaS dont on comprend la valeur avant même de s'inscrire.

Arises transforme un calendrier chaotique en planning équilibré entre travail et vie personnelle. Nous avons conçu la marque, la landing et l'expérience produit avec un seul objectif : réduire le temps entre l'inscription et le premier planning utile.

- SaaS IA
- Logo, identité visuelle, direction artistique
- Landing page
- UX/UI produit et parcours d'activation

### Le client
Arises est un SaaS IA qui transforme le calendrier d'un utilisateur en plan d'action. Sa promesse, en une ligne : *Turn chaotic tasks into a balanced schedule.*

Au moment du projet, le produit était en phase de lancement.

### Le challenge
Comme beaucoup de produits IA, Arises peut faire beaucoup de choses. C'est précisément le risque.

Un utilisateur qui ne perçoit pas la valeur dans les premières minutes ne revient pas. Et un SaaS en lancement n'a ni notoriété, ni avis, ni cas clients pour compenser.

Chaque élément devait donc faire son travail seul : la marque pour être crédible, la landing pour faire comprendre, le produit pour prouver vite.

### Les objectifs
- Expliquer la promesse IA par son bénéfice, pas par sa technologie.
- Donner l'image d'un produit crédible dès le jour du lancement.
- Réduire la distance entre la première connexion et le premier planning utile.
- Construire un univers cohérent, du logo à l'interface.

### Notre approche
**01 — Construire une marque de produit, pas de projet**
Un SaaS sans historique est jugé sur ses signaux : logo, typographie, cohérence. Nous avons créé une identité capable de positionner Arises aux côtés d'outils établis dès sa mise en ligne.

**02 — Vendre l'avant/après, pas l'algorithme**
Personne n'achète « un moteur de planification par IA ». On achète une semaine moins chaotique. La landing montre le passage de tâches empilées à un planning équilibré, travail d'un côté, vie personnelle de l'autre. La technologie vient après.

**03 — Concevoir chaque écran autour de l'activation**
Une question a guidé l'UX : combien d'étapes avant que l'utilisateur voie son premier planning ? Chaque écran du parcours a été jugé à cette aune. Ce qui n'aidait pas l'utilisateur à atteindre ce premier planning passait au second plan.

### La solution
Une marque, une landing et une expérience produit conçues pour qu'un inconnu comprenne, essaie, puis obtienne son premier planning.

**Marque** : Logo · Identité visuelle · Direction artistique

**Acquisition** : Landing page · Copywriting

**Produit** : UX/UI · Parcours d'activation · Interfaces produit

**Lancement** : Mise en ligne

### Focus features
**L'avant/après, dès la première lecture**
Plutôt que d'expliquer le fonctionnement de l'IA, la landing montre le résultat : des tâches qui se chevauchent d'un côté, un planning organisé en Work / Life de l'autre. Le visiteur comprend la promesse sans lire un paragraphe, et l'appel à l'action suit immédiatement.

**Un parcours d'activation centré sur le premier planning**
L'inscription ne sert pas à présenter le produit, mais à y entrer. Le parcours mène l'utilisateur vers une seule chose : voir son propre planning réorganisé. La valeur arrive avant la lassitude.

### Le résultat
Arises a été lancé avec une marque, une landing et un produit conçus ensemble. Pas d'étape où la promesse change de ton : ce que la landing montre, le produit le livre.

### CTA
## Vous lancez un SaaS et vos utilisateurs ne comprennent pas encore sa valeur au premier regard ?

**Parler de mon projet →**

---

## 09 — Souji Nova

**Catégorie** : Landing page · Services

# Faire de la confiance le premier levier de conversion.

Souji Nova propose des prestations de nettoyage aux particuliers et aux professionnels. Nous avons conçu une landing page qui répond aux doutes du visiteur avant de lui demander un devis.

- Landing page
- UX/UI + copywriting
- 2 publics : particuliers et professionnels
- Objectif unique : la demande de devis

### Le client
Souji Nova est une société de nettoyage qui intervient chez les particuliers et dans les locaux professionnels.

Deux publics, un même besoin : confier son espace à quelqu'un de fiable.

### Le challenge
Dans les services, on n'achète pas d'abord une prestation. On achète de la confiance.

Avant de demander un devis, le visiteur se pose quatre questions :
Qui intervient ?
Pour quels besoins ?
Comment demander un devis ?
Puis-je leur confier mes locaux ou mon domicile ?

Si le site n'y répond pas en quelques secondes, le visiteur revient sur Google et appelle le prestataire suivant.

### Les objectifs
- Répondre aux quatre questions dès les premiers écrans.
- Distinguer clairement l'offre particuliers et l'offre professionnels.
- Lever les objections avant la demande de contact.
- Raccourcir le chemin jusqu'au devis.

### Notre approche
**01 — Commencer par la réponse**
Les services et les profils accompagnés sont annoncés dès le premier écran. Sur mobile, un visiteur décide en quelques secondes s'il est au bon endroit : la page ne lui fait pas chercher.

**02 — Placer la preuve là où le doute apparaît**
Chacune des quatre questions trouve sa réponse dans une section de la page. La confiance ne vient pas d'un slogan : elle vient de preuves placées au moment où le doute se présente.

**03 — Un seul objectif**
La page limite les distractions : chaque section mène à la même action, la demande de devis. Une landing de service n'a pas besoin d'être explorée, elle doit être utilisée.

### La solution
Une landing page construite comme une réponse aux objections, qui se termine par une demande de devis.

- Proposition de valeur
- Présentation des services
- Offre segmentée particuliers / professionnels
- Éléments de réassurance
- Appels à l'action répartis sur la page
- Demande de devis
- Copywriting
- Conception mobile-first

### Focus features
**Segmenter dès l'entrée**
Un particulier et un gestionnaire de locaux n'ont pas les mêmes attentes, ni les mêmes questions. La page distingue les deux offres pour que chacun lise ce qui le concerne. La demande de devis arrive déjà orientée, et Souji Nova sait à qui il répond.

**Le devis toujours à portée**
Les appels à l'action sont répartis tout au long de la page. Le visiteur convaincu à la deuxième section n'a pas à attendre la fin pour agir. Chaque moment de décision a sa porte de sortie.

### Le résultat
Souji Nova a une page qui fait un seul travail, sans détour : transformer une visite en demande de devis.

### Témoignage
> « De bons conseils et à l'écoute de ses clients. »

> « MC Studio nous a réalisé un super site internet, très intuitif et très pro. De bons conseils et à l'écoute de ses clients, je recommande ! »
>
> **Nelson M.**, Co-fondateur de Souji Nova

### CTA
## Vos clients hésitent avant de vous demander un devis ?

**Parler de mon projet →**

---

## 10 — Fontaines VTC

**Catégorie** : Site web · SEO local · Conversion

# Transformer une recherche locale en réservation.

Pour un chauffeur VTC, le site sert à deux choses : être trouvé au moment où quelqu'un cherche un transport, puis être réservé sans friction. Nous avons travaillé les deux.

- Site web · SEO local
- Copywriting
- Optimisation des appels à l'action
- Parcours de réservation mobile

### Le client
Fontaines VTC est un service de transport privé avec réservation en ligne.

Une activité où la demande naît souvent d'une recherche sur mobile, parfois au dernier moment.

### Le challenge
Un utilisateur qui tape « VTC » suivi du nom de sa ville ne compare pas longtemps. Il contacte le premier résultat qui lui inspire confiance.

Deux objectifs devaient donc fonctionner ensemble : apparaître sur les bonnes recherches locales, et rendre la réservation évidente dès l'arrivée sur le site.

L'un sans l'autre ne sert à rien.

### Les objectifs
- Gagner en visibilité sur les recherches locales pertinentes.
- Donner immédiatement les informations utiles avant une réservation.
- Faire de la réservation l'action principale du site.
- Soigner l'expérience mobile, là où se font les recherches.

### Notre approche
**01 — Structurer pour la recherche locale**
Les contenus et la structure de la page sont organisés autour de la zone d'activité. En SEO local, la pertinence géographique compte davantage que le volume de texte.

**02 — Répondre avant que la question bloque**
Prestations et informations utiles sont visibles immédiatement. Pour un transport, chaque information manquante pousse le visiteur à contacter le concurrent.

**03 — Une seule action principale**
La réservation et la prise de contact sont positionnées comme les actions principales du site. Sur mobile, il n'y a pas de place pour deux objectifs.

### La solution
- Architecture de la landing page
- Copywriting
- SEO local
- Présentation des prestations
- Optimisation des appels à l'action
- Expérience mobile
- Parcours vers la réservation

### Focus features
**Un SEO local construit sur la zone d'activité**
Plutôt que de viser des requêtes génériques, le site cible les recherches liées à sa zone. Le trafic qui arrive correspond à des personnes qui cherchent un transport ici et maintenant. Ce sont les visites qui se transforment en courses.

**La réservation à un geste**
Les appels à l'action sont repositionnés pour rendre la réservation immédiate. Le visiteur qui a trouvé Fontaines VTC sur Google n'a pas à chercher comment réserver.

### Le résultat
Le site de Fontaines VTC est construit autour des deux métriques qui comptent pour son activité : être trouvé, être réservé.

### Témoignage
> « Entreprise très sérieuse et professionnelle. »

> « MC Studio m'a accompagné dans mon projet digital, entreprise très sérieuse et professionnelle, je la recommande ! »
>
> **Mario C.**, Dirigeant de Fontaines VTC

### CTA
## Vos clients vous cherchent sur Google. Est-ce qu'ils vous trouvent ?

**Parler de mon projet →**

---

## 11 — MC Studio Creator

**Catégorie** : Projet interne · Branding · Positionnement · Landing page

# Passer de prestataire pour créateurs à partenaire produit.

Les créateurs ont déjà ce que la plupart des produits cherchent pendant des années : une audience. Nous avons construit la marque et le site d'une verticale dédiée à ce qui vient ensuite.

- Projet interne MC Studio
- Positionnement et thèse
- Identité complète : logo, couleurs, typographies
- Landing page + parcours de candidature

### Le contexte
MC Studio Creator est la verticale de MC Studio dédiée aux créateurs de contenu. Nous y concevons des produits et des applications construits autour de leur communauté : un espace qu'ils possèdent, plutôt qu'une audience qui dépend des algorithmes.

### Le challenge
Un créateur ne raisonne pas comme une PME. Il pense communauté, univers, monétisation. Et ce qu'on lui livre n'est pas un site : c'est un produit.

Parler aux deux publics avec la même marque diluait le message.

Le risque inverse existait aussi : être perçu comme une agence de plus qui propose « une app ». Or le vrai travail est plus large : comprendre la communauté, identifier un besoin, concevoir le produit, puis le lancer sur la distribution existante.

### Les objectifs
- Créer une verticale distincte sans casser la marque MC Studio.
- Parler aux créateurs avec leurs propres codes.
- Rendre concrète l'idée d'un produit construit pour une communauté.
- Recevoir des demandes qualifiées de créateurs.

### Notre approche
**01 — Écrire la thèse avant le logo**
Audience → besoin → produit → lancement. Un positionnement qui ne tient pas en une ligne ne se vend pas. Toute la page découle de ces quatre étapes.

**02 — Une identité à part**
Les créateurs jugent d'abord sur l'univers. Une marque d'agence B2B ne leur parle pas. Nous avons créé un système dédié : violet, Helvetica et Inter, textures et déclinaisons jusqu'à la signalétique.

**03 — Vendre un partenariat, pas une prestation**
La landing parle de construction à deux et d'exploitation de la distribution, pas de livrables. Les produits de créateurs réussissent quand le lancement est pensé dès le cadrage : c'est ce que la page doit faire comprendre.

**04 — Filtrer par la candidature**
Plutôt qu'un formulaire de contact, un parcours de candidature. Il permet de comprendre l'audience et le besoin du créateur avant le premier échange.

### La solution
- Positionnement et thèse
- Proposition de valeur
- Logo et wordmark
- Système de couleurs (violet), typographies Helvetica et Inter, textures
- Déclinaisons de marque (signalétique, affichage)
- Direction artistique
- Landing page
- Parcours de candidature

### Focus features
**La thèse, visible en 4 étapes**
Plutôt qu'une liste de services, la page déroule le raisonnement : audience, besoin, produit, lancement. Le créateur comprend qu'on lui propose de construire un actif, pas de commander une app. Les demandes qui arrivent partent de cette ambition.

**Le cas Maison AWL comme preuve**
La landing met en avant la case study Maison AWL. Un créateur y voit un pair qui l'a fait, plutôt qu'une promesse d'agence. C'est l'argument le plus direct de toute la page.

### Le résultat
Cette verticale est devenue le socle de l'offre Creators de MC Studio et de notre approche des produits construits autour d'audiences existantes.

### La thèse
> « La force d'un créateur, c'est sa distribution. On transforme cette audience en utilisateurs d'un produit concret. »

### CTA
## Vous avez une audience et une idée de produit pour votre communauté ?

**Parler de mon projet →**
