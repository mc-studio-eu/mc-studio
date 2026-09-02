/**
 * Le déroulé du reel : chaque plan est une capture réelle, plein cadre,
 * étiquetée par la discipline qu'elle illustre. L'ordre raconte les deux
 * voies du studio — Business d'abord, Creator ensuite.
 */
export type Lane = 'business' | 'creator'

export type Shot = {
  src: string
  /** Discipline affichée dans la pastille en bas à droite. */
  label: string
  client: string
  lane: Lane
  /** `contain` pour les planches et mockups, `cover` pour les captures pleines. */
  fit?: 'cover' | 'contain'
  /** Point d'ancrage vertical du cadrage en `cover`. */
  focus?: string
}

export const shots: Shot[] = [
  // — Business —————————————————————————————————————
  { src: 'img/project/ra-branding.png', label: 'Branding', client: 'R&A Energy', lane: 'business', fit: 'contain' },
  { src: 'img/project/shika-consulting/homepage.webp', label: 'Site web', client: 'Shika Consulting', lane: 'business', focus: 'top' },
  { src: 'img/project/souji-nova-desktop.png', label: 'Site web', client: 'Souji Nova', lane: 'business', fit: 'contain' },
  { src: 'img/project/crm-ra/crm-dashboard.png', label: 'Design produit', client: 'CRM R&A Energy', lane: 'business', focus: 'top' },
  { src: 'img/project/crm-ra/crm-planning.png', label: 'Développement', client: 'CRM R&A Energy', lane: 'business', focus: 'top' },
  { src: 'img/project/arises-saas.png', label: 'Design produit', client: 'Arises', lane: 'business', focus: 'top' },
  { src: 'img/project/amgprom.png', label: 'Site web', client: 'AMG Promotion', lane: 'business', fit: 'contain' },

  // — Creator ——————————————————————————————————————
  { src: 'img/project/maison-awl/instagram-profile.png', label: 'Communauté', client: 'Maison AWL', lane: 'creator', fit: 'contain' },
  { src: 'img/project/maison-awl/desktop-mockup.png', label: 'App créateur', client: 'Maison AWL', lane: 'creator', fit: 'contain' },
  { src: 'img/project/personal/hero.png', label: 'App créateur', client: 'Personal', lane: 'creator', focus: 'top' },
  { src: 'img/project/personal/feed.webp', label: 'Design produit', client: 'Personal', lane: 'creator', focus: 'top' },
  { src: 'img/project/mc-studio-creator/website-dark.png', label: 'Branding', client: 'MC Studio Creator', lane: 'creator', focus: 'top' },
]

export const businessShots = shots.filter((s) => s.lane === 'business')
export const creatorShots = shots.filter((s) => s.lane === 'creator')

/** Logos clients pour la barre de confiance. */
export const clientLogos = [
  { src: 'img/clients/ra-energy.svg', name: 'R&A Energy' },
  { src: 'img/clients/shika-consulting.webp', name: 'Shika Consulting' },
  { src: 'img/clients/personal.svg', name: 'Personal' },
  { src: 'img/clients/arises.svg', name: 'Arises' },
  { src: 'img/clients/souji-nova.png', name: 'Souji Nova' },
  { src: 'img/clients/fontaines-vtc.svg', name: 'Fontaines VTC' },
  { src: 'img/clients/amg-promotion.svg', name: 'AMG Promotion' },
]
