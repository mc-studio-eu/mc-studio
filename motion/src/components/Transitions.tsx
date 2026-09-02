import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { colors } from '../theme'

/** Quick gold flash used to punctuate a cut. */
export const CutFlash: React.FC<{ at: number; length?: number }> = ({ at, length = 7 }) => {
  const frame = useCurrentFrame()
  const p = interpolate(frame, [at - 2, at, at + length], [0, 0.55, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  if (p <= 0) return null
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(120deg, ${colors.gold}, #FFF3DF)`,
        opacity: p,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  )
}
