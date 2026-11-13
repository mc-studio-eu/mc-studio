import React from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import '../showreel/loadFonts'
import { colors, fonts } from '../theme'
import { realAssets as A } from './assets'
import { type Cam, Floor, Laptop, Panel, Phone, ScreenPages, Stage } from './devices'

export const REAL_FRAMES = 840
export const REAL_TIMELINE = { ouverture: 0, sites: 110, produit: 330, galerie: 560, signature: 710 } as const

const OUT = Easing.bezier(0.16, 1, 0.3, 1)
const FLOW = Easing.bezier(0.6, 0, 0.3, 1)
const p = (f: number, a: number, b: number, easing = FLOW) => interpolate(f, [a, b], [0, 1], { easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
/** Images clés lissées. */
const kf = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * p(f, keys[i - 1][0], keys[i][0])
  return keys[keys.length - 1][1]
}

const PAGES = [
  { at: 0, src: A.raSite, url: 'ra-energy.fr', name: 'R&A Energy', kind: 'Site vitrine' },
  { at: 172, src: A.shika, url: 'shika-consulting.fr', name: 'Shika Consulting', kind: 'Site vitrine' },
  { at: 226, src: A.personal, url: 'usepersonal.app', name: 'Personal', kind: 'Landing page' },
  { at: 280, src: A.amg, url: 'amgprom.com', name: 'AMG Promotion', kind: 'Showroom en ligne' },
  { at: 336, src: A.crm, url: 'CRM R&A Energy', name: 'CRM R&A Energy', kind: 'Application métier' },
  { at: 500, src: A.feed, url: 'usepersonal.app', name: 'Personal', kind: 'SaaS' },
  { at: 530, src: A.awl, url: 'app.maisonawl.com', name: 'Maison AWL', kind: 'Marketplace' },
]

const camAt = (f: number): Cam => ({
  dolly: kf(f, [[0, -620], [100, -210], [330, -120], [392, -330], [418, -330], [462, 520], [478, 520], [520, -150], [560, -90], [710, -240], [790, 60], [840, 120]]),
  pitch: kf(f, [[0, 40], [100, 11], [330, 9], [392, 13], [418, 13], [462, 5], [478, 5], [520, 10], [710, 11], [790, 58], [840, 60]]),
  yaw: kf(f, [[0, -24], [100, -7], [330, 8], [392, 17], [418, 17], [462, 9], [478, 9], [520, -5], [560, -9], [710, 6], [790, 0]]),
  x: kf(f, [[0, 0], [392, 60], [418, 60], [462, 300], [478, 300], [520, 0]]),
  y: kf(f, [[0, -40], [100, -300], [418, -300], [462, -345], [478, -345], [520, -300], [720, -300], [790, -20]]),
  z: kf(f, [[0, 300], [100, 120], [418, 150], [462, 430], [478, 430], [520, 120], [720, 120], [790, 300]]),
})

const Headline: React.FC<{ f: number; from: number; to: number; label?: string; lines: string[]; size?: number }> = ({ f, from, to, label, lines, size = 98 }) => {
  if (f < from - 2 || f > to + 14) return null
  const out = p(f, to, to + 12, Easing.in(Easing.cubic))
  return (
    <div style={{ position: 'absolute', left: 72, right: 72, top: 250, color: colors.white, opacity: 1 - out, transform: 'translateY(' + -out * 24 + 'px)' }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30, opacity: p(f, from, from + 16, OUT), fontFamily: fonts.body, fontSize: 27, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.gold }}>
          <span style={{ width: 44, height: 2, background: colors.gold, transform: 'scaleX(' + p(f, from, from + 20, OUT) + ')', transformOrigin: '0 50%' }} />{label}
        </div>
      )}
      {lines.map((l, i) => {
        const t = p(f, from + 5 + i * 6, from + 33 + i * 6, OUT)
        return (
          <div key={l} style={{ overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em' }}>
            <div style={{ fontFamily: fonts.display, fontSize: size, fontWeight: 500, lineHeight: 1.03, letterSpacing: '-0.05em', transform: 'translateY(' + (1 - t) * 112 + '%)' }}>{l}</div>
          </div>
        )
      })}
    </div>
  )
}

