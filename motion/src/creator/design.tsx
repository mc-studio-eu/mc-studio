import React, { type CSSProperties } from 'react'
import { AbsoluteFill } from 'remotion'
import { Picture, p, OUT } from '../showreel/primitives'
import { creatorAssets as A } from './assets'

export const C = { ink: '#1f1f1f', purple: '#a375f2', lilac: '#d9c6f5', paper: '#fcfcfd', warm: '#e9e3d9' }
export const Text: React.FC<{children: React.ReactNode; f: number; at?: number; size?: number; style?: CSSProperties}> =
({ children, f, at = 0, size = 120, style }) => <div style={{ fontSize: size, fontWeight: 650, lineHeight: 1.03, letterSpacing: '-0.065em', overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em', ...style }}>
  <div style={{ transform: 'translateY(' + 118 * (1 - p(f, at, at + 24, OUT)) + '%)' }}>{children}</div>
</div>

export const Tag: React.FC<{children: React.ReactNode; style?: CSSProperties}> =
({children, style}) => <div style={{ fontSize: 18, fontWeight: 550, letterSpacing: '0.04em', textTransform: 'uppercase', ...style }}>{children}</div>

export const Backdrop: React.FC<{paper?: boolean; style?: CSSProperties}> =
({paper, style}) => <AbsoluteFill style={{background: paper ? C.paper : C.lilac, ...style}}>
  <Picture src={paper ? A.paper : A.texture} />
</AbsoluteFill>

export const Screen: React.FC<{src: string; width: number; height: number; style?: CSSProperties; padding?: number}> =
({src, width, height, style, padding = 12}) => <div style={{width, height, padding, boxSizing: 'border-box', background: '#fff', border: '1px solid #00000015', borderRadius: 18, overflow: 'hidden', boxShadow: '0 28px 70px #20123524', ...style}}>
  <Picture src={src} style={{borderRadius: 8}} />
</div>

export const CreatorLogo: React.FC<{width?: number; style?: CSSProperties}> =
({width = 360, style}) => <div style={{width, height: width * 200 / 963, ...style}}><Picture src={A.logo} fit="contain" /></div>
