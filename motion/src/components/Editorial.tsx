import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/** Fond papier du film : gris clair, très légèrement texturé. */
export const Paper: React.FC<{ tone?: string }> = ({ tone = colors.paper }) => (
  <AbsoluteFill style={{ background: tone }} />
)

/**
 * Un plan plein cadre : la capture occupe toute l'image et dérive lentement.
 * `contain` laisse respirer les planches et mockups sur le papier.
 */
export const FullBleed: React.FC<{
  src: string
  durationInFrames: number
  fit?: 'cover' | 'contain'
  focus?: string
  /** Sens du léger mouvement de caméra, pour que deux plans voisins diffèrent. */
  direction?: 1 | -1
}> = ({ src, durationInFrames, fit = 'cover', focus = 'center', direction = 1 }) => {
  const frame = useCurrentFrame()

  const zoom = interpolate(frame, [0, durationInFrames], [1.02, 1.09])
  const pan = interpolate(frame, [0, durationInFrames], [0, 14 * direction])
  const enter = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: outEase })

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: enter }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          objectPosition: focus,
          transform: `scale(${zoom}) translateX(${pan}px)`,
        }}
      />
    </AbsoluteFill>
  )
}

/**
 * La pastille de discipline, ancrée en bas à droite pendant tout le reel.
 * Le libellé bascule verticalement quand on change de discipline.
 */
export const DisciplinePill: React.FC<{ label: string; client: string }> = ({ label, client }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  // Chaque nouveau libellé remonte à sa place : on re-monte le composant via `key`.
  const rise = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp', easing: outEase })

  return (
    <div
      style={{
        position: 'absolute',
        right: width * 0.035,
        bottom: width * 0.032,
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: 999,
        background: colors.white,
        boxShadow: '0 18px 44px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        transform: `translateY(${(1 - rise) * 26}px)`,
        opacity: rise,
      }}
    >
      <div
        style={{
          padding: `${width * 0.012}px ${width * 0.022}px`,
          fontFamily: fonts.display,
          fontSize: width * 0.023,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: colors.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${width * 0.022}px`,
          background: colors.ink,
          fontFamily: fonts.body,
          fontSize: width * 0.013,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: colors.white,
          whiteSpace: 'nowrap',
        }}
      >
        {client}
      </div>
    </div>
  )
}

/** Grande phrase éditoriale, encre sur papier. */
export const Statement: React.FC<{
  children: React.ReactNode
  start?: number
  size: number
  color?: string
  align?: React.CSSProperties['textAlign']
  weight?: number
}> = ({ children, start = 0, size, color = colors.ink, align = 'center', weight = 700 }) => {
  const frame = useCurrentFrame()
  const p = interpolate(frame - start, [0, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  return (
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.04,
        letterSpacing: '-0.04em',
        color,
        textAlign: align,
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
      }}
    >
      {children}
    </div>
  )
}
