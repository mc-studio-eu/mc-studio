import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Logo } from '../components/Logo'
import { colors } from '../theme'
import { assets, Chrome, Dot, Furniture, Label, Picture, Reveal, mix, p, OUT } from './primitives'

export const Convergence: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 22)
  const close = p(f, 64, 90)
  return <AbsoluteFill style={{ background: colors.black, color: colors.paper }}>
    <div style={{ opacity: 1 - close }}><Furniture chapter="ONE STUDIO / COMPLETE EXPERIENCES" frame={f} dark /></div>
    <div style={{ position: 'absolute', left: 88, top: 153, opacity: 1 - close }}>
      <Reveal frame={f} at={14} size={108}>From vision to reality.</Reveal>
    </div>
    {[assets.energySign, assets.shikaSite, assets.personalFeed].map((src, i) => {
      const x = mix(mix(552, 88 + i * 588, enter), 946, close)
      const y = mix(mix(284, 373, enter), 526, close)
      const w = mix(mix(1280, 568, enter), 28, close)
      const h = mix(mix(771, 386, enter), 28, close)
      return <div key={src} style={{ position: 'absolute', left: x, top: y, width: w, height: h, zIndex: i, borderRadius: mix(14, 50, close), overflow: 'hidden', opacity: i === 2 ? 1 : p(f, 2 + i * 4, 20 + i * 4), transform: 'rotate(' + mix(0, (i - 1) * 9, close) + 'deg)' }}>
        <>{i === 2 ? <Chrome title="Personal" width={w} height={Math.max(1, h - 42)} dark><Picture src={src} /></Chrome> : <Picture src={src} />}</>
        <AbsoluteFill style={{ background: colors.gold, opacity: p(f, 70, 87) }} />
      </div>
    })}
    <div style={{ position: 'absolute', left: 88, right: 88, top: 798, display: 'flex', gap: 20, opacity: p(f, 17, 38) * (1 - close) }}>
      {['Branding', 'Websites', 'Software'].map((word, i) => <div key={word} style={{ width: 568 }}>
        <div style={{ height: 1, background: '#ffffff30', marginBottom: 22 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontSize: 39, letterSpacing: '-0.035em' }}>{word}</span><Label style={{ fontSize: 15, color: '#9c9c94' }}>0{i + 1}</Label></div>
      </div>)}
    </div>
    <Label style={{ position: 'absolute', left: 88, bottom: 58, fontSize: 16, color: colors.gold, opacity: p(f, 24, 48) * (1 - close) }}>Strategy. Design. Development.</Label>
  </AbsoluteFill>
}

export const Signature: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 16)
  const bloom = p(f, 16, 47, OUT)
  return <AbsoluteFill style={{ background: colors.black, color: colors.paper, clipPath: 'circle(' + enter * 1200 + 'px at 960px 540px)' }}>
    <Dot x={mix(960, 1678, bloom)} y={mix(540, 500, bloom)} size={mix(28, 19, bloom)} />
    <div style={{ position: 'absolute', top: 286, width: '100%', textAlign: 'center' }}>
      <Reveal frame={f} at={12} size={55} style={{ letterSpacing: '-0.035em', color: colors.gold }}>Your vision. Our craft.</Reveal>
    </div>
    <div style={{ position: 'absolute', left: 330, top: 412, width: 1260, clipPath: 'inset(0 ' + (1 - bloom) * 100 + '% 0 0)' }}>
      <Logo width={1260} fill={colors.paper} style={{ display: 'block', transform: 'translateY(' + mix(30, 0, bloom) + 'px)' }} />
    </div>
    <div style={{ position: 'absolute', top: 738, width: '100%', textAlign: 'center' }}>
      <Reveal frame={f} at={30} size={37} style={{ letterSpacing: '-0.015em' }}>mc-studio.eu</Reveal>
    </div>
    <div style={{ position: 'absolute', left: 88, right: 88, bottom: 64, borderTop: '1px solid #ffffff25', paddingTop: 26, display: 'flex', justifyContent: 'space-between', opacity: p(f, 36, 61) }}>
      <Label style={{ fontSize: 17, color: '#aaa99f' }}>Branding / Websites / Software</Label>
      <Label style={{ fontSize: 17, color: '#aaa99f' }}>FROM IDEA TO IMPACT</Label>
    </div>
  </AbsoluteFill>
}
