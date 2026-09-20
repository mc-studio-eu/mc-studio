import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { colors } from '../theme'
import { assets, Chrome, Furniture, Label, Picture, Reveal, mix, p, OUT } from './primitives'

export const Product: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 16)
  const feed = p(f, 62, 91)
  const copyOpacity = 1 - p(f, 168, 180)
  return <AbsoluteFill style={{ color: colors.paper, background: colors.black, clipPath: 'inset(0 0 0 ' + (1 - enter) * 100 + '%)' }}>
    <div style={{ opacity: copyOpacity }}><Furniture chapter="03 / Digital products" frame={f} dark /></div>
    <div style={{ position: 'absolute', left: 88, top: 141, opacity: copyOpacity }}><Reveal frame={f} at={8} size={108}>Beyond websites.</Reveal></div>
    <div style={{ position: 'absolute', left: 88, top: 396, opacity: copyOpacity }}>
      {['Software built', 'for real-world', 'impact.'].map((line, i) => <Reveal key={line} frame={f} at={24 + i * 5} size={48} style={{ lineHeight: 1.16, color: i === 2 ? colors.gold : '#a9a9a0', letterSpacing: '-0.035em' }}>{line}</Reveal>)}
    </div>
    <div style={{ position: 'absolute', left: 88, top: 828, opacity: p(f, 37, 67) * copyOpacity }}>
      <div style={{ fontSize: 43, letterSpacing: '-0.045em' }}>Personal</div>
      <Label style={{ fontSize: 14, color: '#aaa99f', marginTop: 13 }}>Creator-focused AI</Label>
      <div style={{ marginTop: 29, display: 'flex', alignItems: 'center', gap: 13 }}>
        <span style={{ display: 'block', width: 7, height: 7, borderRadius: 9, background: colors.gold }} />
        <Label style={{ fontSize: 13, color: colors.gold }}>{f < 78 ? 'A personal space' : 'Made for creators'}</Label>
      </div>
    </div>
    <Chrome title="Personal" width={1280} height={729} dark style={{ position: 'absolute', left: 552, top: 284 }}>
      <Picture src={assets.personalLogin} style={{ position: 'absolute', transform: 'scale(' + mix(1.015, 1, p(f, 0, 55, OUT)) + ')' }} />
      {/* Real screen change; no invented interaction or data. */}
      <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(0 ' + (1 - feed) * 100 + '% 0 0)' }}><Picture src={assets.personalFeed} /></div>
    </Chrome>
    <div style={{ position: 'absolute', left: 552, top: 284, width: 1280, height: 771, borderRadius: 16, border: '1px solid #ffffff18', pointerEvents: 'none' }} />
  </AbsoluteFill>
}
