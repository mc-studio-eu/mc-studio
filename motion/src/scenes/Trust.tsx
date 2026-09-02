import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Paper, Statement } from '../components/Editorial'
import { clientLogos } from '../shots'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)

/**
 * Bandeau de confiance : les logos clients défilent, celui qui passe au centre
 * est saisi dans une pastille blanche.
 */
export const Trust: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame()
  const { width } = useStage()

  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const slotW = width * 0.26
  const rowH = width * 0.13
  const loop = clientLogos.length
  const items = [...clientLogos, ...clientLogos, ...clientLogos]
  // Un logo passe au centre par seconde ; on démarre dans la copie du milieu.
  const travel = (frame / durationInFrames) * slotW * loop
  const centred = Math.round(travel / slotW) + loop

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Paper />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: width * 0.045 }}>
        <Statement start={0} size={width * 0.048}>
          Ils nous font confiance.
        </Statement>

        <div style={{ position: 'relative', width: '100%', height: rowH, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              display: 'flex',
              alignItems: 'center',
              transform: `translateX(${-travel - slotW / 2 - loop * slotW}px)`,
            }}
          >
            {items.map((logo, i) => {
              const isCentred = i === centred
              return (
                <div
                  key={`${logo.name}-${i}`}
                  style={{
                    width: slotW,
                    height: rowH,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 999,
                    background: isCentred ? colors.white : 'transparent',
                    boxShadow: isCentred ? '0 20px 50px rgba(0,0,0,0.12)' : 'none',
                  }}
                >
                  {/* La marque seule ne se lit pas : on l'accompagne du nom. */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: rowH * 0.16,
                      opacity: isCentred ? 1 : 0.32,
                      filter: isCentred ? 'none' : 'grayscale(1)',
                    }}
                  >
                    <div
                      style={{
                        width: rowH * 0.4,
                        height: rowH * 0.4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Img
                        src={staticFile(logo.src)}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: fonts.display,
                        fontSize: width * 0.021,
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        color: colors.ink,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {logo.name}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            fontFamily: fonts.body,
            fontSize: width * 0.017,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: colors.inkSoft,
            opacity: interpolate(frame, [30, 54], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          Noté 5/5 sur Google
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
