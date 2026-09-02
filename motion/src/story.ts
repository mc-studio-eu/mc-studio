/**
 * La matière humaine du film : de vraies personnes, leurs vrais mots.
 * Les avis sont ceux publiés sur le site (i18n/locales/fr.json), les
 * problématiques sont les `challenges` documentés dans app/data/projects.ts.
 * Rien n'est inventé ni remis dans la bouche de quelqu'un.
 */

export type Person = {
  name: string
  role: string
  photo: string
}

export const people: Person[] = [
  { name: 'Yazid', role: 'Co-fondateur, R&A Energy', photo: 'img/testimonials/yazid-ra-energy.jpeg' },
  { name: 'Nelson', role: 'Co-fondateur, Souji Nova', photo: 'img/testimonials/nelson-souji-nova.jpg' },
  { name: 'Mario', role: 'Dirigeant, Fontaines VTC', photo: 'img/testimonials/mario-fontaines-vtc.png' },
  { name: 'Pierre-Jean', role: 'Fondateur, AMG Promotion', photo: 'img/testimonials/pierre jean.jpg' },
]

/** Ce que les clients apportent en arrivant — leurs problématiques réelles. */
export const struggles: { text: string; client: string }[] = [
  { text: 'Remplacer des habitudes Excel par un outil adopté par tous', client: 'R&A Energy' },
  { text: 'Image de marque trop générique', client: 'AMG Promotion' },
  { text: 'Visibilité locale à renforcer', client: 'Fontaines VTC' },
  { text: 'Installer la confiance très vite', client: 'Souji Nova' },
  { text: 'Rendre accessible une expertise très spécialisée', client: 'Shika Consulting' },
  { text: 'Poser une image de produit crédible dès le lancement', client: 'Arises' },
]

/** Avis Google publié, cité mot pour mot. */
export const testimonial = {
  quote:
    "MC Studio a réalisé notre site internet et le résultat est excellent. Travail rapide, professionnel et très soigné.",
  person: people[0],
}
