export interface LocalizedField<T> {
  fr: T
  en: T
}

export interface OfferSection {
  title: string
  body: string
}

export interface OfferDeliverable {
  title: string
  description: string
}

export interface OfferData {
  key: 'entrepreneur' | 'creator' | 'enterprise'
  slug: string
  icon: string
  featured: boolean
  heroTitle: LocalizedField<string>
  heroSummary: LocalizedField<string>
  profileLabel: LocalizedField<string>
  profileValue: LocalizedField<string>
  timeframeLabel: LocalizedField<string>
  timeframeValue: LocalizedField<string>
  investmentLabel: LocalizedField<string>
  investmentValue: LocalizedField<string>
  fitBullets: LocalizedField<string[]>
  challenges: LocalizedField<string[]>
  objectives: LocalizedField<string[]>
  deliverables: LocalizedField<OfferDeliverable[]>
  process: LocalizedField<OfferSection[]>
}

export const offers: OfferData[] = [
  {
    key: 'entrepreneur',
    slug: 'entrepreneur',
    icon: 'i-heroicons-rocket-launch',
    featured: false,
    heroTitle: {
      fr: 'Une offre pour lancer vite, sans partir dans tous les sens.',
      en: 'An offer built to launch fast without going in every direction.',
    },
    heroSummary: {
      fr: "Pour les fondateurs qui ont besoin d'un cadre clair, d'une landing solide ou d'un MVP propre pour transformer une idee en vrai point de depart.",
      en: 'For founders who need a clear frame, a solid landing page or a clean MVP to turn an idea into a real starting point.',
    },
    profileLabel: {
      fr: 'Profil',
      en: 'Profile',
    },
    profileValue: {
      fr: 'Fondateurs, independants, startups early-stage',
      en: 'Founders, independents, early-stage startups',
    },
    timeframeLabel: {
      fr: 'Tempo',
      en: 'Pace',
    },
    timeframeValue: {
      fr: 'Rapide, cadre, execution concrete',
      en: 'Fast, structured, concrete execution',
    },
    investmentLabel: {
      fr: 'Approche',
      en: 'Approach',
    },
    investmentValue: {
      fr: 'Prioriser ce qui cree de la traction d abord',
      en: 'Prioritize what creates traction first',
    },
    fitBullets: {
      fr: [
        'Clarifier une idee avant de trop construire',
        'Lancer une premiere version credible',
        'Avoir un partenaire qui cadre autant qu il execute',
      ],
      en: [
        'Clarify an idea before overbuilding',
        'Launch a credible first version',
        'Work with a partner who frames as much as executes',
      ],
    },
    challenges: {
      fr: [
        'Trop d idees, pas assez de priorites',
        'Besoin d aller vite sans sacrifier la credibilite',
        'Budget et energie a concentrer sur l essentiel',
      ],
      en: [
        'Too many ideas, not enough priorities',
        'Need to move fast without losing credibility',
        'Budget and energy must stay focused on essentials',
      ],
    },
    objectives: {
      fr: [
        'Sortir vite avec une base propre',
        'Faire comprendre l offre rapidement',
        'Creer un point de contact ou un produit qui rassure',
      ],
      en: [
        'Ship fast with a clean foundation',
        'Make the offer easy to understand',
        'Create a product or touchpoint that reassures',
      ],
    },
    deliverables: {
      fr: [
        {
          title: 'Cadrage rapide',
          description: 'On simplifie le scope, le message et la priorite business avant de produire.',
        },
        {
          title: 'Landing ou MVP',
          description: 'Une premiere version qui a du sens, presentable et exploitable rapidement.',
        },
        {
          title: 'Direction claire',
          description: 'Une vision concrete de la suite pour eviter les iterations confuses.',
        },
      ],
      en: [
        {
          title: 'Fast scoping',
          description: 'We simplify scope, messaging and business priority before building.',
        },
        {
          title: 'Landing or MVP',
          description: 'A first version that is meaningful, presentable and quickly usable.',
        },
        {
          title: 'Clear direction',
          description: 'A concrete path forward to avoid confused iterations.',
        },
      ],
    },
    process: {
      fr: [
        {
          title: '1. Cadrer',
          body: 'On identifie le coeur de valeur, les objections et ce qui doit vraiment sortir maintenant.',
        },
        {
          title: '2. Designer juste',
          body: 'On construit un rendu simple, propre et credible pour soutenir la proposition de valeur.',
        },
        {
          title: '3. Mettre en ligne',
          body: 'On livre une version actionnable, pensable comme base de traction et non comme simple brouillon.',
        },
      ],
      en: [
        {
          title: '1. Frame',
          body: 'We identify the core value, the objections and what truly needs to ship now.',
        },
        {
          title: '2. Design with intent',
          body: 'We create a clean, credible output that supports the value proposition.',
        },
        {
          title: '3. Launch',
          body: 'We deliver an actionable version built as a traction base, not just a draft.',
        },
      ],
    },
  },
  {
    key: 'creator',
    slug: 'creator',
    icon: 'i-heroicons-sparkles',
    featured: true,
    heroTitle: {
      fr: 'Passer du contenu à un vrai produit digital.',
      en: 'Turn an audience into a product, app or useful experience.',
    },
    heroSummary: {
      fr: "Nous aidons les créateurs à transformer leur audience en produit digital utile et monétisable, pour sortir d'une dépendance totale aux plateformes et construire un nouvel actif plus durable.",
      en: 'We help creators turn their audience into a useful and monetizable digital product, so they are less dependent on platforms and can build a stronger long-term asset.',
    },
    profileLabel: {
      fr: 'Profil',
      en: 'Profile',
    },
    profileValue: {
      fr: 'Créateurs, influenceurs, médias, profils à forte audience',
      en: 'Creators, influencers, media brands, audience-driven profiles',
    },
    timeframeLabel: {
      fr: 'Focus',
      en: 'Focus',
    },
    timeframeValue: {
      fr: 'Audience, valeur, exécution premium',
      en: 'Audience, value, premium execution',
    },
    investmentLabel: {
      fr: 'Ambition',
      en: 'Ambition',
    },
    investmentValue: {
      fr: 'Créer un actif digital pour moins dépendre d’Instagram, TikTok ou du sponsoring',
      en: 'Build a digital asset to be less dependent on Instagram, TikTok or sponsorships',
    },
    fitBullets: {
      fr: [
        'Apporter plus de valeur à sa communauté',
        'Monétiser son audience autrement qu’avec du sponsoring',
        'Lancer une application cohérente avec son univers',
      ],
      en: [
        'Bring more value to an audience',
        'Monetize an audience beyond sponsorships',
        'Launch an app aligned with a creator universe',
      ],
    },
    challenges: {
      fr: [
        'Transformer une audience en produit sans trahir la marque personnelle',
        'Créer quelque chose d’utile, pas juste une idée séduisante sur le papier',
        'Éviter une dépendance totale aux plateformes sociales',
      ],
      en: [
        'Move from content to product without breaking brand identity',
        'Build something useful, not just appealing in theory',
        'Avoid total dependence on social platforms',
      ],
    },
    objectives: {
      fr: [
        'Aligner produit, image et audience',
        'Créer une nouvelle source de revenus plus durable',
        'Lancer une expérience claire, engageante et désirable',
      ],
      en: [
        'Align product, image and audience',
        'Create a more durable revenue stream',
        'Launch a clear and desirable experience',
      ],
    },
    deliverables: {
      fr: [
        {
          title: 'Réflexion stratégique',
          description: "Analyse de l’audience, brainstorming de concepts, étude de faisabilité, validation du besoin et réflexion sur le modèle économique.",
        },
        {
          title: 'Conception produit & design',
          description: 'Direction artistique, identité visuelle, branding, UX/UI design, parcours utilisateurs et structure des fonctionnalités.',
        },
        {
          title: 'Développement',
          description: 'Développement front-end, back-end, infrastructure technique, gestion de projet et mise en ligne.',
        },
        {
          title: 'Lancement',
          description: 'Déploiement, tests, accompagnement au lancement et conseils sur la mise en avant du produit.',
        },
      ],
      en: [
        {
          title: 'Strategic thinking',
          description: 'Audience analysis, concept brainstorming, feasibility review, need validation and business model thinking.',
        },
        {
          title: 'Product design',
          description: 'Art direction, visual identity, branding, UX/UI design, user journeys and feature structure.',
        },
        {
          title: 'Development',
          description: 'Front-end, back-end, technical infrastructure, project management and launch-ready implementation.',
        },
        {
          title: 'Launch',
          description: 'Deployment, testing, launch support and guidance on how to put the product forward.',
        },
      ],
    },
    process: {
      fr: [
        {
          title: '1. Trouver la bonne opportunité',
          body: "Avant de concevoir quoi que ce soit, nous travaillons l’idée de produit pour qu’elle soit cohérente avec la niche, l’audience et l’image du créateur.",
        },
        {
          title: '2. Donner forme au produit',
          body: 'Nous concevons une expérience engageante, claire et désirable, pensée pour la communauté et alignée avec l’univers du créateur.',
        },
        {
          title: '3. Développer sur mesure',
          body: 'Nous développons l’application selon les besoins du projet pour aboutir à un produit fiable, propre et prêt à être lancé.',
        },
        {
          title: '4. Accompagner le lancement',
          body: 'Nous allons jusqu’à la mise en ligne pour livrer une application prête à être utilisée, mise en avant et monétisée.',
        },
      ],
      en: [
        {
          title: '1. Find the right opportunity',
          body: 'Before designing anything, we work on the product idea so it fits the niche, the audience and the creator’s image.',
        },
        {
          title: '2. Shape the product',
          body: 'We design an experience that is engaging, clear and desirable for the community while staying aligned with the creator universe.',
        },
        {
          title: '3. Build it properly',
          body: 'We develop the application according to the project needs so the product is reliable, polished and ready to launch.',
        },
        {
          title: '4. Support the launch',
          body: 'We go through deployment so the app is ready to be used, promoted and monetized.',
        },
      ],
    },
  },
  {
    key: 'enterprise',
    slug: 'enterprise',
    icon: 'i-heroicons-building-office-2',
    featured: false,
    heroTitle: {
      fr: 'Des outils plus clairs pour fluidifier l operationnel et soutenir la croissance.',
      en: 'Clearer tools to streamline operations and support growth.',
    },
    heroSummary: {
      fr: "Pour les entreprises qui ont besoin d'un outil interne, d'une plateforme metier ou d'un dispositif digital plus structure et plus robuste.",
      en: 'For companies that need an internal tool, a business platform or a more structured and robust digital setup.',
    },
    profileLabel: {
      fr: 'Profil',
      en: 'Profile',
    },
    profileValue: {
      fr: 'PME, structures en croissance, equipes operationnelles',
      en: 'SMBs, growing teams, operational organizations',
    },
    timeframeLabel: {
      fr: 'Enjeu',
      en: 'Focus',
    },
    timeframeValue: {
      fr: 'Fiabilite, simplification, gain de temps',
      en: 'Reliability, simplification, time savings',
    },
    investmentLabel: {
      fr: 'Logique',
      en: 'Logic',
    },
    investmentValue: {
      fr: 'Concevoir un systeme utile au quotidien',
      en: 'Design a system that is useful every day',
    },
    fitBullets: {
      fr: [
        'Fluidifier des workflows internes',
        'Centraliser des operations dispersees',
        'Concevoir un outil metier vraiment adapte',
      ],
      en: [
        'Streamline internal workflows',
        'Centralize scattered operations',
        'Design a business tool that truly fits the organization',
      ],
    },
    challenges: {
      fr: [
        'Des process trop manuels ou fragmentes',
        'Des outils generiques qui ne collent pas au terrain',
        'Une perte de temps et de lisibilite pour les equipes',
      ],
      en: [
        'Processes are too manual or fragmented',
        'Generic tools do not fit actual operations',
        'Teams lose time and clarity every day',
      ],
    },
    objectives: {
      fr: [
        'Rendre les operations plus fluides',
        'Reduire la friction entre les equipes et les taches',
        'Avoir un systeme plus durable et mieux pense',
      ],
      en: [
        'Make operations smoother',
        'Reduce friction between teams and tasks',
        'Build a more durable, better thought-out system',
      ],
    },
    deliverables: {
      fr: [
        {
          title: 'Audit du flux actuel',
          description: 'On comprend les points de friction avant de proposer une couche de design ou de dev.',
        },
        {
          title: 'Outil sur mesure',
          description: 'On structure un back-office, une interface interne ou une plateforme adaptee au besoin reel.',
        },
        {
          title: 'Base evolutive',
          description: "Le systeme est pense pour s'ameliorer, pas seulement pour depanner un moment.",
        },
      ],
      en: [
        {
          title: 'Audit of current flow',
          description: 'We understand friction points before adding a design or development layer.',
        },
        {
          title: 'Custom tool',
          description: 'We structure a back-office, internal interface or platform tailored to the real need.',
        },
        {
          title: 'Scalable base',
          description: 'The system is designed to evolve, not just to patch a short-term issue.',
        },
      ],
    },
    process: {
      fr: [
        {
          title: '1. Cartographier',
          body: 'On regarde les etapes, les zones de friction et les enjeux metier reels.',
        },
        {
          title: '2. Simplifier',
          body: 'On enleve le bruit, on clarifie les actions utiles et on structure un parcours plus net.',
        },
        {
          title: '3. Fiabiliser',
          body: 'On livre un outil plus robuste, plus lisible et plus agreable a utiliser au quotidien.',
        },
      ],
      en: [
        {
          title: '1. Map the flow',
          body: 'We examine the steps, friction points and real business constraints.',
        },
        {
          title: '2. Simplify',
          body: 'We remove noise, clarify useful actions and structure a cleaner workflow.',
        },
        {
          title: '3. Stabilize',
          body: 'We deliver a more robust, readable and pleasant tool to use every day.',
        },
      ],
    },
  },
]

export function findOfferBySlug(slug: string): OfferData | undefined {
  return offers.find((offer) => offer.slug === slug)
}
