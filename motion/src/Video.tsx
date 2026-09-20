import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { SparkAndStudio } from './showreel/SparkAndStudio'
import { Branding } from './showreel/Branding'
import { Websites } from './showreel/Websites'
import { Product } from './showreel/Product'
import { Convergence, Signature } from './showreel/Finale'
import { fonts, colors } from './theme'
import './showreel/loadFonts'

/** Entrances overlap the preceding scene by 16 frames. */
export const TIMELINE = {
  sparkAndStudio: { from: 0, durationInFrames: 180 },
  branding: { from: 164, durationInFrames: 166 },
  websites: { from: 314, durationInFrames: 196 },
  product: { from: 494, durationInFrames: 196 },
  convergence: { from: 674, durationInFrames: 106 },
  signature: { from: 764, durationInFrames: 136 },
} as const
export const TOTAL_FRAMES = 900

export const McStudioReel: React.FC = () => (
  <AbsoluteFill style={{ background: colors.black, fontFamily: fonts.display, overflow: 'hidden' }}>
    <Sequence {...TIMELINE.sparkAndStudio} name="01 · Idea → MC Studio"><SparkAndStudio /></Sequence>
    <Sequence {...TIMELINE.branding} name="02 · R&A Energy / Branding"><Branding /></Sequence>
    <Sequence {...TIMELINE.websites} name="03 · R&A Energy → Shika"><Websites /></Sequence>
    <Sequence {...TIMELINE.product} name="04 · Personal / Product"><Product /></Sequence>
    <Sequence {...TIMELINE.convergence} name="05 · From vision to reality"><Convergence /></Sequence>
    <Sequence {...TIMELINE.signature} name="06 · MC Studio / Signature"><Signature /></Sequence>
  </AbsoluteFill>
)
