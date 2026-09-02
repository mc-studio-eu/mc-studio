/**
 * Le fond du film est un champ de couleur vivant qui se déplace d'une scène à
 * l'autre : braise → ambre → rose → profond → chaud → lumière.
 * Chaque scène interpole entre deux palettes, donc l'image ne s'arrête jamais.
 */
export type Palette = {
  base: string
  blobs: string[]
}

export const palettes = {
  ember: { base: '#120C06', blobs: ['#F0BF6C', '#7A4B1E', '#2A1B0C'] },
  amber: { base: '#1A0F06', blobs: ['#F0BF6C', '#E0763C', '#8A3520'] },
  rose: { base: '#150809', blobs: ['#D4566A', '#F0BF6C', '#6A2440'] },
  night: { base: '#0C0906', blobs: ['#F0BF6C', '#8A5A22', '#1A1206'] },
  warm: { base: '#150F09', blobs: ['#F0BF6C', '#E09A4C', '#43290F'] },
  glow: { base: '#1E1509', blobs: ['#FFD79A', '#F0BF6C', '#A8702A'] },
  dawn: { base: '#EFEAE1', blobs: ['#F0BF6C', '#FFFFFF', '#E4D2B4'] },
} satisfies Record<string, Palette>

/** Mélange deux couleurs hex — utilisé pour faire fondre une palette dans l'autre. */
export const mixHex = (a: string, b: string, t: number): string => {
  const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const to = (x: number) => Math.round(x).toString(16).padStart(2, '0')
  return `#${to(r1 + (r2 - r1) * t)}${to(g1 + (g2 - g1) * t)}${to(b1 + (b2 - b1) * t)}`
}

export const mixPalette = (a: Palette, b: Palette, t: number): Palette => ({
  base: mixHex(a.base, b.base, t),
  blobs: a.blobs.map((c, i) => mixHex(c, b.blobs[i] ?? c, t)),
})
