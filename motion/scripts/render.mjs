import { bundle } from '@remotion/bundler'
import { openBrowser, selectComposition, renderStill, renderMedia } from '@remotion/renderer'
import { mkdir, readFile, copyFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
const creator = process.argv.includes('--creator')
const compositionId = creator ? 'McStudioCreator' : 'McStudioReel'
const filename = creator ? 'mc-studio-creator.mp4' : 'mc-studio-reel.mp4'
const out = path.join(root, 'out', ...(creator ? ['creator'] : []))
await mkdir(out, { recursive: true })
// Bundle only the selected film’s actual assets and local fonts.
const source = await readFile(creator ? 'src/creator/assets.ts' : 'src/showreel/primitives.tsx', 'utf8')
const assets = [...source.matchAll(/: '((?:img|assets)\/[^']+)'/g)].map(m => m[1])
assets.push('motion/fonts/host-grotesk-latin.woff2', 'motion/fonts/inter-latin.woff2')
const publicDir = path.join(out, 'render-public')
for (const asset of assets) {
  const dest = path.join(publicDir, asset)
  await mkdir(path.dirname(dest), { recursive: true })
  await copyFile(path.resolve(root, '../public', asset), dest)
}
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), outDir: path.join(out, 'bundle'), publicDir })
const browser = await openBrowser('chrome')
const browserErrors = []
const onBrowserLog = log => {
  if (log.type === 'error') { browserErrors.push(log.text); console.error(log.text) }
}
try {
  const composition = await selectComposition({ serveUrl, id: compositionId, puppeteerInstance: browser, onBrowserLog })
  if (composition.durationInFrames !== 900 || composition.width !== 1920 || composition.height !== 1080 || composition.fps !== 30) throw new Error('Unexpected master specifications')
  console.log('Master verified: 1920×1080 / 30 fps / 900 frames')
  if (process.argv.includes('--render')) {
    let last = -1
    await renderMedia({ serveUrl, composition, puppeteerInstance: browser, outputLocation: path.join(out, filename), codec: 'h264', muted: true, crf: 17, pixelFormat: 'yuv420p', imageFormat: 'jpeg', jpegQuality: 95, concurrency: 4, onBrowserLog, onProgress: ({ progress }) => {
      const step = Math.floor(progress * 10)
      if (step !== last) { last = step; console.log('Render ' + step * 10 + '%') }
    } })
    console.log('Export complete: ' + path.join(out, filename))
  } else {
    const frameArg = process.argv.find(a => a.startsWith('--frames='))
    const frames = frameArg ? frameArg.split('=')[1].split(',').map(Number) : creator ? [0, 65, 177, 270, 365, 478, 548, 656, 725, 825, 860, 899] : [0, 50, 130, 245, 375, 460, 540, 620, 715, 770, 850, 899]
    await mkdir(path.join(out, 'review'), { recursive: true })
    for (const frame of frames) {
      await renderStill({ serveUrl, composition, puppeteerInstance: browser, frame, output: path.join(out, 'review', 'frame-' + String(frame).padStart(3, '0') + '.png'), imageFormat: 'png', onBrowserLog })
      console.log('Reviewed frame ' + frame)
    }
  }
  await writeFile(path.join(out, 'render-report.json'), JSON.stringify({ width: composition.width, height: composition.height, fps: composition.fps, frames: composition.durationInFrames, browserErrors, audio: 'silent', assets }, null, 2))
  if (browserErrors.length) throw new Error('Browser reported rendering errors')
} finally { await browser.close({ silent: true }) }
