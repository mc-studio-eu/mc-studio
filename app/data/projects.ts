export interface ProjectScreenshots {
  desktop: string[]
  mobile: string[]
}

export interface LocalizedValue<T> {
  fr: T
  en: T
}

export interface ProjectTestimonial {
  name: string
  avatar: string
}

export interface ProjectActionItem {
  title: string
  body: string
}

export type ProjectCategory = 'branding' | 'landing-page' | 'app'

export interface Project {
  /** URL-friendly identifier: /projects/[slug] */
  slug: string
  /** i18n namespace under `projects.items.<i18nKey>` */
  i18nKey: string
  /** Display name (kept in code, not translated) */
  title: string
  /** Portfolio filters displayed on the landing page */
  categories: ProjectCategory[]
  /** Main cover image used in landing carousel + detail hero */
  image: string
  /** External website url */
  externalLink: string
  /** Whether the project has a verified-website style badge on the external link */
  verified?: boolean
  /** Optional testimonial; text/job come from i18n */
  testimonial?: ProjectTestimonial
  /** Screenshots shown on the detail page (desktop / mobile toggle) */
  screenshots: ProjectScreenshots
  summary: LocalizedValue<string>
  aboutCompany: LocalizedValue<string>
  industry: LocalizedValue<string>
  companySize: string
  supportBullets: LocalizedValue<string[]>
  context: LocalizedValue<string>
  solution: LocalizedValue<string>
  challenges: LocalizedValue<string[]>
  objectives: LocalizedValue<string[]>
  actions: LocalizedValue<ProjectActionItem[]>
}

