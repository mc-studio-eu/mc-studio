import { cancelRender, continueRender, delayRender, staticFile } from 'remotion'

// Local variable fonts: deterministic and network-independent in Studio/export.
if (typeof document !== 'undefined') {
  const handle = delayRender('Load local MC Studio typefaces')
  Promise.all([
    ['Host Grotesk', 'host-grotesk-latin.woff2'],
    ['Inter', 'inter-latin.woff2'],
  ].map(async ([name, file]) => {
    const font = new FontFace(name, 'url("' + staticFile('motion/fonts/' + file) + '")', { weight: '100 900' })
    document.fonts.add(await font.load())
  })).then(() => continueRender(handle)).catch(cancelRender)
}
