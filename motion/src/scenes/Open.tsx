import React from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Paper, Statement } from '../components/Editorial'
import { Logo } from '../components/Logo'
import { colors, ease } from '../theme'

const outEase = Easing.bezier(...ease.out)

/**
 * Ouverture : le wordmark en filigrane, immense, et la phrase de
 * positionnement qui se pose dessus.
 */
export const Open: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const ghost = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp', easing: outEase })
  const ghostScale = interpolate(frame, [0, durationInFrames], [1.14, 1.02])
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Paper />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Logo
          width={width * 1.15}
          fill={colors.inkGhost}
          style={{ opacity: ghost * 0.85, transform: `scale(${ghostScale})` }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: `0 ${width * 0.09}px` }}>
        <Statement start={22} size={width * 0.056}>
          Un studio de design
          <br />
          et de développement.
        </Statement>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
