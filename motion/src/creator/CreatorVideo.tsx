import React from 'react'
import { AbsoluteFill, Sequence, useCurrentFrame, interpolateColors } from 'remotion'
import { Picture, p, mix, OUT } from '../showreel/primitives'
import { creatorAssets as A } from './assets'
import { Backdrop, C, CreatorLogo, Screen, Tag, Text } from './design'
import '../showreel/loadFonts'

export const CREATOR_FRAMES = 900
export const CREATOR_TIMELINE = {
  audience: {from: 0, durationInFrames: 135},
  promise: {from: 120, durationInFrames: 105},
  maison: {from: 210, durationInFrames: 225},
  personal: {from: 420, durationInFrames: 180},
  process: {from: 585, durationInFrames: 180},
  signature: {from: 750, durationInFrames: 150},
} as const

const Audience: React.FC = () => {
  const f = useCurrentFrame()
  const exit = p(f, 106, 130)
  return <AbsoluteFill style={{background: C.lilac, color: C.ink}}>
    <Backdrop />
    <Tag style={{position: 'absolute', top: 57, left: 76}}>MC STUDIO / CREATOR</Tag>
    <Tag style={{position: 'absolute', top: 57, right: 76}}>LA SUITE DE VOTRE HISTOIRE</Tag>
    {[{src: A.instagram, x: 103, y: 272, r: -12}, {src: A.youtube, x: 1570, y: 210, r: 11}, {src: A.tiktok, x: 1535, y: 712, r: -8}].map((icon, i) => {
      const enter = p(f, 12 + i * 9, 42 + i * 9, OUT)
      return <div key={icon.src} style={{position: 'absolute', left: mix(icon.x, 910, exit), top: mix(icon.y, 470, exit), width: 180, height: 180, background: C.paper, border: '1px solid #00000015', borderRadius: 34, boxShadow: '0 18px 0 #0000000a', transform: 'rotate(' + icon.r * (1 - exit) + 'deg) scale(' + mix(0.2, 1, enter) * (1 - exit * 0.3) + ')', opacity: enter, display: 'grid', placeItems: 'center'}}>
        <Picture src={icon.src} fit="contain" style={{width: 94, height: 94}} />
      </div>
    })}
    <div style={{position: 'absolute', left: 310, right: 310, top: 268, textAlign: 'center', transform: 'translateY(' + -exit * 90 + 'px)', opacity: 1 - exit}}>
      <Text f={f} at={0} size={180}>Votre audience</Text>
      <div style={{display: 'inline-block', marginTop: 22, background: C.ink, color: C.paper, padding: '4px 36px 18px', transform: 'rotate(-2deg)', opacity: p(f, 0, 8)}}>
        <Text f={f} at={14} size={155}>est déjà là.</Text>
      </div>
    </div>
    <div style={{position: 'absolute', bottom: 111, width: '100%', textAlign: 'center', opacity: p(f, 40, 64) * (1 - exit)}}>
      <Text f={f} at={40} size={36} style={{fontWeight: 450, letterSpacing: '-0.03em'}}>Donnons-lui un nouvel espace.</Text>
    </div>
    <div style={{position: 'absolute', bottom: 50, left: 76, right: 76, height: 2, background: '#1f1f1f20'}}>
      <div style={{width: p(f, 0, 120) * 100 + '%', height: 2, background: C.ink}} />
    </div>
  </AbsoluteFill>
}

const PromiseScene: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 15)
  const exit = p(f, 83, 100)
  return <AbsoluteFill style={{background: C.paper, color: C.ink, clipPath: 'inset(0 ' + (1 - enter) * 50 + '% 0 ' + (1 - enter) * 50 + '%)'}}>
    <CreatorLogo width={355} style={{position: 'absolute', left: 76, top: 52}} />
    <Tag style={{position: 'absolute', left: 459, top: 82, background: C.lilac, padding: '12px 20px', borderRadius: 8}}>CREATOR</Tag>
    <div style={{position: 'absolute', right: 90, top: 171, width: 213, height: 213, transform: 'rotate(' + mix(-25, 0, p(f, 16, 70, OUT)) + 'deg)'}}><Picture src={A.mark} /></div>
    <div style={{position: 'absolute', left: 76, top: 258, opacity: 1 - exit}}>
      <Text f={f} at={15} size={165}>Créons votre</Text>
      <div style={{position: 'relative', marginTop: 12}}>
        <div style={{position: 'absolute', left: -12, right: -45, top: 12, bottom: -9, background: C.purple, transform: 'scaleX(' + p(f, 22, 51, OUT) + ') rotate(-1deg)', transformOrigin: 'left center'}} />
        <Text f={f} at={22} size={178} style={{position: 'relative'}}>application.</Text>
      </div>
    </div>
    <div style={{position: 'absolute', left: 81, bottom: 136, display: 'flex', gap: 20, opacity: 1 - exit}}>
      {['Votre univers', 'Votre communauté', 'Votre produit'].map((word, i) => <div key={word} style={{border: '1px solid #1f1f1f', borderRadius: 80, padding: '19px 32px', fontSize: 30, letterSpacing: '-0.03em', transform: 'translateY(' + (1 - p(f, 34 + i * 5, 62 + i * 5, OUT)) * 80 + 'px)', opacity: p(f, 34 + i * 5, 53 + i * 5)}}>{word}</div>)}
    </div>
  </AbsoluteFill>
}

