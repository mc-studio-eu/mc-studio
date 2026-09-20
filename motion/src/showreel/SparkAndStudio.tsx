import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Logo } from '../components/Logo'
import { colors } from '../theme'
import { Dot, Label, Reveal, mix, p, OUT } from './primitives'

export const SparkAndStudio: React.FC = () => {
  const f = useCurrentFrame()
  const spread = p(f, 20, 62)
  const identity = p(f, 76, 112)
  const depart = p(f, 145, 170)
  return <AbsoluteFill style={{ background: colors.black, color: colors.paper }}>
    <div style={{ position: 'absolute', left: 88, top: 67, opacity: p(f, 14, 36) }}><Label>FROM IDEA TO IMPACT</Label></div>
    <Label style={{ position: 'absolute', right: 88, top: 67, color: '#999991', opacity: p(f, 14, 36) }}>MC STUDIO</Label>
    {/* One seed becomes three disciplines, then a single identity. */}
    {[-1, 0, 1].map((n, i) => {
      const x = mix(960 + n * 290 * spread, 1744, depart)
      const y = mix(mix(404, 692, identity), 172, depart)
      const width = mix(mix(22, 220, spread), 8, identity)
      const height = mix(mix(22, 160, spread), 8, identity)
      return <div key={n} style={{ position: 'absolute', left: x - width / 2, top: y - height / 2, width, height, borderRadius: mix(80, i === 1 ? 8 : 80, spread * (1 - identity)), background: i === 1 ? colors.gold : colors.paper, opacity: (i === 1 ? mix(0.2, 1, p(f, 0, 14, OUT)) : p(f, 20 + i * 4, 35 + i * 4)) * (1 - depart * (i === 1 ? 0 : 1)), transform: 'rotate(' + n * 24 * spread * (1 - identity) + 'deg)' }} />
    })}
    <div style={{ position: 'absolute', top: 590, width: '100%', textAlign: 'center', opacity: 1 - p(f, 72, 91) }}>
      <Reveal frame={f} at={8} size={67}>Every great product</Reveal>
      <Reveal frame={f} at={15} size={67} style={{ color: colors.gold }}>starts with an idea.</Reveal>
    </div>
    <div style={{ position: 'absolute', left: 370, top: 374, width: 1180, overflow: 'hidden', clipPath: 'inset(0 ' + (1 - p(f, 78, 115, OUT)) * 100 + '% 0 0)' }}>
      <Logo width={1180} fill={colors.paper} style={{ display: 'block', transform: 'translateY(' + mix(36, 0, p(f, 78, 115, OUT)) + 'px)' }} />
    </div>
    <div style={{ position: 'absolute', left: 490, right: 490, top: 627, display: 'flex', justifyContent: 'space-between' }}>
      {['Strategy.', 'Design.', 'Development.'].map((word, i) => <Reveal key={word} frame={f} at={100 + i * 6} size={32} style={{ letterSpacing: '-0.02em', color: '#b5b5ad' }}>{word}</Reveal>)}
    </div>
    <div style={{ position: 'absolute', bottom: 62, left: 88, width: 1744, height: 1, background: '#ffffff18', opacity: p(f, 93, 122) }}>
      <div style={{ width: p(f, 93, 174) * 100 + '%', height: 1, background: colors.gold }} />
    </div>
    {f > 165 && <Dot x={1744} y={172} size={8} />}
  </AbsoluteFill>
}
