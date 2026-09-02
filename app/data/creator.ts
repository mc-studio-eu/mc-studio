export type TextBlock = {
  type: 'text'
  title: string
  body: string
  layout?: 'full' | 'split'
}

export type ImageBlock = {
  type: 'image'
  src: string
  alt: string
  width?: 'narrow' | 'wide' | 'full'
  rounded?: boolean
}

export type DeliverablesBlock = {
  type: 'deliverables'
  title?: string
  items: string[]
}

export type SplitBlock = {
  type: 'split'
  columns: TextBlock[]
}

export type CaseStudyBlock = TextBlock | ImageBlock | DeliverablesBlock | SplitBlock

export type CaseStudy = {
  slug: string
  title: string
  audience: string
  category: string
  summaryTitle: string
  summary: string
  aboutTitle: string
  about: string
  heroImage: string
  projectUrl?: string
  blocks: CaseStudyBlock[]
}

const sharedImages = {
  heroImage: '/assets/creator/maison-awl-cover.png',
  instagram: '/assets/creator/maison-awl-insta.png',
  landing: '/assets/creator/maison-awl-landing.png',
  desktop: '/assets/creator/desktop-app.png',
  mobile: '/assets/creator/mobile.svg'
}

const caseStudiesByLocale: Record<'fr' | 'en', CaseStudy[]> = {
  fr: [
    {
      slug: 'maison-awl',
      title: 'Maison AWL',
      audience: '+180k abonnés',
      category: 'Plateforme de mise en relation',
      summaryTitle: 'Résumé',
      summary:
        "Maison AWL est l'univers créé par Célia autour du home organising sur les réseaux sociaux. Nous avons conçu une plateforme de mise en relation permettant à sa communauté d'accéder à des prestataires formés à sa méthode.",
      aboutTitle: 'À propos',
      about:
        "Derrière Maison AWL, il y a Célia : elle partage son expertise du rangement et de l'organisation intérieure à une communauté engagée, tout en formant des prestataires à son métier et à ses standards de service.",
      heroImage: sharedImages.heroImage,
      blocks: [
        {
          type: 'image',
          src: sharedImages.instagram,
          alt: 'Compte Instagram Maison AWL',
          width: 'wide'
        },
        {
          type: 'text',
          title: 'Contexte & enjeux',
          body: "Célia recevait une demande grandissante de sa communauté pour accéder à des prestations de home organising, pendant qu'elle formait de plus en plus de personnes à son métier via Maison AWL. L'enjeu était de transformer cette dynamique en une expérience simple et rassurante, capable de connecter les bonnes demandes aux bons prestataires sans perdre la qualité, la confiance et l'univers de marque déjà installés."
        },
        {
          type: 'image',
          src: sharedImages.landing,
          alt: 'Page d’accueil Maison AWL',
          width: 'wide'
        },
        {
          type: 'text',
          title: 'Objectifs',
          body: "L'objectif de la plateforme était de créer un point de rencontre clair entre deux audiences : d'un côté, une communauté qui cherche des services d'organisation à domicile ; de l'autre, des prestataires formés par Maison AWL et prêts à intervenir."
        },
        {
          type: 'image',
          src: sharedImages.desktop,
          alt: 'Application Maison AWL sur ordinateur',
          width: 'wide'
        },
        {
          type: 'text',
          title: 'Résultats',
          body: "Nous avons développé une plateforme complète autour de l'activité de Maison AWL, capable de transformer sa communauté et son réseau de prestataires formés en un véritable écosystème de service. Tout le parcours a été pensé pour Maison AWL : dépôt de demande, qualification du besoin, mise en relation avec les bons prestataires, échanges et suivi des projets. Nous nous sommes occupés de toute l'expérience, de la direction artistique à la structure produit, afin de prolonger son univers."
        },
        {
          type: 'image',
          src: sharedImages.mobile,
          alt: 'Écrans mobiles de la plateforme Maison AWL',
          width: 'wide'
        }
      ]
    }
  ],
  en: [
    {
      slug: 'maison-awl',
      title: 'Maison AWL',
      audience: '180k+ followers',
      category: 'Service marketplace',
      summaryTitle: 'Overview',
      summary:
        "Maison AWL is Célia's home-organising universe on social media. We designed a service marketplace that gives her community access to professionals trained in her method.",
      aboutTitle: 'About',
      about:
        'Behind Maison AWL is Célia, who shares her home-organising expertise with an engaged community while training professionals in her craft and service standards.',
      heroImage: sharedImages.heroImage,
      blocks: [
        {
          type: 'image',
          src: sharedImages.instagram,
          alt: 'Maison AWL Instagram account',
          width: 'wide'
        },
        {
          type: 'text',
          title: 'Context & challenges',
          body: "Célia's community increasingly wanted access to home-organising services, while she was training more and more professionals through Maison AWL. The challenge was to turn that momentum into a simple, reassuring experience that could match the right requests with the right professionals without losing the quality, trust and brand universe she had already established."
        },
        {
          type: 'image',
          src: sharedImages.landing,
          alt: 'Maison AWL landing page',
          width: 'wide'
        },
        {
          type: 'text',
          title: 'Objectives',
          body: 'The platform needed to create a clear meeting point between two audiences: a community looking for in-home organising services, and professionals trained by Maison AWL who were ready to help.'
        },
        {
          type: 'image',
          src: sharedImages.desktop,
          alt: 'Maison AWL desktop application',
          width: 'wide'
        },
        {
          type: 'text',
          title: 'Results',
          body: "We developed a complete platform around Maison AWL's business, turning its community and network of trained professionals into a genuine service ecosystem. The entire journey was designed for Maison AWL: submitting a request, qualifying the need, matching clients with the right professionals, communicating and tracking projects. We shaped the whole experience, from art direction to product structure, so it would feel like a natural extension of the brand."
        },
        {
          type: 'image',
          src: sharedImages.mobile,
          alt: 'Maison AWL platform mobile screens',
          width: 'wide'
        }
      ]
    }
  ]
}

const resolveLocale = (locale: string): 'fr' | 'en' => (locale === 'en' ? 'en' : 'fr')

export const getCaseStudies = (locale: string) => caseStudiesByLocale[resolveLocale(locale)]

export const getCaseStudyBySlug = (slug: string, locale: string) =>
  getCaseStudies(locale).find((caseStudy) => caseStudy.slug === slug)
