import React from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { ColorField } from '../components/ColorField'
import { Grain } from '../components/Backdrop'
import { Logo } from '../components/Logo'
import { palettes } from '../palette'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)
const INK = '#1A1206'

/**
 * Le film part du noir et finit dans la lumière. Carton final clair, encre
 * sombre : le calme après l'histoire.
 */
export const Outro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const lineIn = interpolate(frame, [4, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const logoIn = interpolate(frame, [44, 76], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const ctaIn = interpolate(frame, [66, 92], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const pulse = 0.5 + 0.5 * Math.sin((frame - 66) / 10)
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ColorField from={palettes.glow} to={palettes.dawn} durationInFrames={44} speed={0.5} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: width * 0.045,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: INK,
            opacity: lineIn,
            transform: `translateY(${(1 - lineIn) * 22}px)`,
          }}
        >
          Pour les gens qui construisent.
        </div>

        <div style={{ opacity: logoIn, transform: `translateY(${(1 - logoIn) * 20}px)` }}>
          <Logo width={width * 0.2} fill={INK} />
        </div>

        <div
          style={{
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 20}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <div
            style={{
              padding: '20px 46px',
              borderRadius: 999,
              background: colors.gold,
              color: INK,
              fontFamily: fonts.body,
              fontSize: 25,
              fontWeight: 600,
              boxShadow: `0 0 ${30 + pulse * 40}px rgba(240,191,108,${0.35 + pulse * 0.3})`,
            }}
          >
            Réserver un appel
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 19,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: `${INK}88`,
            }}
          >
            business.mc-studio.eu
          </div>
        </div>
      </AbsoluteFill>

      <Grain opacity={0.03} />
    </AbsoluteFill>
  )
}