const Maison: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 15)
  const switchView = p(f, 90, 112)
  const copyOut = 1 - p(f, 73, 90)
  return <AbsoluteFill style={{background: C.warm, color: C.ink, clipPath: 'inset(' + (1 - enter) * 100 + '% 0 0 0)'}}>
    <div style={{opacity: copyOut}}>
      <Tag style={{position: 'absolute', left: 76, top: 57}}>DU CONTENU AU PRODUIT</Tag>
      <div style={{position: 'absolute', left: 76, top: 264}}>
        <Text f={f} at={16} size={114}>Un univers.</Text>
        <Text f={f} at={23} size={114}>Une app.</Text>
      </div>
      <div style={{position: 'absolute', left: 82, top: 775}}>
        <div style={{fontSize: 39, letterSpacing: '-0.04em'}}>Maison AWL</div>
        <Tag style={{marginTop: 18, fontSize: 16}}>Une application pour sa communauté</Tag>
      </div>
    </div>
    <div style={{position: 'absolute', left: 773, top: 156, width: 1070, height: 803, borderRadius: 18, overflow: 'hidden', transform: 'translateY(' + mix(140, 0, p(f, 4, 44, OUT)) + 'px) rotate(' + mix(4, -1, p(f, 4, 75, OUT)) + 'deg)'}}>
      <Picture src={A.maisonDesktop} />
    </div>
    <AbsoluteFill style={{background: C.warm, clipPath: 'inset(0 ' + (1 - switchView) * 100 + '% 0 0)'}}>
      <Tag style={{position: 'absolute', left: 76, top: 57}}>MAISON AWL / APPLICATION WEB</Tag>
      <div style={{position: 'absolute', left: 76, top: 124}}><Text f={f} at={108} size={84}>Votre communauté, réunie.</Text></div>
      <Screen src={A.maisonMarketplace} width={1250} height={712} style={{position: 'absolute', left: 76, top: 274, transform: 'translateY(' + mix(25, 0, p(f, 108, 145, OUT)) + 'px)'}} />
      <div style={{position: 'absolute', left: 1358, top: 274, width: 486, height: 712, borderRadius: 18, overflow: 'hidden'}}>
        <Picture src={A.maisonMobile} style={{objectPosition: '50% 50%', transform: 'scale(' + mix(1.08, 1, p(f, 112, 210)) + ')'}} />
      </div>
      <Tag style={{position: 'absolute', left: 76, bottom: 38, fontSize: 15}}>Stratégie · Design · Développement</Tag>
      <Tag style={{position: 'absolute', right: 76, bottom: 38, fontSize: 15}}>MC STUDIO CREATOR</Tag>
    </AbsoluteFill>
  </AbsoluteFill>
}

const Personal: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 15)
  const screen = p(f, 66, 96)
  return <AbsoluteFill style={{background: C.lilac, color: C.ink, clipPath: 'polygon(0 0, ' + enter * 120 + '% 0, ' + enter * 120 + '% 100%, 0 100%)'}}>
    <Backdrop />
    <Tag style={{position: 'absolute', left: 76, top: 57}}>PERSONAL / OUTIL POUR CRÉATEURS</Tag>
    <Tag style={{position: 'absolute', right: 76, top: 57}}>MC STUDIO CREATOR</Tag>
    <div style={{position: 'absolute', left: 76, top: 280}}>
      {['Un outil.', 'Votre façon', 'de créer.'].map((line, i) => <Text key={line} f={f} at={18 + i * 6} size={106}>{line}</Text>)}
    </div>
    <div style={{position: 'absolute', left: 76, top: 874, fontSize: 28, letterSpacing: '-0.025em', opacity: p(f, 43, 66)}}>L’IA au service des créateurs.</div>
    <div style={{position: 'absolute', left: 738, top: 247, width: 1100, height: 630, transform: 'translateY(' + mix(110, 0, p(f, 0, 39, OUT)) + 'px) rotate(' + mix(-4, 0, p(f, 20, 140)) + 'deg)'}}>
      <Screen src={A.personalHero} width={1100} height={630} padding={10} />
      <div style={{position: 'absolute', inset: 0, clipPath: 'inset(' + (1 - screen) * 100 + '% 0 0 0 round 18px)'}}><Screen src={A.personalFeed} width={1100} height={630} padding={10} /></div>
      <div style={{position: 'absolute', left: 35, bottom: -43, background: C.ink, color: '#fff', padding: '18px 32px', borderRadius: 60, fontSize: 24, letterSpacing: '-0.02em', transform: 'rotate(-3deg)', opacity: p(f, 105, 125)}}>Un produit qui prolonge votre univers.</div>
    </div>
  </AbsoluteFill>
}

