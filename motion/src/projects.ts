/**
 * Curated portfolio entries for the reel.
 * Mirrors app/data/projects.ts (slug, title, url, category) so the video and
 * the site always tell the same story — only the visuals are picked for motion.
 */
export type Showcase = {
  slug: string
  title: string
  url: string
  industry: string
  tags: string[]
  desktop: string
  mobile?: string
  /** Second écran, affiché en carte décalée quand le projet n'a pas de shot mobile. */
  secondary?: string
}

export const showcase: Showcase[] = [
  {
    slug: 'personal',
    title: 'Personal',
    url: 'usepersonal.app',
    industry: 'SaaS IA pour créateurs',
    tags: ['Branding', 'Landing', 'App'],
    desktop: 'img/project/personal/hero.png',
    mobile: 'img/project/live-screens/personal.jpg',
  },
  {
    slug: 'crm-ra-energy',
    title: 'CRM R&A Energy',
    url: 'ra-energy.fr',
    industry: 'Courtage en énergie',
    tags: ['Produit', 'App métier'],
    desktop: 'img/project/crm-ra/crm-dashboard.png',
    mobile: 'img/project/crm-ra/crm-mobile-dashboard.png',
  },
  {
    slug: 'maison-awl',
    title: 'Maison AWL',
    url: 'app.maisonawl.com',
    industry: 'Marketplace de services',
    tags: ['Produit', 'App'],
    desktop: 'img/project/maison-awl/desktop-mockup.png',
    mobile: 'img/project/maison-awl/mobile-mockup.png',
  },
  {
    slug: 'shika-consulting',
    title: 'Shika Consulting',
    url: 'shika-consulting.fr',
    industry: 'Expertise comptable associative',
    tags: ['Landing page', 'Copywriting'],
    desktop: 'img/project/shika-consulting/homepage.webp',
    mobile: 'img/project/live-screens/shika-consulting.png',
  },
  {
    slug: 'arises',
    title: 'Arises',
    url: 'arises.app',
    industry: 'SaaS IA',
    tags: ['Branding', 'Landing', 'App'],
    desktop: 'img/project/arises-saas.png',
    secondary: 'img/project/arises-login.png',
  },
  {
    slug: 'souji-nova',
    title: 'Souji Nova',
    url: 'soujinova.fr',
    industry: 'Services de nettoyage',
    tags: ['Landing page', 'Conversion'],
    desktop: 'img/project/souji-nova-desktop.png',
  },
  {
    slug: 'ra-energy',
    title: 'R&A Energy',
    url: 'ra-energy.fr',
    industry: 'Courtage en énergie',
    tags: ['Branding', 'Landing'],
    desktop: 'img/project/ra-energy-v2.png',
    mobile: 'img/project/live-screens/ra-energy.png',
  },
  {
    slug: 'amg-promotion',
    title: 'AMG Promotion',
    url: 'amgprom.com',
    industry: 'Produits promotionnels',
    tags: ['Landing page'],
    desktop: 'img/project/amgprom.png',
  },
  {
    slug: 'fontaines-vtc',
    title: 'Fontaines VTC',
    url: 'fontaines-vtc.fr',
    industry: 'Transport privé',
    tags: ['Landing page'],
    desktop: 'img/project/fontaines-vtc-dark.jpeg',
    mobile: 'img/project/live-screens/fontaines-vtc.png',
  },
  {
    slug: 'mc-studio-creator',
    title: 'MC Studio Creator',
    url: 'mc-studio.eu',
    industry: 'Créateurs de contenu',
    tags: ['Branding', 'Landing'],
    desktop: 'img/project/mc-studio-creator/website-dark.png',
  },
]

/** The four projects that get a full hero moment in the reel. */
export const featured = ['personal', 'crm-ra-energy', 'arises', 'shika-consulting'].map(
  (slug) => showcase.find((p) => p.slug === slug)!,
)
