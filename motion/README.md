# MC Studio — From idea to impact

La nouvelle vidéo **MC Studio Creator** a sa propre composition et son propre export.
Voir [CREATOR.md](CREATOR.md) ; lancer `npm run render:creator` pour la rendre.

Le troisième film présente le **process MC Studio Business**, avec des schémas
animés : [BUSINESS-PROCESS.md](BUSINESS-PROCESS.md), `npm run render:business`.

A 30-second Remotion showreel: **1920 × 1080, 30 fps, 900 frames**.
The master export is `out/mc-studio-reel.mp4` (H.264, CRF 17, 4:2:0).
The film is intentionally silent; no licensed soundtrack was present locally.

## Preview, validate, export

```bash
cd motion
npm ci                    # only needed on a fresh checkout
npm run dev               # Remotion Studio; choose McStudioReel
npm run typecheck
npm run review            # 12 representative full-resolution PNGs
npm run review -- --frames=172,322,502,682,772  # targeted transitions
npm run render            # full 1080p MP4
```

The renderer uses the installed Remotion Chromium. A fresh environment may need
its initial browser download. Once installed, the film's assets and fonts load
locally and rendering requires no external services. The export script bundles
only the six featured portfolio assets and two fonts, rather than copying the
entire website portfolio. Render concurrency is limited to four.

## The sequence

| Time | Scene | Motion |
| --- | --- | --- |
| 0–3 s | The spark | A dot develops into three geometric forms |
| 3–6 s | MC Studio | The forms resolve into disciplines under the authentic wordmark |
| 6–11 s | R&A Energy branding | Original vector reveal, sign application, staggered color panels |
| 11–17 s | Websites | The brand panel expands into a browser; R&A Energy becomes Shika |
| 17–23 s | Personal | The browser docks into a product layout; real login → feed screens |
| 23–26 s | The big picture | Three disciplines form a triptych, then converge into one point |
| 26–30 s | Signature | The point leads the wordmark reveal; the last 2.5 seconds hold still |

Entrances overlap by 16 frames. `src/Video.tsx` owns the timeline;
`src/showreel/` contains the individual scenes. `primitives.tsx` holds the small
shared set of masking, text, browser, image and timing components. Animations
are entirely frame-driven; no timers, CSS animations, network calls or random
values. `theme.ts` and the existing `components/Logo.tsx` supply the brand.

To adjust a scene, edit its local frame timing in the corresponding component.
If changing total duration, update `TOTAL_FRAMES` and the specification assertion
in `scripts/render.mjs`. The renderer writes `out/render-report.json` and fails
on browser errors. Generated review frames and exports stay in ignored `out/`.

The existing square/vertical compositions remain available as framed versions
of the master (`npm run render:square`, `npm run render:vertical`). The delivered
and visually reviewed export is the 16:9 master.

## Source and provenance

The requested Figma file was attempted before implementation:
https://www.figma.com/design/Q7mpxV7ExHgGXoTfMesA0n/Motion-Design-Frames?node-id=1-691
The Figma connector denied access because the connected account lacks editor
access. **Fidelity to those frames could not be verified.** Per the brief's
fallback instruction, this version follows the available MC Studio assets and
existing motion/website identity instead. No Figma assets were reconstructed.

Brand positioning was checked against https://mc-studio.eu/ and
https://mc-studio.eu/business. Project attribution is recorded in
`../app/data/projects.ts`. `public` is the existing symlink to `../public`,
so portfolio images are reused without source duplication.

| Content | Original local asset |
| --- | --- |
| MC Studio wordmark | `../public/img/logo/mc-studio.svg` via existing Logo component |
| R&A Energy leaf | `../public/img/clients/ra-energy.svg` |
| R&A Energy sign | `../public/img/project/logo-raenergy.png` |
| R&A Energy website | `../public/img/project/hero-raenergy.png` |
| Shika website | `../public/img/project/shika-consulting/homepage.webp` |
| Personal login | `../public/img/project/personal/login.webp` |
| Personal feed | `../public/img/project/personal/feed.webp` |

UI content and any figures visible within it are part of the supplied original
screenshots, not newly authored claims. Personal is presented through its real
screens; no simulated feature or fabricated customer data has been added.
Color panels and faint alignment guides are motion presentation elements, not
a claim to reproduce an official client brand manual.

Host Grotesk and Inter match `../app/assets/css/main.css`. Their small Latin
variable font files are bundled in `../public/motion/fonts/` with the upstream
SIL Open Font License texts. Font sources are Google Fonts / Google Fonts GitHub.
