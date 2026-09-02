import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { ColorField } from '../components/ColorField'
import { Grain, Vignette } from '../components/Backdrop'
import { palettes } from '../palette'
import { testimonial } from '../story'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/**
 * La preuve, portée par une personne : le portrait de Yazid et son avis Google
 * publié, cité mot pour mot. Pas de chiffre hors-sol.
 */
export const Testimonial: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const photoIn = interpolate(frame, [0, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  // Le portrait respire pendant tout le plan.
  const breathe = 1 + Math.sin(frame / 70) * 0.012

  const words = testimonial.quote.split(' ')
  const photoW = width * 0.24

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ColorField from={palettes.warm} to={palettes.glow} durationInFrames={durationInFrames} speed={0.6} />

      <AbsoluteFill
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: width * 0.045,
          padding: `0 ${width * 0.08}px`,
        }}
      >
        <div
          style={{
            width: photoW,
            height: photoW * 1.24,
            borderRadius: 18,
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 50px 110px rgba(0,0,0,0.55)',
            opacity: photoIn,
            transform: `translateY(${(1 - photoIn) * 44}px) scale(${breathe})`,
          }}
        >
          <Img
            src={staticFile(testimonial.person.photo)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const p = interpolate(frame - 18 - i * 4, [0, 14], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: outEase,
              })
              return (
                <span key={i} style={{ fontSize: 30, color: colors.gold, opacity: p, transform: `scale(${0.6 + p * 0.4})` }}>
                  ★
                </span>
              )
            })}
          </div>

          <div
            style={{
              fontFamily: fonts.display,
              fontSize: width * 0.031,
              fontWeight: 600,
              lineHeight: 1.28,
              letterSpacing: '-0.02em',
              color: colors.white,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0 0.28em',
            }}
          >
            {words.map((w, i) => {
              const p = interpolate(frame - 30 - i * 2, [0, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: outEase,
              })
              return (
                <span key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px)`, display: 'inline-block' }}>
                  {w}
                </span>
              )
            })}
          </div>

          <div
            style={{
              opacity: interpolate(frame, [72, 96], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            <div style={{ fontFamily: fonts.body, fontSize: 24, color: colors.white, fontWeight: 600 }}>
              {testimonial.person.name}
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 20, color: `${colors.white}99`, marginTop: 4 }}>
              {testimonial.person.role} · Avis Google
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Grain opacity={0.045} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  )
}
