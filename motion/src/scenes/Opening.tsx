import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { ColorField } from '../components/ColorField'
import { Grain, Vignette } from '../components/Backdrop'
import { SplitWords } from '../components/Text'
import { palettes } from '../palette'
import { people } from '../story'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/**
 * Ouverture : des visages, pas des écrans. Les portraits des clients se posent
 * en collage décalé, puis la phrase fondatrice du film s'écrit par-dessus.
 */
export const Opening: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width, height } = useStage()

  const cardW = width * 0.19
  const cardH = cardW * 1.28

  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  // Les portraits reculent doucement pour laisser la phrase prendre le dessus.
  const recede = interpolate(frame, [64, 112], [1, 0.34], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const spread = interpolate(frame, [64, 118], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ColorField from={palettes.ember} to={palettes.amber} durationInFrames={durationInFrames} speed={0.8} />

      <AbsoluteFill
        style={{ alignItems: 'center', justifyContent: 'center', transform: `translateY(${-height * 0.11}px)` }}
      >
        {people.map((person, i) => {
          const enter = interpolate(frame - i * 9, [0, 34], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: outEase,
          })
          const tilt = (random(`tilt-${person.name}`) - 0.5) * 9
          // Empilées au centre, puis déployées en éventail.
          const stackX = (i - (people.length - 1) / 2) * cardW * 0.34
          const fanX = (i - (people.length - 1) / 2) * cardW * 1.12
          const x = stackX + (fanX - stackX) * spread
          const y = Math.sin((i / people.length) * Math.PI) * -cardH * 0.07

          return (
            <div
              key={person.name}
              style={{
                position: 'absolute',
                width: cardW,
                height: cardH,
                left: '50%',
                top: '50%',
                marginLeft: -cardW / 2,
                marginTop: -cardH / 2,
                borderRadius: 14,
                overflow: 'hidden',
                background: '#1A1206',
                boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
                opacity: enter * (0.42 + recede * 0.58),
                transform: `translate(${x}px, ${y + (1 - enter) * 60}px) rotate(${tilt * (1 - spread * 0.7)}deg) scale(${(0.9 + enter * 0.1) * (0.72 + recede * 0.28)})`,
              }}
            >
              <Img
                src={staticFile(person.photo)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.8) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 14,
                  opacity: interpolate(frame - 30 - i * 6, [0, 20], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }) * recede,
                }}
              >
                <div style={{ fontFamily: fonts.display, fontSize: cardW * 0.11, color: colors.white, fontWeight: 600 }}>
                  {person.name}
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: cardW * 0.062, color: `${colors.white}AA`, marginTop: 3 }}>
                  {person.role}
                </div>
              </div>
            </div>
          )
        })}
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: `0 ${width * 0.1}px` }}>
        <div style={{ transform: `translateY(${height * 0.29}px)` }}>
          <SplitWords start={78} fontSize={width * 0.048} stagger={4} accentIndices={[6]}>
            Derrière chaque marque, il y a quelqu'un.
          </SplitWords>
        </div>
      </AbsoluteFill>

      <Grain opacity={0.05} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  )
}
