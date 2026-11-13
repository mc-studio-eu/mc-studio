import React, { type CSSProperties } from 'react'
import { AbsoluteFill, Img, staticFile } from 'remotion'
import { Logo } from '../components/Logo'
import { fonts } from '../theme'

const P3: CSSProperties = { position: 'absolute', transformStyle: 'preserve-3d' }
const ALU = 'linear-gradient(180deg,#d6d7da 0%,#b6b8bd 55%,#9c9ea3 100%)'

export type Cam = { dolly: number; pitch: number; yaw: number; x: number; y: number; z: number }

/** Une « prise » : même caméra pour chaque couche, flou/opacité appliqués à plat (profondeur de champ, reflet). */
export const Stage: React.FC<{
  cam: Cam; children: React.ReactNode; blur?: number; opacity?: number; mirror?: boolean; style?: CSSProperties
}> = ({ cam, children, blur = 0, opacity = 1, mirror, style }) => (
  <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: '50% 53%', filter: blur > 0.05 ? 'blur(' + blur.toFixed(2) + 'px)' : undefined, opacity, ...style }}>
    <div style={{ ...P3, left: '50%', top: '53%', width: 0, height: 0, transform: 'translateZ(' + cam.dolly + 'px) rotateX(' + -cam.pitch + 'deg) rotateY(' + cam.yaw + 'deg) translate3d(' + -cam.x + 'px,' + -cam.y + 'px,' + -cam.z + 'px)' + (mirror ? ' scaleY(-1)' : '') }}>
      {children}
    </div>
  </AbsoluteFill>
)

/** Sol du studio : nappe de lumière + ombres de contact. */
export const Floor: React.FC<{ shadows?: { x: number; z: number; w: number; d: number; o: number }[]; light?: number }> = ({ shadows = [], light = 1 }) => (
  <div style={{ ...P3, left: -3200, top: 0, width: 6400, height: 5200, transformOrigin: '50% 0', transform: 'translateZ(-3600px) rotateX(90deg)', background: 'radial-gradient(ellipse 1500px 1300px at 50% 75%, rgba(86,84,80,' + 0.62 * light + ') 0%, rgba(40,39,38,' + 0.5 * light + ') 38%, rgba(8,8,9,0) 72%)' }}>
    {shadows.map((s, i) => (
      <div key={i} style={{ position: 'absolute', left: 3200 + s.x - s.w / 2, top: 3600 + s.z - s.d / 2, width: s.w, height: s.d, background: 'radial-gradient(ellipse at center, rgba(0,0,0,' + s.o + ') 0%, rgba(0,0,0,' + s.o * 0.75 + ') 42%, rgba(0,0,0,0) 70%)' }} />
    ))}
  </div>
)

export type Page = { src: string; url: string }

