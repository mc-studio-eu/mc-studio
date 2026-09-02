import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Grain, Vignette } from '../components/Backdrop'
import { ColorField } from '../components/ColorField'
import { palettes } from '../palette'
import { Kicker, SplitWords } from '../components/Text'
import { showcase } from '../projects'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/**
 * Every project snaps into a grid while the camera pulls back —
 * the "here is the whole body of work" beat.
 */
export const Wall: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width, height } = useStage()

  const cols = 5
  const rows = Math.ceil(showcase.length / cols)
  const gap = width * 0.014
  const gridW = width * 0.86
  const cardW = (gridW - gap * (cols - 1)) / cols
  const cardH = cardW * 0.62
  const gridH = rows * cardH + gap * (rows - 1)

  // Camera pull-back: starts pushed in, settles, then drifts slightly.
  const zoom = interpolate(frame, [0, 46, durationInFrames], [1.5, 1, 0.98], {
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const dim = interpolate(frame, [70, 96], [0, 0.74], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ColorField from={palettes.warm} to={palettes.glow} durationInFrames={durationInFrames} speed={0.8} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: gridW,
            height: gridH,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cardW}px)`,
            gap,
            transform: `scale(${zoom})`,
          }}
        >
          {showcase.map((p, i) => {
            const delay = i * 3
            const enter = interpolate(frame - delay, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: outEase,
            })
            const fromX = (random(`wx-${p.slug}`) - 0.5) * width * 0.7
            const fromY = (random(`wy-${p.slug}`) - 0.5) * height * 0.7
            const rot = (random(`wr-${p.slug}`) - 0.5) * 16

            return (
              <div
                key={p.slug}
                style={{
                  position: 'relative',
                  width: cardW,
                  height: cardH,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: `1px solid ${colors.white}14`,
                  background: '#111',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
                  opacity: enter,
                  transform: `translate(${(1 - enter) * fromX}px, ${(1 - enter) * fromY}px) rotate(${(1 - enter) * rot}deg) scale(${0.85 + enter * 0.15})`,
                }}
              >
                <Img
                  src={staticFile(p.desktop)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.85) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    bottom: 10,
                    fontFamily: fonts.body,
                    fontSize: cardW * 0.075,
                    color: colors.white,
                    letterSpacing: '0.02em',
                  }}
                >
                  {p.title}
                </div>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>

      {/* Headline lands once the grid has settled */}
      <AbsoluteFill style={{ background: `rgba(12,7,2,${dim})` }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 }}>
        <Kicker start={78}>Portfolio</Kicker>
        <SplitWords start={84} fontSize={width * 0.055} accentIndices={[1]}>
          Des projets livrés, en ligne, qui tournent.
        </SplitWords>
      </AbsoluteFill>

      <Grain opacity={0.04} />
      <Vignette strength={0.75} />
    </AbsoluteFill>
  )
}
