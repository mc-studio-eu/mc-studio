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
  /** Screenshots shown on the detail page (desktop / mobile toggle). Case study copy lives in `caseStudies.ts`. */
  screenshots: ProjectScreenshots
}

export const projects: Project[] = [
  {
    "slug": "sotraya",
    "i18nKey": "sotraya",
    "title": "Sotraya",
    "categories": [
      "landing-page"
    ],
    "image": "/img/project/sotraya/hero.png",
    "externalLink": "https://sotraya.vercel.app/",
    "verified": true,
    "screenshots": {
      "desktop": [
        "/img/project/sotraya/hero.png",
        "/img/project/sotraya/about.png",
        "/img/project/sotraya/services.png",
        "/img/project/sotraya/brand.png"
      ],
      "mobile": []
    },
  },
  {
    slug: 'personal',
    i18nKey: 'personal',
    title: 'Personal',
    categories: ['branding', 'landing-page', 'app'],
    image: '/img/project/personal/hero.png',
    externalLink: 'https://usepersonal.app/',
    verified: true,
    screenshots: {
      desktop: [
        '/img/project/personal/hero.png',
        '/img/project/personal/login.webp',
        '/img/project/personal/feed.webp',
        '/img/project/personal/closing.webp',
      ],
      mobile: [],
    },
  },
  {
    slug: 'maison-awl',
    i18nKey: 'maison_awl',
    title: 'Maison AWL',
    categories: ['app'],
    image: '/img/project/maison-awl/desktop-mockup.png',
    externalLink: 'https://app.maisonawl.com/',
    verified: true,
    screenshots: {
      desktop: [],
      mobile: [
        '/img/project/maison-awl/mobile-mockup.png',
        '/img/project/maison-awl/instagram-profile.png',
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
    testimonial: {
      name: 'Nouri Yahi',
      avatar: '/img/testimonials/nouri-shika-consulting.png',
    },
    screenshots: {
      desktop: [
        '/img/project/shika-consulting/homepage.webp',
        '/img/project/shika-consulting/associations.webp',
        '/img/project/shika-consulting/process.webp',
        '/img/project/shika-consulting/testimonials.webp',
      ],
      mobile: [],
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
      name: 'Jean-François Fialaire',
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
  },
]

export function findProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
