import React, {type CSSProperties} from 'react'
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, interpolateColors} from 'remotion'
import {Logo} from '../components/Logo'
import {p, mix, OUT, Reveal} from '../showreel/primitives'
import '../showreel/loadFonts'

export const BUSINESS_FRAMES = 900
const B = {paper: '#F5F2EA', ink: '#171815', gold: '#F0BF6C', line: '#D9D7CD', muted: '#74756A', white: '#FFFDF8'}
const steps = ['Échanger', 'Cadrer', 'Concevoir', 'Construire', 'Lancer']
export const BUSINESS_TIMELINE = {
  intro: {from: 0, durationInFrames: 90},
  discover: {from: 75, durationInFrames: 135},
  scope: {from: 195, durationInFrames: 135},
  design: {from: 315, durationInFrames: 165},
  build: {from: 465, durationInFrames: 165},
  launch: {from: 615, durationInFrames: 165},
  close: {from: 765, durationInFrames: 135},
} as const

const Caption: React.FC<{children: React.ReactNode; style?: CSSProperties}> = ({children,style}) =>
  <div style={{fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', ...style}}>{children}</div>

const Board: React.FC<{children?: React.ReactNode; style?: CSSProperties}> = ({children,style}) =>
  <div style={{position: 'absolute', background: B.white, border: '1px solid ' + B.line, borderRadius: 16, boxShadow: '0 20px 50px #17181509', boxSizing: 'border-box', ...style}}>{children}</div>

const StepShell: React.FC<{n: number; title: string[]; body: string[]; children: React.ReactNode; duration: number}> =
({n,title,body,children,duration}) => {
  const f = useCurrentFrame()
  const visibility = p(f, 8, 21, OUT) * (1 - p(f, duration - 27, duration - 15))
  return <AbsoluteFill style={{opacity: visibility}}>
    <Caption style={{position: 'absolute', top: 173, left: 80, color: B.muted}}>0{n} / {steps[n - 1]}</Caption>
    <div style={{position: 'absolute', left: 80, top: 270, width: 695}}>
      {title.map((line,i) => <Reveal key={line} frame={f} at={12 + i * 4} size={94} style={{fontWeight: 500, lineHeight: 1.02}}>{line}</Reveal>)}
    </div>
    <div style={{position: 'absolute', left: 84, top: 623, fontFamily: 'Inter, sans-serif', fontSize: 28, lineHeight: 1.45, letterSpacing: '-0.025em', color: B.muted, opacity: p(f, 25, 44)}}>
      {body.map(line => <div key={line}>{line}</div>)}
    </div>
    {children}
  </AbsoluteFill>
}

const Rail: React.FC = () => {
  const f = useCurrentFrame()
  const phase = interpolate(f, [75,195,315,465,615,765], [0,1,2,3,4,4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  const exit = p(f, 753, 785)
  return <div style={{position: 'absolute', inset: 0, opacity: p(f, 38, 70) * (1 - exit), transform: 'translateY(' + exit * 50 + 'px)'}}>
    <div style={{position: 'absolute', left: 152, top: 943, width: 1520, height: 2, background: B.line}} />
    <div style={{position: 'absolute', left: 152, top: 943, width: 1520 * phase / 4, height: 2, background: B.ink}} />
    {steps.map((step,i) => {
      const completed = p(phase, i - 0.08, i + 0.08)
      return <div key={step} style={{position: 'absolute', left: 80 + i * 380, top: 919, width: 250}}>
        <div style={{marginLeft: 48, width: 47, height: 47, borderRadius: 50, background: interpolateColors(completed, [0,1], [B.paper,B.gold]), border: '1px solid ' + (phase >= i ? B.ink : B.line), display: 'grid', placeItems: 'center', fontSize: 18}}>0{i + 1}</div>
        <div style={{marginTop: 22, fontSize: 25, letterSpacing: '-0.03em', color: phase + 0.05 >= i ? B.ink : B.muted}}>{step}</div>
      </div>
    })}
  </div>
}

const Intro: React.FC = () => {
  const f = useCurrentFrame()
  const exit = 1 - p(f, 63, 82)
  return <AbsoluteFill style={{opacity: exit}}>
    <div style={{position: 'absolute', left: 80, top: 238}}>
      <Reveal frame={f} at={0} size={131}>Un projet ambitieux.</Reveal>
      <Reveal frame={f} at={8} size={131}>Une méthode claire.</Reveal>
    </div>
    <div style={{position: 'absolute', left: 89, top: 611, fontSize: 32, color: B.muted, letterSpacing: '-0.025em', opacity: p(f, 23, 42)}}>Du premier échange au lancement.</div>
    <div style={{position: 'absolute', left: 88, top: 749, width: mix(0, 1720, p(f, 12, 66)), height: 5, background: B.gold}} />
    <Caption style={{position: 'absolute', right: 84, top: 700, color: B.muted, opacity: p(f, 27, 53)}}>CLARTÉ · COLLABORATION · EXÉCUTION</Caption>
  </AbsoluteFill>
}

const Discover: React.FC = () => {
  const f = useCurrentFrame()
  return <StepShell n={1} title={['D’abord,', 'vous écouter.']} body={['Votre activité. Vos objectifs.', 'Les enjeux qui comptent vraiment.']} duration={135}>
    <div style={{position: 'absolute', left: 859, top: 288, width: 2, height: 446 * p(f, 22, 73), background: B.ink}} />
    {[
      ['Votre contexte', 'Comprendre votre activité.'],
      ['Vos objectifs', 'Définir ce que l’on veut atteindre.'],
      ['Vos priorités', 'Identifier l’essentiel.'],
    ].map(([title,line],i) => {
      const t = p(f, 18 + i * 16, 45 + i * 16, OUT)
      return <React.Fragment key={title}>
        <div style={{position: 'absolute', left: 849, top: 284 + i * 179, width: 22, height: 22, borderRadius: 40, background: B.gold, border: '1px solid ' + B.ink, transform: 'scale(' + t + ')'}} />
        <Board style={{left: 905 + (1-t)*50, top: 237 + i * 179, width: 914, height: 144, padding: '23px 31px', opacity: t}}>
          <Caption style={{color: B.muted, fontSize: 14}}>0{i+1} / PREMIER ÉCHANGE</Caption>
          <div style={{fontSize: 41, letterSpacing: '-0.035em', marginTop: 6}}>{title}</div>
          <div style={{fontFamily: 'Inter, sans-serif', fontSize: 22, color: B.muted, marginTop: 4}}>{line}</div>
        </Board>
      </React.Fragment>
    })}
    <Caption style={{position: 'absolute', left: 910, top: 818, color: B.muted, fontSize: 16, opacity: p(f, 66, 88)}}>Un point de départ partagé.</Caption>
  </StepShell>
}

const Scope: React.FC = () => {
  const f = useCurrentFrame()
  const enter = p(f, 15, 47, OUT)
  return <StepShell n={2} title={['Un cadre clair.', 'Avant de créer.']} body={['Une proposition détaillée.', 'Le périmètre, le budget, le planning.']} duration={135}>
    {[2,1].map(i => <Board key={i} style={{left: 949 + i*15, top: 206 + i*15, width: 815, height: 604, background: '#E9E6DD', transform: 'rotate(' + i*1.4*(1-enter/2) + 'deg)', opacity: enter}} />)}
    <Board style={{left: 949, top: 206, width: 815, height: 604, padding: 40, transform: 'translateY(' + mix(70,0,enter) + 'px)', opacity: enter}}>
      <Caption style={{color: B.muted}}>VOTRE PROJET / PROPOSITION</Caption>
      <div style={{fontSize: 45, letterSpacing: '-0.04em', marginTop: 22}}>Tout est posé.</div>
      {['Périmètre', 'Budget', 'Planning'].map((word,i) => <div key={word} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', borderBottom: '1px solid ' + B.line, opacity: p(f, 30+i*12, 48+i*12)}}>
        <div style={{fontSize: 34, letterSpacing: '-0.025em'}}>{word}</div>
        <span style={{width: 34, height: 34, borderRadius: 40, display: 'grid', placeItems: 'center', background: B.gold, fontSize: 23}}>✓</span>
      </div>)}
      <div style={{marginTop: 31, padding: '18px 23px', background: B.gold, display: 'inline-block', borderRadius: 6, fontSize: 25, opacity: p(f, 69, 90)}}>À valider ensemble</div>
    </Board>
  </StepShell>
}

const Design: React.FC = () => {
  const f = useCurrentFrame()
  const detail = p(f, 37, 75)
  const loop = p(f, 57, 99)
  return <StepShell n={3} title={['Vous voyez.', 'Vous ajustez.', 'Vous validez.']} body={['Direction créative, puis maquettes.', 'Vos retours font avancer le design.']} duration={165}>
    <Board style={{left: 828, top: 221, width: 627, height: 441, overflow: 'hidden', opacity: p(f, 14, 37)}}>
      <div style={{height: 48, borderBottom: '1px solid ' + B.line, paddingLeft: 23, display: 'flex', alignItems: 'center'}}><Caption style={{fontSize: 13, color: B.muted}}>MAQUETTE / STRUCTURE</Caption></div>
      <div style={{padding: 32}}>
        <div style={{width: 129, height: 13, background: B.line, marginBottom: 30}} />
        <div style={{width: 395, height: 28, background: interpolateColors(detail,[0,1],[B.line,B.ink]), borderRadius: 3, marginBottom: 12}} />
        <div style={{width: 285, height: 28, background: interpolateColors(detail,[0,1],[B.line,B.ink]), borderRadius: 3}} />
        <div style={{width: 425, height: 11, background: B.line, marginTop: 29}} />
        <div style={{width: 323, height: 11, background: B.line, marginTop: 10}} />
        <div style={{width: mix(140,187,detail), height: 46, background: interpolateColors(detail,[0,1],['#E8E5DD',B.gold]), borderRadius: 6, marginTop: 25}} />
        <div style={{display: 'flex', gap: 12, marginTop: 32}}>{[0,1,2].map(i => <div key={i} style={{height: 62, flex: 1, border: '1px solid ' + B.line, background: '#F0EEE6', transform: 'scaleY(' + p(f,42+i*5,66+i*5,OUT) + ')', transformOrigin: 'bottom'}} />)}</div>
      </div>
    </Board>
    <svg width="1080" height="680" viewBox="0 0 1080 680" style={{position: 'absolute', left: 785, top: 166, overflow: 'visible'}}>
      <path d="M670 265 H888 V562 H362 V510" fill="none" stroke={B.ink} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-loop} />
      <circle cx="362" cy="510" r={7*loop} fill={B.gold} />
    </svg>
    <Board style={{left: 1522, top: 301, width: 293, height: 187, padding: 27, background: B.gold, opacity: p(f,45,65), transform: 'translateY(' + mix(22,0,p(f,45,69,OUT)) + 'px)'}}>
      <Caption style={{fontSize: 14}}>VOS RETOURS</Caption>
      <div style={{fontSize: 32, lineHeight: 1.08, letterSpacing: '-0.035em', marginTop: 22}}>On affine<br />ensemble.</div>
    </Board>
    <Board style={{left: 972, top: 753, width: 647, height: 80, borderColor: B.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: p(f,91,116)}}>
      <span style={{fontSize: 25}}>✓</span><div style={{fontSize: 28, letterSpacing: '-0.025em'}}>Une direction validée</div>
    </Board>
  </StepShell>
}

const Build: React.FC = () => {
  const f = useCurrentFrame()
  const phases = ['Design', 'Développement', 'Tests']
  return <StepShell n={4} title={['On construit.', 'On vérifie.']} body={['Le design devient un produit.', 'Chaque détail est vérifié avant livraison.']} duration={165}>
    <Caption style={{position: 'absolute', left: 835, top: 247, color: B.muted}}>DE LA MAQUETTE AU PRODUIT</Caption>
    <div style={{position: 'absolute', left: 946, top: 459, width: 675, height: 2, background: B.line}} />
    <div style={{position: 'absolute', left: 946, top: 459, width: 675*p(f,36,111), height: 2, background: B.ink}} />
    {phases.map((word,i) => {
      const t = p(f,25+i*28,47+i*28,OUT)
      return <Board key={word} style={{left: 829+i*334, top: 346, width: 302, height: 232, padding: 25, opacity: p(f,18+i*7,38+i*7), transform: 'translateY(' + mix(32,0,t) + 'px)', background: interpolateColors(t,[0,1],[B.white,B.gold])}}>
        <div style={{width: 41, height: 41, border: '1px solid ' + B.ink, borderRadius: 50, display: 'grid', placeItems: 'center', fontSize: 22, opacity: t}}>✓</div>
        <div style={{fontSize: i === 1 ? 30 : 35, letterSpacing: '-0.045em', marginTop: 37}}>{word}</div>
        <Caption style={{fontSize: 13, marginTop: 11, opacity: t}}>{['VALIDÉ','INTÉGRÉ','VÉRIFIÉS'][i]}</Caption>
      </Board>
    })}
    <div style={{position: 'absolute', left: 835, top: 688, display: 'flex', gap: 19}}>
      {['Responsive', 'Performance', 'Vérifications'].map((word,i) => <div key={word} style={{border: '1px solid ' + B.line, borderRadius: 80, padding: '17px 23px', fontSize: 23, opacity: p(f,82+i*9,105+i*9)}}>{word}</div>)}
    </div>
    <Caption style={{position: 'absolute', left: 838, top: 816, color: B.muted, fontSize: 16, opacity: p(f,103,128)}}>Un produit prêt à être utilisé.</Caption>
  </StepShell>
}

const Launch: React.FC = () => {
  const f = useCurrentFrame()
  const ready = p(f,53,91,OUT)
  return <StepShell n={5} title={['On lance.', 'On avance.']} body={['Vous validez la livraison.', 'Nous préparons la suite du projet.']} duration={165}>
    <div style={{position: 'absolute', left: 893, top: 208, width: 852, height: 602, border: '1px solid ' + B.line, borderRadius: 18, background: B.white, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#17181507 1px, transparent 1px), linear-gradient(90deg, #17181507 1px, transparent 1px)', backgroundSize: '38px 38px'}} />
      {[0,1].map(i => <div key={i} style={{position: 'absolute', left: 426-(132+i*54), top: 253-(132+i*54), width: 264+i*108, height: 264+i*108, borderRadius: '50%', border: '1px solid ' + B.line, transform: 'scale(' + mix(0.78,1,p(f,20+i*8,74+i*8,OUT)) + ')', opacity: p(f,20+i*8,45+i*8)}} />)}
      <div style={{position: 'absolute', left: 333, top: 160, width: 186, height: 186, borderRadius: '50%', background: B.gold, display: 'grid', placeItems: 'center', transform: 'scale(' + mix(0.35,1,p(f,18,53,OUT)) + ')'}}>
        <div style={{fontSize: 85, transform: 'scale(' + ready + ')'}}>✓</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 391, textAlign: 'center', fontSize: 49, letterSpacing: '-0.045em', opacity: ready}}>Prêt à prendre vie.</div>
      <div style={{position: 'absolute', left: 45, right: 45, bottom: 39, display: 'flex', justifyContent: 'space-around'}}>
        {['Validation', 'Mise en ligne', 'Livraison'].map((word,i) => <Caption key={word} style={{fontSize: 15, opacity: p(f,52+i*13,75+i*13)}}>{word}</Caption>)}
      </div>
    </div>
  </StepShell>
}

const Close: React.FC = () => {
  const f = useCurrentFrame()
  return <AbsoluteFill style={{opacity: p(f,9,24), background: B.paper}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 147, textAlign: 'center'}}>
      <Reveal frame={f} at={16} size={80}>Du premier échange</Reveal>
      <Reveal frame={f} at={22} size={80}>au lancement.</Reveal>
    </div>
    <div style={{position: 'absolute', left: 380, top: 425, width: 1160, clipPath: 'inset(0 ' + (1-p(f,28,54,OUT))*100 + '% 0 0)'}}><Logo width={1160} fill={B.ink} style={{display: 'block'}} /></div>
    <div style={{position: 'absolute', top: 695, left: 0, right: 0, textAlign: 'center', opacity: p(f,38,58)}}>
      <span style={{display: 'inline-block', background: B.gold, padding: '14px 29px', fontFamily: 'Inter, sans-serif', fontSize: 26, letterSpacing: '0.16em'}}>BUSINESS</span>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 838, textAlign: 'center', fontSize: 33, letterSpacing: '-0.03em', opacity: p(f,48,68)}}>Parlons de votre projet.</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 948, textAlign: 'center', fontSize: 28, letterSpacing: '-0.02em', opacity: p(f,53,73)}}>mc-studio.eu</div>
  </AbsoluteFill>
}

