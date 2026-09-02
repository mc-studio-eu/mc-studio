import React from 'react'
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { ColorField } from '../components/ColorField'
import { Grain, Vignette } from '../components/Backdrop'
import { palettes } from '../palette'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/** Une réplique tenue, puis effacée : le rythme d'une phrase parlée. */
const Line: React.FC<{ text: string; hold: number; accent?: boolean }> = ({ text, hold, accent }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const p = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp', easing: outEase })
  const out = interpolate(frame, [hold - 12, hold], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: `0 ${width * 0.12}px` }}>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: width * 0.055,
          fontWeight: 700,
          letterSpacing: '-0.035em',
          lineHeight: 1.08,
          textAlign: 'center',
          color: accent ? colors.gold : colors.white,
          opacity: p * (1 - out),
          transform: `translateY(${(1 - p) * 26 - out * 16}px)`,
          filter: `blur(${(1 - p) * 12 + out * 10}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  )
}

/**
 * Le basculement du film : on nomme la vraie demande, celle qui n'est jamais
 * formulée en réunion.
 */
export const Turn: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <ColorField from={palettes.rose} to={palettes.night} durationInFrames={durationInFrames} speed={0.7} />

      <Sequence durationInFrames={58}>
        <Line text="On vient nous voir pour être choisi." hold={58} />
      </Sequence>
      <Sequence from={58} durationInFrames={62}>
        <Line text="Le reste, c'est notre métier." hold={62} accent />
      </Sequence>

      <Grain opacity={0.05} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  )
}
