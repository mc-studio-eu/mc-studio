import React from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Paper } from '../components/Editorial'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/**
 * Carton de chapitre entre deux parties du reel : le nom de la voie et sa
 * promesse en une ligne. L'adresse n'apparaît qu'au carton final.
 */
export const LaneTitle: React.FC<{
  title: string
  line: string
  accent?: boolean
  durationInFrames: number
}> = ({ title, line, accent = false, durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const titleIn = interpolate(frame, [0, 26], [0, 1], { extrapolateRight: 'clamp', easing: outEase })
  const lineIn = interpolate(frame, [14, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  // Le mot avance légèrement pendant tout le plan.
  const push = interpolate(frame, [0, durationInFrames], [0, -18])

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Paper />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: width * 0.018 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: width * 0.13,
            fontWeight: 800,
            letterSpacing: '-0.05em',
            color: accent ? colors.goldDeep : colors.ink,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40 + push}px)`,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontFamily: fonts.body,
            fontSize: width * 0.021,
            color: '#4A4A4A',
            opacity: lineIn,
            transform: `translateY(${(1 - lineIn) * 20}px)`,
            textAlign: 'center',
            maxWidth: width * 0.5,
            lineHeight: 1.4,
          }}
        >
          {line}
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  )
}
