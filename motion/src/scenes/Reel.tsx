import React from 'react'
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion'
import { DisciplinePill, FullBleed, Paper } from '../components/Editorial'
import type { Shot } from '../shots'

export const SHOT_LENGTH = 58

/**
 * Le reel : les captures s'enchaînent plein cadre, la pastille en bas à droite
 * nomme la discipline. Aucun texte par-dessus — le travail parle.
 */
export const Reel: React.FC<{ shots: Shot[]; durationInFrames: number }> = ({ shots, durationInFrames }) => {
  const frame = useCurrentFrame()
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Paper />
      {shots.map((shot, i) => (
        <Sequence key={`${shot.src}-${i}`} from={i * SHOT_LENGTH} durationInFrames={SHOT_LENGTH}>
          <FullBleed
            src={shot.src}
            durationInFrames={SHOT_LENGTH}
            fit={shot.fit}
            focus={shot.focus}
            direction={i % 2 === 0 ? 1 : -1}
          />
          <DisciplinePill label={shot.label} client={shot.client} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
