import React from 'react'
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion'
import { useStage } from '../stage'
import { Grain, Vignette } from '../components/Backdrop'
import { ColorField } from '../components/ColorField'
import { palettes } from '../palette'
import { BrowserFrame, PhoneFrame } from '../components/Frames'
import { Kicker, SplitWords } from '../components/Text'
import { featured, type Showcase as ShowcaseItem } from '../projects'
import { colors, ease, fonts } from '../theme'

const outEase = Easing.bezier(...ease.out)
const SLIDE = 86

const Tag: React.FC<{ label: string; start: number }> = ({ label, start }) => {
  const frame = useCurrentFrame()
  const p = interpolate(frame - start, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  return (
    <span
      style={{
        fontFamily: fonts.body,
        fontSize: 17,
        letterSpacing: '0.08em',
        color: colors.gold,
        border: `1px solid ${colors.gold}55`,
        borderRadius: 999,
        padding: '8px 18px',
        opacity: p,
        transform: `translateY(${(1 - p) * 12}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

/** One portfolio entry: copy on the left, live screens on the right. */
const ProjectSlide: React.FC<{ project: ShowcaseItem; index: number }> = ({ project, index }) => {
  const frame = useCurrentFrame()
  const { width, height } = useStage()

  const enter = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  const exit = interpolate(frame, [SLIDE - 16, SLIDE], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })
  // Slow push on the screenshot for the whole slide — keeps stills alive.
  const drift = interpolate(frame, [0, SLIDE], [0, -26])
  const scroll = interpolate(frame, [10, SLIDE], [0, 0.35], { extrapolateRight: 'clamp' })
  // Entrée décalée du second écran (mobile ou capture secondaire).
  const secondaryIn = interpolate(frame, [18, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: outEase,
  })

  const browserW = width * 0.5
  const browserH = browserW * 0.6

  return (
    <AbsoluteFill
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: `0 ${width * 0.06}px`,
        opacity: enter * (1 - exit),
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Kicker start={4} fontSize={17}>
          {project.industry}
        </Kicker>
        <SplitWords start={8} fontSize={width * 0.045} align="flex-start" stagger={4}>
          {project.title}
        </SplitWords>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          {project.tags.map((t, i) => (
            <Tag key={t} label={t} start={24 + i * 5} />
          ))}
        </div>
        <Kicker start={40} fontSize={18} color={colors.greyLight} style={{ letterSpacing: '0.12em', marginTop: 8 }}>
          {project.url}
        </Kicker>
      </div>

      <div
        style={{
          position: 'relative',
          width: browserW,
          height: browserH + 90,
          display: 'flex',
          alignItems: 'center',
          transform: `translateX(${(1 - enter) * 140 + exit * -120}px) translateY(${drift}px)`,
        }}
      >
        <BrowserFrame
          src={project.desktop}
          url={project.url}
          width={browserW}
          height={browserH}
          scroll={scroll}
        />
        {project.secondary && !project.mobile ? (
          <div
            style={{
              position: 'absolute',
              right: -width * 0.035,
              bottom: -height * 0.05,
              width: browserW * 0.52,
              transform: `translateY(${(1 - secondaryIn) * 80}px)`,
              opacity: secondaryIn,
            }}
          >
            <BrowserFrame
              src={project.secondary}
              width={browserW * 0.52}
              height={browserW * 0.52 * 0.6}
              radius={12}
            />
          </div>
        ) : null}
        {project.mobile ? (
          <div
            style={{
              position: 'absolute',
              right: -width * 0.03,
              bottom: -height * 0.02,
              transform: `translateY(${(1 - secondaryIn) * 90}px)`,
              opacity: secondaryIn,
            }}
          >
            <PhoneFrame src={project.mobile} width={width * 0.093} scroll={scroll * 0.5} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  )
}

/** Four featured case studies, cut back to back. */
export const Showcase: React.FC = () => (
  <AbsoluteFill>
    <ColorField
      from={palettes.night}
      to={palettes.warm}
      durationInFrames={SHOWCASE_DURATION}
      speed={0.55}
    />

    {featured.map((project, i) => (
      <Sequence key={project.slug} from={i * SLIDE} durationInFrames={SLIDE}>
        <ProjectSlide project={project} index={i} />
      </Sequence>
    ))}

    <Grain opacity={0.04} />
    <Vignette strength={0.65} />
  </AbsoluteFill>
)

export const SHOWCASE_DURATION = SLIDE * featured.length
