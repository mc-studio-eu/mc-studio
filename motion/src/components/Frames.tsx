import React from 'react'
import { Img, staticFile } from 'remotion'
import { colors, fonts } from '../theme'

/**
 * macOS-ish browser chrome wrapping a real project screenshot.
 * `scroll` lets the shot pan vertically inside the window (0 = top, 1 = bottom).
 */
export const BrowserFrame: React.FC<{
  src: string
  url?: string
  width: number
  height: number
  scroll?: number
  radius?: number
  style?: React.CSSProperties
}> = ({ src, url, width, height, scroll = 0, radius = 16, style }) => {
  const barHeight = Math.max(28, height * 0.052)

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: 'hidden',
        background: '#111',
        border: `1px solid ${colors.white}1A`,
        boxShadow: '0 60px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(240,191,108,0.08)',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div
        style={{
          height: barHeight,
          background: '#1A1A1A',
          borderBottom: `1px solid ${colors.white}12`,
          display: 'flex',
          alignItems: 'center',
          gap: barHeight * 0.22,
          paddingLeft: barHeight * 0.5,
          flexShrink: 0,
        }}
      >
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{ width: barHeight * 0.24, height: barHeight * 0.24, borderRadius: '50%', background: c, opacity: 0.9 }} />
        ))}
        {url ? (
          <div
            style={{
              marginLeft: barHeight * 0.6,
              padding: `${barHeight * 0.12}px ${barHeight * 0.5}px`,
              borderRadius: 999,
              background: '#0F0F0F',
              color: colors.greyLight,
              fontFamily: fonts.body,
              fontSize: barHeight * 0.34,
              letterSpacing: '0.02em',
            }}
          >
            {url}
          </div>
        ) : null}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${-scroll * 100}%) translateY(${scroll * (height - barHeight)}px)`,
          }}
        />
      </div>
    </div>
  )
}

/** Phone mockup for the mobile shots. */
export const PhoneFrame: React.FC<{
  src: string
  width: number
  scroll?: number
  style?: React.CSSProperties
}> = ({ src, width, scroll = 0, style }) => {
  const height = width * 2.05

  return (
    <div
      style={{
        width,
        height,
        borderRadius: width * 0.13,
        padding: width * 0.022,
        background: 'linear-gradient(160deg, #3A3A3A, #101010)',
        boxShadow: '0 50px 100px rgba(0,0,0,0.7)',
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: width * 0.11,
          overflow: 'hidden',
          background: '#000',
          position: 'relative',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${-scroll * 100}%) translateY(${scroll * height}px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: width * 0.035,
            left: '50%',
            transform: 'translateX(-50%)',
            width: width * 0.3,
            height: width * 0.075,
            borderRadius: 999,
            background: '#000',
          }}
        />
      </div>
    </div>
  )
}