const Caption: React.FC<{ f: number }> = ({ f }) => {
  let idx = 0
  PAGES.forEach((pg, i) => { if (f >= pg.at) idx = i })
  const cur = PAGES[idx]
  const start = Math.max(cur.at, 118)
  const vis = p(f, start, start + 14, OUT) * (1 - p(f, 548, 560)) * (f >= 118 ? 1 : 0) * (1 - p(f, 404, 414) + p(f, 492, 502))
  return (
    <div style={{ position: 'absolute', left: 72, right: 72, top: 1590, display: 'flex', alignItems: 'center', gap: 22, opacity: vis, transform: 'translateY(' + (1 - p(f, start, start + 14, OUT)) * 14 + 'px)', color: colors.white }}>
      <span style={{ width: 13, height: 13, borderRadius: 13, background: colors.gold }} />
      <span style={{ fontFamily: fonts.display, fontSize: 46, fontWeight: 500, letterSpacing: '-0.035em' }}>{cur.name}</span>
      <span style={{ fontFamily: fonts.body, fontSize: 27, color: '#a5a5a0', letterSpacing: '0.01em', marginTop: 8 }}>{cur.kind}</span>
    </div>
  )
}

// Galerie : [capture, colonne x, y de départ, profondeur]
const WALL: [string, number, number, number][] = [
  [A.arises, -330, 250, 2], [A.alertes, 320, 520, 2], [A.sotraya, -300, 880, 2], [A.association, 340, 1150, 2], [A.fontaines, -320, 1500, 2],
  [A.automation, 420, -120, 1], [A.awlLanding, -470, 420, 1], [A.crmCarte, 430, 800, 1], [A.personalLogin, -450, 1260, 1], [A.sotrayaAbout, 440, 1620, 1],
  [A.arisesLogin, -380, -60, 0], [A.shika, 400, 300, 0], [A.amg, -420, 760, 0], [A.feed, 380, 1180, 0], [A.raSite, -400, 1640, 0],
]
const DEPTH = [{ z: -1500, blur: 9, dim: 0.42, speed: 2.1 }, { z: -620, blur: 3.2, dim: 0.66, speed: 3.6 }, { z: 60, blur: 0, dim: 1, speed: 5.6 }]
const STATS = [['+20', 'projets livrés'], ['5/5', 'sur Google'], ['+5 ans', "d'expérience"]]

const Gallery: React.FC<{ f: number }> = ({ f }) => {
  const cam: Cam = { dolly: -260 + f * 1.1, pitch: 0, yaw: 13 - f * 0.03, x: 0, y: 0, z: 0 }
  const focus = p(f, 26, 44)
  return (
    <AbsoluteFill>
      {DEPTH.map((d, layer) => (
        <Stage key={layer} cam={cam} blur={d.blur + (layer === 2 ? focus * 2.5 : 0)}>
          {WALL.filter(w => w[3] === layer).map(([src, x, y]) => (
            <Panel key={src} src={src} x={x * (layer === 0 ? 1.7 : layer === 1 ? 1.2 : 1)} y={y - 760 - f * d.speed} z={d.z} w={layer === 2 ? 600 : 640} dim={d.dim * (1 - focus * 0.45)} />
          ))}
        </Stage>
      ))}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 34% at 50% 47%, rgba(6,6,7,0.86) 0%, rgba(6,6,7,0.55) 55%, rgba(6,6,7,0) 100%)', opacity: focus }} />
      {STATS.map(([big, small], i) => {
        const a = 30 + i * 36
        const t = p(f, a, a + 22, OUT)
        const out = i < 2 ? p(f, a + 32, a + 40, Easing.in(Easing.cubic)) : 0
        if (f < a - 1) return null
        return (
          <div key={big} style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', color: colors.white, opacity: 1 - out, transform: 'translateY(' + -out * 30 + 'px)' }}>
            <div style={{ overflow: 'hidden', paddingBottom: 20 }}>
              <div style={{ fontFamily: fonts.display, fontSize: 250, fontWeight: 500, letterSpacing: '-0.065em', lineHeight: 0.98, transform: 'translateY(' + (1 - t) * 108 + '%)' }}>{big}</div>
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 40, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.gold, opacity: p(f, a + 8, a + 26, OUT), marginTop: 4 }}>{small}</div>
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity: 0.2, pointerEvents: 'none' }}>
    <svg width="100%" height="100%">
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 97} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
)

