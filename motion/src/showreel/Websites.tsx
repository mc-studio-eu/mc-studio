import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { colors } from '../theme'
import { assets, Chrome, Furniture, Label, Picture, Reveal, mix, p, OUT } from './primitives'

export const Websites: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 0, 16)
  const next = p(f, 91, 121)
  const dock = p(f, 170, 196)
  const width = mix(1492, 1280, dock)
  return <AbsoluteFill style={{ background: '#f3f3ee', color: colors.ink, clipPath: 'inset(' + mix(25.55, 0, enter) + '% ' + mix(4.58, 0, enter) + '% ' + mix(13.88, 0, enter) + '% ' + mix(17.7, 0, enter) + '% round ' + mix(14, 0, enter) + 'px)' }}>
    <Furniture chapter="02 / Digital experiences" frame={f} />
    <div style={{ position: 'absolute', left: 88, top: 145, display: 'flex', gap: 24 }}>
      <Reveal frame={f} at={16} size={79}>Designed to stand out.</Reveal>
      <Reveal frame={f} at={22} size={79} style={{ color: '#898c81' }}>Built to perform.</Reveal>
    </div>
    <div style={{ position: 'absolute', left: 88, top: 780, width: 224 }}>
      <div style={{ height: 46, width: 46, border: '1px solid #b2b8aa', borderRadius: 50, display: 'grid', placeItems: 'center', marginBottom: 26, fontSize: 22 }}>02</div>
      <div style={{ position: 'relative', height: 95, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', fontSize: 30, lineHeight: 1.12, transform: 'translateY(' + -110 * next + 'px)' }}>R&A Energy</div>
        <div style={{ position: 'absolute', fontSize: 30, lineHeight: 1.12, transform: 'translateY(' + 110 * (1 - next) + 'px)' }}>Shika<br />Consulting</div>
      </div>
      <Label style={{ fontSize: 13, color: '#6c7065' }}>Design & development</Label>
    </div>
    {/* The browser docks into the next scene's real product screen. */}
    <Chrome title={f < 106 ? 'ra-energy.fr' : 'shika-consulting.fr'} width={width} height={mix(708, 729, dock)} style={{ position: 'absolute', left: mix(340, 552, dock), top: mix(276, 284, dock), transform: 'translateY(' + mix(30, 0, p(f, 0, 32, OUT)) + 'px)' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', transform: 'translateX(' + -next * 100 + '%)' }}>
        <Picture src={assets.energySite} style={{ height: 'auto', objectFit: 'initial', transform: 'translateY(' + -mix(0, 80, p(f, 36, 105)) + 'px)' }} />
      </div>
      <div style={{ position: 'absolute', width: '100%', height: '100%', transform: 'translateX(' + (1 - next) * 100 + '%)' }}>
        <Picture src={assets.shikaSite} style={{ height: 'auto', objectFit: 'initial', transform: 'translateY(' + -mix(0, 42, p(f, 121, 180)) + 'px)' }} />
      </div>
    </Chrome>
    <div style={{ position: 'absolute', left: 88, bottom: 46, display: 'flex', gap: 7 }}>
      {[0, 1].map(i => <div key={i} style={{ width: 52, height: 3, background: i === 0 ? '#31694e' : '#b8bfaa', opacity: i === 0 ? mix(1, 0.3, next) : mix(0.3, 1, next) }} />)}
    </div>
  </AbsoluteFill>
}
