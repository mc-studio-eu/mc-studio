import type { LocalizedValue } from './projects'

export interface CaseStudyLink {
  slug: string
  label: string
}

export interface CaseStudy {
  headline: string
  /** Overrides the default "Client" label, e.g. for internal projects */
  clientLabel?: string
  client: string
  problem: string
  solution: string
  /** Related case study, e.g. the two R&A Energy chapters */
  link?: CaseStudyLink
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
      headline: 'Transformer une audience de 180 000 personnes en un produit qui lui appartient.',
      client: "Maison AWL, l'univers home organizing de Célia : 180 000 abonnés et un réseau de prestataires formés à sa méthode.",
      problem: 'La demande de la communauté grandissait, mais aucun espace ne permettait de réserver, payer et garantir la qualité des prestations.',
      solution: 'Une marketplace sur mesure : recherche de prestataires, messagerie, propositions, paiement via Stripe Connect, avis et gestion des litiges.',
    },
    en: {
      headline: 'Turning an audience of 180,000 people into a product it owns.',
      client: 'Maison AWL, Célia’s home organizing world: 180,000 followers and a network of professionals trained in her method.',
      problem: 'Demand from the community kept growing, but there was no place to book, pay and guarantee the quality of each job.',
      solution: 'A custom marketplace: provider search, messaging, proposals, payments via Stripe Connect, reviews and dispute handling.',
    },
  },

  'crm-ra-energy': {
    fr: {
      headline: 'Remplacer les fichiers Excel par un CRM qui vérifie chaque rendez-vous.',
      client: 'R&A Energy, courtier en énergie B2B. Une équipe de 10 à 20 personnes, déjà cliente pour son site.',
      problem: 'Une prospection sur Excel : doublons, rendez-vous intenables faute de temps de trajet, données sensibles visibles par tous.',
      solution: 'Un CRM Nuxt + Supabase : fiches enrichies automatiquement, RDV vérifiés via Google Calendar et temps de trajet, carte des tournées, 5 rôles cloisonnés.',
      link: { slug: 'ra-energy', label: 'Voir le site R&A Energy' },
      testimonialContext: 'Sur notre premier projet ensemble',
    },
    en: {
      headline: 'Replacing spreadsheets with a CRM that checks every meeting.',
      client: 'R&A Energy, a B2B energy broker. A team of 10 to 20 people, already a client for its website.',
      problem: 'Prospecting in Excel: duplicates, meetings impossible to keep because of travel time, sensitive data visible to everyone.',
      solution: 'A Nuxt + Supabase CRM: auto-enriched records, meetings checked against Google Calendar and travel time, a route map, 5 partitioned roles.',
      link: { slug: 'ra-energy', label: 'See the R&A Energy website' },
      testimonialContext: 'On our first project together',
    },
  },

  'shika-consulting': {
    fr: {
      headline: 'Un site qui répond aux associations avant même le premier rendez-vous.',
      client: "Shika Consulting, cabinet d'expertise comptable et de commissariat aux comptes dédié aux associations, partout en France.",
      problem: 'Une expertise pointue et 14 pages de contenu : le risque était que personne ne trouve sa réponse.',
      solution: "Un site de 14 pages organisé par profil d'association, avec simulateurs, page Tarifs et un parcours direct vers le rendez-vous.",
    },
    en: {
      headline: 'A website that answers nonprofits before the first meeting.',
      client: 'Shika Consulting, an accounting and statutory audit firm dedicated to nonprofits across France.',
      problem: 'Specialist expertise and 14 pages of content: the risk was that nobody would find their answer.',
      solution: 'A 14-page website organised by nonprofit profile, with simulators, a Pricing page and a direct path to booking a meeting.',
    },
  },

  personal: {
    fr: {
      headline: 'Aider les créateurs à publier mieux, sans devenir des machines à contenu.',
      client: 'Personal, un SaaS IA pour les créateurs qui veulent publier régulièrement sans perdre leur voix.',
      problem: 'Les outils IA produisent le même contenu pour tout le monde. Pour un créateur, le générique ne crée aucun attachement.',
      solution: 'Une marque, un site et une app bilingue : feed des contenus qui performent, Remix à partir du vécu du créateur, brouillons jamais publiés sans lui.',
    },
    en: {
      headline: 'Helping creators publish better, without becoming content machines.',
      client: 'Personal, an AI SaaS for creators who want to publish consistently without losing their voice.',
      problem: 'AI tools produce the same content for everyone. For a creator, generic content builds no attachment.',
      solution: 'A brand, a website and a bilingual app: a feed of what performs, Remix built from the creator’s own life, drafts never published without them.',
    },
  },

  'amg-promotion': {
    fr: {
      headline: 'Un site au niveau de ses clients : Groupe SEB, ALTRAD, Police Nationale.',
      client: 'AMG Promotion, spécialiste des textiles, goodies et objets personnalisés pour les grands comptes.',
      problem: 'Des références solides, mais un site qui ne les montrait pas au même niveau, avec une offre difficile à parcourir.',
      solution: 'Une refonte sobre : offre organisée par catégories, références au premier plan, chemin direct vers la demande de devis.',
      testimonialHighlight: 'Efficacité et très bonne compréhension de nos attentes.',
    },
    en: {
      headline: 'A website at the level of its clients: Groupe SEB, ALTRAD, the French National Police.',
      client: 'AMG Promotion, a specialist in custom textiles, goodies and branded items for major accounts.',
      problem: 'Strong references, but a website that did not show them at the same level, with an offer that was hard to navigate.',
      solution: 'A restrained redesign: offer organised by category, references up front, a direct path to the quote request.',
      testimonialHighlight: 'Efficiency and a very good understanding of our expectations.',
    },
  },

  'ra-energy': {
    fr: {
      headline: "Rendre simple une expertise qui ne l'est pas.",
      client: "R&A Energy, courtier qui optimise les contrats d'énergie des professionnels.",
      problem: "Un marché opaque : un prospect qui ne comprend pas l'offre ne prend pas rendez-vous.",
      solution: 'Un logo, une identité et une landing qui expliquent le métier en quelques écrans et mènent au rendez-vous.',
      link: { slug: 'crm-ra-energy', label: 'Voir le CRM créé ensuite' },
      testimonialHighlight: 'Travail rapide, professionnel et très soigné.',
    },
    en: {
      headline: 'Making simple an expertise that isn’t.',
      client: 'R&A Energy, a broker that optimises energy contracts for businesses.',
      problem: 'An opaque market: a prospect who does not understand the offer does not book a meeting.',
      solution: 'A logo, an identity and a landing page that explain the job in a few screens and lead to a meeting.',
      link: { slug: 'crm-ra-energy', label: 'See the CRM we built next' },
      testimonialHighlight: 'Fast, professional and very careful work.',
    },
  },

  sotraya: {
    fr: {
      headline: "Rendre visible une offre d'automatisation qui, par nature, ne se voit pas.",
      client: 'Sotraya, fondée par Daris Rabouhi, connecte les outils des entreprises et automatise leurs tâches répétitives.',
      problem: "La valeur de l'automatisation est réelle, mais invisible. Parler d'API et d'intégrations perd le lecteur.",
      solution: 'Une landing qui montre le quotidien avant/après, déroule un onboarding automatisé et mène à un audit gratuit de 30 minutes.',
    },
    en: {
      headline: 'Making visible an automation offer that, by nature, cannot be seen.',
      client: 'Sotraya, founded by Daris Rabouhi, connects business tools and automates repetitive tasks.',
      problem: 'The value of automation is real, but invisible. Talking about APIs and integrations loses the reader.',
      solution: 'A landing page that shows the day-to-day before and after, walks through an automated onboarding and leads to a free 30-minute audit.',
    },
  },

  arises: {
    fr: {
      headline: "Un SaaS IA dont on comprend la valeur avant même de s'inscrire.",
      client: 'Arises, un SaaS IA qui transforme un calendrier chaotique en planning équilibré entre travail et vie perso.',
      problem: "Un produit IA en lancement, sans notoriété : si la valeur n'est pas claire en quelques minutes, l'utilisateur ne revient pas.",
      solution: "Une marque, une landing centrée sur l'avant/après et un parcours d'activation qui mène droit au premier planning.",
    },
    en: {
      headline: 'An AI SaaS whose value is clear before you even sign up.',
      client: 'Arises, an AI SaaS that turns a chaotic calendar into a schedule balanced between work and personal life.',
      problem: 'An AI product at launch with no reputation: if the value is not clear within minutes, users do not come back.',
      solution: 'A brand, a landing page built on the before/after, and an activation journey that leads straight to the first schedule.',
    },
  },

  'souji-nova': {
    fr: {
      headline: 'Faire de la confiance le premier levier de conversion.',
      client: 'Souji Nova, société de nettoyage pour particuliers et professionnels.',
      problem: "Dans les services, on achète d'abord de la confiance. Sans réponses rapides, le visiteur appelle le concurrent.",
      solution: 'Une landing qui répond aux doutes section par section, sépare particuliers et pros, et garde le devis toujours à portée.',
      testimonialHighlight: "De bons conseils et à l'écoute de ses clients.",
    },
    en: {
      headline: 'Making trust the first conversion lever.',
      client: 'Souji Nova, a cleaning company for households and businesses.',
      problem: 'In services, people buy trust first. Without quick answers, visitors call a competitor.',
      solution: 'A landing page that answers doubts section by section, separates households and businesses, and keeps the quote always within reach.',
      testimonialHighlight: 'Good advice and attentive to its clients.',
    },
  },

  'fontaines-vtc': {
    fr: {
      headline: 'Transformer une recherche locale en réservation.',
      client: 'Fontaines VTC, service de transport privé avec réservation en ligne.',
      problem: 'Un client qui cherche un VTC ne compare pas longtemps : il faut être trouvé, puis réservé sans friction.',
      solution: 'Un site structuré pour le SEO local, avec les infos utiles immédiatement visibles et la réservation en action principale.',
      testimonialHighlight: 'Entreprise très sérieuse et professionnelle.',
    },
    en: {
      headline: 'Turning a local search into a booking.',
      client: 'Fontaines VTC, a private transport service with online booking.',
      problem: 'Someone looking for a driver does not compare for long: you have to be found, then booked without friction.',
      solution: 'A website structured for local SEO, with useful information visible immediately and booking as the main action.',
      testimonialHighlight: 'A very serious and professional company.',
    },
  },

  'mc-studio-creator': {
    fr: {
      headline: 'Passer de prestataire pour créateurs à partenaire produit.',
      clientLabel: 'Contexte',
      client: 'MC Studio Creator, notre verticale dédiée aux créateurs qui veulent un produit pour leur communauté.',
      problem: "Une même marque pour PME et créateurs diluait le message, avec le risque d'être vu comme une agence de plus qui fait « une app ».",
      solution: 'Une identité dédiée, une thèse claire (audience → besoin → produit → lancement) et une landing avec parcours de candidature.',
      quote: "La force d'un créateur, c'est sa distribution. On transforme cette audience en utilisateurs d'un produit concret.",
    },
    en: {
      headline: 'From service provider for creators to product partner.',
      clientLabel: 'Context',
      client: 'MC Studio Creator, our vertical dedicated to creators who want a product for their community.',
      problem: 'One brand for both small businesses and creators diluted the message, with the risk of being seen as yet another agency making "an app".',
      solution: 'A dedicated identity, a clear thesis (audience → need → product → launch) and a landing page with an application journey.',
      quote: 'A creator’s strength is their distribution. We turn that audience into users of a real product.',
    },
  },
}

export function findCaseStudyBySlug(slug: string): LocalizedValue<CaseStudy> | undefined {
  return caseStudies[slug]
}
