import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, random } from 'remotion'
import { useStage } from '../stage'
import { colors } from '../theme'

/** Faint technical grid — the "blueprint" layer of the art direction. */
export const BlueprintGrid: React.FC<{
  cell?: number
  opacity?: number
  drift?: number
  color?: string
}> = ({ cell = 80, opacity = 0.16, drift = 12, color = colors.gold }) => {
  const frame = useCurrentFrame()
  const offset = (frame / 60) * drift

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `
          linear-gradient(to right, ${color}22 1px, transparent 1px),
          linear-gradient(to bottom, ${color}22 1px, transparent 1px),
          linear-gradient(to right, ${color}44 1px, transparent 1px),
          linear-gradient(to bottom, ${color}44 1px, transparent 1px)
        `,
        backgroundSize: `${cell}px ${cell}px, ${cell}px ${cell}px, ${cell * 5}px ${cell * 5}px, ${cell * 5}px ${cell * 5}px`,
        backgroundPosition: `${offset}px ${offset}px`,
      }}
    />
  )
}

/**
 * Slow-moving warm light blobs behind the type — the same trick the Lovable
 * board uses, re-tinted to the MC Studio gold instead of pink/blue.
 */
export const GoldAurora: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame()
  const { width, height } = useStage()
  const t = frame / 90

  const blobs = [
    { c: colors.gold, r: 0.62, x: 0.32 + Math.sin(t) * 0.09, y: 0.42 + Math.cos(t * 0.8) * 0.08, a: 0.75 },
    { c: colors.goldDeep, r: 0.5, x: 0.7 + Math.cos(t * 0.7) * 0.1, y: 0.6 + Math.sin(t * 1.1) * 0.09, a: 0.62 },
    { c: '#FFE9C4', r: 0.32, x: 0.55 + Math.sin(t * 1.4) * 0.12, y: 0.35 + Math.cos(t * 1.2) * 0.1, a: 0.4 },
  ]

  return (
    <AbsoluteFill style={{ filter: 'blur(80px)', mixBlendMode: 'screen' }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x * width - (b.r * height) / 2,
            top: b.y * height - (b.r * height) / 2,
            width: b.r * height,
            height: b.r * height,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
            opacity: b.a * intensity,
          }}
        />
      ))}
    </AbsoluteFill>
  )
}

/** Film grain, kept cheap: a fixed dot field re-seeded a few times per second. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame()
  const { width, height } = useStage()
  const seed = Math.floor(frame / 3)
  const dots = new Array(220).fill(0).map((_, i) => ({
    x: random(`gx-${seed}-${i}`) * width,
    y: random(`gy-${seed}-${i}`) * height,
    s: 1 + random(`gs-${seed}-${i}`) * 2,
  }))

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: d.s,
            height: d.s,
            background: '#fff',
            borderRadius: '50%',
          }}
        />
      ))}
    </AbsoluteFill>
  )
}

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.7 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
)

/** Thin gold scan line that sweeps across a scene, used as a section accent. */
export const ScanLine: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()
  const x = interpolate(frame, [from, to], [-200, width + 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        bottom: 0,
        width: 180,
        background: `linear-gradient(90deg, transparent, ${colors.gold}22, transparent)`,
      }}
    />
  )
}