const Process: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 15)
  const steps = ['Analyser', 'Valider', 'Construire', 'Lancer', 'Grandir']
  const captions = ['Votre audience', 'Le concept', 'Design + code', 'Votre application', 'Les évolutions']
  return <AbsoluteFill style={{background: C.ink, color: C.paper, clipPath: 'inset(' + (1 - enter) * 100 + '% 0 0 0)'}}>
    <Tag style={{position: 'absolute', left: 76, top: 57, color: C.lilac}}>DE L’IDÉE AU LANCEMENT. ET APRÈS.</Tag>
    <div style={{position: 'absolute', left: 76, top: 162}}>
      <Text f={f} at={15} size={140}>Votre vision.</Text>
      <Text f={f} at={22} size={140} style={{color: C.purple}}>Notre savoir-faire.</Text>
    </div>
    <div style={{position: 'absolute', left: 76, top: 614, display: 'flex', gap: 18}}>
      {steps.map((word, i) => {
        const t = p(f, 31 + i * 19, 48 + i * 19, OUT)
        return <div key={word} style={{width: 339, height: 303, padding: 26, boxSizing: 'border-box', borderRadius: 12, background: interpolateColors(t, [0, 1], ['#2d2d2d', C.lilac]), color: interpolateColors(t, [0, 1], ['#a9a9a9', C.ink]), transform: 'translateY(' + mix(30, 0, t) + 'px)', opacity: p(f, 20 + i * 5, 34 + i * 5)}}>
          <Tag style={{fontSize: 19}}>0{i + 1}</Tag>
          <div style={{fontSize: 40, fontWeight: 600, letterSpacing: '-0.055em', marginTop: 64}}>{word}</div>
          <div style={{fontSize: 19, marginTop: 16, letterSpacing: '-0.025em'}}>{captions[i]}</div>
          <div style={{height: 3, marginTop: 29, width: t * 100 + '%', background: C.ink}} />
        </div>
      })}
    </div>
    <Tag style={{position: 'absolute', left: 76, bottom: 50, fontSize: 16, opacity: p(f, 115, 139)}}>UN PARTENAIRE POUR CONSTRUIRE LA SUITE.</Tag>
  </AbsoluteFill>
}

const Signature: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 15)
  return <AbsoluteFill style={{background: C.paper, color: C.ink, clipPath: 'inset(0 0 0 ' + (1 - enter) * 100 + '%)'}}>
    <Backdrop paper />
    <div style={{position: 'absolute', top: 113, width: '100%', textAlign: 'center'}}>
      <Text f={f} at={16} size={99}>Faites grandir</Text>
      <Text f={f} at={22} size={99}>votre univers.</Text>
    </div>
    <div style={{position: 'absolute', left: 425, top: 399, width: 1070, overflow: 'hidden', clipPath: 'inset(0 ' + (1 - p(f, 29, 54, OUT)) * 100 + '% 0 0)'}}>
      <CreatorLogo width={1070} />
    </div>
    <div style={{position: 'absolute', top: 664, width: '100%', textAlign: 'center', opacity: p(f, 40, 60)}}>
      <span style={{display: 'inline-block', padding: '13px 36px', borderRadius: 7, background: C.purple, fontSize: 43, fontWeight: 650, letterSpacing: '0.08em', transform: 'rotate(-2deg)'}}>CREATOR</span>
    </div>
    <div style={{position: 'absolute', top: 826, width: '100%', textAlign: 'center'}}>
      <Text f={f} at={49} size={32} style={{fontWeight: 450, letterSpacing: '-0.025em'}}>Créons l’application qui va avec votre communauté.</Text>
    </div>
    <div style={{position: 'absolute', top: 942, width: '100%', textAlign: 'center', fontSize: 29, letterSpacing: '-0.025em', opacity: p(f, 56, 74)}}>mc-studio.eu</div>
  </AbsoluteFill>
}

export const McStudioCreator: React.FC = () => <AbsoluteFill style={{fontFamily: 'Inter, sans-serif', background: C.lilac, overflow: 'hidden'}}>
  <Sequence {...CREATOR_TIMELINE.audience} name="01 · Votre audience"><Audience /></Sequence>
  <Sequence {...CREATOR_TIMELINE.promise} name="02 · MC Studio Creator"><PromiseScene /></Sequence>
  <Sequence {...CREATOR_TIMELINE.maison} name="03 · Maison AWL"><Maison /></Sequence>
  <Sequence {...CREATOR_TIMELINE.personal} name="04 · Personal"><Personal /></Sequence>
  <Sequence {...CREATOR_TIMELINE.process} name="05 · Notre savoir-faire"><Process /></Sequence>
  <Sequence {...CREATOR_TIMELINE.signature} name="06 · Votre univers"><Signature /></Sequence>
</AbsoluteFill>
