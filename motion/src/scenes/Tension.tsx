import React from 'react'
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { ColorField } from '../components/ColorField'
import { Grain, Vignette } from '../components/Backdrop'
import { SplitWords } from '../components/Text'
import { palettes } from '../palette'
import { struggles } from '../story'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/** Positions manuelles pour que les cartes encadrent le texte sans le couvrir. */
const SLOTS = [
  { x: 0.11, y: 0.2, s: 1 },
  { x: 0.78, y: 0.16, s: 0.92 },
  { x: 0.16, y: 0.74, s: 0.96 },
  { x: 0.82, y: 0.78, s: 1 },
  { x: 0.47, y: 0.04, s: 0.72 },
  { x: 0.55, y: 0.87, s: 0.76 },
]

/**
 * La tension : ce que les clients apportent en arrivant. Les cartes flottent
 * en perspective autour de la phrase, comme des messages qui s'accumulent.
 */
export const Tension: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width, height } = useStage()

  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  // Les cartes s'effacent quand la phrase centrale prend le dessus.
  const settle = interpolate(frame, [110, 160], [1, 0.42], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ColorField from={palettes.amber} to={palettes.rose} durationInFrames={durationInFrames} speed={1.15} />

      <AbsoluteFill>
        {struggles.map((s, i) => {
          const slot = SLOTS[i]
          const start = 6 + i * 11
          const enter = interpolate(frame - start, [0, 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: outEase,
          })
          // Dérive lente et désynchronisée, pour que rien ne soit figé.
          const floatY = Math.sin((frame + i * 40) / 46) * 9
          const floatX = Math.cos((frame + i * 55) / 58) * 7
          const cardW = width * 0.2 * slot.s

          return (
            <div
              key={s.client}
              style={{
                position: 'absolute',
                left: slot.x * width - cardW / 2 + floatX,
                top: slot.y * height + floatY + (1 - enter) * 40,
                width: cardW,
                padding: `${cardW * 0.085}px ${cardW * 0.095}px`,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.94)',
                boxShadow: '0 26px 60px rgba(40,10,0,0.35)',
                opacity: enter * settle,
                transform: `scale(${0.88 + enter * 0.12}) rotate(${(random(`r-${s.client}`) - 0.5) * 4}deg)`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: cardW * 0.062,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9A7130',
                  marginBottom: cardW * 0.045,
                }}
              >
                {s.client}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: cardW * 0.085, lineHeight: 1.35, color: '#1A1206' }}>
                {s.text}
              </div>
            </div>
          )
        })}
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: `0 ${width * 0.16}px` }}>
        <SplitWords start={116} fontSize={width * 0.048} stagger={4} accentIndices={[6, 7]}>
          Personne ne vient nous voir pour un site.
        </SplitWords>
      </AbsoluteFill>

      <Grain opacity={0.045} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  )
}
