import React from 'react'
import { AbsoluteFill, Sequence } from 'remotion'
import { loadFont as loadDisplay } from '@remotion/google-fonts/HostGrotesk'
import { loadFont as loadBody } from '@remotion/google-fonts/Inter'
import { Open } from './scenes/Open'
import { TwoWays } from './scenes/TwoWays'
import { Trust } from './scenes/Trust'
import { LaneTitle } from './scenes/LaneTitle'
import { Reel } from './scenes/Reel'
import { Numbers } from './scenes/Numbers'
import { Close } from './scenes/Close'
import { businessShots, creatorShots } from './shots'
import { colors } from './theme'

loadDisplay()
loadBody()

/**
 * Montage : positionnement → deux voies → confiance → le travail, voie par
 * voie → les chiffres → l'invitation. Les plans s'enchaînent bord à bord,
 * chacun se fond sur sa fin.
 */
const D = {
  open: 110,
  twoWays: 220,
  trust: 140,
  laneTitle: 90,
  businessReel: businessShots.length * 58,
  creatorReel: creatorShots.length * 58,
  numbers: 3 * 56 - 2 * 7,
  close: 150,
}

let cursor = 0
const at = (duration: number) => {
  const from = cursor
  cursor += duration
  return { from, durationInFrames: duration }
}

export const TIMELINE = {
  open: at(D.open),
  twoWays: at(D.twoWays),
  trust: at(D.trust),
  businessTitle: at(D.laneTitle),
  businessReel: at(D.businessReel),
  creatorTitle: at(D.laneTitle),
  creatorReel: at(D.creatorReel),
  numbers: at(D.numbers),
  close: at(D.close),
}

export const TOTAL_FRAMES = cursor

export const McStudioReel: React.FC = () => (
  <AbsoluteFill style={{ background: colors.paper }}>
    <Sequence {...TIMELINE.open}>
      <Open durationInFrames={D.open} />
    </Sequence>

    <Sequence {...TIMELINE.twoWays}>
      <TwoWays durationInFrames={D.twoWays} />
    </Sequence>

    <Sequence {...TIMELINE.trust}>
      <Trust durationInFrames={D.trust} />
    </Sequence>

    <Sequence {...TIMELINE.businessTitle}>
      <LaneTitle
        title="Business"
        line="Marque, site et produit pour les entreprises ambitieuses."
        durationInFrames={D.laneTitle}
      />
    </Sequence>
    <Sequence {...TIMELINE.businessReel}>
      <Reel shots={businessShots} durationInFrames={D.businessReel} />
    </Sequence>

    <Sequence {...TIMELINE.creatorTitle}>
      <LaneTitle
        title="Creator"
        line="L'app sur mesure qui prolonge votre contenu, et le revenu qui va avec."
        accent
        durationInFrames={D.laneTitle}
      />
    </Sequence>
    <Sequence {...TIMELINE.creatorReel}>
      <Reel shots={creatorShots} durationInFrames={D.creatorReel} />
    </Sequence>

    <Sequence {...TIMELINE.numbers}>
      <Numbers durationInFrames={D.numbers} />
    </Sequence>

    <Sequence {...TIMELINE.close}>
      <Close durationInFrames={D.close} />
    </Sequence>
  </AbsoluteFill>
)