/** Contenu d'écran : barre de navigateur sobre + capture réelle, fondu entre pages. */
export const ScreenPages: React.FC<{ pages: (Page & { at: number })[]; frame: number; bar?: boolean }> = ({ pages, frame, bar = true }) => {
  let idx = 0
  pages.forEach((pg, i) => { if (frame >= pg.at) idx = i })
  const cur = pages[idx]
  const prev = idx > 0 ? pages[idx - 1] : null
  const t = Math.min(1, Math.max(0, (frame - cur.at) / 9))
  const e = 1 - Math.pow(1 - t, 3)
  const h = bar ? 30 : 0
  return (
    <AbsoluteFill style={{ background: '#0c0c0d' }}>
      {bar && (
        <div style={{ position: 'absolute', inset: '0 0 auto 0', height: h, background: '#ececea', display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12, borderBottom: '1px solid #00000018' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: 8, background: c }} />)}
          <div style={{ marginLeft: 150, width: 380, height: 18, borderRadius: 6, background: '#dcdcd9', fontFamily: fonts.body, fontSize: 10.5, color: '#4c4c4a', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.01em' }}>{cur.url}</div>
        </div>
      )}
      <div style={{ position: 'absolute', inset: h + 'px 0 0 0', overflow: 'hidden' }}>
        {prev && t < 1 && <Img src={staticFile(prev.src)} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0' }} />}
        <Img src={staticFile(cur.src)} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0', opacity: prev ? e : 1, transform: 'translateY(' + (prev ? (1 - e) * 14 : 0) + 'px)' }} />
      </div>
    </AbsoluteFill>
  )
}

const KEY_ROWS = [14, 14, 13, 12, 11]

/** Ordinateur portable aluminium. Origine : centre de la charnière, posé au sol (y = 0). */
export const Laptop: React.FC<{
  open: number; on: number; sweep: number; reflect?: boolean; x?: number; z?: number; ry?: number; children?: React.ReactNode
}> = ({ open, on, sweep, reflect, x = 0, z = 0, ry = 0, children }) => {
  const W = 900, H = 590, D = 612, T = 15, LT = 7
  const sheen = 'linear-gradient(100deg, transparent ' + (sweep * 140 - 40) + '%, rgba(255,255,255,0.55) ' + (sweep * 140 - 20) + '%, transparent ' + (sweep * 140) + '%)'
  return (
    <div style={{ ...P3, transform: 'translate3d(' + x + 'px,0,' + z + 'px) rotateY(' + ry + 'deg)' }}>
      {/* Base */}
      <div style={{ ...P3, left: -W / 2, top: 0, width: W, height: D, transformOrigin: '50% 0', transform: 'translateY(' + -T + 'px) rotateX(90deg)' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '8px 8px 24px 24px', background: reflect ? '#1a1a1b' : 'linear-gradient(180deg,#b9bbc0 0%,#c9cace 30%,#d2d3d6 100%)', boxShadow: 'inset 0 0 0 1px #ffffff55', overflow: 'hidden' }}>
          {!reflect && <>
            <div style={{ position: 'absolute', left: 46, right: 46, top: 34, height: 262, borderRadius: 9, background: '#141416', padding: 7, display: 'flex', flexDirection: 'column', gap: 5, boxShadow: 'inset 0 1px 3px #000' }}>
              {KEY_ROWS.map((n, r) => (
                <div key={r} style={{ flex: r === 0 ? 0.62 : 1, display: 'flex', gap: 5 }}>
                  {Array.from({ length: n }).map((_, k) => (
                    <div key={k} style={{ flex: (k === 0 || k === n - 1) && r > 0 ? 1 + r * 0.35 : 1, borderRadius: 5, background: 'linear-gradient(180deg,#2c2d30,#202124)', boxShadow: 'inset 0 1px 0 #ffffff12, 0 1px 0 #000' }} />
                  ))}
                </div>
              ))}
              <div style={{ flex: 1, display: 'flex', gap: 5 }}>
                {[1, 1, 1, 1.3, 5.6, 1.3, 1, 1, 1].map((fl, k) => <div key={k} style={{ flex: fl, borderRadius: 5, background: 'linear-gradient(180deg,#2c2d30,#202124)', boxShadow: 'inset 0 1px 0 #ffffff12, 0 1px 0 #000' }} />)}
              </div>
            </div>
            <div style={{ position: 'absolute', left: '29%', right: '29%', top: 326, bottom: 26, borderRadius: 12, background: 'linear-gradient(180deg,#c3c4c8,#cdced2)', boxShadow: 'inset 0 0 0 1px #00000026, inset 0 1px 2px #00000030' }} />
            {/* lumière de l'écran sur le clavier */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,250,240,' + 0.34 * on + ') 0%, rgba(255,250,240,' + 0.1 * on + ') 34%, rgba(255,255,255,0) 70%)', mixBlendMode: 'screen' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,' + (0.5 - 0.3 * on) + ') 0%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,0) 100%)' }} />
          </>}
        </div>
        {/* tranches avant et latérales */}
        <div style={{ position: 'absolute', left: 16, right: 16, top: D - 1, height: T, transformOrigin: '50% 0', transform: 'rotateX(-90deg)', background: 'linear-gradient(180deg,#e2e3e6 0%,#a9abb0 45%,#6f7175 100%)', borderRadius: '0 0 10px 10px' }}>
          <div style={{ position: 'absolute', left: '42%', right: '42%', top: 0, height: 5, borderRadius: '0 0 6px 6px', background: '#77797d' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 6, width: T, height: D - 26, transformOrigin: '0 50%', transform: 'rotateY(90deg)', background: 'linear-gradient(90deg,#c9cacd,#77797d)' }} />
        <div style={{ position: 'absolute', right: 0, top: 6, width: T, height: D - 26, transformOrigin: '100% 50%', transform: 'rotateY(-90deg)', background: 'linear-gradient(270deg,#c9cacd,#77797d)' }} />
      </div>
      {/* Charnière */}
      <div style={{ ...P3, left: -W * 0.36, top: -T - 9, width: W * 0.72, height: 9, background: 'linear-gradient(180deg,#3a3b3e,#141415)', borderRadius: 3, transform: 'translateZ(-2px)' }} />
      {/* Capot */}
      <div style={{ ...P3, left: -W / 2, top: -T - 3 - H, width: W, height: H, transformOrigin: '50% 100%', transform: 'rotateX(' + (open - 90) + 'deg)' }}>
        {/* dos aluminium + marque gravée */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '22px 22px 8px 8px', background: ALU, transform: 'translateZ(' + -LT + 'px) rotateY(180deg)', backfaceVisibility: 'hidden', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px #ffffff66' }}>
          <div style={{ position: 'absolute', inset: 0, background: sheen }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(180deg)' }}>
            <Logo width={360} fill="#3c3d40" style={{ opacity: 0.9, filter: 'drop-shadow(0 1px 0 #ffffff90)' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 14, right: 14, top: 0, height: LT, transformOrigin: '50% 0', transform: 'rotateX(-90deg)', background: '#9a9ca1' }} />
        {/* face écran */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '22px 22px 8px 8px', background: '#09090a', boxShadow: 'inset 0 0 0 2px #84868b, inset 0 0 0 3px #2a2a2c', backfaceVisibility: 'hidden' }}>
          <div style={{ position: 'absolute', left: 13, right: 13, top: 13, bottom: 20, borderRadius: 9, overflow: 'hidden', background: '#020202' }}>
            <AbsoluteFill style={{ opacity: on }}>{children}</AbsoluteFill>
            <AbsoluteFill style={{ background: 'linear-gradient(118deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.035) 24%, rgba(255,255,255,0) 38%)' }} />
            <AbsoluteFill style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35)' }} />
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 4, width: 5, height: 5, marginLeft: -2.5, borderRadius: 5, background: '#1c2530' }} />
        </div>
      </div>
    </div>
  )
}

