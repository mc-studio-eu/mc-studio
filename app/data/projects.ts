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

export interface Project {
  /** URL-friendly identifier: /projects/[slug] */
  slug: string
  /** i18n namespace under `projects.items.<i18nKey>` */
  i18nKey: string
  /** Display name (kept in code, not translated) */
  title: string
  /** Main cover image used in landing carousel + detail hero */
  image: string
  /** External website url */
  externalLink: string
  /** Whether the project has a verified-website style badge on the external link */
  verified?: boolean
  /** Optional testimonial — text/job come from i18n */
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
    slug: 'amg-promotion',
    i18nKey: 'amg_promotion',
    title: 'AMG Promotion',
    image: '/img/project/amgprom.png',
    externalLink: 'https://amgprom.com/',
    verified: true,
    screenshots: {
      desktop: [
        '/img/project/amgprom.png',
        '/img/project/alertes-infos.png',
        '/img/project/how-it-work-ra.png',
      ],
      mobile: [
        '/img/project/amgprom.png',
      ],
    },
    summary: {
      fr: "AMG Promotion accompagne les marques dans la creation d'objets promotionnels sur mesure avec une image plus premium et un discours commercial plus clair.",
      en: 'AMG Promotion helps brands create custom promotional products with a more premium image and a clearer commercial message.',
    },
    aboutCompany: {
      fr: "Entreprise specialisee dans les textiles, goodies et supports personnalises pour des references nationales. L'enjeu etait de moderniser la perception tout en renforcant la lisibilite de l'offre.",
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
      fr: "Le site precedent ne mettait pas assez en valeur la qualite percue ni la diversite des prestations. Nous avons donc repense la structure pour rassurer, clarifier et donner une impression plus haut de gamme.",
      en: 'The previous website did not highlight perceived quality enough or clearly explain the breadth of the offer. We reworked the structure to reassure, clarify and create a more premium feel.',
    },
    solution: {
      fr: "Nouvelle landing page, direction artistique plus nette, hierarchie de contenu plus forte et sections pensees pour aider un prospect a comprendre vite et demander un devis.",
      en: 'A new landing page, sharper art direction, stronger content hierarchy and sections designed to help prospects understand the offer quickly and request a quote.',
    },
    challenges: {
      fr: [
        "Image de marque trop generique",
        'Offre peu structuree pour un nouveau visiteur',
        'Manque de hierarchie dans les contenus cles',
      ],
      en: [
        'Brand image felt too generic',
        'Offer was not structured enough for new visitors',
        'Key content lacked hierarchy',
      ],
    },
    objectives: {
      fr: [
        'Renforcer la credibilite des le premier ecran',
        "Mieux presenter l'offre et les cas d'usage",
        'Ameliorer la prise de contact commerciale',
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
          body: "Refonte visuelle plus premium avec une mise en page plus respirante et une meilleure hierarchie des blocs.",
        },
        {
          title: 'Structure de landing',
          body: "Reecriture et reorganisation du contenu pour guider la lecture et rendre l'offre plus immediate.",
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
      fr: "Arises est un SaaS IA concu pour transformer un calendrier en plan d'action. L'objectif etait de lancer une presence forte, claire et credible des les premiers utilisateurs.",
      en: 'Arises is an AI SaaS designed to turn a calendar into an action plan. The goal was to launch with a strong, clear and credible presence from day one.',
    },
    aboutCompany: {
      fr: "Produit SaaS en phase de lancement avec un univers digital ambitieux. Il fallait faire coexister innovation, simplicite et pedagogie dans une meme interface.",
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
      fr: "Le produit avait besoin d'une identite forte et d'un cadre visuel coherent pour expliquer un concept nouveau sans perdre l'utilisateur.",
      en: 'The product needed a strong identity and a coherent visual system to explain a new concept without losing the user.',
    },
    solution: {
      fr: "Nous avons travaille le branding, la landing et plusieurs ecrans produit pour creer une experience de lancement complete et consistante.",
      en: 'We worked on branding, landing and several product screens to create a complete and consistent launch experience.',
    },
    challenges: {
      fr: [
        'Expliquer une promesse IA de facon concrete',
        'Trouver le bon equilibre entre innovation et clarte',
        'Poser une image de produit credible des le lancement',
      ],
      en: [
        'Explain an AI promise in a concrete way',
        'Balance innovation with clarity',
        'Create a credible product image from launch',
      ],
    },
    objectives: {
      fr: [
        'Rendre la proposition de valeur immediate',
        "Donner envie d'essayer le produit",
        'Construire un univers cohérent du branding a l’UI',
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
          title: 'Branding & systeme visuel',
          body: 'Creation d une base graphique pour soutenir le discours produit et poser les codes du lancement.',
        },
        {
          title: 'Landing de conversion',
          body: "Construction d'une page qui explique le benefice, rassure rapidement et pousse a l'activation.",
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
    image: '/img/project/souji-nova-desktop.png',
    externalLink: 'https://soujinova.fr/',
    verified: true,
    testimonial: {
      name: 'Nelson M.',
      avatar: '/img/project/avis-souji-nova.jpg',
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
      fr: "Societe de nettoyage a destination des particuliers et professionnels. Le sujet principal etait de rassurer rapidement et de structurer une offre simple a comprendre.",
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
        'Parcours de demande simplifie',
      ],
      en: [
        'Clearer offer',
        'More reassuring image',
        'Simpler request flow',
      ],
    },
    context: {
      fr: "Le marche demande de la confiance immediate. Le site devait donc etre simple, propre et efficace pour convaincre sans trop de friction.",
      en: 'This market requires immediate trust. The site had to feel simple, clean and effective to convert without unnecessary friction.',
    },
    solution: {
      fr: "Nous avons concu une landing orientee conversion avec une offre mieux segmentee, des messages rassurants et des points d'entree clairs.",
      en: 'We designed a conversion-focused landing page with a better segmented offer, reassuring messaging and clear entry points.',
    },
    challenges: {
      fr: [
        'Installer la confiance tres vite',
        'Clarifier les services proposes',
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
        'Generer plus de demandes entrantes',
        'Mieux distinguer les profils de clients',
        "Ameliorer la comprehension de l'offre",
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
          title: 'Reassurance & contenu',
          body: 'Travail sur les messages, la lisibilite des services et les preuves qui aident a se projeter.',
        },
        {
          title: 'Optimisation conversion',
          body: 'CTA, structure et enchainement des sections ont ete ajustes pour reduire les hesitations.',
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
    image: '/img/project/ra-energy.png',
    externalLink: 'https://ra-energy.fr/',
    verified: true,
    testimonial: {
      name: 'Yazid C.',
      avatar: '/img/project/avis-ra-energy.jpg',
    },
    screenshots: {
      desktop: [
        '/img/project/ra-energy.png',
        '/img/project/hero-raenergy.png',
        '/img/project/how-it-work-ra.png',
        '/img/project/logo-raenergy.png',
      ],
      mobile: [
        '/img/project/ra-energy.png',
      ],
    },
    summary: {
      fr: "R&A Energy voulait un site plus premium pour mieux porter son expertise, rassurer les entreprises et fluidifier la prise de contact.",
      en: 'R&A Energy wanted a more premium website to better convey expertise, reassure companies and streamline contact requests.',
    },
    aboutCompany: {
      fr: "Courtier en energie pour professionnels avec une offre parfois complexe a expliquer. L'enjeu etait de simplifier sans perdre la perception d'expertise.",
      en: 'An energy broker serving professionals with an offer that can be complex to explain. The challenge was to simplify without losing expert positioning.',
    },
    industry: {
      fr: 'Courtage en energie',
      en: 'Energy brokerage',
    },
    companySize: '10 - 20',
    supportBullets: {
      fr: [
        'Image plus haut de gamme',
        'Discours simplifie',
        'Prise de contact plus fluide',
      ],
      en: [
        'More premium image',
        'Simplified messaging',
        'Smoother lead capture',
      ],
    },
    context: {
      fr: "Le sujet etait tres business et demandait un cadrage fort pour etre compris rapidement. Le site devait aussi soutenir un discours de confiance sur un marche sensible.",
      en: 'The topic was business-heavy and required strong framing to be understood quickly. The website also needed to support a trust-based message in a sensitive market.',
    },
    solution: {
      fr: "Nous avons construit une landing plus premium avec un branding plus propre, une offre simplifiee et un parcours oriente prise de rendez-vous.",
      en: 'We built a more premium landing page with cleaner branding, a simplified offer and a journey focused on booking calls.',
    },
    challenges: {
      fr: [
        'Sujet percu comme technique et parfois opaque',
        'Besoin de rassurer des profils B2B exigeants',
        'Structurer un parcours tres commercial sans etre agressif',
      ],
      en: [
        'The topic felt technical and sometimes opaque',
        'Need to reassure demanding B2B profiles',
        'Structure a highly commercial journey without feeling pushy',
      ],
    },
    objectives: {
      fr: [
        'Donner une image plus credible et premium',
        'Rendre la proposition plus facile a comprendre',
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
          body: "Refonte de l'identite visuelle de la page pour gagner en clarte, en qualite percue et en professionnalisme.",
        },
        {
          title: 'Copywriting & structure',
          body: 'Simplification du discours et meilleure hierarchie des sections pour soutenir la conversion.',
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
    slug: 'fontaines-vtc',
    i18nKey: 'fontaines_vtc',
    title: 'Fontaines VTC',
    image: '/img/project/fontaines-vtc-dark.jpeg',
    externalLink: 'https://fontaines-vtc.fr/',
    verified: true,
    testimonial: {
      name: 'Mario C.',
      avatar: '/img/project/avis-fontaines-vtc.jpg',
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
      fr: "Fontaines VTC cherchait a gagner en visibilite locale et a capter davantage de reservations grace a une presence web plus lisible.",
      en: 'Fontaines VTC wanted to improve local visibility and capture more bookings through a clearer web presence.',
    },
    aboutCompany: {
      fr: "Service de transport prive avec enjeu local fort. Le travail a porte sur la lisibilite, le SEO et l'efficacite des appels a l'action.",
      en: 'A private transportation service with strong local acquisition needs. The work focused on clarity, SEO and CTA efficiency.',
    },
    industry: {
      fr: 'Transport prive',
      en: 'Private transportation',
    },
    companySize: '1 - 10',
    supportBullets: {
      fr: [
        'SEO local renforce',
        'CTA plus visibles',
        'Parcours plus direct vers la reservation',
      ],
      en: [
        'Stronger local SEO',
        'More visible CTAs',
        'More direct route to booking',
      ],
    },
    context: {
      fr: "Le besoin etait moins de reimaginer totalement l'image que de rendre le site plus performant pour un usage concret : etre trouve et etre contacte.",
      en: 'The need was less about fully reinventing the brand and more about making the website perform for a clear business goal: being found and contacted.',
    },
    solution: {
      fr: "Optimisation des points de contact, meilleure mise en avant des CTA et ajustements SEO pour soutenir la prise de reservation.",
      en: 'Contact points were optimized, CTAs were made more visible and SEO improvements supported booking intent.',
    },
    challenges: {
      fr: [
        'Visibilite locale a renforcer',
        'Parcours de reservation a simplifier',
        'Besoin d une presence digitale plus efficace',
      ],
      en: [
        'Local visibility needed improvement',
        'Booking journey had to be simplified',
        'A more effective digital presence was needed',
      ],
    },
    objectives: {
      fr: [
        'Ameliorer le trafic local qualifie',
        'Generer plus de prises de contact',
        'Rendre la reservation plus intuitive',
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
          body: "Repositionnement des appels a l'action pour rendre la prise de reservation plus immediate.",
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
