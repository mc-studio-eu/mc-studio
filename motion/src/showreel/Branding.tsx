import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { colors } from '../theme'
import { assets, Furniture, Label, Picture, Reveal, mix, p, OUT } from './primitives'

export const Branding: React.FC = () => {
  const f = useCurrentFrame()
  const opening = p(f, 0, 16)
  const photo = p(f, 22, 54, OUT)
  const dock = p(f, 141, 166)
  const copyOpacity = 1 - p(f, 134, 149)
  return <AbsoluteFill style={{ background: colors.paper, color: colors.ink, clipPath: 'circle(' + opening * 2300 + 'px at 1744px 172px)' }}>
    <div style={{ opacity: copyOpacity }}><Furniture chapter="01 / Branding" frame={f} footer="R&A ENERGY · BRAND IDENTITY" /></div>
    <div style={{ position: 'absolute', left: 88, top: 208, opacity: copyOpacity }}>
      {['Make your', 'brand', 'unmistakable.'].map((line, i) => <Reveal key={line} frame={f} at={14 + i * 5} size={91} style={{ color: i === 2 ? '#31694e' : colors.ink }}>{line}</Reveal>)}
    </div>
    <div style={{ position: 'absolute', left: 88, top: 653, width: 555, height: 279, background: '#f7f8f2', borderRadius: 12, overflow: 'hidden', transform: 'translateY(' + mix(60, 0, p(f, 26, 58, OUT)) + 'px)', opacity: p(f, 26, 48) * copyOpacity }}>
      {/* Original vector, revealed rather than redrawn. Lines are presentation guides. */}
      {[78, 138, 198].map(x => <div key={x} style={{ position: 'absolute', left: x, top: 28, width: 1, height: 210, background: '#31694e16', transform: 'scaleY(' + p(f, 30, 64) + ')' }} />)}
      {[80, 140, 200].map(y => <div key={y} style={{ position: 'absolute', left: 42, top: y, width: 202, height: 1, background: '#31694e16', transform: 'scaleX(' + p(f, 30, 64) + ')' }} />)}
      <div style={{ position: 'absolute', left: 67, top: 77, width: 142, height: 125, clipPath: 'inset(' + (1 - p(f, 39, 73, OUT)) * 100 + '% 0 0)' }}><Picture src={assets.energyMark} fit="contain" /></div>
      <div style={{ position: 'absolute', left: 284, top: 100 }}>
        <div style={{ fontSize: 36, letterSpacing: '-0.04em' }}>R&A Energy</div>
        <Label style={{ fontSize: 13, marginTop: 13, color: '#31694e' }}>A distinct identity</Label>
      </div>
    </div>
    <div style={{ position: 'absolute', left: mix(728, 340, dock), top: mix(180, 276, dock), width: mix(1104, 1492, dock), height: mix(560, 654, dock), borderRadius: 14, overflow: 'hidden', clipPath: 'inset(' + (1 - photo) * 100 + '% 0 0)' }}>
      <Picture src={assets.energySign} style={{ transform: 'scale(' + mix(1.1, 1, p(f, 25, 150, OUT)) + ')', objectPosition: '50% 47%' }} />
    </div>
    <div style={{ position: 'absolute', left: 728, top: 760, display: 'flex', gap: 16, opacity: 1 - dock }}>
      {['#31694E', '#D6E3B3', '#F7F8F2'].map((color, i) => <div key={color} style={{ width: 357, height: 172, borderRadius: 12, background: color, transform: 'translateY(' + mix(160, 0, p(f, 48 + i * 6, 80 + i * 6, OUT)) + 'px)', opacity: p(f, 48 + i * 6, 68 + i * 6), position: 'relative' }}>
        <Label style={{ position: 'absolute', left: 24, bottom: 23, fontSize: 14, color: i === 0 ? '#fff' : '#31694e' }}>{i === 0 ? 'Identity' : i === 1 ? 'Expression' : 'Clarity'}</Label>
      </div>)}
    </div>
  </AbsoluteFill>
}