/** Téléphone titane. Origine : centre de l'appareil. */
export const Phone: React.FC<{ x: number; y: number; z: number; ry: number; rx?: number; rz?: number; src: string; scale?: number }> = ({ x, y, z, ry, rx = 0, rz = 0, src, scale = 1 }) => {
  const W = 300, H = 650, R = 50
  return (
    <div style={{ ...P3, transform: 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotateY(' + ry + 'deg) rotateX(' + rx + 'deg) rotateZ(' + rz + 'deg) scale3d(' + scale + ',' + scale + ',' + scale + ')' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, borderRadius: R, transform: 'translateZ(' + (-12 + i * 1.5) + 'px)', background: i === 0 ? 'linear-gradient(135deg,#55575b,#2b2c2f)' : 'linear-gradient(90deg,#8e9095 0%,#d9dadd 12%,#a3a5aa 50%,#dcdde0 88%,#85878c 100%)' }} />
      ))}
      <div style={{ position: 'absolute', left: -W / 2, top: -H / 2, width: W, height: H, borderRadius: R, background: '#050506', boxShadow: 'inset 0 0 0 3px #b9bbbf, inset 0 0 0 4.5px #2a2a2c', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 11, borderRadius: R - 10, overflow: 'hidden', background: '#31694e' }}>
          <Img src={staticFile(src)} style={{ position: 'absolute', left: 0, top: 34, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0', display: 'block' }} />
          <div style={{ position: 'absolute', left: '50%', top: 9, width: 84, height: 24, marginLeft: -42, borderRadius: 14, background: '#000' }} />
          <AbsoluteFill style={{ background: 'linear-gradient(122deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 36%)' }} />
        </div>
      </div>
    </div>
  )
}

/** Panneau flottant (galerie de projets). */
export const Panel: React.FC<{ src: string; x: number; y: number; z: number; w: number; ry?: number; dim?: number }> = ({ src, x, y, z, w, ry = 0, dim = 1 }) => (
  <div style={{ ...P3, left: -w / 2, top: -w * 0.3, width: w, height: w * 0.6, transform: 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotateY(' + ry + 'deg)', borderRadius: 18, overflow: 'hidden', background: '#111', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.16)' }}>
    <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0', display: 'block', filter: 'brightness(' + dim + ')' }} />
    <AbsoluteFill style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 30%)' }} />
  </div>
)
