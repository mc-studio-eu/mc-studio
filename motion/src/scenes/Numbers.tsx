import React from 'react'
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Paper } from '../components/Editorial'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

export const NUMBER_LENGTH = 56

/**
 * Un chiffre plein cadre, avec son intitulé en fantôme derrière — le libellé
 * est là pour la lecture, le chiffre pour l'impact.
 */
const Stat: React.FC<{ value: string; label: string; hold: number }> = ({ value, label, hold }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const p = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp', easing: outEase })
  const out = interpolate(frame, [hold - 7, hold], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const ghost = interpolate(frame, [6, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - out }}>
      <div
        style={{
          position: 'absolute',
          fontFamily: fonts.display,
          fontSize: width * 0.058,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: colors.inkGhost,
          opacity: ghost,
          transform: `translateY(${width * 0.048}px)`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: width * 0.135,
          fontWeight: 800,
          letterSpacing: '-0.055em',
          color: colors.ink,
          opacity: p,
          transform: `scale(${0.9 + p * 0.1}) translateY(${(1 - p) * 24}px)`,
        }}
      >
        {value}
      </div>
    </AbsoluteFill>
  )
}

/** Les chiffres publiés du studio, un par plan. */
export const Numbers: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const stats = [
    { value: '20+', label: 'Projets livrés' },
    { value: '180 000', label: 'Communauté' },
    { value: '5/5', label: 'Avis Google' },
  ]

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Paper />
      {stats.map((s, i) => (
        <Sequence key={s.label} from={i * (NUMBER_LENGTH - 7)} durationInFrames={NUMBER_LENGTH}>
          <Stat value={s.value} label={s.label} hold={NUMBER_LENGTH} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
