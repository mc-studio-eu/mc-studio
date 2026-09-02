import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { loadFont as loadDisplay } from '@remotion/google-fonts/HostGrotesk'
import { loadFont as loadBody } from '@remotion/google-fonts/Inter'
import { CutFlash } from './components/Transitions'
import { Opening } from './scenes/Opening'
import { Tension } from './scenes/Tension'
import { Turn } from './scenes/Turn'
import { Showcase } from './scenes/Showcase'
import { Wall } from './scenes/Wall'
import { Testimonial } from './scenes/Testimonial'
import { Outro } from './scenes/Outro'
import { colors } from './theme'

loadDisplay()
loadBody()

/**
 * Le montage suit une histoire : les gens → ce qu'ils apportent → ce qu'ils
 * demandent vraiment → ce qu'on livre → la preuve → l'invitation.
 * Les scènes s'enchaînent bord à bord, chacune se fond en sortie.
 */
export const TIMELINE = {
  opening: { from: 0, duration: 165 },
  tension: { from: 165, duration: 210 },
  turn: { from: 375, duration: 126 },
  showcase: { from: 501, duration: 344 },
  wall: { from: 845, duration: 140 },
  testimonial: { from: 985, duration: 140 },
  outro: { from: 1125, duration: 160 },
} as const

export const TOTAL_FRAMES = TIMELINE.outro.from + TIMELINE.outro.duration

export const McStudioReel: React.FC = () => (
  <AbsoluteFill style={{ background: colors.blackDeep }}>
    <Sequence {...seq(TIMELINE.opening)}>
      <Opening durationInFrames={TIMELINE.opening.duration} />
    </Sequence>
    <Sequence {...seq(TIMELINE.tension)}>
      <Tension durationInFrames={TIMELINE.tension.duration} />
    </Sequence>
    <Sequence {...seq(TIMELINE.turn)}>
      <Turn durationInFrames={TIMELINE.turn.duration} />
    </Sequence>
    <Sequence {...seq(TIMELINE.showcase)}>
      <Showcase />
    </Sequence>
    <Sequence {...seq(TIMELINE.wall)}>
      <Wall durationInFrames={TIMELINE.wall.duration} />
    </Sequence>
    <Sequence {...seq(TIMELINE.testimonial)}>
      <Testimonial durationInFrames={TIMELINE.testimonial.duration} />
    </Sequence>
    <Sequence {...seq(TIMELINE.outro)}>
      <Outro durationInFrames={TIMELINE.outro.duration} />
    </Sequence>

    <CutFlash at={TIMELINE.turn.from} />
    <CutFlash at={TIMELINE.showcase.from} />
    <CutFlash at={TIMELINE.wall.from} />
  </AbsoluteFill>
)

function seq({ from, duration }: { from: number; duration: number }) {
  return { from, durationInFrames: duration }
}
