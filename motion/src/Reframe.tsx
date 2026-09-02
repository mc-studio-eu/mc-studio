import React from 'react'
import { AbsoluteFill } from 'remotion'
import { Logo } from './components/Logo'
import { StageProvider } from './stage'
import { McStudioReel } from './Video'
import { colors, fonts } from './theme'

const STAGE = { width: 1920, height: 1080 }

/**
 * Social crops. The 16:9 film is scaled to the canvas width and framed by
 * branded bands, so nothing composed for widescreen gets cut off.
 */
export const Reframe: React.FC<{
  canvasWidth: number
  canvasHeight: number
  showBands?: boolean
}> = ({ canvasWidth, canvasHeight, showBands = true }) => {
  const scale = canvasWidth / STAGE.width
  const stageHeight = STAGE.height * scale
  // Enough zoom for the blurred backdrop to cover the whole canvas.
  const coverScale = Math.max(canvasWidth / STAGE.width, canvasHeight / STAGE.height)

  return (
    <AbsoluteFill style={{ background: colors.blackDeep, overflow: 'hidden' }}>
      {/* Blurred copy of the film fills the letterbox instead of dead space */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: STAGE.width,
              height: STAGE.height,
              transform: `scale(${coverScale})`,
              transformOrigin: 'center center',
              filter: 'blur(70px) saturate(1.5) brightness(0.85)',
            }}
          >
            <StageProvider value={STAGE}>
              <McStudioReel />
            </StageProvider>
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: 'rgba(8,8,8,0.38)' }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: STAGE.width,
            height: STAGE.height,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: showBands ? 24 / scale : 0,
            boxShadow: '0 40px 120px rgba(0,0,0,0.75)',
          }}
        >
          <StageProvider value={STAGE}>
            <McStudioReel />
          </StageProvider>
        </div>
      </AbsoluteFill>

      {showBands ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: (canvasHeight - stageHeight) / 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              padding: '0 8%',
              textAlign: 'center',
            }}
          >
            <Logo width={canvasWidth * 0.44} fill={colors.white} />
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: canvasWidth * 0.026,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: colors.gold,
              }}
            >
              Branding · Design · Développement
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: (canvasHeight - stageHeight) / 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 26,
            }}
          >
            <div
              style={{
                padding: `${canvasWidth * 0.018}px ${canvasWidth * 0.05}px`,
                borderRadius: 999,
                background: colors.gold,
                color: colors.black,
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: canvasWidth * 0.028,
              }}
            >
              Réserver un appel
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: canvasWidth * 0.022,
                letterSpacing: '0.24em',
                color: `${colors.white}77`,
              }}
            >
              BUSINESS.MC-STUDIO.EU
            </div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  )
}
