import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { mixPalette, type Palette } from '../palette'

/**
 * Champ de couleur plein cadre : trois masses lumineuses qui dérivent lentement
 * pendant que la palette glisse de `from` vers `to`. C'est le fond de tout le
 * film — il respire et change au fil de l'histoire, jamais un noir figé.
 */
export const ColorField: React.FC<{
  from: Palette
  to: Palette
  durationInFrames: number
  /** Vitesse de dérive des masses. */
  speed?: number
  opacity?: number
}> = ({ from, to, durationInFrames, speed = 1, opacity = 1 }) => {
  const frame = useCurrentFrame()
  const { width, height } = useStage()

  const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' })
  const palette = mixPalette(from, to, t)
  const drift = (frame / 110) * speed

  const masses = [
    { x: 0.3 + Math.sin(drift) * 0.16, y: 0.4 + Math.cos(drift * 0.8) * 0.15, r: 0.95 },
    { x: 0.74 + Math.cos(drift * 0.72) * 0.17, y: 0.62 + Math.sin(drift * 1.05) * 0.16, r: 0.8 },
    { x: 0.52 + Math.sin(drift * 1.25) * 0.2, y: 0.28 + Math.cos(drift * 1.1) * 0.18, r: 0.62 },
  ]

  return (
    <AbsoluteFill style={{ background: palette.base, opacity }}>
      <AbsoluteFill style={{ filter: 'blur(110px)' }}>
        {masses.map((m, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: m.x * width - (m.r * height) / 2,
              top: m.y * height - (m.r * height) / 2,
              width: m.r * height,
              height: m.r * height,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${palette.blobs[i]} 0%, transparent 68%)`,
              opacity: 0.85,
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
