import React from 'react'
import { Composition } from 'remotion'
import { McStudioReel, TOTAL_FRAMES } from './Video'
import { Reframe } from './Reframe'
import { FPS } from './theme'

export const RemotionRoot: React.FC = () => (
  <>
    {/* Master — website hero, YouTube, LinkedIn */}
    <Composition
      id="McStudioReel"
      component={McStudioReel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />

    {/* Feed post */}
    <Composition
      id="McStudioReelSquare"
      component={Reframe}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1080}
      defaultProps={{ canvasWidth: 1080, canvasHeight: 1080, showBands: true }}
    />

    {/* Reels / TikTok / Shorts */}
    <Composition
      id="McStudioReelVertical"
      component={Reframe}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ canvasWidth: 1080, canvasHeight: 1920, showBands: true }}
    />
  </>
)
