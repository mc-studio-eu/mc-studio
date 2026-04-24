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
  key: 'creator'
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
    key: 'creator',
    slug: 'creator',
    icon: 'i-heroicons-sparkles',
    featured: true,
    heroTitle: {
      fr: 'Passer du contenu à un vrai produit digital.',
      en: 'Turn an audience into a real digital product.',
    },
    heroSummary: {
      fr: 'Nous aidons les créateurs de contenu à transformer leur audience, leur expertise ou leur communauté en application web ou mobile utile, cohérente et monétisable, du concept jusqu’au lancement.',
      en: 'We help content creators turn their audience, expertise, or community into a useful, coherent, and monetizable web or mobile app, from concept to launch.',
    },
    profileLabel: {
      fr: 'Profil',
      en: 'Profile',
    },
    profileValue: {
      fr: 'Créateurs de contenu avec une audience, une expertise ou une communauté engagée',
      en: 'Content creators with an audience, expertise, or an engaged community',
    },
    timeframeLabel: {
      fr: 'Focus',
      en: 'Focus',
    },
    timeframeValue: {
      fr: 'Produit utile, expérience soignée, lancement clair',
      en: 'Useful product, polished experience, clean launch',
    },
    investmentLabel: {
      fr: 'Résultat',
      en: 'Outcome',
    },
    investmentValue: {
      fr: 'Créer un actif digital qui renforce la valeur, la rétention et la monétisation',
      en: 'Build a digital asset that supports value, retention, and monetization',
    },
    fitBullets: {
      fr: [
        'Donner une vraie utilité à son audience',
        'Transformer son univers en expérience digitale soignée',
        'Créer une nouvelle source de revenus plus durable',
      ],
      en: [
        'Give more value to an audience',
        'Turn a creator universe into a polished digital experience',
        'Create a more durable revenue stream',
      ],
    },
    challenges: {
      fr: [
        'Transformer une audience en produit sans perdre la cohérence de la marque personnelle',
        'Créer quelque chose de vraiment utile, pas seulement séduisant sur le papier',
        'Sortir d’une dépendance trop forte aux plateformes et aux revenus ponctuels',
      ],
      en: [
        'Turn an audience into a product without losing brand coherence',
        'Build something genuinely useful, not just appealing in theory',
        'Reduce dependence on platforms and one-off revenue streams',
      ],
    },
    objectives: {
      fr: [
        'Aligner produit, image et audience',
        'Lancer une application claire, désirable et bien pensée',
        'Créer une monétisation plus durable autour de la communauté',
      ],
      en: [
        'Align product, image and audience',
        'Launch an app that feels clear, desirable, and well structured',
        'Create a more durable monetization layer around the community',
      ],
    },
    deliverables: {
      fr: [
        {
          title: 'Stratégie produit',
          description: 'Clarification du concept, du besoin utilisateur, du format de produit et de la logique de monétisation.',
        },
        {
          title: 'Design produit',
          description: 'Direction artistique, UX/UI, structure de l’expérience et interfaces pensées pour une communauté réelle.',
        },
        {
          title: 'Développement',
          description: 'Développement front-end et back-end, paiements, gestion des utilisateurs, contenu et infrastructure technique.',
        },
        {
          title: 'Lancement',
          description: 'Tests, mise en ligne, finitions et accompagnement au lancement pour sortir un produit crédible et prêt à être utilisé.',
        },
      ],
      en: [
        {
          title: 'Product strategy',
          description: 'Clarifying the concept, user need, product format, and monetization logic before anything gets built.',
        },
        {
          title: 'Product design',
          description: 'Art direction, UX/UI, product structure, and interfaces designed to feel clear and easy to use.',
        },
        {
          title: 'Development',
          description: 'Front-end and back-end development, payments, user systems, content flows, and technical foundations.',
        },
        {
          title: 'Launch',
          description: 'Testing, deployment, final polish, and launch support so the product goes live with clarity.',
        },
      ],
    },
    process: {
      fr: [
        {
          title: '1. Clarifier le concept',
          body: 'Nous cadrons l’opportunité produit à partir de votre audience, de votre univers et de ce qui mérite vraiment d’être transformé en application.',
        },
        {
          title: '2. Designer le produit',
          body: 'Nous structurons l’expérience, les écrans et la direction visuelle pour obtenir une application claire, soignée et cohérente.',
        },
        {
          title: '3. Développer proprement',
          body: 'Nous construisons le produit de bout en bout avec les bonnes bases techniques pour les utilisateurs, le contenu et la monétisation.',
        },
        {
          title: '4. Lancer',
          body: 'Nous finalisons, testons et mettons l’application en ligne pour qu’elle soit prête à accueillir de vrais utilisateurs dès le premier jour.',
        },
      ],
      en: [
        {
          title: '1. Clarify the concept',
          body: 'We frame the right product opportunity from your audience, your universe, and what is worth turning into an app.',
        },
        {
          title: '2. Design the product',
          body: 'We shape the flows, screens, and visual direction so the product feels clear, polished, and coherent.',
        },
        {
          title: '3. Build it properly',
          body: 'We build the product end to end with the right technical foundations for users, content, and monetization.',
        },
        {
          title: '4. Launch',
          body: 'We test, polish, and put the app online so it is ready for real users from day one.',
        },
      ],
    },
  },
]

export function findOfferBySlug(slug: string): OfferData | undefined {
  return offers.find((offer) => offer.slug === slug)
}