export const projects: Project[] = [
  {
    slug: 'personal',
    i18nKey: 'personal',
    title: 'Personal',
    categories: ['branding', 'landing-page', 'app'],
    image: '/img/project/personal/homepage.webp',
    externalLink: 'https://usepersonal.app/',
    verified: true,
    screenshots: {
      desktop: [
        '/img/project/personal/homepage.webp',
        '/img/project/personal/login.webp',
        '/img/project/personal/feed.webp',
        '/img/project/personal/closing.webp',
      ],
      mobile: [],
    },
    summary: {
      fr: "Personal est un SaaS conçu pour aider les créateurs à trouver des idées qui fonctionnent dans leur niche et à les transformer en contenus fidèles à leur histoire, leur voix et leur rythme. Nous avons construit la marque, le site et l'expérience produit de bout en bout.",
      en: 'Personal is a SaaS designed to help creators find ideas that work in their niche and turn them into content rooted in their story, voice and rhythm. We built the brand, website and product experience end to end.',
    },
    aboutCompany: {
      fr: "Personal s'adresse aux créateurs qui veulent publier régulièrement sans devenir une machine à contenu. Le produit analyse les formats performants, les relie aux moments vécus par le créateur et prépare des brouillons qu'il reste toujours libre de modifier et de publier.",
      en: 'Personal is made for creators who want to publish consistently without becoming content machines. The product analyzes high-performing formats, connects them to moments from the creator\'s life and prepares drafts they always remain free to edit and publish.',
    },
    industry: {
      fr: 'SaaS IA pour créateurs',
      en: 'AI SaaS for creators',
    },
    companySize: '1 - 10',
    supportBullets: {
      fr: [
        'Une marque forte et immédiatement reconnaissable',
        'Un parcours complet de la découverte au brouillon',
        "L'IA au service de la voix du créateur",
      ],
      en: [
        'A strong and immediately recognizable brand',
        'A complete journey from discovery to draft',
        "AI serving the creator's own voice",
      ],
    },
    context: {
      fr: "Les outils de génération de contenu produisent souvent des textes génériques et déconnectés de la personne qui les publie. Personal devait prendre le contre-pied de cette logique : partir de ce qui fonctionne réellement, préserver la singularité du créateur et lui faire gagner du temps sans jamais publier à sa place.",
      en: 'Content generation tools often produce generic copy disconnected from the person publishing it. Personal had to take the opposite approach: start from what actually works, preserve the creator\'s individuality and save time without ever posting on their behalf.',
    },
    solution: {
      fr: "Nous avons conçu une plateforme bilingue qui réunit veille, inspiration et création. Le feed fait remonter des contenus performants dans la niche du créateur, permet de les enregistrer puis de les remixer à partir de ses propres moments. Le produit accompagne ensuite la création d'une légende, d'un carrousel ou d'un Reel, jusqu'au brouillon prêt à reprendre.",
      en: 'We designed a bilingual platform that brings research, inspiration and creation together. The feed surfaces high-performing content in the creator\'s niche, lets them save it and remix it using their own moments. The product then guides the creation of a caption, carousel or Reel through to a draft ready to refine.',
    },
    challenges: {
      fr: [
        "Se distinguer des générateurs de contenu IA génériques",
        "Rendre une mécanique complexe évidente dès les premières minutes",
        "Créer une expérience éditoriale cohérente entre marketing et produit",
      ],
      en: [
        'Stand apart from generic AI content generators',
        'Make a complex workflow obvious within the first few minutes',
        'Create one editorial experience across marketing and product',
      ],
    },
    objectives: {
      fr: [
        "Donner aux créateurs des idées pertinentes chaque semaine",
        "Transformer leur vécu en contenus qui leur ressemblent",
        "Réduire le temps entre l'inspiration et le brouillon final",
      ],
      en: [
        'Give creators relevant ideas every week',
        'Turn their lived experience into content that sounds like them',
        'Reduce the time from inspiration to final draft',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Branding & direction artistique',
          body: "Création d'une identité contrastée et éditoriale : symbole signature, typographie expressive, palette ivoire, noir et corail, et système visuel capable de vivre du site au produit.",
        },
        {
          title: 'Produit & expérience',
          body: "Conception des parcours clés : onboarding, feed personnalisé, favoris, moments personnels, remix et génération de brouillons en plusieurs formats.",
        },
        {
          title: 'Développement SaaS',
          body: "Développement de l'application bilingue, de l'authentification et de la landing animée, avec une interface responsive pensée pour accompagner les créateurs de la découverte à la production.",
        },
      ],
      en: [
        {
          title: 'Branding & art direction',
          body: 'A contrasting editorial identity: signature symbol, expressive typography, ivory, black and coral palette, and a visual system designed to extend from website to product.',
        },
        {
          title: 'Product & experience',
          body: 'Design of the core journeys: onboarding, personalized feed, saved posts, personal moments, remixing and draft generation across several formats.',
        },
        {
          title: 'SaaS development',
          body: 'Development of the bilingual app, authentication and animated landing page, with a responsive interface guiding creators from discovery to production.',
        },
      ],
    },
  },
  {
    slug: 'shika-consulting',
    i18nKey: 'shika_consulting',
    title: 'Shika Consulting',
    categories: ['landing-page'],
    image: '/img/project/shika-consulting/homepage.webp',
    externalLink: 'https://shika-consulting.fr/',
    verified: true,
    screenshots: {
      desktop: [
        '/img/project/shika-consulting/homepage.webp',
        '/img/project/shika-consulting/associations.webp',
        '/img/project/shika-consulting/process.webp',
        '/img/project/shika-consulting/testimonials.webp',
      ],
      mobile: [],
    },
    summary: {
      fr: "Shika Consulting nous a confié la conception et le développement de son nouveau site pour affirmer son positionnement de cabinet d'expertise comptable dédié aux associations et transformer une offre technique en parcours clair et rassurant.",
      en: 'Shika Consulting asked us to design and build its new website to establish its positioning as an accounting firm dedicated to nonprofits and turn a technical offer into a clear, reassuring journey.',
    },
    aboutCompany: {
      fr: "Shika Consulting est un cabinet d'expertise comptable et de commissariat aux comptes spécialisé dans le secteur associatif. Il accompagne partout en France les associations sur leurs enjeux comptables, financiers, juridiques et organisationnels.",
      en: 'Shika Consulting is an accounting and statutory audit firm specialized in the nonprofit sector. It supports associations across France with their accounting, financial, legal and organizational challenges.',
    },
    industry: {
      fr: 'Expertise comptable associative',
      en: 'Nonprofit accounting',
    },
    companySize: '1 - 10',
    supportBullets: {
      fr: [
        'Positionnement spécialisé immédiatement lisible',
        'Offre complexe rendue simple et pédagogique',
        'Parcours orienté estimation et prise de rendez-vous',
      ],
      en: [
        'Specialist positioning made immediately clear',
        'A complex offer made simple and educational',
        'A journey focused on estimates and call booking',
      ],
    },
    context: {
      fr: "L'expertise de Shika couvre des sujets précis comme la comptabilité, l'audit, le conseil et le juridique, avec des spécificités propres aux associations. Le site devait rendre ce positionnement évident dès le premier écran, expliquer les enjeux sans jargon et installer la confiance nécessaire pour choisir un cabinet comptable.",
      en: "Shika's expertise covers accounting, audit, consulting and legal matters, each with requirements specific to nonprofits. The website had to make this positioning obvious from the first screen, explain the challenges without jargon and build the trust needed to choose an accounting firm.",
    },
    solution: {
      fr: "Nous avons conçu et développé un site complet au langage visuel chaleureux et expert. La navigation structure les contenus par profil d'association et par service, les blocs pédagogiques rendent les obligations concrètes, tandis que les preuves, témoignages, tarifs et appels à l'action accompagnent progressivement vers l'estimation du budget ou la prise de rendez-vous.",
      en: 'We designed and built a complete website with a warm yet expert visual language. Navigation organizes content by nonprofit profile and service, educational sections make obligations tangible, while proof points, testimonials, pricing and calls to action progressively guide visitors toward a budget estimate or a booked call.',
    },
    challenges: {
      fr: [
        "Rendre accessible une expertise comptable très spécialisée",
        "Parler à des associations aux profils et niveaux de maturité variés",
        "Concilier sérieux institutionnel, pédagogie et proximité humaine",
      ],
      en: [
        'Make highly specialized accounting expertise accessible',
        'Address nonprofits with varied profiles and maturity levels',
        'Balance institutional credibility, education and human proximity',
      ],
    },
    objectives: {
      fr: [
        "Affirmer la spécialisation de Shika auprès des associations",
        "Clarifier l'offre et les situations prises en charge",
        "Créer un parcours de conversion fluide vers le rendez-vous",
      ],
      en: [
        "Establish Shika's specialization in the nonprofit sector",
        'Clarify the offer and the situations it covers',
        'Create a smooth conversion journey toward booking a call',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Architecture & copywriting',
          body: "Organisation d'un site multi-page autour des associations, des services et des besoins concrets, avec un discours simple qui valorise l'expertise sans alourdir la lecture.",
        },
        {
          title: 'Direction artistique & UI',
          body: "Création d'un univers chaleureux et distinctif autour du bleu nuit, du beige et de l'orange, enrichi d'illustrations pédagogiques, de chiffres clés et de témoignages.",
        },
        {
          title: 'Développement & contenu',
          body: "Développement d'une expérience responsive rapide et animée, avec une structure éditoriale qui permet de faire vivre les pages services, associations et contenus du cabinet.",
        },
      ],
      en: [
        {
          title: 'Architecture & copywriting',
          body: 'A multi-page website organized around nonprofit profiles, services and concrete needs, with simple messaging that showcases expertise without weighing down the reading experience.',
        },
        {
          title: 'Art direction & UI',
          body: 'A warm and distinctive visual universe built around navy, beige and orange, enriched with educational illustrations, key figures and testimonials.',
        },
        {
          title: 'Development & content',
          body: 'A fast, responsive and animated experience, with an editorial structure designed to support service pages, nonprofit profiles and the firm\'s content over time.',
        },
      ],
    },
  },
  {
    slug: 'crm-ra-energy',
    i18nKey: 'crm_ra_energy',
    title: 'CRM R&A Energy',
    categories: ['app'],
    image: '/img/project/crm-ra/crm-hero-mockup.png',
    externalLink: 'https://ra-energy.fr/',
    verified: true,
    testimonial: {
      name: 'Yazid C.',
      avatar: '/img/testimonials/yazid-ra-energy.jpeg',
    },
    screenshots: {
      desktop: [
        '/img/project/crm-ra/crm-hero-mockup.png',
        '/img/project/crm-ra/crm-dashboard.png',
        '/img/project/crm-ra/crm-prospects.png',
        '/img/project/crm-ra/crm-planning.png',
        '/img/project/crm-ra/crm-carte.png',
      ],
      mobile: [
        '/img/project/crm-ra/crm-mobile-dashboard.png',
        '/img/project/crm-ra/crm-mobile-prospects.png',
      ],
    },
    summary: {
      fr: "Après sa landing page, R&A Energy nous a confié la création de son outil interne : un CRM sur mesure pour piloter la prospection, les rendez-vous commerciaux et les tournées terrain de toute l'équipe.",
      en: 'After their landing page, R&A Energy asked us to build their internal tool: a custom CRM to manage prospecting, sales appointments and field routes for the whole team.',
    },
    aboutCompany: {
      fr: "Courtier en énergie pour professionnels, avec une équipe mêlant téléprospecteurs, commerciaux terrain et apporteurs d'affaires. Les fichiers Excel et les agendas dispersés ne suivaient plus le rythme de la croissance.",
      en: 'An energy broker for professionals, with a team of telemarketers, field sales reps and business introducers. Spreadsheets and scattered calendars could no longer keep up with their growth.',
    },
    industry: {
      fr: 'Courtage en énergie',
      en: 'Energy brokerage',
    },
    companySize: '10 - 20',
    supportBullets: {
      fr: [
        'Un outil unique pour toute l\'équipe',
        'RDV vérifiés : agenda + temps de trajet',
        'Données sécurisées rôle par rôle',
      ],
      en: [
        'One tool for the whole team',
        'Verified meetings: calendar + travel time',
        'Data secured role by role',
      ],
    },
    context: {
      fr: "La prospection était gérée sur des fichiers partagés : doublons, RDV impossibles à honorer faute de temps de trajet, aucun suivi d'historique et des informations sensibles accessibles à tous. Il fallait un outil central, simple pour le terrain et strict sur les accès.",
      en: 'Prospecting was managed in shared spreadsheets: duplicates, meetings impossible to honor due to travel time, no activity history and sensitive data visible to everyone. They needed one central tool, simple for the field and strict on access.',
    },
    solution: {
      fr: "Nous avons conçu et développé un CRM web sur mesure : pipeline de prospects avec fiches enrichies (SIRET et adresses auto-complétés, commentaires, documents), prise de RDV avec vérification automatique des disponibilités Google Calendar et du temps de trajet, planning d'équipe, carte des tournées et gestion fine des rôles (admin, télépro, commercial, régies).",
      en: 'We designed and built a custom web CRM: a prospect pipeline with enriched records (auto-completed company data and addresses, comments, documents), meeting booking with automatic Google Calendar availability and travel-time checks, a team planning view, a map of field routes and fine-grained roles (admin, telemarketer, sales rep, partners).',
    },
    challenges: {
      fr: [
        'Remplacer des habitudes Excel par un outil adopté par tous',
        'Fiabiliser la prise de RDV terrain (agenda + itinéraires)',
        'Cloisonner les données selon 5 rôles différents',
      ],
      en: [
        'Replace spreadsheet habits with a tool the whole team adopts',
        'Make field meeting booking reliable (calendar + routes)',
        'Partition data across 5 different roles',
      ],
    },
    objectives: {
      fr: [
        'Centraliser prospects, RDV et documents au même endroit',
        'Éliminer les conflits d\'agenda et les trajets intenables',
        'Donner à chaque rôle exactement ce qu\'il doit voir',
      ],
      en: [
        'Centralize prospects, meetings and documents in one place',
        'Eliminate calendar conflicts and unrealistic travel times',
        'Give each role exactly what it should see',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Produit & développement sur mesure',
          body: "Application web complète (Nuxt + Supabase) : pipeline de prospects, fiches enrichies par les API SIRET et adresse, commentaires, documents et historique d'activité automatique.",
        },
        {
          title: 'RDV intelligents',
          body: "Chaque créneau est vérifié en direct : disponibilité dans le Google Calendar du commercial et temps de trajet réaliste entre deux rendez-vous, avec planning d'équipe et carte des tournées.",
        },
        {
          title: 'Sécurité par rôles',
          body: "Cinq rôles aux permissions distinctes, appliquées jusqu'à la base de données : chacun ne voit que ses fiches, ses RDV et les documents auxquels il a droit.",
        },
      ],
      en: [
        {
          title: 'Custom product & development',
          body: 'A complete web app (Nuxt + Supabase): prospect pipeline, records enriched via company and address APIs, comments, documents and automatic activity history.',
        },
        {
          title: 'Smart meeting booking',
          body: "Every slot is checked live: availability in the sales rep's Google Calendar and realistic travel time between meetings, with a team planning view and a route map.",
        },
        {
          title: 'Role-based security',
          body: 'Five roles with distinct permissions enforced down to the database: everyone sees only their own records, meetings and authorized documents.',
        },
      ],
    },
  },
  {
    slug: 'amg-promotion',
    i18nKey: 'amg_promotion',
    title: 'AMG Promotion',
    categories: ['landing-page'],
    image: '/img/project/amgprom.png',
    externalLink: 'https://amgprom.com/',
    verified: true,
    testimonial: {
      name: 'Jean francois Fialaire',
      avatar: '/img/testimonials/jean-francois-fialaire.svg',
    },
    screenshots: {
      desktop: [
        '/img/project/amgprom.png',
      ],
      mobile: [
        '/img/project/amgprom.png',
      ],
    },
    summary: {
      fr: "AMG Promotion accompagne les marques dans la création d'objets promotionnels sur mesure avec une image plus premium et un discours commercial plus clair.",
      en: 'AMG Promotion helps brands create custom promotional products with a more premium image and a clearer commercial message.',
    },
    aboutCompany: {
      fr: "Entreprise spécialisée dans les textiles, goodies et supports personnalisés pour des références nationales. L'enjeu était de moderniser la perception tout en renforçant la lisibilité de l'offre.",
      en: 'A company specialized in textiles, goodies and personalized materials for major national brands. The challenge was to modernize perception while making the offer easier to understand.',
    },
    industry: {
      fr: 'Produits promotionnels',
      en: 'Promotional products',
    },
    companySize: '20 - 50',
    supportBullets: {
      fr: [
        'Positionnement plus premium',
        'Message plus lisible',
        'Parcours plus simple pour convertir',
      ],
      en: [
        'More premium positioning',
        'Clearer messaging',
        'Simpler path to convert',
      ],
    },
    context: {
      fr: "Le site précédent ne mettait pas assez en valeur la qualité perçue ni la diversité des prestations. Nous avons donc repensé la structure pour rassurer, clarifier et donner une impression plus haut de gamme.",
      en: 'The previous website did not highlight perceived quality enough or clearly explain the breadth of the offer. We reworked the structure to reassure, clarify and create a more premium feel.',
    },
    solution: {
      fr: "Nouvelle landing page, direction artistique plus nette, hiérarchie de contenu plus forte et sections pensées pour aider un prospect à comprendre vite et demander un devis.",
      en: 'A new landing page, sharper art direction, stronger content hierarchy and sections designed to help prospects understand the offer quickly and request a quote.',
    },
    challenges: {
      fr: [
        "Image de marque trop générique",
        'Offre peu structurée pour un nouveau visiteur',
        'Manque de hiérarchie dans les contenus clés',
      ],
      en: [
        'Brand image felt too generic',
        'Offer was not structured enough for new visitors',
        'Key content lacked hierarchy',
      ],
    },
    objectives: {
      fr: [
        'Renforcer la crédibilité dès le premier écran',
        "Mieux présenter l'offre et les cas d'usage",
        'Améliorer la prise de contact commerciale',
      ],
      en: [
        'Increase credibility from the first screen',
        'Present the offer and use cases more clearly',
        'Improve commercial lead generation',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Direction artistique',
          body: "Refonte visuelle plus premium avec une mise en page plus respirante et une meilleure hiérarchie des blocs.",
        },
        {
          title: 'Structure de landing',
          body: "Réécriture et réorganisation du contenu pour guider la lecture et rendre l'offre plus immédiate.",
        },
      ],
      en: [
        {
          title: 'Art direction',
          body: 'A more premium visual redesign with more breathing room and stronger hierarchy between content blocks.',
        },
        {
          title: 'Landing structure',
          body: 'Content was rewritten and reorganized to guide reading and make the offer easier to grasp.',
        },
      ],
    },
  },
  {
    slug: 'arises',
    i18nKey: 'arises',
    title: 'Arises',
    categories: ['branding', 'landing-page', 'app'],
    image: '/img/project/arises-tablet.jpeg',
    externalLink: 'https://arises.app/',
    verified: true,
    screenshots: {
      desktop: [
        '/img/project/arises-saas.png',
        '/img/project/arises-before-after.png',
        '/img/project/arises-login.png',
      ],
      mobile: [
        '/img/project/arises-tablet.jpeg',
      ],
    },
    summary: {
      fr: "Arises est un SaaS IA conçu pour transformer un calendrier en plan d'action. L'objectif était de lancer une présence forte, claire et crédible dès les premiers utilisateurs.",
      en: 'Arises is an AI SaaS designed to turn a calendar into an action plan. The goal was to launch with a strong, clear and credible presence from day one.',
    },
    aboutCompany: {
      fr: "Produit SaaS en phase de lancement avec un univers digital ambitieux. Il fallait faire coexister innovation, simplicité et pédagogie dans une même interface.",
      en: 'A SaaS product in launch phase with an ambitious digital universe. The challenge was to balance innovation, simplicity and clarity in one interface.',
    },
    industry: {
      fr: 'SaaS IA',
      en: 'AI SaaS',
    },
    companySize: '1 - 10',
    supportBullets: {
      fr: [
        'Positionnement plus net',
        'Narration produit plus convaincante',
        'Base solide pour le lancement',
      ],
      en: [
        'Sharper positioning',
        'More persuasive product story',
        'Solid base for launch',
      ],
    },
    context: {
      fr: "Le produit avait besoin d'une identité forte et d'un cadre visuel cohérent pour expliquer un concept nouveau sans perdre l'utilisateur.",
      en: 'The product needed a strong identity and a coherent visual system to explain a new concept without losing the user.',
    },
    solution: {
      fr: "Nous avons travaillé le branding, la landing et plusieurs écrans produit pour créer une expérience de lancement complète et consistante.",
      en: 'We worked on branding, landing and several product screens to create a complete and consistent launch experience.',
    },
    challenges: {
      fr: [
        'Expliquer une promesse IA de façon concrète',
        'Trouver le bon équilibre entre innovation et clarté',
        'Poser une image de produit crédible dès le lancement',
      ],
      en: [
        'Explain an AI promise in a concrete way',
        'Balance innovation with clarity',
        'Create a credible product image from launch',
      ],
    },
    objectives: {
      fr: [
        'Rendre la proposition de valeur immédiate',
        "Donner envie d'essayer le produit",
        'Construire un univers cohérent du branding à l’UI',
      ],
      en: [
        'Make the value proposition immediate',
        'Make people want to try the product',
        'Build a coherent universe from branding to UI',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Branding & système visuel',
          body: "Création d'une base graphique pour soutenir le discours produit et poser les codes du lancement.",
        },
        {
          title: 'Landing de conversion',
          body: "Construction d'une page qui explique le bénéfice, rassure rapidement et pousse à l'activation.",
        },
      ],
      en: [
        {
          title: 'Branding & visual system',
          body: 'A visual foundation was created to support the product narrative and establish launch-ready codes.',
        },
        {
          title: 'Conversion landing',
          body: 'A landing page was built to explain the benefit, reassure quickly and drive activation.',
        },
      ],
    },
  },
  {
    slug: 'souji-nova',
    i18nKey: 'souji_nova',
    title: 'Souji Nova',
    categories: ['landing-page'],
    image: '/img/project/souji-nova-desktop.png',
    externalLink: 'https://soujinova.fr/',
    verified: true,
    testimonial: {
      name: 'Nelson M.',
      avatar: '/img/testimonials/nelson-souji-nova.jpg',
    },
    screenshots: {
      desktop: [
        '/img/project/souji-nova-desktop.png',
        '/img/project/souji-nova-section.png',
      ],
      mobile: [
        '/img/project/souji-nova-desktop.png',
      ],
    },
    summary: {
      fr: "Souji Nova avait besoin d'une landing claire et rassurante pour transformer plus efficacement des visiteurs en demandes de devis.",
      en: 'Souji Nova needed a clear and reassuring landing page to turn more visitors into quote requests.',
    },
    aboutCompany: {
      fr: "Société de nettoyage à destination des particuliers et professionnels. Le sujet principal était de rassurer rapidement et de structurer une offre simple à comprendre.",
      en: 'A cleaning company serving both consumers and businesses. The main challenge was to reassure quickly and structure the offer so it felt easy to understand.',
    },
    industry: {
      fr: 'Services de nettoyage',
      en: 'Cleaning services',
    },
    companySize: '1 - 10',
    supportBullets: {
      fr: [
        'Offre plus claire',
        'Image plus rassurante',
        'Parcours de demande simplifié',
      ],
      en: [
        'Clearer offer',
        'More reassuring image',
        'Simpler request flow',
      ],
    },
    context: {
      fr: "Le marché demande de la confiance immédiate. Le site devait donc être simple, propre et efficace pour convaincre sans trop de friction.",
      en: 'This market requires immediate trust. The site had to feel simple, clean and effective to convert without unnecessary friction.',
    },
    solution: {
      fr: "Nous avons conçu une landing orientée conversion avec une offre mieux segmentée, des messages rassurants et des points d'entrée clairs.",
      en: 'We designed a conversion-focused landing page with a better segmented offer, reassuring messaging and clear entry points.',
    },
    challenges: {
      fr: [
        'Installer la confiance très vite',
        'Clarifier les services proposés',
        'Mieux orienter vers la prise de contact',
      ],
      en: [
        'Build trust very quickly',
        'Clarify the services offered',
        'Guide users toward contact more efficiently',
      ],
    },
    objectives: {
      fr: [
        'Générer plus de demandes entrantes',
        'Mieux distinguer les profils de clients',
        "Améliorer la compréhension de l'offre",
      ],
      en: [
        'Generate more inbound requests',
        'Differentiate client profiles more clearly',
        'Improve understanding of the offer',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Réassurance & contenu',
          body: 'Travail sur les messages, la lisibilité des services et les preuves qui aident à se projeter.',
        },
        {
          title: 'Optimisation conversion',
          body: 'CTA, structure et enchaînement des sections ont été ajustés pour réduire les hésitations.',
        },
      ],
      en: [
        {
          title: 'Reassurance & content',
          body: 'Messaging, service clarity and proof points were refined to help visitors trust the company faster.',
        },
        {
          title: 'Conversion optimization',
          body: 'CTA placement, structure and section flow were adjusted to reduce hesitation.',
        },
      ],
    },
  },
  {
    slug: 'ra-energy',
    i18nKey: 'ra_energy',
    title: 'R&A Energy',
    categories: ['branding', 'landing-page'],
    image: '/img/project/ra-energy-.png',
    externalLink: 'https://ra-energy.fr/',
    verified: true,
    testimonial: {
      name: 'Yazid C.',
      avatar: '/img/testimonials/yazid-ra-energy.jpeg',
    },
    screenshots: {
      desktop: [
        '/img/project/ra-energy-.png',
        '/img/project/hero-raenergy.png',
        '/img/project/how-it-work-ra.png',
        '/img/project/logo-raenergy.png',
      ],
      mobile: [
        '/img/project/ra-energy-.png',
      ],
    },
    summary: {
      fr: "R&A Energy voulait un site plus premium pour mieux porter son expertise, rassurer les entreprises et fluidifier la prise de contact.",
      en: 'R&A Energy wanted a more premium website to better convey expertise, reassure companies and streamline contact requests.',
    },
    aboutCompany: {
      fr: "Courtier en énergie pour professionnels avec une offre parfois complexe à expliquer. L'enjeu était de simplifier sans perdre la perception d'expertise.",
      en: 'An energy broker serving professionals with an offer that can be complex to explain. The challenge was to simplify without losing expert positioning.',
    },
    industry: {
      fr: 'Courtage en énergie',
      en: 'Energy brokerage',
    },
    companySize: '10 - 20',
    supportBullets: {
      fr: [
        'Image plus haut de gamme',
        'Discours simplifié',
        'Prise de contact plus fluide',
      ],
      en: [
        'More premium image',
        'Simplified messaging',
        'Smoother lead capture',
      ],
    },
    context: {
      fr: "Le sujet était très business et demandait un cadrage fort pour être compris rapidement. Le site devait aussi soutenir un discours de confiance sur un marché sensible.",
      en: 'The topic was business-heavy and required strong framing to be understood quickly. The website also needed to support a trust-based message in a sensitive market.',
    },
    solution: {
      fr: "Nous avons construit une landing plus premium avec un branding plus propre, une offre simplifiée et un parcours orienté prise de rendez-vous.",
      en: 'We built a more premium landing page with cleaner branding, a simplified offer and a journey focused on booking calls.',
    },
    challenges: {
      fr: [
        'Sujet perçu comme technique et parfois opaque',
        'Besoin de rassurer des profils B2B exigeants',
        'Structurer un parcours très commercial sans être agressif',
      ],
      en: [
        'The topic felt technical and sometimes opaque',
        'Need to reassure demanding B2B profiles',
        'Structure a highly commercial journey without feeling pushy',
      ],
    },
    objectives: {
      fr: [
        'Donner une image plus crédible et premium',
        'Rendre la proposition plus facile à comprendre',
        'Encourager la prise de rendez-vous',
      ],
      en: [
        'Create a more credible and premium image',
        'Make the value proposition easier to understand',
        'Encourage meeting bookings',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Branding & interface',
          body: "Refonte de l'identité visuelle de la page pour gagner en clarté, en qualité perçue et en professionnalisme.",
        },
        {
          title: 'Copywriting & structure',
          body: 'Simplification du discours et meilleure hiérarchie des sections pour soutenir la conversion.',
        },
      ],
      en: [
        {
          title: 'Branding & interface',
          body: 'The page visual identity was redesigned to increase clarity, perceived quality and professionalism.',
        },
        {
          title: 'Copywriting & structure',
          body: 'Messaging was simplified and sections were reorganized to support conversion.',
        },
      ],
    },
  },
  {
    slug: 'mc-studio-creator',
    i18nKey: 'mc_studio_creator',
    title: 'MC Studio Creator',
    categories: ['branding', 'landing-page'],
    image: '/img/project/mc-studio-creator/cover.png',
    externalLink: 'https://mc-studio.eu',
    verified: true,
    screenshots: {
      desktop: [
        '/img/project/mc-studio-creator/cover.png',
        '/img/project/mc-studio-creator/website-dark.png',
        '/img/project/mc-studio-creator/logo-wordmark.png',
        '/img/project/mc-studio-creator/typography.png',
      ],
      mobile: [
        '/img/project/mc-studio-creator/sign-logo.png',
        '/img/project/mc-studio-creator/billboard-logo.png',
      ],
    },
    summary: {
      fr: "MC Studio Creator est notre verticale dédiée aux créateurs de contenu. Nous avons construit la marque et le site de A à Z : identité visuelle, direction artistique et landing page pensée pour les créateurs qui veulent une application sur mesure pour leur communauté.",
      en: 'MC Studio Creator is our vertical dedicated to content creators. We built the brand and the website end to end: visual identity, art direction and a landing page designed for creators who want a custom app for their community.',
    },
    aboutCompany: {
      fr: "MC Studio Creator est la branche de MC Studio consacrée aux créateurs de contenu. Nous leur concevons des applications sur mesure destinées à leur communauté : un espace qui leur appartient vraiment, plutôt qu'une audience qui dépend uniquement des réseaux sociaux.",
      en: 'MC Studio Creator is the MC Studio branch dedicated to content creators. We build them custom apps for their community: a space they truly own, instead of an audience that depends only on social platforms.',
    },
    industry: {
      fr: 'Créateurs de contenu',
      en: 'Content creators',
    },
    companySize: '1 - 10',
    supportBullets: {
      fr: [
        'Une marque propre à la verticale créateurs',
        'Un discours qui parle aux créateurs',
        'Une landing pensée pour la prise de contact',
      ],
      en: [
        'A brand of its own for the creator vertical',
        'Messaging that speaks to creators',
        'A landing page built for lead capture',
      ],
    },
    context: {
      fr: "Les créateurs de contenu n'ont pas les mêmes attentes que nos clients B2B classiques : ils raisonnent en communauté, en univers de marque et en produit, et ce qu'on leur livre n'est pas un site mais une application sur mesure. Parler de la même façon aux deux publics diluait le message, il fallait donc une verticale avec son propre positionnement et sa propre identité.",
      en: "Content creators do not have the same expectations as our classic B2B clients: they think in terms of community, brand universe and product, and what we deliver to them is not a website but a custom app. Speaking to both audiences the same way diluted the message, so the vertical needed its own positioning and identity.",
    },
    solution: {
      fr: "Nous avons créé le branding complet de la verticale : logo, système de couleurs violet, typographies Helvetica et Inter, textures et déclinaisons. Nous avons ensuite développé la landing page dédiée, avec un discours centré sur les créateurs de contenu et l'application sur mesure que l'on construit pour leur communauté.",
      en: 'We created the full branding for the vertical: logo, purple color system, Helvetica and Inter typography, textures and applications. We then built the dedicated landing page, with messaging centered on content creators and the custom app we build for their community.',
    },
    challenges: {
      fr: [
        'Créer une identité distincte sans casser la marque MC Studio',
        "Adresser les créateurs de contenu avec leurs propres codes",
        "Rendre concrète l'idée d'une application sur mesure pour une communauté",
      ],
      en: [
        'Create a distinct identity without breaking the MC Studio brand',
        'Address content creators with their own codes',
        'Make the idea of a custom app for a community feel concrete',
      ],
    },
    objectives: {
      fr: [
        'Poser une verticale claire dédiée aux créateurs de contenu',
        "Expliquer la valeur d'une application sur mesure pour leur communauté",
        'Générer des demandes qualifiées de créateurs',
      ],
      en: [
        'Establish a clear vertical dedicated to content creators',
        'Explain the value of a custom app for their community',
        'Generate qualified requests from creators',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Branding de la verticale',
          body: "Création du logo, du système chromatique violet, des typographies (Helvetica / Inter) et des déclinaisons de marque, du signalétique aux visuels de communication.",
        },
        {
          title: 'Landing page créateurs',
          body: "Conception et développement d'une landing dédiée : promesse claire dès le premier écran, cas d'usage d'applications créateurs, preuves et parcours orienté prise de rendez-vous.",
        },
      ],
      en: [
        {
          title: 'Vertical branding',
          body: 'Logo, purple color system, typography (Helvetica / Inter) and brand applications were created, from signage to communication visuals.',
        },
        {
          title: 'Creator landing page',
          body: 'A dedicated landing page was designed and built: a clear promise on the first screen, creator app use cases, proof points and a journey focused on booking calls.',
        },
      ],
    },
  },
  {
    slug: 'fontaines-vtc',
    i18nKey: 'fontaines_vtc',
    title: 'Fontaines VTC',
    categories: ['landing-page'],
    image: '/img/project/fontaines-vtc-dark.jpeg',
    externalLink: 'https://fontaines-vtc.fr/',
    verified: true,
    testimonial: {
      name: 'Mario C.',
      avatar: '/img/testimonials/mario-fontaines-vtc.png',
    },
    screenshots: {
      desktop: [
        '/img/project/fontaines-vtc-dark.jpeg',
      ],
      mobile: [
        '/img/project/fontaines-vtc-dark.jpeg',
      ],
    },
    summary: {
      fr: "Fontaines VTC cherchait à gagner en visibilité locale et à capter davantage de réservations grâce à une présence web plus lisible.",
      en: 'Fontaines VTC wanted to improve local visibility and capture more bookings through a clearer web presence.',
    },
    aboutCompany: {
      fr: "Service de transport privé avec enjeu local fort. Le travail a porté sur la lisibilité, le SEO et l'efficacité des appels à l'action.",
      en: 'A private transportation service with strong local acquisition needs. The work focused on clarity, SEO and CTA efficiency.',
    },
    industry: {
      fr: 'Transport privé',
      en: 'Private transportation',
    },
    companySize: '1 - 10',
    supportBullets: {
      fr: [
        'SEO local renforcé',
        'CTA plus visibles',
        'Parcours plus direct vers la réservation',
      ],
      en: [
        'Stronger local SEO',
        'More visible CTAs',
        'More direct route to booking',
      ],
    },
    context: {
      fr: "Le besoin était moins de réimaginer totalement l'image que de rendre le site plus performant pour un usage concret : être trouvé et être contacté.",
      en: 'The need was less about fully reinventing the brand and more about making the website perform for a clear business goal: being found and contacted.',
    },
    solution: {
      fr: "Optimisation des points de contact, meilleure mise en avant des CTA et ajustements SEO pour soutenir la prise de réservation.",
      en: 'Contact points were optimized, CTAs were made more visible and SEO improvements supported booking intent.',
    },
    challenges: {
      fr: [
        'Visibilité locale à renforcer',
        'Parcours de réservation à simplifier',
        "Besoin d'une présence digitale plus efficace",
      ],
      en: [
        'Local visibility needed improvement',
        'Booking journey had to be simplified',
        'A more effective digital presence was needed',
      ],
    },
    objectives: {
      fr: [
        'Améliorer le trafic local qualifié',
        'Générer plus de prises de contact',
        'Rendre la réservation plus intuitive',
      ],
      en: [
        'Improve qualified local traffic',
        'Generate more contact requests',
        'Make booking more intuitive',
      ],
    },
    actions: {
      fr: [
        {
          title: 'Optimisation SEO',
          body: 'Ajustements de structure et de contenus pour mieux ressortir localement sur les recherches pertinentes.',
        },
        {
          title: 'CTA & conversion',
          body: "Repositionnement des appels à l'action pour rendre la prise de réservation plus immédiate.",
        },
      ],
      en: [
        {
          title: 'SEO optimization',
          body: 'Structure and content were adjusted to improve local visibility on relevant searches.',
        },
        {
          title: 'CTA & conversion',
          body: 'Calls to action were repositioned to make booking more immediate.',
        },
      ],
    },
  },
]

export function findProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
