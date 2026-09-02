import React from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Paper } from '../components/Editorial'
import { Logo } from '../components/Logo'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/** Carton final : le wordmark, les deux voies, et l'unique adresse du studio. */
export const Close: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const logoIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp', easing: outEase })
  const linksIn = interpolate(frame, [26, 54], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const ctaIn = interpolate(frame, [48, 76], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const pulse = 0.5 + 0.5 * Math.sin((frame - 48) / 10)
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Les deux voies restent nommées, mais le studio n'a qu'une adresse.
  const lanes = ['Business', 'Creator']

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Paper />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: width * 0.03 }}>
        <Logo
          width={width * 0.26}
          fill={colors.ink}
          style={{ opacity: logoIn, transform: `translateY(${(1 - logoIn) * 22}px)` }}
        />

        <div
          style={{
            display: 'flex',
            gap: width * 0.014,
            opacity: linksIn,
            transform: `translateY(${(1 - linksIn) * 18}px)`,
          }}
        >
          {lanes.map((lane, i) => (
            <div
              key={lane}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: `${width * 0.009}px ${width * 0.022}px`,
                borderRadius: 999,
                background: colors.white,
                boxShadow: '0 14px 34px rgba(0,0,0,0.1)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i === 0 ? colors.ink : colors.gold,
                }}
              />
              <span style={{ fontFamily: fonts.body, fontSize: width * 0.0155, fontWeight: 600, color: colors.ink }}>
                {lane}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: width * 0.01,
            padding: `${width * 0.013}px ${width * 0.032}px`,
            borderRadius: 999,
            background: colors.ink,
            color: colors.white,
            fontFamily: fonts.display,
            fontSize: width * 0.026,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 16}px)`,
            boxShadow: `0 0 ${16 + pulse * 30}px rgba(20,20,20,${0.16 + pulse * 0.12})`,
          }}
        >
          mc-studio.eu
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  )
}
