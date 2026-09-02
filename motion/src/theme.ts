/**
 * Design tokens mirrored from the MC Studio website (app/assets/css/main.css)
 * so the reel stays visually consistent with the brand.
 */
export const colors = {
  black: '#0F0F0F',
  blackDeep: '#080808',
  blackLight: '#232323',
  gold: '#F0BF6C',
  goldDeep: '#C89341',
  white: '#FFFFFF',
  grey: '#5D5D5D',
  greyLight: '#A1A1A1',
} as const

export const fonts = {
  display: '"Host Grotesk", sans-serif',
  body: 'Inter, sans-serif',
} as const

/** Video is authored at 30fps — helper to express timings in seconds. */
export const FPS = 30
export const sec = (s: number) => Math.round(s * FPS)

/** Shared easings (cubic-bezier control points for Remotion's Easing.bezier). */
export const ease = {
  /** Strong deceleration, used for text and card entrances. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Gentle in-out for camera-like movements. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Snappy overshoot-free entrance. */
  quick: [0.33, 1, 0.68, 1] as const,
}
