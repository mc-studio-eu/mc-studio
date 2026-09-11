import type { LocalizedValue } from './projects'

export interface CaseStudyItem {
  title: string
  body: string
}

export interface CaseStudyGroup {
  title?: string
  items: string[]
}

export interface CaseStudyStat {
  value: string
  label: string
}

export interface CaseStudyLink {
  slug: string
  label: string
}

export interface CaseStudy {
  category: string
  headline: string
  subtitle: string
  keyFacts: string[]
  /** Overrides the default "Le client" heading */
  clientTitle?: string
  client: string[]
  clientLink?: CaseStudyLink
  challenge: string[]
  objectivesIntro?: string
  objectives: string[]
  approach: CaseStudyItem[]
  solutionIntro?: string
  solution: CaseStudyGroup[]
  features: CaseStudyItem[]
  resultStats?: CaseStudyStat[]
  result: string[]
  resultEmphasis?: string
  resultLink?: CaseStudyLink
  /** Short excerpt shown above the full testimonial */
  testimonialHighlight?: string
  /** Line displayed before the testimonial, e.g. when it refers to another project */
  testimonialContext?: string
  /** Shown instead of a testimonial when the project has none */
  quote?: string
}

export const caseStudies: Record<string, LocalizedValue<CaseStudy>> = {
  'maison-awl': {
    fr: {
      category: 'Marketplace de services · Produit créateur',
      headline: 'Transformer une audience de 180 000 personnes en un produit qui lui appartient.',
      subtitle: "Célia avait la communauté et l'expertise. Nous avons construit la plateforme qui connecte ses abonnés aux prestataires formés à sa méthode, du premier message jusqu'au paiement.",
      keyFacts: [
        '180 000 abonnés au lancement',
        'Marketplace web · 3 espaces : client, prestataire, admin',
        'Cadrage, UX/UI, développement, lancement',
        'Paiements via Stripe Connect',
      ],
      client: [
        "Maison AWL est l'univers créé par Célia autour du home organizing. Sur les réseaux sociaux, elle partage sa méthode avec 180 000 abonnés. En parallèle, elle forme des prestataires à son métier et à ses standards de service.",
        'Au moment du projet, sa communauté demandait de plus en plus de prestations à domicile.',
      ],
      challenge: [
        "La demande existait. Les prestataires formés aussi. Il manquait l'endroit où les deux se rencontrent.",
        "Sans cet espace, la relation restait sur des plateformes que Maison AWL ne contrôle pas : ni les données, ni la transaction, ni l'expérience.",
        'Et chaque prestation réalisée sous le nom Maison AWL engage la réputation de Célia.',
        "Il ne s'agissait donc pas de « faire une app », mais de construire une marketplace crédible des deux côtés. Un particulier doit pouvoir faire confiance à la personne qui entre chez lui. Un prestataire doit être sûr d'être payé.",
      ],
      objectives: [
        'Créer un actif numérique qui ne dépend pas des algorithmes des réseaux sociaux.',
        'Mettre en relation la communauté avec des prestataires formés à la méthode Maison AWL.',
        'Gérer toute la transaction dans la plateforme : proposition, paiement, suivi, litiges.',
        'Activer la communauté existante dès le lancement.',
      ],
      approach: [
        {
          title: 'Cadrer avant de dessiner',
          body: "Une marketplace réunit trois acteurs aux intérêts différents : le client, le prestataire et Maison AWL. Nous avons d'abord défini les rôles, les étapes et les règles entre eux. Chaque écran dessiné ensuite répond à une étape de ce modèle.",
        },
        {
          title: 'Deux parcours, une seule marque',
          body: "Un particulier veut trouver vite quelqu'un de fiable près de chez lui. Un prestataire veut des demandes sérieuses et un paiement garanti. Nous avons conçu deux parcours distincts dans le même univers visuel, pour que la plateforme reste reconnaissable comme Maison AWL des deux côtés.",
        },
        {
          title: 'Garder la transaction dans la plateforme',
          body: 'Si la proposition et le paiement se font ailleurs, la plateforme devient un simple annuaire : la relation sort, et la donnée avec. Nous avons intégré propositions commerciales, paiement et suivi dans le produit. Maison AWL maîtrise ainsi toute la chaîne.',
        },
        {
          title: 'Traiter la confiance comme une fonctionnalité',
          body: "Avis, gestion des contestations, espace d'administration : ce ne sont pas des options. Ce sont les mécanismes qui permettent à Célia de garantir un niveau de service sans être présente à chaque intervention.",
        },
      ],
      solutionIntro: "Une marketplace complète, du premier contact au paiement, conçue pour trois utilisateurs : le particulier, le prestataire et l'équipe Maison AWL.",
      solution: [
        { title: 'Côté client', items: ['Onboarding', 'Recherche et filtres géographiques', 'Messagerie', 'Réception des propositions', 'Paiement', 'Suivi de la prestation', 'Avis'] },
        { title: 'Côté prestataire', items: ['Onboarding', 'Profil professionnel', 'Messagerie', 'Propositions commerciales', 'Suivi des prestations', 'Encaissement via Stripe Connect'] },
        { title: 'Côté Maison AWL', items: ["Espace d'administration", 'Gestion des contestations'] },
        { title: 'Notre périmètre', items: ['Cadrage produit', 'UX/UI', 'Identité produit', 'Développement', 'Lancement'] },
      ],
      features: [
        {
          title: 'Stripe Connect : le paiement comme preuve de sérieux',
          body: "Plutôt que de laisser client et prestataire s'arranger entre eux, le paiement passe par la plateforme. Le client paie dans un cadre qu'il connaît. Le prestataire est payé sans avoir à relancer. Maison AWL garde la maîtrise de chaque transaction.",
        },
        {
          title: 'La proposition commerciale intégrée',
          body: 'Une prestation de home organizing ne se vend pas sur catalogue : chaque intérieur est différent. Le prestataire échange avec le client dans la messagerie, puis lui envoie une proposition directement dans la plateforme. Le client accepte et paie sans quitter Maison AWL.',
        },
        {
          title: 'Avis et contestations : protéger la marque de Célia',
          body: "Chaque intervention se fait sous le nom Maison AWL. Les avis rendent la qualité visible pour les clients suivants. La gestion des contestations offre un cadre en cas de désaccord, au lieu d'un échange de messages sans issue. La marque peut grandir sans que Célia supervise chaque prestation.",
        },
      ],
      result: [
        'Maison AWL a lancé sa plateforme auprès de 180 000 abonnés.',
        'Sa communauté a maintenant un endroit pour trouver, réserver, payer et évaluer des prestataires formés à la méthode de Célia. Maison AWL possède la relation, la donnée et la transaction.',
        "C'est aussi la première démonstration de notre thèse Creators : la distribution d'un créateur est le point de départ d'un produit.",
      ],
    },
    en: {
      category: 'Service marketplace · Creator product',
      headline: 'Turning an audience of 180,000 people into a product it owns.',
      subtitle: 'Célia had the community and the expertise. We built the platform that connects her followers with professionals trained in her method, from the first message to payment.',
      keyFacts: [
        '180,000 followers at launch',
        'Web marketplace · 3 spaces: client, provider, admin',
        'Framing, UX/UI, development, launch',
        'Payments via Stripe Connect',
      ],
      client: [
        'Maison AWL is the world Célia built around home organizing. On social media, she shares her method with 180,000 followers. Alongside that, she trains professionals in her craft and her service standards.',
        'At the time of the project, her community was asking for more and more in-home services.',
      ],
      challenge: [
        'The demand was there. So were the trained professionals. What was missing was a place where the two could meet.',
        'Without it, the relationship stayed on platforms Maison AWL does not control: not the data, not the transaction, not the experience.',
        "And every job done under the Maison AWL name puts Célia's reputation on the line.",
        'So this was never about "making an app". It was about building a marketplace that is credible on both sides. A client must be able to trust the person entering their home. A provider must be sure they will get paid.',
      ],
      objectives: [
        'Create a digital asset that does not depend on social media algorithms.',
        'Connect the community with professionals trained in the Maison AWL method.',
        'Handle the whole transaction inside the platform: proposal, payment, follow-up, disputes.',
        'Activate the existing community from day one.',
      ],
      approach: [
        {
          title: 'Frame before designing',
          body: 'A marketplace brings together three parties with different interests: the client, the provider and Maison AWL. We first defined the roles, the steps and the rules between them. Every screen designed afterwards serves a step of that model.',
        },
        {
          title: 'Two journeys, one brand',
          body: 'A client wants to find someone reliable nearby, fast. A provider wants serious requests and guaranteed payment. We designed two distinct journeys within the same visual world, so the platform remains recognisably Maison AWL on both sides.',
        },
        {
          title: 'Keep the transaction inside the platform',
          body: 'If proposals and payments happen elsewhere, the platform becomes a directory: the relationship leaves, and the data with it. We built commercial proposals, payment and follow-up into the product. Maison AWL controls the whole chain.',
        },
        {
          title: 'Treat trust as a feature',
          body: 'Reviews, dispute handling, an admin space: these are not extras. They are the mechanisms that let Célia guarantee a level of service without being present at every job.',
        },
      ],
      solutionIntro: 'A complete marketplace, from first contact to payment, designed for three users: the client, the provider and the Maison AWL team.',
      solution: [
        { title: 'Client side', items: ['Onboarding', 'Search and location filters', 'Messaging', 'Receiving proposals', 'Payment', 'Job follow-up', 'Reviews'] },
        { title: 'Provider side', items: ['Onboarding', 'Professional profile', 'Messaging', 'Commercial proposals', 'Job tracking', 'Payouts via Stripe Connect'] },
        { title: 'Maison AWL side', items: ['Admin space', 'Dispute handling'] },
        { title: 'Our scope', items: ['Product framing', 'UX/UI', 'Product identity', 'Development', 'Launch'] },
      ],
      features: [
        {
          title: 'Stripe Connect: payment as a sign of trust',
          body: 'Instead of letting client and provider sort it out between themselves, payment goes through the platform. The client pays within a familiar framework. The provider gets paid without chasing. Maison AWL stays in control of every transaction.',
        },
        {
          title: 'Built-in commercial proposals',
          body: 'Home organizing is not sold from a catalogue: every home is different. The provider talks with the client in the messaging space, then sends a proposal directly in the platform. The client accepts and pays without leaving Maison AWL.',
        },
        {
          title: "Reviews and disputes: protecting Célia's brand",
          body: 'Every job is done under the Maison AWL name. Reviews make quality visible to future clients. Dispute handling provides a framework when there is disagreement, instead of an endless message thread. The brand can grow without Célia supervising every job.',
        },
      ],
      result: [
        'Maison AWL launched its platform to 180,000 followers.',
        "Its community now has a place to find, book, pay and review professionals trained in Célia's method. Maison AWL owns the relationship, the data and the transaction.",
        "It is also the first proof of our Creators thesis: a creator's distribution is the starting point of a product.",
      ],
    },
  },

  'crm-ra-energy': {
    fr: {
      category: 'CRM sur mesure · Outil métier',
      headline: "Remplacer les fichiers Excel par un CRM qui vérifie chaque rendez-vous avant qu'il soit posé.",
      subtitle: 'Après son site, R&A Energy nous a confié son outil interne : un CRM qui réunit prospection, rendez-vous et tournées terrain, construit sur son processus commercial réel.',
      keyFacts: [
        'Application web sur mesure · Nuxt + Supabase',
        '6 modules · 5 rôles utilisateurs',
        'Intégration Google Calendar + calcul du temps de trajet',
        'Deuxième projet avec le client',
      ],
      client: [
        "R&A Energy est courtier en énergie pour les professionnels. Son équipe de 10 à 20 personnes réunit téléprospecteurs, commerciaux terrain et apporteurs d'affaires.",
        "Nous avions déjà conçu son identité et son site. Quand la croissance a rendu les fichiers partagés ingérables, l'équipe est revenue vers nous pour son outil métier.",
      ],
      clientLink: { slug: 'ra-energy', label: "Chapitre 1 : l'identité et le site de R&A Energy" },
      challenge: [
        'La prospection vivait dans des fichiers Excel et des agendas séparés.',
        'Les conséquences étaient concrètes : des doublons, des rendez-vous posés sans tenir compte du trajet du commercial, aucun historique des échanges, des informations sensibles visibles par tout le monde.',
        "Chaque rendez-vous impossible à honorer, c'est un prospect qualifié qui refroidit.",
        "Un CRM générique aurait obligé l'équipe à changer sa façon de travailler. Nous avons fait l'inverse.",
      ],
      objectives: [
        'Centraliser prospects, rendez-vous et documents dans un seul outil.',
        "Supprimer les rendez-vous impossibles à tenir (conflit d'agenda ou trajet irréaliste).",
        "Donner à chaque rôle exactement ce qu'il doit voir, rien de plus.",
        "Faire adopter l'outil par une équipe habituée à Excel.",
      ],
      approach: [
        {
          title: 'Cartographier le processus avant de coder',
          body: "Nous avons suivi le parcours d'un prospect de bout en bout : création par un téléprospecteur, qualification, prise de rendez-vous, visite terrain. Chaque écran du CRM correspond à une étape de ce parcours. Rien n'a été ajouté simplement parce que « les CRM l'ont ».",
        },
        {
          title: 'Mettre la contrainte terrain dans le logiciel',
          body: "Stocker des prospects, n'importe quel outil sait le faire. Ce qui manquait à R&A Energy, c'était des rendez-vous fiables. Nous avons donc placé la vérification au moment exact où le rendez-vous est posé : agenda du commercial et temps de trajet réel.",
        },
        {
          title: "Cloisonner par rôle, jusqu'à la base de données",
          body: "Un téléprospecteur, un commercial et un apporteur d'affaires n'ont pas besoin des mêmes informations. Cinq rôles, avec des permissions appliquées au niveau de la base : chacun ne voit que ses fiches, ses rendez-vous et ses documents. Quand les données sont commerciales, masquer un bouton ne suffit pas.",
        },
        {
          title: "Réduire la saisie pour obtenir l'adoption",
          body: "Un outil jugé lourd finit abandonné au profit d'Excel. Les fiches se complètent automatiquement via les API SIRET et adresse, et l'historique d'activité s'écrit tout seul. Moins de saisie, plus de chances que l'outil soit utilisé chaque jour.",
        },
      ],
      solutionIntro: 'Un CRM web construit sur le processus commercial de R&A Energy, du premier appel à la visite terrain.',
      solution: [
        { title: '6 modules', items: ['Tableau de bord', 'Prospects', 'Planning', 'Carte des RDV', 'Équipe', 'Paramètres'] },
        {
          title: 'Fonctionnalités',
          items: [
            'Pipeline de prospects',
            'Fiches enrichies automatiquement (SIRET, adresse), commentaires, documents',
            "Historique d'activité automatique",
            'Prise de rendez-vous avec vérification Google Calendar et temps de trajet',
            "Planning de l'équipe commerciale",
            'Carte des rendez-vous et des tournées',
            '5 rôles aux permissions distinctes',
            'Interface utilisable sur mobile',
            'Stack : Nuxt + Supabase',
          ],
        },
      ],
      features: [
        {
          title: 'Le rendez-vous vérifié',
          body: 'Quand un téléprospecteur pose un rendez-vous, le CRM vérifie en direct deux choses : le créneau est libre dans le Google Calendar du commercial, et le trajet depuis le rendez-vous précédent est réaliste. Le téléprospecteur voit immédiatement si le créneau est tenable. Le prospect qualifié rencontre un commercial à l\'heure, au lieu d\'un rendez-vous reporté.',
        },
        {
          title: 'La carte des rendez-vous',
          body: "Les rendez-vous de la semaine s'affichent sur une carte. Le responsable voit la répartition géographique d'un coup d'œil et peut regrouper les visites par zone, plutôt que de faire traverser la région à un commercial pour un seul rendez-vous.",
        },
        {
          title: 'Des données cloisonnées par rôle',
          body: "Chaque rôle a son périmètre, appliqué jusque dans la base de données. R&A Energy peut ainsi ouvrir l'outil à des partenaires externes sans exposer son fichier client. L'outil accompagne la croissance de l'équipe sans créer de risque.",
        },
      ],
      resultStats: [
        { value: '6', label: 'modules' },
        { value: '5', label: 'rôles utilisateurs' },
        { value: '3', label: 'intégrations : Google Calendar, API SIRET, API adresse' },
      ],
      result: [
        "R&A Energy a remplacé ses fichiers partagés par un seul outil, construit sur son propre processus. Les rendez-vous sont vérifiés avant d'être posés, les données sont cloisonnées et l'historique s'écrit seul.",
        "Et ce projet est né d'un premier site. Pour nous, le meilleur indicateur de confiance, c'est un client qui revient.",
      ],
      testimonialContext: 'Sur notre premier projet ensemble :',
    },
    en: {
      category: 'Custom CRM · Business tool',
      headline: 'Replacing spreadsheets with a CRM that checks every meeting before it is booked.',
      subtitle: 'After their website, R&A Energy trusted us with their internal tool: a CRM that brings prospecting, meetings and field routes together, built on their real sales process.',
      keyFacts: [
        'Custom web app · Nuxt + Supabase',
        '6 modules · 5 user roles',
        'Google Calendar integration + travel-time check',
        'Second project with the client',
      ],
      client: [
        'R&A Energy is an energy broker for businesses. Its team of 10 to 20 people brings together telemarketers, field sales reps and business introducers.',
        'We had already designed their identity and website. When growth made shared spreadsheets unmanageable, the team came back to us for their business tool.',
      ],
      clientLink: { slug: 'ra-energy', label: 'Chapter 1: the R&A Energy identity and website' },
      challenge: [
        'Prospecting lived in Excel files and separate calendars.',
        'The consequences were concrete: duplicates, meetings booked without accounting for the sales rep’s travel, no history of interactions, sensitive information visible to everyone.',
        'Every meeting that cannot be honoured is a qualified prospect going cold.',
        'An off-the-shelf CRM would have forced the team to change the way it works. We did the opposite.',
      ],
      objectives: [
        'Centralise prospects, meetings and documents in one tool.',
        'Eliminate meetings that cannot be kept (calendar conflict or unrealistic travel).',
        'Give each role exactly what it needs to see, nothing more.',
        'Get a team used to Excel to adopt the tool.',
      ],
      approach: [
        {
          title: 'Map the process before writing code',
          body: 'We followed a prospect’s journey end to end: created by a telemarketer, qualified, booked, visited in the field. Every CRM screen matches a step of that journey. Nothing was added just because "CRMs have it".',
        },
        {
          title: 'Put the field constraint into the software',
          body: 'Any tool can store prospects. What R&A Energy lacked was reliable meetings. So we placed the check at the exact moment a meeting is booked: the sales rep’s calendar and real travel time.',
        },
        {
          title: 'Partition by role, down to the database',
          body: 'A telemarketer, a sales rep and a business introducer do not need the same information. Five roles, with permissions enforced at database level: everyone sees only their own records, meetings and documents. When the data is commercial, hiding a button is not enough.',
        },
        {
          title: 'Reduce data entry to win adoption',
          body: 'A tool that feels heavy ends up abandoned for Excel. Records fill themselves in through company-registry and address APIs, and the activity history writes itself. Less typing, more chance the tool gets used every day.',
        },
      ],
      solutionIntro: 'A web CRM built on R&A Energy’s sales process, from the first call to the field visit.',
      solution: [
        { title: '6 modules', items: ['Dashboard', 'Prospects', 'Planning', 'Meeting map', 'Team', 'Settings'] },
        {
          title: 'Features',
          items: [
            'Prospect pipeline',
            'Auto-enriched records (company registry, address), comments, documents',
            'Automatic activity history',
            'Meeting booking with Google Calendar and travel-time checks',
            'Sales team planning',
            'Map of meetings and field routes',
            '5 roles with distinct permissions',
            'Mobile-friendly interface',
            'Stack: Nuxt + Supabase',
          ],
        },
      ],
      features: [
        {
          title: 'The verified meeting',
          body: 'When a telemarketer books a meeting, the CRM checks two things live: the slot is free in the sales rep’s Google Calendar, and the travel time from the previous meeting is realistic. The telemarketer sees immediately whether the slot works. The qualified prospect meets a sales rep who is on time, instead of a rescheduled meeting.',
        },
        {
          title: 'The meeting map',
          body: 'The week’s meetings appear on a map. The manager sees the geographic spread at a glance and can group visits by area, rather than sending a sales rep across the region for a single meeting.',
        },
        {
          title: 'Data partitioned by role',
          body: 'Each role has its own scope, enforced down to the database. R&A Energy can open the tool to external partners without exposing its client file. The tool supports the team’s growth without creating risk.',
        },
      ],
      resultStats: [
        { value: '6', label: 'modules' },
        { value: '5', label: 'user roles' },
        { value: '3', label: 'integrations: Google Calendar, company registry API, address API' },
      ],
      result: [
        'R&A Energy replaced its shared spreadsheets with a single tool built on its own process. Meetings are checked before they are booked, data is partitioned and the history writes itself.',
        'And this project was born from a first website. To us, the best measure of trust is a client who comes back.',
      ],
      testimonialContext: 'On our first project together:',
    },
  },

  'shika-consulting': {
    fr: {
      category: 'Site web · Expertise comptable',
      headline: "Transformer l'expertise d'un cabinet spécialisé en un site qui répond avant même le premier rendez-vous.",
      subtitle: 'Shika Consulting accompagne les associations partout en France. Nous avons conçu un site de 14 pages qui oriente chaque visiteur selon son profil et lui donne une première estimation grâce à des simulateurs.',
      keyFacts: [
        'Site web · 14 pages sur mesure',
        'Architecture, UX/UI, copywriting, développement',
        'Simulateurs, dont un simulateur de budget',
        "Navigation par profil d'association",
      ],
      client: [
        "Shika Consulting est un cabinet d'expertise comptable et de commissariat aux comptes spécialisé dans le secteur associatif. Il accompagne des associations partout en France sur leurs enjeux comptables, financiers, juridiques et organisationnels.",
        "C'est un positionnement étroit et choisi. Une force, à condition qu'on le comprenne tout de suite.",
      ],
      challenge: [
        "L'expertise était là : comptabilité, audit, conseil, juridique, avec les obligations propres aux associations.",
        'Mais une association qui cherche un cabinet ne compare pas des expertises. Elle se pose deux questions : « Connaissent-ils des structures comme la nôtre ? Combien ça va coûter ? »',
        'Avec 14 pages et de nombreux contenus pédagogiques, le risque était clair : tout montrer, et que personne ne trouve sa réponse.',
      ],
      objectives: [
        'Rendre la spécialisation associative évidente dès le premier écran.',
        "Structurer 14 pages pour que chaque profil d'association trouve son chemin.",
        'Expliquer des obligations techniques sans jargon.',
        "Faire progresser le visiteur vers l'estimation, puis vers le rendez-vous.",
      ],
      approach: [
        {
          title: 'Organiser par visiteur, pas par organigramme',
          body: "Un cabinet pense en services : comptabilité, audit, juridique. Une association pense en situations. Nous avons structuré la navigation autour de deux entrées, les profils d'association et les services. Chacun se reconnaît avant de lire le détail de l'offre.",
        },
        {
          title: 'Traduire sans simplifier',
          body: "Le public n'est pas expert, le sujet l'est. Chaque page part du besoin concret de l'association, puis explique ce que le cabinet prend en charge. L'expertise reste entière : seul l'ordre de lecture change.",
        },
        {
          title: 'Répondre avant le contact',
          body: "Prendre rendez-vous avec un expert-comptable est un engagement. Beaucoup de visiteurs veulent d'abord savoir si c'est accessible pour eux. Les simulateurs leur donnent une première réponse sans quitter le site, et transforment l'hésitation en raison de prendre contact.",
        },
        {
          title: 'Montrer les prix',
          body: "Le site intègre une page Tarifs. Des repères tarifaires lèvent l'une des premières objections et filtrent les demandes en amont : une association qui prend rendez-vous connaît déjà l'ordre de grandeur.",
        },
        {
          title: 'Un univers chaleureux pour un métier réputé austère',
          body: 'Bleu nuit, beige, orange et illustrations pédagogiques : un univers sérieux sans froideur, cohérent avec un cabinet proche du terrain associatif. Les chiffres clés et les témoignages ancrent la crédibilité.',
        },
      ],
      solutionIntro: 'Un site de 14 pages conçu comme un parcours : comprendre la spécialisation, se reconnaître, estimer, prendre rendez-vous.',
      solution: [
        {
          items: [
            "Architecture de contenu : navigation par profil d'association et par service",
            'Copywriting',
            'Direction artistique et UX/UI (illustrations, chiffres clés)',
            'Simulateurs, dont un simulateur de budget',
            'Page Tarifs',
            'Parcours de prise de rendez-vous',
            'Témoignages et preuves',
            'Développement responsive',
            'SEO technique et performance',
          ],
        },
      ],
      features: [
        {
          title: 'Le simulateur de budget',
          body: "Plutôt que de demander tout de suite un rendez-vous, le site propose un simulateur de budget. L'association obtient une première estimation en autonomie et arrive au rendez-vous avec une idée claire du cadre. Pour le cabinet, c'est un premier filtre avant même l'appel.",
        },
        {
          title: "L'entrée par profil d'association",
          body: "Le menu « Associations » permet à chaque visiteur de trouver la page qui correspond à sa structure. Il se reconnaît dans les situations et les obligations décrites avant même de lire l'offre. C'est la preuve de spécialisation la plus directe : ce cabinet connaît des associations comme la sienne.",
        },
        {
          title: 'Un parcours qui mène toujours au rendez-vous',
          body: "Le bouton « Prendre rendez-vous » reste accessible dans la navigation, et les simulateurs, les tarifs et les témoignages y ramènent. Chaque page a une sortie claire. Le visiteur convaincu n'a jamais à chercher comment passer à l'étape suivante.",
        },
      ],
      resultStats: [
        { value: '14', label: 'pages sur mesure' },
        { value: '2', label: 'entrées de navigation : profil et service' },
      ],
      result: [
        'Le site de Shika Consulting fait désormais une partie du travail commercial. Il affirme la spécialisation, répond aux premières questions de prix et oriente vers le rendez-vous.',
      ],
    },
    en: {
      category: 'Website · Accounting firm',
      headline: 'Turning a specialist firm’s expertise into a website that answers before the first meeting.',
      subtitle: 'Shika Consulting supports nonprofits across France. We designed a 14-page website that guides each visitor according to their profile and gives them a first estimate through simulators.',
      keyFacts: [
        'Website · 14 custom pages',
        'Architecture, UX/UI, copywriting, development',
        'Simulators, including a budget simulator',
        'Navigation by nonprofit profile',
      ],
      client: [
        'Shika Consulting is an accounting and statutory audit firm specialised in the nonprofit sector. It supports associations across France with their accounting, financial, legal and organisational challenges.',
        'A narrow, deliberate positioning. A strength, as long as people understand it straight away.',
      ],
      challenge: [
        'The expertise was there: accounting, audit, advisory, legal, with the obligations specific to nonprofits.',
        'But a nonprofit looking for a firm does not compare areas of expertise. It asks two questions: "Do they know organisations like ours? How much will it cost?"',
        'With 14 pages and a lot of educational content, the risk was clear: show everything, and nobody finds their answer.',
      ],
      objectives: [
        'Make the nonprofit specialisation obvious from the first screen.',
        'Structure 14 pages so every type of nonprofit finds its way.',
        'Explain technical obligations without jargon.',
        'Move visitors towards an estimate, then towards a meeting.',
      ],
      approach: [
        {
          title: 'Organise by visitor, not by org chart',
          body: 'A firm thinks in services: accounting, audit, legal. A nonprofit thinks in situations. We built the navigation around two entry points, nonprofit profiles and services. Visitors recognise themselves before reading the details of the offer.',
        },
        {
          title: 'Translate without simplifying',
          body: 'The audience is not expert; the subject is. Each page starts from the nonprofit’s concrete need, then explains what the firm takes care of. The expertise stays whole: only the reading order changes.',
        },
        {
          title: 'Answer before the first contact',
          body: 'Booking a meeting with an accountant is a commitment. Many visitors first want to know whether it is within reach. The simulators give them a first answer without leaving the site, turning hesitation into a reason to get in touch.',
        },
        {
          title: 'Show the prices',
          body: 'The website includes a Pricing page. Price guidance removes one of the first objections and filters requests upstream: a nonprofit that books a meeting already knows the order of magnitude.',
        },
        {
          title: 'A warm world for a profession seen as austere',
          body: 'Navy, beige, orange and educational illustrations: serious without being cold, consistent with a firm close to the nonprofit world. Key figures and testimonials anchor credibility.',
        },
      ],
      solutionIntro: 'A 14-page website designed as a journey: understand the specialisation, recognise yourself, get an estimate, book a meeting.',
      solution: [
        {
          items: [
            'Content architecture: navigation by nonprofit profile and by service',
            'Copywriting',
            'Art direction and UX/UI (illustrations, key figures)',
            'Simulators, including a budget simulator',
            'Pricing page',
            'Meeting booking journey',
            'Testimonials and proof points',
            'Responsive development',
            'Technical SEO and performance',
          ],
        },
      ],
      features: [
        {
          title: 'The budget simulator',
          body: 'Instead of asking for a meeting straight away, the site offers a budget simulator. The nonprofit gets a first estimate on its own and arrives at the meeting with a clear idea of the framework. For the firm, it is a first filter before the call even happens.',
        },
        {
          title: 'Entry by nonprofit profile',
          body: 'The "Nonprofits" menu lets each visitor find the page that matches their organisation. They recognise their situation and obligations before reading the offer. It is the most direct proof of specialisation: this firm knows organisations like mine.',
        },
        {
          title: 'A journey that always leads to a meeting',
          body: 'The "Book a meeting" button stays available in the navigation, and the simulators, pricing and testimonials all lead back to it. Every page has a clear way forward. A convinced visitor never has to look for the next step.',
        },
      ],
      resultStats: [
        { value: '14', label: 'custom pages' },
        { value: '2', label: 'navigation entry points: profile and service' },
      ],
      result: [
        'Shika Consulting’s website now does part of the sales work. It asserts the specialisation, answers the first pricing questions and guides visitors towards a meeting.',
      ],
    },
  },

  personal: {
    fr: {
      category: 'SaaS IA · Branding · Product design · Développement',
      headline: 'Aider les créateurs à publier mieux, sans devenir des machines à contenu.',
      subtitle: "Un SaaS IA qui part de ce qui fonctionne dans la niche du créateur et de ce qu'il a vécu, pour préparer des brouillons qui lui ressemblent. Nous avons construit la marque, le site et le produit.",
      keyFacts: [
        'SaaS IA bilingue FR / EN',
        'Marque + landing + application',
        '3 formats : légende, carrousel, script de Reel',
        'Aucune publication automatique : le créateur garde la main',
      ],
      client: [
        'Personal s’adresse aux créateurs qui veulent publier régulièrement sans perdre ce qui les rend reconnaissables : leur voix, leurs histoires, leurs opinions.',
        "Le produit part d'une conviction : l'IA doit servir la singularité d'un créateur, pas la lisser.",
      ],
      challenge: [
        'Les outils IA savent produire du texte. Surtout le même texte pour tout le monde.',
        "Pour un créateur, c'est un risque direct : un contenu générique ne crée ni attachement ni différence, et l'audience le sent.",
        "Personal devait tenir deux promesses qui semblent opposées : faire gagner du temps grâce aux données et à l'IA, sans jamais produire un contenu que n'importe qui aurait pu publier.",
      ],
      objectives: [
        'Proposer régulièrement des idées fondées sur ce qui fonctionne dans la niche du créateur.',
        'Transformer son vécu en contenus qui lui ressemblent.',
        "Réduire le temps entre l'inspiration et le brouillon.",
        'Rendre une mécanique complexe évidente dès les premières minutes.',
      ],
      approach: [
        {
          title: 'Partir du créateur, pas du prompt',
          body: 'Un outil générique commence par une page blanche et un champ de texte. Personal commence par le créateur : son positionnement, ses sujets, sa voix, ses références. Ce profil, le Creator DNA, sert de filtre à tout ce que le produit propose ensuite.',
        },
        {
          title: "Remplacer l'intuition par des signaux",
          body: "Les idées trouvées au hasard coûtent du temps et performent mal. Le produit fait remonter les contenus et les angles qui fonctionnent déjà dans l'univers du créateur. Chaque idée part d'une preuve, pas d'une supposition.",
        },
        {
          title: 'Relier chaque idée à un vécu',
          body: "Un format qui marche chez un autre ne suffit pas. Le Remix croise ce format avec les moments, les histoires et les opinions du créateur. C'est ce qui empêche le contenu d'être une copie.",
        },
        {
          title: 'Accélérer sans retirer le contrôle',
          body: "Personal va jusqu'au brouillon (angle, script, carrousel, légende), mais jamais jusqu'à la publication. Le créateur relit, modifie, décide. C'est un choix produit assumé : la confiance dans l'outil en dépend.",
        },
        {
          title: 'Une marque qui tient la promesse du produit',
          body: "Sur un marché d'outils IA qui se ressemblent, Personal devait se reconnaître au premier regard. Nous avons créé une identité éditoriale et contrastée : symbole signature, typographie expressive, palette ivoire, noir et corail. Elle est déclinée du site jusqu'à l'interface : le site promet une voix, le produit la tient.",
        },
      ],
      solutionIntro: 'Un produit qui réunit veille, inspiration et création dans un seul espace, et une marque construite pour le porter.',
      solution: [
        { title: 'Marque', items: ['Positionnement', 'Identité visuelle (symbole, typographie, palette)', 'Direction artistique'] },
        { title: 'Acquisition', items: ['Landing page animée', 'Copywriting'] },
        { title: 'Produit', items: ['Onboarding et Creator DNA', 'Feed de contenus performants dans la niche', 'Favoris', 'Moments personnels', 'Remix', "Expérience conversationnelle avec l'IA", 'Génération de brouillons (légende, carrousel, script de Reel)'] },
        { title: 'Technique', items: ['Application bilingue FR / EN', 'Authentification', 'Interface responsive'] },
      ],
      features: [
        {
          title: 'Le feed : partir de ce qui marche',
          body: "Plutôt que de demander au créateur « de quoi veux-tu parler ? », Personal lui montre ce qui performe déjà dans sa niche. Il enregistre ce qui l'inspire. La page blanche disparaît, et chaque idée part d'un signal réel.",
        },
        {
          title: 'Le Remix : un format éprouvé, une histoire personnelle',
          body: "Le créateur choisit un contenu qui fonctionne et le croise avec l'un de ses propres moments. Le produit s'appuie sur ce qui fait marcher le format et le reconstruit à partir de son vécu. Le résultat a une chance de performer, et personne d'autre n'aurait pu le publier.",
        },
        {
          title: 'Du brouillon, jamais de publication',
          body: "Personal prépare une légende, un carrousel ou un script, mais ne publie jamais. Ce n'est pas une limite, c'est la promesse : un créateur ne confie pas sa voix à un outil qui agit sans lui.",
        },
      ],
      resultStats: [
        { value: '2', label: 'langues' },
        { value: '3', label: 'formats de contenu' },
      ],
      result: [
        "Personal est passé d'une conviction à un produit en ligne : une marque, un site et une application bilingue, construits autour d'un seul principe.",
      ],
      resultEmphasis: "L'IA amplifie la singularité du créateur. Elle ne la remplace pas.",
    },
    en: {
      category: 'AI SaaS · Branding · Product design · Development',
      headline: 'Helping creators publish better, without becoming content machines.',
      subtitle: 'An AI SaaS that starts from what works in the creator’s niche and from what they have lived, to prepare drafts that sound like them. We built the brand, the website and the product.',
      keyFacts: [
        'Bilingual AI SaaS, FR / EN',
        'Brand + landing page + app',
        '3 formats: caption, carousel, Reel script',
        'No automatic posting: the creator stays in control',
      ],
      client: [
        'Personal is made for creators who want to publish consistently without losing what makes them recognisable: their voice, their stories, their opinions.',
        'The product starts from one belief: AI should serve a creator’s individuality, not flatten it.',
      ],
      challenge: [
        'AI tools know how to produce text. Mostly the same text for everyone.',
        'For a creator, that is a direct risk: generic content creates neither attachment nor difference, and the audience can tell.',
        'Personal had to keep two promises that seem to contradict each other: save time with data and AI, without ever producing content anyone else could have posted.',
      ],
      objectives: [
        'Regularly suggest ideas based on what works in the creator’s niche.',
        'Turn their lived experience into content that sounds like them.',
        'Shorten the time between inspiration and draft.',
        'Make a complex workflow obvious within the first minutes.',
      ],
      approach: [
        {
          title: 'Start from the creator, not the prompt',
          body: 'A generic tool starts with a blank page and a text field. Personal starts with the creator: their positioning, topics, voice and references. That profile, the Creator DNA, filters everything the product suggests afterwards.',
        },
        {
          title: 'Replace guesswork with signals',
          body: 'Random ideas cost time and perform poorly. The product surfaces the content and angles that already work in the creator’s world. Every idea starts from evidence, not an assumption.',
        },
        {
          title: 'Tie every idea to lived experience',
          body: 'A format that works for someone else is not enough. Remix combines that format with the creator’s own moments, stories and opinions. That is what keeps the content from being a copy.',
        },
        {
          title: 'Speed things up without taking control away',
          body: 'Personal goes as far as the draft (angle, script, carousel, caption), never as far as publishing. The creator reviews, edits, decides. It is a deliberate product choice: trust in the tool depends on it.',
        },
        {
          title: 'A brand that keeps the product’s promise',
          body: 'In a market of AI tools that all look alike, Personal had to be recognisable at first glance. We created an editorial, high-contrast identity: signature symbol, expressive typography, an ivory, black and coral palette. It carries from the website to the interface: the site promises a voice, the product delivers it.',
        },
      ],
      solutionIntro: 'A product that brings research, inspiration and creation into one space, and a brand built to carry it.',
      solution: [
        { title: 'Brand', items: ['Positioning', 'Visual identity (symbol, typography, palette)', 'Art direction'] },
        { title: 'Acquisition', items: ['Animated landing page', 'Copywriting'] },
        { title: 'Product', items: ['Onboarding and Creator DNA', 'Feed of high-performing content in the niche', 'Saved posts', 'Personal moments', 'Remix', 'Conversational AI experience', 'Draft generation (caption, carousel, Reel script)'] },
        { title: 'Tech', items: ['Bilingual FR / EN app', 'Authentication', 'Responsive interface'] },
      ],
      features: [
        {
          title: 'The feed: start from what works',
          body: 'Instead of asking the creator "what do you want to talk about?", Personal shows them what already performs in their niche. They save what inspires them. The blank page disappears, and every idea starts from a real signal.',
        },
        {
          title: 'Remix: a proven format, a personal story',
          body: 'The creator picks content that works and combines it with one of their own moments. The product builds on what makes the format work and rebuilds it from their experience. The result has a chance to perform, and nobody else could have posted it.',
        },
        {
          title: 'Drafts, never publishing',
          body: 'Personal prepares a caption, a carousel or a script, but never publishes. It is not a limitation, it is the promise: a creator does not hand their voice to a tool that acts without them.',
        },
      ],
      resultStats: [
        { value: '2', label: 'languages' },
        { value: '3', label: 'content formats' },
      ],
      result: [
        'Personal went from a belief to a live product: a brand, a website and a bilingual app, built around a single principle.',
      ],
      resultEmphasis: 'AI amplifies the creator’s individuality. It does not replace it.',
    },
  },

  'amg-promotion': {
    fr: {
      category: 'Site web · B2B · Objets promotionnels',
      headline: "Mettre le site d'AMG Promotion au niveau de ses clients : Groupe SEB, ALTRAD, Police Nationale.",
      subtitle: 'AMG Promotion conçoit textiles, goodies et objets personnalisés pour des organisations de premier plan. Nous avons repensé son site pour que la qualité perçue corresponde à celle des projets livrés.',
      keyFacts: [
        'Refonte du site',
        'Direction artistique, UX/UI, copywriting, développement',
        'Client B2B · équipe de 20 à 50 personnes',
      ],
      client: [
        'AMG Promotion accompagne entreprises et institutions dans la création de textiles, goodies et objets promotionnels personnalisés. Parmi ses clients : Groupe SEB, ALTRAD, la Police Nationale.',
        'Une équipe de 20 à 50 personnes, avec un savoir-faire reconnu par des grands comptes.',
      ],
      challenge: [
        "Quand un acheteur de grand compte découvre un fournisseur, il le juge d'abord sur son site.",
        "AMG avait les références et la qualité d'exécution. Son site précédent ne le montrait pas encore au même niveau : l'offre était difficile à parcourir pour un nouveau visiteur, et les contenus clés manquaient de hiérarchie.",
        "Dans l'objet promotionnel, le risque est double : trop de produits, trop de possibilités. Un site qui montre tout finit par ne rien vendre.",
      ],
      objectives: [
        "Crédibiliser AMG dès le premier écran auprès d'acheteurs B2B.",
        "Rendre l'offre lisible : ce qu'AMG produit, et pour quels besoins.",
        'Placer les références et les réalisations au centre.',
        'Faciliter la demande de devis.',
      ],
      approach: [
        {
          title: "Aligner l'image sur les clients",
          body: "Un acheteur qui travaille pour un groupe industriel compare AMG à ses propres standards. Nous avons construit une direction artistique plus sobre : plus d'espace, une hiérarchie nette. AMG est perçu au niveau des marques qu'il équipe.",
        },
        {
          title: 'Organiser par besoin, pas par catalogue',
          body: "AMG peut produire une gamme très large. Le site présente d'abord les grandes catégories et les besoins auxquels elles répondent. Le détail vient ensuite, dans l'échange commercial. Un visiteur doit savoir en quelques secondes si AMG peut répondre à sa demande, pas parcourir un catalogue.",
        },
        {
          title: 'Faire parler les références',
          body: "Dans ce secteur, le premier frein est la confiance : délais, qualité, rendu final. Les références clients et les réalisations répondent à la question que l'acheteur ne pose pas : « Savent-ils gérer une commande comme la mienne ? »",
        },
      ],
      solutionIntro: "Un site qui présente AMG comme le partenaire de grands comptes et amène l'acheteur jusqu'à la demande de devis.",
      solution: [
        {
          items: [
            'Direction artistique',
            'Architecture et hiérarchie de contenu',
            'Copywriting',
            'Présentation des catégories de produits',
            'Mise en avant des références et des réalisations',
            "Appels à l'action vers la demande de devis",
            'Développement responsive',
          ],
        },
      ],
      features: [
        {
          title: 'Les références comme argument principal',
          body: "Groupe SEB, ALTRAD, Police Nationale : ces noms font plus pour la crédibilité d'AMG qu'un paragraphe de présentation. Le site en fait sa preuve principale. L'acheteur est rassuré avant même d'avoir lu l'offre.",
        },
        {
          title: "Des catégories plutôt qu'un catalogue",
          body: "Plutôt que d'exposer toute la gamme, le site organise l'offre en grandes catégories. Le visiteur identifie vite ce qui le concerne et arrive à la demande de devis avec un besoin déjà formulé. L'échange commercial démarre plus vite.",
        },
      ],
      result: [
        "Le site d'AMG Promotion montre aujourd'hui en ligne le niveau qu'elle démontre déjà chez ses clients. Il ne se contente plus de décrire ce qu'elle fabrique : il montre pour qui, et comment lancer une commande.",
      ],
      testimonialHighlight: 'Efficacité et très bonne compréhension de nos attentes.',
    },
    en: {
      category: 'Website · B2B · Promotional products',
      headline: 'Bringing AMG Promotion’s website up to the level of its clients: Groupe SEB, ALTRAD, the French National Police.',
      subtitle: 'AMG Promotion creates custom textiles, goodies and branded items for leading organisations. We redesigned its website so that perceived quality matches the quality of the projects it delivers.',
      keyFacts: [
        'Website redesign',
        'Art direction, UX/UI, copywriting, development',
        'B2B client · team of 20 to 50 people',
      ],
      client: [
        'AMG Promotion helps companies and institutions create custom textiles, goodies and promotional products. Its clients include Groupe SEB, ALTRAD and the French National Police.',
        'A team of 20 to 50 people, with know-how trusted by major accounts.',
      ],
      challenge: [
        'When a buyer at a large company discovers a supplier, they judge it first by its website.',
        'AMG had the references and the quality of execution. Its previous website did not yet show them at the same level: the offer was hard to navigate for a new visitor, and key content lacked hierarchy.',
        'In promotional products, the risk is twofold: too many products, too many options. A website that shows everything ends up selling nothing.',
      ],
      objectives: [
        'Make AMG credible to B2B buyers from the first screen.',
        'Make the offer readable: what AMG produces, and for which needs.',
        'Put references and completed work at the centre.',
        'Make requesting a quote easy.',
      ],
      approach: [
        {
          title: 'Align the image with the clients',
          body: 'A buyer working for an industrial group measures AMG against their own standards. We built a more restrained art direction: more space, a clear hierarchy. AMG is perceived at the level of the brands it supplies.',
        },
        {
          title: 'Organise by need, not by catalogue',
          body: 'AMG can produce a very wide range. The website first presents the main categories and the needs they meet. The details come later, in the sales conversation. A visitor should know within seconds whether AMG can handle their request, not browse a catalogue.',
        },
        {
          title: 'Let the references speak',
          body: 'In this sector, the first obstacle is trust: lead times, quality, final result. Client references and completed work answer the question buyers do not ask out loud: "Can they handle an order like mine?"',
        },
      ],
      solutionIntro: 'A website that presents AMG as a partner to major accounts and takes the buyer all the way to a quote request.',
      solution: [
        {
          items: [
            'Art direction',
            'Content architecture and hierarchy',
            'Copywriting',
            'Product category presentation',
            'Showcase of references and completed work',
            'Calls to action towards quote requests',
            'Responsive development',
          ],
        },
      ],
      features: [
        {
          title: 'References as the main argument',
          body: 'Groupe SEB, ALTRAD, the French National Police: these names do more for AMG’s credibility than a paragraph of introduction. The website makes them its main proof. The buyer is reassured before even reading the offer.',
        },
        {
          title: 'Categories rather than a catalogue',
          body: 'Rather than exposing the whole range, the website organises the offer into main categories. Visitors quickly spot what concerns them and reach the quote request with a need already defined. The sales conversation starts faster.',
        },
      ],
      result: [
        'AMG Promotion’s website now shows online the level it already demonstrates with its clients. It no longer just describes what it makes: it shows who for, and how to start an order.',
      ],
      testimonialHighlight: 'Efficiency and a very good understanding of our expectations.',
    },
  },

  'ra-energy': {
    fr: {
      category: 'Branding · Landing page · Copywriting · Chapitre 1',
      headline: "Rendre simple une expertise qui ne l'est pas.",
      subtitle: "R&A Energy optimise les contrats d'énergie des professionnels. Nous avons créé son identité et une landing page qui explique le métier en quelques écrans et amène le prospect jusqu'au rendez-vous.",
      keyFacts: [
        'Logo + identité visuelle',
        'Landing page · Copywriting',
        'Client B2B · équipe de 10 à 20 personnes',
        'Premier projet avant le CRM sur mesure',
      ],
      client: [
        "R&A Energy est courtier en énergie pour les professionnels. Son métier : aider les entreprises à optimiser leurs contrats d'énergie.",
        'Une équipe de 10 à 20 personnes, sur un marché où le prospect a rarement le temps de comprendre les détails.',
      ],
      challenge: [
        "Prix, fournisseurs, contrats, conditions : pour la plupart des dirigeants, le marché de l'énergie est opaque.",
        "Pour un courtier, c'est un paradoxe : plus l'expertise est technique, plus elle est difficile à vendre en ligne. Et un prospect qui ne comprend pas l'offre ne prend pas rendez-vous.",
        'Le site devait réduire la complexité sans réduire la crédibilité.',
      ],
      objectivesIntro: 'Le prospect devait comprendre rapidement :',
      objectives: [
        'ce que fait R&A Energy ;',
        'pourquoi faire appel à eux ;',
        "comment se déroule l'accompagnement ;",
        "quelle est l'étape suivante.",
      ],
      approach: [
        {
          title: 'Le problème avant le marché',
          body: "La page parle d'abord de la situation du prospect et du bénéfice de l'accompagnement. Le détail du marché vient ensuite, pour ceux qui le cherchent. Un dirigeant ne veut pas un cours sur l'énergie : il veut savoir si l'appel vaut son temps.",
        },
        {
          title: 'Une identité qui inspire le sérieux',
          body: "Sur un marché de l'énergie où le démarchage est souvent perçu comme agressif, un courtier doit se distinguer au premier regard. Le logo et la direction artistique positionnent R&A Energy comme un conseil, pas comme un vendeur.",
        },
        {
          title: 'Montrer le déroulé',
          body: "Une section dédiée explique les étapes de l'accompagnement. Rendre visible ce qui se passe après le premier appel réduit la peur de s'engager.",
        },
        {
          title: 'Un parcours commercial, sans pression',
          body: "Chaque section mène à la prise de contact, sans formules agressives. Le prospect avance à son rythme, et l'étape suivante reste toujours évidente.",
        },
      ],
      solutionIntro: 'Une identité et une landing page qui transforment une offre technique en décision simple : prendre rendez-vous.',
      solution: [
        {
          items: [
            'Logo et identité visuelle',
            'Direction artistique',
            'Positionnement et copywriting',
            'Landing page',
            "Section « comment ça marche » : les étapes de l'accompagnement",
            'Éléments de réassurance',
            'Parcours vers la prise de rendez-vous',
          ],
        },
      ],
      features: [
        {
          title: 'La section « comment ça marche »',
          body: "Plutôt que d'expliquer le marché de l'énergie, la page montre ce que R&A Energy fait pour le prospect, étape par étape. Le prospect sait à quoi il s'engage avant d'appeler. Le premier échange commence sur une base claire.",
        },
        {
          title: 'Une identité conçue pour la confiance',
          body: "Le logo et le système visuel donnent à R&A Energy l'image d'un cabinet de conseil. Dans un secteur où le prospect se méfie par défaut, c'est la première objection levée, avant même la lecture.",
        },
      ],
      result: [
        "R&A Energy explique aujourd'hui son métier en quelques écrans, avec une image à la hauteur de son conseil.",
        "Le signe le plus fort est venu ensuite : l'équipe nous a confié la conception de son CRM sur mesure.",
      ],
      resultLink: { slug: 'crm-ra-energy', label: 'Chapitre 2 : le CRM R&A Energy' },
      testimonialHighlight: 'Travail rapide, professionnel et très soigné.',
    },
    en: {
      category: 'Branding · Landing page · Copywriting · Chapter 1',
      headline: 'Making simple an expertise that isn’t.',
      subtitle: 'R&A Energy optimises energy contracts for businesses. We created its identity and a landing page that explains the job in a few screens and takes the prospect all the way to a meeting.',
      keyFacts: [
        'Logo + visual identity',
        'Landing page · Copywriting',
        'B2B client · team of 10 to 20 people',
        'First project before the custom CRM',
      ],
      client: [
        'R&A Energy is an energy broker for businesses. Its job: helping companies optimise their energy contracts.',
        'A team of 10 to 20 people, in a market where prospects rarely have time to understand the details.',
      ],
      challenge: [
        'Prices, suppliers, contracts, terms: for most business owners, the energy market is opaque.',
        'For a broker, that is a paradox: the more technical the expertise, the harder it is to sell online. And a prospect who does not understand the offer does not book a meeting.',
        'The website had to reduce complexity without reducing credibility.',
      ],
      objectivesIntro: 'Prospects needed to understand quickly:',
      objectives: [
        'what R&A Energy does;',
        'why they should work with them;',
        'how the support works;',
        'what the next step is.',
      ],
      approach: [
        {
          title: 'The problem before the market',
          body: 'The page first talks about the prospect’s situation and the benefit of the service. Market details come later, for those who want them. A business owner does not want a lesson on energy: they want to know whether the call is worth their time.',
        },
        {
          title: 'An identity that signals seriousness',
          body: 'In an energy market where cold calling is often seen as aggressive, a broker has to stand out at first glance. The logo and art direction position R&A Energy as an advisor, not a salesperson.',
        },
        {
          title: 'Show the process',
          body: 'A dedicated section explains the steps of the service. Making visible what happens after the first call reduces the fear of committing.',
        },
        {
          title: 'A sales journey without pressure',
          body: 'Every section leads to getting in touch, without pushy wording. Prospects move at their own pace, and the next step always stays obvious.',
        },
      ],
      solutionIntro: 'An identity and a landing page that turn a technical offer into a simple decision: booking a meeting.',
      solution: [
        {
          items: [
            'Logo and visual identity',
            'Art direction',
            'Positioning and copywriting',
            'Landing page',
            '"How it works" section: the steps of the service',
            'Reassurance elements',
            'Journey towards booking a meeting',
          ],
        },
      ],
      features: [
        {
          title: 'The "how it works" section',
          body: 'Rather than explaining the energy market, the page shows what R&A Energy does for the prospect, step by step. Prospects know what they are committing to before calling. The first conversation starts on a clear basis.',
        },
        {
          title: 'An identity designed for trust',
          body: 'The logo and visual system give R&A Energy the image of an advisory firm. In a sector where prospects are wary by default, it is the first objection removed, before they even start reading.',
        },
      ],
      result: [
        'R&A Energy now explains its job in a few screens, with an image that matches the quality of its advice.',
        'The strongest signal came next: the team trusted us with the design of its custom CRM.',
      ],
      resultLink: { slug: 'crm-ra-energy', label: 'Chapter 2: the R&A Energy CRM' },
      testimonialHighlight: 'Fast, professional and very careful work.',
    },
  },

  sotraya: {
    fr: {
      category: 'Landing page · B2B · Automatisation',
      headline: "Rendre tangible une offre d'automatisation qui, par nature, ne se voit pas.",
      subtitle: 'Sotraya connecte les outils et automatise les opérations des entreprises. Nous avons conçu une landing page qui montre ce qui change au quotidien avant de parler de technologie, et qui mène à un audit gratuit de 30 minutes.',
      keyFacts: [
        'Landing page B2B',
        'UX/UI · Copywriting',
        "Démonstrations avant/après et scénario d'onboarding",
        'Conversion : audit gratuit de 30 min',
      ],
      client: [
        "Fondée par Daris Rabouhi, Sotraya connecte les outils d'une entreprise, fait circuler les données entre eux et automatise les tâches répétitives.",
        "Automatisation, intégrations, IA, outils métier sur mesure : une offre large, destinée à des dirigeants qui n'ont pas toujours les mots pour décrire leur besoin.",
      ],
      challenge: [
        "L'automatisation a un problème commercial : sa valeur peut être énorme, mais elle est invisible.",
        'Un dirigeant ne cherche pas « un workflow entre son CRM et sa facturation ». Il veut arrêter de ressaisir les mêmes informations à plusieurs endroits.',
        "Parler d'API et d'intégrations, c'est perdre ce lecteur. Il fallait lui montrer sa propre journée, en mieux.",
      ],
      objectives: [
        "Expliquer l'automatisation par ses usages concrets.",
        'Présenter plusieurs expertises comme une seule offre cohérente.',
        'Mettre en valeur la méthode.',
        "Faire de l'audit gratuit le premier pas naturel.",
      ],
      approach: [
        {
          title: 'Partir des tâches, pas des outils',
          body: "La page s'organise autour de situations que chaque entreprise reconnaît : onboarding client, CRM, documents, facturation, suivi. Le lecteur se reconnaît avant d'entendre parler de technologie.",
        },
        {
          title: "Montrer au lieu d'expliquer",
          body: "Une comparaison avant/après et un scénario d'onboarding automatisé montrent l'information qui circule entre les outils. L'invisible devient visible : le prospect voit ce qu'il achète.",
        },
        {
          title: 'Réduire le premier engagement',
          body: 'Un projet d\'automatisation inquiète : coût, durée, perturbation des équipes. Plutôt qu\'un simple « contactez-nous », la page propose un audit gratuit de 30 minutes pour identifier les premières opportunités. Le premier pas est concret, limité dans le temps, sans risque.',
        },
      ],
      solutionIntro: "Une landing page qui vend la conséquence de l'automatisation, pas sa mécanique.",
      solution: [
        {
          items: [
            'Positionnement et proposition de valeur',
            'Architecture de la landing',
            "Présentation de l'offre : automatisation, intégrations, IA, outils métier",
            'Comparaison avant/après',
            "Scénario d'onboarding automatisé",
            'Présentation de la méthode',
            'Réassurance',
            "Appels à l'action vers l'audit de 30 minutes, répartis sur la page",
          ],
        },
      ],
      features: [
        {
          title: "Le scénario d'onboarding",
          body: "Plutôt que de lister des intégrations, la page déroule un cas : un nouveau client arrive, et l'information circule d'un outil à l'autre sans ressaisie. Le prospect projette le scénario sur sa propre entreprise et arrive à l'audit avec des exemples en tête.",
        },
        {
          title: "L'avant/après",
          body: 'Deux versions de la même situation, côte à côte : avec des outils déconnectés, puis avec des systèmes qui travaillent ensemble. Le gain de temps devient visible sans chiffre abstrait.',
        },
        {
          title: "L'audit de 30 minutes comme CTA",
          body: "Une vente d'automatisation est complexe. Un rendez-vous de 30 minutes, gratuit et centré sur les opportunités du prospect, ne l'est pas. Le CTA transforme une décision lourde en premier pas facile.",
        },
      ],
      result: [
        "Un visiteur de Sotraya ne découvre plus une liste d'outils. Il voit sa propre organisation avec moins de ressaisie, et un moyen simple d'aller plus loin : 30 minutes d'audit.",
      ],
    },
    en: {
      category: 'Landing page · B2B · Automation',
      headline: 'Making tangible an automation offer that, by nature, cannot be seen.',
      subtitle: 'Sotraya connects tools and automates business operations. We designed a landing page that shows what changes day to day before talking about technology, and leads to a free 30-minute audit.',
      keyFacts: [
        'B2B landing page',
        'UX/UI · Copywriting',
        'Before/after demos and onboarding scenario',
        'Conversion: free 30-min audit',
      ],
      client: [
        'Founded by Daris Rabouhi, Sotraya connects a company’s tools, moves data between them and automates repetitive tasks.',
        'Automation, integrations, AI, custom business tools: a broad offer, for business owners who do not always have the words to describe their need.',
      ],
      challenge: [
        'Automation has a sales problem: its value can be huge, but it is invisible.',
        'A business owner is not looking for "a workflow between my CRM and my invoicing". They want to stop re-entering the same information in several places.',
        'Talking about APIs and integrations loses that reader. We had to show them their own day, only better.',
      ],
      objectives: [
        'Explain automation through concrete use cases.',
        'Present several areas of expertise as one coherent offer.',
        'Showcase the method.',
        'Make the free audit the natural first step.',
      ],
      approach: [
        {
          title: 'Start from tasks, not tools',
          body: 'The page is organised around situations every company recognises: client onboarding, CRM, documents, invoicing, follow-up. Readers recognise themselves before hearing about technology.',
        },
        {
          title: 'Show instead of explaining',
          body: 'A before/after comparison and an automated onboarding scenario show information flowing between tools. The invisible becomes visible: prospects see what they are buying.',
        },
        {
          title: 'Lower the first commitment',
          body: 'An automation project raises concerns: cost, time, disruption for teams. Rather than a plain "contact us", the page offers a free 30-minute audit to identify the first opportunities. The first step is concrete, time-boxed and risk-free.',
        },
      ],
      solutionIntro: 'A landing page that sells the outcome of automation, not its mechanics.',
      solution: [
        {
          items: [
            'Positioning and value proposition',
            'Landing page architecture',
            'Offer presentation: automation, integrations, AI, business tools',
            'Before/after comparison',
            'Automated onboarding scenario',
            'Method overview',
            'Reassurance',
            'Calls to action towards the 30-minute audit throughout the page',
          ],
        },
      ],
      features: [
        {
          title: 'The onboarding scenario',
          body: 'Rather than listing integrations, the page walks through a case: a new client arrives, and information flows from one tool to the next with no re-entry. Prospects project the scenario onto their own company and arrive at the audit with examples in mind.',
        },
        {
          title: 'The before/after',
          body: 'Two versions of the same situation, side by side: with disconnected tools, then with systems that work together. The time saved becomes visible without abstract figures.',
        },
        {
          title: 'The 30-minute audit as the CTA',
          body: 'Selling automation is complex. A free 30-minute meeting focused on the prospect’s opportunities is not. The CTA turns a heavy decision into an easy first step.',
        },
      ],
      result: [
        'A Sotraya visitor no longer discovers a list of tools. They see their own organisation with less re-entry, and a simple way to go further: a 30-minute audit.',
      ],
    },
  },

  arises: {
    fr: {
      category: 'SaaS IA · Branding · Landing page · Product design',
      headline: "Transformer un concept IA en un SaaS dont on comprend la valeur avant même de s'inscrire.",
      subtitle: "Arises transforme un calendrier chaotique en planning équilibré entre travail et vie personnelle. Nous avons conçu la marque, la landing et l'expérience produit avec un seul objectif : réduire le temps entre l'inscription et le premier planning utile.",
      keyFacts: [
        'SaaS IA',
        'Logo, identité visuelle, direction artistique',
        'Landing page',
        "UX/UI produit et parcours d'activation",
      ],
      client: [
        "Arises est un SaaS IA qui transforme le calendrier d'un utilisateur en plan d'action. Sa promesse, en une ligne : « Turn chaotic tasks into a balanced schedule. »",
        'Au moment du projet, le produit était en phase de lancement.',
      ],
      challenge: [
        "Comme beaucoup de produits IA, Arises peut faire beaucoup de choses. C'est précisément le risque.",
        "Un utilisateur qui ne perçoit pas la valeur dans les premières minutes ne revient pas. Et un SaaS en lancement n'a ni notoriété, ni avis, ni cas clients pour compenser.",
        'Chaque élément devait donc faire son travail seul : la marque pour être crédible, la landing pour faire comprendre, le produit pour prouver vite.',
      ],
      objectives: [
        'Expliquer la promesse IA par son bénéfice, pas par sa technologie.',
        "Donner l'image d'un produit crédible dès le jour du lancement.",
        'Réduire la distance entre la première connexion et le premier planning utile.',
        "Construire un univers cohérent, du logo à l'interface.",
      ],
      approach: [
        {
          title: 'Construire une marque de produit, pas de projet',
          body: "Un SaaS sans historique est jugé sur ses signaux : logo, typographie, cohérence. Nous avons créé une identité capable de positionner Arises aux côtés d'outils établis dès sa mise en ligne.",
        },
        {
          title: "Vendre l'avant/après, pas l'algorithme",
          body: "Personne n'achète « un moteur de planification par IA ». On achète une semaine moins chaotique. La landing montre le passage de tâches empilées à un planning équilibré, travail d'un côté, vie personnelle de l'autre. La technologie vient après.",
        },
        {
          title: "Concevoir chaque écran autour de l'activation",
          body: "Une question a guidé l'UX : combien d'étapes avant que l'utilisateur voie son premier planning ? Chaque écran du parcours a été jugé à cette aune. Ce qui n'aidait pas l'utilisateur à atteindre ce premier planning passait au second plan.",
        },
      ],
      solutionIntro: "Une marque, une landing et une expérience produit conçues pour qu'un inconnu comprenne, essaie, puis obtienne son premier planning.",
      solution: [
        { title: 'Marque', items: ['Logo', 'Identité visuelle', 'Direction artistique'] },
        { title: 'Acquisition', items: ['Landing page', 'Copywriting'] },
        { title: 'Produit', items: ['UX/UI', "Parcours d'activation", 'Interfaces produit'] },
        { title: 'Lancement', items: ['Mise en ligne'] },
      ],
      features: [
        {
          title: "L'avant/après, dès la première lecture",
          body: "Plutôt que d'expliquer le fonctionnement de l'IA, la landing montre le résultat : des tâches qui se chevauchent d'un côté, un planning organisé en Work / Life de l'autre. Le visiteur comprend la promesse sans lire un paragraphe, et l'appel à l'action suit immédiatement.",
        },
        {
          title: "Un parcours d'activation centré sur le premier planning",
          body: "L'inscription ne sert pas à présenter le produit, mais à y entrer. Le parcours mène l'utilisateur vers une seule chose : voir son propre planning réorganisé. La valeur arrive avant la lassitude.",
        },
      ],
      result: [
        'Arises a été lancé avec une marque, une landing et un produit conçus ensemble. Pas d\'étape où la promesse change de ton : ce que la landing montre, le produit le livre.',
      ],
    },
    en: {
      category: 'AI SaaS · Branding · Landing page · Product design',
      headline: 'Turning an AI concept into a SaaS whose value is clear before you even sign up.',
      subtitle: 'Arises turns a chaotic calendar into a schedule balanced between work and personal life. We designed the brand, the landing page and the product experience with one goal: shorten the time between sign-up and the first useful schedule.',
      keyFacts: [
        'AI SaaS',
        'Logo, visual identity, art direction',
        'Landing page',
        'Product UX/UI and activation journey',
      ],
      client: [
        'Arises is an AI SaaS that turns a user’s calendar into an action plan. Its promise, in one line: “Turn chaotic tasks into a balanced schedule.”',
        'At the time of the project, the product was in its launch phase.',
      ],
      challenge: [
        'Like many AI products, Arises can do a lot of things. That is precisely the risk.',
        'A user who does not see the value in the first few minutes does not come back. And a SaaS at launch has no reputation, reviews or case studies to make up for it.',
        'Each piece had to do its job on its own: the brand to be credible, the landing page to explain, the product to prove value fast.',
      ],
      objectives: [
        'Explain the AI promise through its benefit, not its technology.',
        'Look like a credible product from launch day.',
        'Shorten the distance between first login and the first useful schedule.',
        'Build a coherent world, from logo to interface.',
      ],
      approach: [
        {
          title: 'Build a product brand, not a project brand',
          body: 'A SaaS with no track record is judged on its signals: logo, typography, consistency. We created an identity that could place Arises alongside established tools from the day it went live.',
        },
        {
          title: 'Sell the before/after, not the algorithm',
          body: 'Nobody buys "an AI scheduling engine". People buy a less chaotic week. The landing page shows stacked tasks becoming a balanced schedule, work on one side, personal life on the other. The technology comes second.',
        },
        {
          title: 'Design every screen around activation',
          body: 'One question guided the UX: how many steps before users see their first schedule? Every screen in the journey was judged against it. Anything that did not help users reach that first schedule took a back seat.',
        },
      ],
      solutionIntro: 'A brand, a landing page and a product experience designed so that a stranger understands, tries, then gets their first schedule.',
      solution: [
        { title: 'Brand', items: ['Logo', 'Visual identity', 'Art direction'] },
        { title: 'Acquisition', items: ['Landing page', 'Copywriting'] },
        { title: 'Product', items: ['UX/UI', 'Activation journey', 'Product interfaces'] },
        { title: 'Launch', items: ['Go-live'] },
      ],
      features: [
        {
          title: 'The before/after, at first read',
          body: 'Rather than explaining how the AI works, the landing page shows the result: overlapping tasks on one side, a schedule organised into Work / Life on the other. Visitors understand the promise without reading a paragraph, and the call to action follows immediately.',
        },
        {
          title: 'An activation journey focused on the first schedule',
          body: 'Sign-up is not there to present the product, but to get into it. The journey leads users to one thing: seeing their own schedule reorganised. Value arrives before fatigue does.',
        },
      ],
      result: [
        'Arises launched with a brand, a landing page and a product designed together. There is no point where the promise changes tone: what the landing page shows, the product delivers.',
      ],
    },
  },

  'souji-nova': {
    fr: {
      category: 'Landing page · Services',
      headline: 'Faire de la confiance le premier levier de conversion.',
      subtitle: 'Souji Nova propose des prestations de nettoyage aux particuliers et aux professionnels. Nous avons conçu une landing page qui répond aux doutes du visiteur avant de lui demander un devis.',
      keyFacts: [
        'Landing page',
        'UX/UI + copywriting',
        '2 publics : particuliers et professionnels',
        'Objectif unique : la demande de devis',
      ],
      client: [
        'Souji Nova est une société de nettoyage qui intervient chez les particuliers et dans les locaux professionnels.',
        "Deux publics, un même besoin : confier son espace à quelqu'un de fiable.",
      ],
      challenge: [
        "Dans les services, on n'achète pas d'abord une prestation. On achète de la confiance.",
        'Avant de demander un devis, le visiteur se pose quatre questions :\nQui intervient ?\nPour quels besoins ?\nComment demander un devis ?\nPuis-je leur confier mes locaux ou mon domicile ?',
        "Si le site n'y répond pas en quelques secondes, le visiteur revient sur Google et appelle le prestataire suivant.",
      ],
      objectives: [
        'Répondre aux quatre questions dès les premiers écrans.',
        "Distinguer clairement l'offre particuliers et l'offre professionnels.",
        'Lever les objections avant la demande de contact.',
        "Raccourcir le chemin jusqu'au devis.",
      ],
      approach: [
        {
          title: 'Commencer par la réponse',
          body: "Les services et les profils accompagnés sont annoncés dès le premier écran. Sur mobile, un visiteur décide en quelques secondes s'il est au bon endroit : la page ne lui fait pas chercher.",
        },
        {
          title: 'Placer la preuve là où le doute apparaît',
          body: "Chacune des quatre questions trouve sa réponse dans une section de la page. La confiance ne vient pas d'un slogan : elle vient de preuves placées au moment où le doute se présente.",
        },
        {
          title: 'Un seul objectif',
          body: "La page limite les distractions : chaque section mène à la même action, la demande de devis. Une landing de service n'a pas besoin d'être explorée, elle doit être utilisée.",
        },
      ],
      solutionIntro: 'Une landing page construite comme une réponse aux objections, qui se termine par une demande de devis.',
      solution: [
        {
          items: [
            'Proposition de valeur',
            'Présentation des services',
            'Offre segmentée particuliers / professionnels',
            'Éléments de réassurance',
            "Appels à l'action répartis sur la page",
            'Demande de devis',
            'Copywriting',
            'Conception mobile-first',
          ],
        },
      ],
      features: [
        {
          title: "Segmenter dès l'entrée",
          body: "Un particulier et un gestionnaire de locaux n'ont pas les mêmes attentes, ni les mêmes questions. La page distingue les deux offres pour que chacun lise ce qui le concerne. La demande de devis arrive déjà orientée, et Souji Nova sait à qui il répond.",
        },
        {
          title: 'Le devis toujours à portée',
          body: "Les appels à l'action sont répartis tout au long de la page. Le visiteur convaincu à la deuxième section n'a pas à attendre la fin pour agir. Chaque moment de décision a sa porte de sortie.",
        },
      ],
      result: [
        'Souji Nova a une page qui fait un seul travail, sans détour : transformer une visite en demande de devis.',
      ],
      testimonialHighlight: "De bons conseils et à l'écoute de ses clients.",
    },
    en: {
      category: 'Landing page · Services',
      headline: 'Making trust the first conversion lever.',
      subtitle: 'Souji Nova provides cleaning services to households and businesses. We designed a landing page that answers visitors’ doubts before asking them for a quote.',
      keyFacts: [
        'Landing page',
        'UX/UI + copywriting',
        '2 audiences: households and businesses',
        'Single goal: the quote request',
      ],
      client: [
        'Souji Nova is a cleaning company working in private homes and business premises.',
        'Two audiences, one need: handing over your space to someone reliable.',
      ],
      challenge: [
        'In services, people do not buy a service first. They buy trust.',
        'Before requesting a quote, visitors ask themselves four questions:\nWho will come?\nFor which needs?\nHow do I request a quote?\nCan I trust them with my premises or my home?',
        'If the website does not answer within seconds, the visitor goes back to Google and calls the next provider.',
      ],
      objectives: [
        'Answer the four questions from the very first screens.',
        'Clearly separate the household offer from the business offer.',
        'Remove objections before the contact request.',
        'Shorten the path to a quote.',
      ],
      approach: [
        {
          title: 'Start with the answer',
          body: 'Services and client types are stated on the first screen. On mobile, visitors decide within seconds whether they are in the right place: the page does not make them search.',
        },
        {
          title: 'Put proof where doubt appears',
          body: 'Each of the four questions is answered in a section of the page. Trust does not come from a slogan: it comes from proof placed at the moment doubt arises.',
        },
        {
          title: 'One single goal',
          body: 'The page limits distractions: every section leads to the same action, the quote request. A service landing page does not need to be explored, it needs to be used.',
        },
      ],
      solutionIntro: 'A landing page built as an answer to objections, ending with a quote request.',
      solution: [
        {
          items: [
            'Value proposition',
            'Service presentation',
            'Offer segmented for households / businesses',
            'Reassurance elements',
            'Calls to action throughout the page',
            'Quote request',
            'Copywriting',
            'Mobile-first design',
          ],
        },
      ],
      features: [
        {
          title: 'Segment from the start',
          body: 'A household and a facility manager do not have the same expectations or the same questions. The page separates the two offers so everyone reads what concerns them. Quote requests arrive already qualified, and Souji Nova knows who it is answering.',
        },
        {
          title: 'The quote always within reach',
          body: 'Calls to action are spread throughout the page. A visitor convinced by the second section does not have to wait until the end to act. Every decision point has a way forward.',
        },
      ],
      result: [
        'Souji Nova has a page that does one job, with no detours: turning a visit into a quote request.',
      ],
      testimonialHighlight: 'Good advice and attentive to its clients.',
    },
  },

  'fontaines-vtc': {
    fr: {
      category: 'Site web · SEO local · Conversion',
      headline: 'Transformer une recherche locale en réservation.',
      subtitle: "Pour un chauffeur VTC, le site sert à deux choses : être trouvé au moment où quelqu'un cherche un transport, puis être réservé sans friction. Nous avons travaillé les deux.",
      keyFacts: [
        'Site web · SEO local',
        'Copywriting',
        "Optimisation des appels à l'action",
        'Parcours de réservation mobile',
      ],
      client: [
        'Fontaines VTC est un service de transport privé avec réservation en ligne.',
        "Une activité où la demande naît souvent d'une recherche sur mobile, parfois au dernier moment.",
      ],
      challenge: [
        'Un utilisateur qui tape « VTC » suivi du nom de sa ville ne compare pas longtemps. Il contacte le premier résultat qui lui inspire confiance.',
        "Deux objectifs devaient donc fonctionner ensemble : apparaître sur les bonnes recherches locales, et rendre la réservation évidente dès l'arrivée sur le site.",
        "L'un sans l'autre ne sert à rien.",
      ],
      objectives: [
        'Gagner en visibilité sur les recherches locales pertinentes.',
        'Donner immédiatement les informations utiles avant une réservation.',
        "Faire de la réservation l'action principale du site.",
        "Soigner l'expérience mobile, là où se font les recherches.",
      ],
      approach: [
        {
          title: 'Structurer pour la recherche locale',
          body: "Les contenus et la structure de la page sont organisés autour de la zone d'activité. En SEO local, la pertinence géographique compte davantage que le volume de texte.",
        },
        {
          title: 'Répondre avant que la question bloque',
          body: 'Prestations et informations utiles sont visibles immédiatement. Pour un transport, chaque information manquante pousse le visiteur à contacter le concurrent.',
        },
        {
          title: 'Une seule action principale',
          body: "La réservation et la prise de contact sont positionnées comme les actions principales du site. Sur mobile, il n'y a pas de place pour deux objectifs.",
        },
      ],
      solution: [
        {
          items: [
            'Architecture de la landing page',
            'Copywriting',
            'SEO local',
            'Présentation des prestations',
            "Optimisation des appels à l'action",
            'Expérience mobile',
            'Parcours vers la réservation',
          ],
        },
      ],
      features: [
        {
          title: "Un SEO local construit sur la zone d'activité",
          body: 'Plutôt que de viser des requêtes génériques, le site cible les recherches liées à sa zone. Le trafic qui arrive correspond à des personnes qui cherchent un transport ici et maintenant. Ce sont les visites qui se transforment en courses.',
        },
        {
          title: 'La réservation à un geste',
          body: "Les appels à l'action sont repositionnés pour rendre la réservation immédiate. Le visiteur qui a trouvé Fontaines VTC sur Google n'a pas à chercher comment réserver.",
        },
      ],
      result: [
        'Le site de Fontaines VTC est construit autour des deux métriques qui comptent pour son activité : être trouvé, être réservé.',
      ],
      testimonialHighlight: 'Entreprise très sérieuse et professionnelle.',
    },
    en: {
      category: 'Website · Local SEO · Conversion',
      headline: 'Turning a local search into a booking.',
      subtitle: 'For a private driver, a website does two things: get found when someone is looking for a ride, then get booked without friction. We worked on both.',
      keyFacts: [
        'Website · Local SEO',
        'Copywriting',
        'Call-to-action optimisation',
        'Mobile booking journey',
      ],
      client: [
        'Fontaines VTC is a private transport service with online booking.',
        'A business where demand often starts with a mobile search, sometimes at the last minute.',
      ],
      challenge: [
        'Someone typing "private driver" followed by their city does not compare for long. They contact the first result that feels trustworthy.',
        'Two goals had to work together: appear in the right local searches, and make booking obvious from the moment visitors land on the site.',
        'One without the other is useless.',
      ],
      objectives: [
        'Gain visibility on relevant local searches.',
        'Provide the useful information before booking, immediately.',
        'Make booking the site’s main action.',
        'Get the mobile experience right, where searches happen.',
      ],
      approach: [
        {
          title: 'Structure for local search',
          body: 'The page’s content and structure are organised around the service area. In local SEO, geographic relevance matters more than the volume of text.',
        },
        {
          title: 'Answer before the question becomes a blocker',
          body: 'Services and useful information are visible immediately. For transport, every missing piece of information pushes visitors towards a competitor.',
        },
        {
          title: 'One main action',
          body: 'Booking and getting in touch are positioned as the site’s main actions. On mobile, there is no room for two goals.',
        },
      ],
      solution: [
        {
          items: [
            'Landing page architecture',
            'Copywriting',
            'Local SEO',
            'Service presentation',
            'Call-to-action optimisation',
            'Mobile experience',
            'Booking journey',
          ],
        },
      ],
      features: [
        {
          title: 'Local SEO built on the service area',
          body: 'Rather than targeting generic queries, the site targets searches tied to its area. The traffic it gets comes from people looking for a ride here and now. Those are the visits that turn into rides.',
        },
        {
          title: 'Booking in one move',
          body: 'Calls to action were repositioned to make booking immediate. Visitors who found Fontaines VTC on Google do not have to look for how to book.',
        },
      ],
      result: [
        'Fontaines VTC’s website is built around the two metrics that matter for its business: being found and being booked.',
      ],
      testimonialHighlight: 'A very serious and professional company.',
    },
  },

  'mc-studio-creator': {
    fr: {
      category: 'Projet interne · Branding · Positionnement · Landing page',
      headline: 'Passer de prestataire pour créateurs à partenaire produit.',
      subtitle: 'Les créateurs ont déjà ce que la plupart des produits cherchent pendant des années : une audience. Nous avons construit la marque et le site d’une verticale dédiée à ce qui vient ensuite.',
      keyFacts: [
        'Projet interne MC Studio',
        'Positionnement et thèse',
        'Identité complète : logo, couleurs, typographies',
        'Landing page + parcours de candidature',
      ],
      clientTitle: 'Le contexte',
      client: [
        "MC Studio Creator est la verticale de MC Studio dédiée aux créateurs de contenu. Nous y concevons des produits et des applications construits autour de leur communauté : un espace qu'ils possèdent, plutôt qu'une audience qui dépend des algorithmes.",
      ],
      challenge: [
        "Un créateur ne raisonne pas comme une PME. Il pense communauté, univers, monétisation. Et ce qu'on lui livre n'est pas un site : c'est un produit.",
        'Parler aux deux publics avec la même marque diluait le message.',
        "Le risque inverse existait aussi : être perçu comme une agence de plus qui propose « une app ». Or le vrai travail est plus large : comprendre la communauté, identifier un besoin, concevoir le produit, puis le lancer sur la distribution existante.",
      ],
      objectives: [
        'Créer une verticale distincte sans casser la marque MC Studio.',
        'Parler aux créateurs avec leurs propres codes.',
        "Rendre concrète l'idée d'un produit construit pour une communauté.",
        'Recevoir des demandes qualifiées de créateurs.',
      ],
      approach: [
        {
          title: 'Écrire la thèse avant le logo',
          body: 'Audience → besoin → produit → lancement. Un positionnement qui ne tient pas en une ligne ne se vend pas. Toute la page découle de ces quatre étapes.',
        },
        {
          title: 'Une identité à part',
          body: "Les créateurs jugent d'abord sur l'univers. Une marque d'agence B2B ne leur parle pas. Nous avons créé un système dédié : violet, Helvetica et Inter, textures et déclinaisons jusqu'à la signalétique.",
        },
        {
          title: 'Vendre un partenariat, pas une prestation',
          body: "La landing parle de construction à deux et d'exploitation de la distribution, pas de livrables. Les produits de créateurs réussissent quand le lancement est pensé dès le cadrage : c'est ce que la page doit faire comprendre.",
        },
        {
          title: 'Filtrer par la candidature',
          body: "Plutôt qu'un formulaire de contact, un parcours de candidature. Il permet de comprendre l'audience et le besoin du créateur avant le premier échange.",
        },
      ],
      solution: [
        {
          items: [
            'Positionnement et thèse',
            'Proposition de valeur',
            'Logo et wordmark',
            'Système de couleurs (violet), typographies Helvetica et Inter, textures',
            'Déclinaisons de marque (signalétique, affichage)',
            'Direction artistique',
            'Landing page',
            'Parcours de candidature',
          ],
        },
      ],
      features: [
        {
          title: 'La thèse, visible en 4 étapes',
          body: "Plutôt qu'une liste de services, la page déroule le raisonnement : audience, besoin, produit, lancement. Le créateur comprend qu'on lui propose de construire un actif, pas de commander une app. Les demandes qui arrivent partent de cette ambition.",
        },
        {
          title: 'Le cas Maison AWL comme preuve',
          body: "La landing met en avant la case study Maison AWL. Un créateur y voit un pair qui l'a fait, plutôt qu'une promesse d'agence. C'est l'argument le plus direct de toute la page.",
        },
      ],
      result: [
        "Cette verticale est devenue le socle de l'offre Creators de MC Studio et de notre approche des produits construits autour d'audiences existantes.",
      ],
      quote: "La force d'un créateur, c'est sa distribution. On transforme cette audience en utilisateurs d'un produit concret.",
    },
    en: {
      category: 'Internal project · Branding · Positioning · Landing page',
      headline: 'From service provider for creators to product partner.',
      subtitle: 'Creators already have what most products spend years chasing: an audience. We built the brand and website of a vertical dedicated to what comes next.',
      keyFacts: [
        'MC Studio internal project',
        'Positioning and thesis',
        'Full identity: logo, colours, typography',
        'Landing page + application journey',
      ],
      clientTitle: 'The context',
      client: [
        'MC Studio Creator is the MC Studio vertical dedicated to content creators. There, we design products and apps built around their community: a space they own, instead of an audience that depends on algorithms.',
      ],
      challenge: [
        'A creator does not think like a small business. They think community, universe, monetisation. And what we deliver to them is not a website: it is a product.',
        'Speaking to both audiences with the same brand diluted the message.',
        'The opposite risk existed too: being seen as yet another agency offering "an app". The real work is broader: understand the community, identify a need, design the product, then launch it on the existing distribution.',
      ],
      objectives: [
        'Create a distinct vertical without breaking the MC Studio brand.',
        'Speak to creators in their own language.',
        'Make the idea of a product built for a community concrete.',
        'Receive qualified requests from creators.',
      ],
      approach: [
        {
          title: 'Write the thesis before the logo',
          body: 'Audience → need → product → launch. A positioning that does not fit in one line does not sell. The whole page flows from these four steps.',
        },
        {
          title: 'A distinct identity',
          body: 'Creators judge the universe first. A B2B agency brand does not speak to them. We created a dedicated system: purple, Helvetica and Inter, textures and applications all the way to signage.',
        },
        {
          title: 'Sell a partnership, not a service',
          body: 'The landing page talks about building together and leveraging distribution, not deliverables. Creator products succeed when the launch is planned from the framing stage: that is what the page has to convey.',
        },
        {
          title: 'Filter through applications',
          body: 'Instead of a contact form, an application journey. It helps us understand the creator’s audience and need before the first conversation.',
        },
      ],
      solution: [
        {
          items: [
            'Positioning and thesis',
            'Value proposition',
            'Logo and wordmark',
            'Colour system (purple), Helvetica and Inter typography, textures',
            'Brand applications (signage, billboards)',
            'Art direction',
            'Landing page',
            'Application journey',
          ],
        },
      ],
      features: [
        {
          title: 'The thesis, visible in 4 steps',
          body: 'Instead of a list of services, the page walks through the reasoning: audience, need, product, launch. Creators understand they are being offered to build an asset, not to order an app. The requests that come in start from that ambition.',
        },
        {
          title: 'The Maison AWL case as proof',
          body: 'The landing page features the Maison AWL case study. Creators see a peer who did it, rather than an agency promise. It is the most direct argument on the page.',
        },
      ],
      result: [
        'This vertical became the foundation of MC Studio’s Creators offer and of our approach to products built around existing audiences.',
      ],
      quote: 'A creator’s strength is their distribution. We turn that audience into users of a real product.',
    },
  },
}

export function findCaseStudyBySlug(slug: string): LocalizedValue<CaseStudy> | undefined {
  return caseStudies[slug]
}