export const McStudioBusinessProcess: React.FC = () => {
  const f = useCurrentFrame()
  return <AbsoluteFill style={{background: B.paper, color: B.ink, fontFamily: '"Host Grotesk", sans-serif', overflow: 'hidden'}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(#17181504 1px, transparent 1px), linear-gradient(90deg, #17181504 1px, transparent 1px)', backgroundSize: '80px 80px'}} />
    <div style={{position: 'absolute', left: 80, right: 80, top: 126, height: 1, background: B.line}} />
    <div style={{opacity: 1-p(f,753,783)}}>
      <Logo width={238} fill={B.ink} style={{position: 'absolute', left: 80, top: 51}} />
      <Caption style={{position: 'absolute', left: 348, top: 70, fontSize: 14}}>BUSINESS</Caption>
      <Caption style={{position: 'absolute', right: 80, top: 70, fontSize: 14, color: B.muted}}>LA MÉTHODE MC STUDIO</Caption>
    </div>
    <Sequence {...BUSINESS_TIMELINE.intro} name="Introduction / Une méthode claire"><Intro /></Sequence>
    <Sequence {...BUSINESS_TIMELINE.discover} name="01 / Échanger"><Discover /></Sequence>
    <Sequence {...BUSINESS_TIMELINE.scope} name="02 / Cadrer"><Scope /></Sequence>
    <Sequence {...BUSINESS_TIMELINE.design} name="03 / Concevoir ensemble"><Design /></Sequence>
    <Sequence {...BUSINESS_TIMELINE.build} name="04 / Construire et vérifier"><Build /></Sequence>
    <Sequence {...BUSINESS_TIMELINE.launch} name="05 / Lancer"><Launch /></Sequence>
    <Rail />
    <Sequence {...BUSINESS_TIMELINE.close} name="Signature / MC Studio Business"><Close /></Sequence>
  </AbsoluteFill>
}
