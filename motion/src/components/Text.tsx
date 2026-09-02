import React from 'react'
import { Easing, interpolate, useCurrentFrame } from 'remotion'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/**
 * Word-by-word reveal: each word rises and un-blurs, staggered.
 * This is the workhorse for every headline in the reel.
 */
export const SplitWords: React.FC<{
  children: string
  start?: number
  stagger?: number
  duration?: number
  fontSize?: number
  weight?: number
  color?: string
  lineHeight?: number
  letterSpacing?: string
  align?: React.CSSProperties['justifyContent']
  fromY?: number
  style?: React.CSSProperties
  /** Words rendered in gold instead of the base color (0-indexed). */
  accentIndices?: number[]
}> = ({
  children,
  start = 0,
  stagger = 3,
  duration = 24,
  fontSize = 120,
  weight = 700,
  color = colors.white,
  lineHeight = 1.02,
  letterSpacing = '-0.035em',
  align = 'center',
  fromY = 60,
  style,
  accentIndices = [],
}) => {
  const frame = useCurrentFrame()
  const words = children.split(' ')

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align,
        gap: `0 ${fontSize * 0.24}px`,
        fontFamily: fonts.display,
        fontSize,
        fontWeight: weight,
        lineHeight,
        letterSpacing,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const local = frame - start - i * stagger
        const p = interpolate(local, [0, duration], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: outEase,
        })
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em' }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * fromY}px)`,
                filter: `blur(${(1 - p) * 14}px)`,
                opacity: p,
                color: accentIndices.includes(i) ? colors.gold : color,
              }}
            >
              {word}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/** Small uppercase letterspaced label — used for kickers and figure captions. */
export const Kicker: React.FC<{
  children: React.ReactNode
  start?: number
  color?: string
  fontSize?: number
  style?: React.CSSProperties
}> = ({ children, start = 0, color = colors.gold, fontSize = 20, style }) => {
  const frame = useCurrentFrame()
  const p = interpolate(frame - start, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  return (
    <div
      style={{
        fontFamily: fonts.body,
        fontSize,
        fontWeight: 500,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Number that counts up, for the proof scene. */
export const CountUp: React.FC<{
  to: number
  start?: number
  duration?: number
  suffix?: string
  fontSize?: number
}> = ({ to, start = 0, duration = 40, suffix = '', fontSize = 130 }) => {
  const frame = useCurrentFrame()
  const value = interpolate(frame - start, [0, duration], [0, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  return (
    <span
      style={{
        fontFamily: fonts.display,
        fontSize,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: colors.white,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {Math.round(value)}
      {suffix}
    </span>
  )
}