export const McStudioReal: React.FC = () => {
  const f = useCurrentFrame()
  const T = REAL_TIMELINE
  const cam = camAt(f)
  const open = kf(f, [[0, 1.2], [20, 1.2], [88, 106], [722, 106], [778, 1.2]])
  const on = p(f, 58, 84) * (1 - p(f, 726, 746))
  const sweep = f < 400 ? p(f, 2, 60, Easing.inOut(Easing.quad)) : p(f, 770, 834, Easing.inOut(Easing.quad))
  // Téléphone : entre, mise au point, sort
  const phIn = p(f, 344, 398, OUT)
  const phOut = p(f, 484, 512, Easing.in(Easing.cubic))
  const phone = { x: 318 + (1 - phIn) * 520, y: -338 - Math.sin(f / 26) * 7 - phOut * 900, z: 430, ry: -16 + (1 - phIn) * -50 + p(f, 418, 462) * 9, rx: -3, rz: 2.5 - phOut * 10 }
  const phoneOn = f > 340 && f < 514
  const dof = p(f, 420, 458) * (1 - p(f, 482, 506))
  const inGallery = f >= T.galerie - 12 && f < T.signature + 12
  const setVis = 1 - p(f, T.galerie - 12, T.galerie) + p(f, T.signature, T.signature + 14)
  const light = 0.35 + 0.65 * p(f, 30, 90)
  const laptop = (reflect?: boolean) => (
    <Laptop open={open} on={on} sweep={sweep} reflect={reflect}>
      <ScreenPages pages={PAGES} frame={f} />
    </Laptop>
  )
  const ph = <Phone {...phone} src={A.crmMobile} />
  const end = f - T.signature
  return (
    <AbsoluteFill style={{ background: '#060607', overflow: 'hidden' }}>
      {(f < T.galerie || f >= T.signature) && (
        <AbsoluteFill style={{ opacity: setVis }}>
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 46% at 50% 38%, rgba(54,50,44,' + 0.55 * light + ') 0%, rgba(6,6,7,0) 70%)' }} />
          <Stage cam={cam} blur={dof * 5}>
            <Floor light={light} shadows={[{ x: 0, z: 300, w: 1180, d: 900, o: 0.82 }, ...(phoneOn ? [{ x: phone.x, z: 440, w: 420, d: 260, o: 0.4 * phIn * (1 - phOut) }] : [])]} />
          </Stage>
          <Stage cam={cam} mirror blur={7 + dof * 5} opacity={0.2 * light}>
            {laptop(true)}
            {phoneOn && ph}
          </Stage>
          <Stage cam={cam} blur={dof * 7.5}>{laptop()}</Stage>
          {phoneOn && <Stage cam={cam}>{ph}</Stage>}
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(6,6,7,0.82) 0%, rgba(6,6,7,0) 30%, rgba(6,6,7,0) 76%, rgba(6,6,7,0.94) 100%)' }} />
        </AbsoluteFill>
      )}
      {inGallery && <AbsoluteFill style={{ opacity: p(f, T.galerie - 4, T.galerie + 10) * (1 - p(f, T.signature - 12, T.signature)) }}><Gallery f={f - T.galerie} /></AbsoluteFill>}

      <Headline f={f} from={10} to={54} lines={['Votre idée.']} size={118} />
      <Headline f={f} from={70} to={104} lines={['Devenue réelle.']} size={118} />
      <Headline f={f} from={T.sites + 8} to={T.produit - 14} label="01 — Sites web" lines={['Pensés pour', 'convertir.']} />
      <Headline f={f} from={T.produit + 8} to={T.galerie - 16} label="02 — Applications & SaaS" lines={['Du bureau', 'à la poche.']} />
      <Caption f={f} />

      {end > 56 && (
        <AbsoluteFill style={{ alignItems: 'center', color: colors.white }}>
          <div style={{ position: 'absolute', top: 330, opacity: p(end, 58, 84, OUT), transform: 'translateY(' + (1 - p(end, 58, 84, OUT)) * 26 + 'px)', textAlign: 'center' }}>
            <div style={{ fontFamily: fonts.display, fontSize: 82, fontWeight: 500, letterSpacing: '-0.05em', lineHeight: 1.06 }}>Design & développement,<br />de l'idée au lancement.</div>
          </div>
          <div style={{ position: 'absolute', top: 1560, opacity: p(end, 78, 104, OUT), fontFamily: fonts.body, fontSize: 36, letterSpacing: '0.08em', color: colors.gold }}>mc-studio.eu</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 52%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
      <Grain f={f} />
      <AbsoluteFill style={{ background: '#060607', opacity: 1 - p(f, 0, 14), pointerEvents: 'none' }} />
    </AbsoluteFill>
  )
}
