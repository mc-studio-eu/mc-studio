import React, { type CSSProperties } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from 'remotion'
import { colors, fonts } from '../theme'

export const OUT = Easing.bezier(0.16, 1, 0.3, 1)
export const FLOW = Easing.bezier(0.65, 0, 0.35, 1)
export const p = (frame: number, start: number, end: number, easing = FLOW) =>
  interpolate(frame, [start, end], [0, 1], { easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
export const mix = (a: number, b: number, t: number) => a + (b - a) * t
export const assets = {
  energyMark: 'img/clients/ra-energy.svg',
  energySign: 'img/project/logo-raenergy.png',
  energySite: 'img/project/hero-raenergy.png',
  shikaSite: 'img/project/shika-consulting/homepage.webp',
  personalLogin: 'img/project/personal/login.webp',
  personalFeed: 'img/project/personal/feed.webp',
} as const

export const Picture: React.FC<{ src: string; style?: CSSProperties; fit?: 'cover' | 'contain' }> = ({ src, style, fit = 'cover' }) =>
  <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: fit, display: 'block', ...style }} />

export const Label: React.FC<{ children: React.ReactNode; style?: CSSProperties }> = ({ children, style }) =>
  <div style={{ fontFamily: fonts.body, fontSize: 20, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', ...style }}>{children}</div>

export const Reveal: React.FC<{
  children: React.ReactNode; frame: number; at?: number; size?: number; style?: CSSProperties
}> = ({ children, frame, at = 0, size = 100, style }) => {
  const t = p(frame, at, at + 28, OUT)
  return <div style={{ overflow: 'hidden', paddingBottom: '0.13em', marginBottom: '-0.13em', fontSize: size, fontWeight: 500, lineHeight: 1.04, letterSpacing: '-0.055em', ...style }}>
    <div style={{ transform: 'translateY(' + (1 - t) * 116 + '%)' }}>{children}</div>
  </div>
}

export const Chrome: React.FC<{
  children: React.ReactNode; title: string; width: number; height: number; style?: CSSProperties; dark?: boolean
}> = ({ children, title, width, height, style, dark = false }) =>
  <div style={{ width, height: height + 42, borderRadius: 16, overflow: 'hidden', background: dark ? '#21211f' : '#fff', boxShadow: '0 30px 80px #00000024', border: '1px solid ' + (dark ? '#ffffff24' : '#00000016'), ...style }}>
    <div style={{ height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? '#21211f' : '#f7f7f5', position: 'relative', borderBottom: '1px solid #88888820' }}>
      <div style={{ position: 'absolute', left: 18, display: 'flex', gap: 7 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: 8, background: dark ? '#777' : '#bdbdb6' }} />)}</div>
      <span style={{ fontFamily: fonts.body, fontSize: 13, letterSpacing: '0.04em', color: dark ? '#ccc' : '#777' }}>{title}</span>
    </div>
    <div style={{ height, position: 'relative', overflow: 'hidden' }}>{children}</div>
  </div>

export const Furniture: React.FC<{ chapter: string; dark?: boolean; frame: number; footer?: string }> = ({ chapter, dark, frame, footer }) =>
  <AbsoluteFill style={{ pointerEvents: 'none', color: dark ? colors.white : colors.ink, opacity: p(frame, 14, 34, OUT) }}>
    <Label style={{ position: 'absolute', left: 88, top: 67 }}>{chapter}</Label>
    <Label style={{ position: 'absolute', right: 88, top: 67, color: dark ? '#999991' : colors.grey }}>MC STUDIO</Label>
    {footer && <Label style={{ position: 'absolute', bottom: 42, left: 88, fontSize: 15, letterSpacing: '0.04em' }}>{footer}</Label>}
  </AbsoluteFill>

export const Dot: React.FC<{ x: number; y: number; size: number; color?: string; style?: CSSProperties }> = ({ x, y, size, color = colors.gold, style }) =>
  <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: color, ...style }} />
