import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Paper, Statement } from '../components/Editorial'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

type Lane = {
  title: string
  line: string
  proof: string
  shot: string
}

const LANES: Lane[] = [
  {
    title: 'Business',
    line: 'Marque, site et produit pour les entreprises ambitieuses.',
    proof: '20+ projets livrés',
    shot: 'img/project/shika-consulting/homepage.webp',
  },
  {
    title: 'Creator',
    line: 'L’app sur mesure qui prolonge votre contenu.',
    proof: 'Communauté de 180 000 followers',
    shot: 'img/project/maison-awl/desktop-mockup.png',
  },
]

/** Une colonne : capture en tête, discipline, promesse, preuve. */
const LanePanel: React.FC<{ lane: Lane; start: number; index: number }> = ({ lane, start, index }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const p = interpolate(frame - start, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const zoom = interpolate(frame - start, [0, 160], [1.04, 1.12])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: width * 0.017,
        opacity: p,
        transform: `translateY(${(1 - p) * 46}px)`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: width * 0.235,
          borderRadius: 18,
          overflow: 'hidden',
          background: colors.white,
          boxShadow: '0 26px 60px rgba(0,0,0,0.14)',
        }}
      >
        <Img
          src={staticFile(lane.shot)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            transform: `scale(${zoom})`,
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: index === 0 ? colors.ink : colors.gold,
          }}
        />
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: width * 0.034,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: colors.ink,
          }}
        >
          {lane.title}
        </div>
      </div>

      <div
        style={{
          fontFamily: fonts.body,
          fontSize: width * 0.0165,
          lineHeight: 1.4,
          color: '#4A4A4A',
          maxWidth: '90%',
        }}
      >
        {lane.line}
      </div>

      <div
        style={{
          marginTop: 4,
          alignSelf: 'flex-start',
          padding: `${width * 0.007}px ${width * 0.016}px`,
          borderRadius: 999,
          background: colors.white,
          fontFamily: fonts.body,
          fontSize: width * 0.0135,
          fontWeight: 600,
          color: colors.ink,
          boxShadow: '0 10px 26px rgba(0,0,0,0.1)',
        }}
      >
        {lane.proof}
      </div>
    </div>
  )
}

/**
 * Le cœur du nouveau positionnement : une seule équipe, deux façons
 * d'entrer — Business et Creator.
 */
export const TwoWays: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Paper />

      <AbsoluteFill
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          padding: `0 ${width * 0.07}px`,
          gap: width * 0.035,
        }}
      >
        <Statement start={2} size={width * 0.05} align="left">
          Deux façons de travailler avec nous.
        </Statement>

        <div style={{ display: 'flex', gap: width * 0.045 }}>
          {LANES.map((lane, i) => (
            <LanePanel key={lane.title} lane={lane} start={26 + i * 16} index={i} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
