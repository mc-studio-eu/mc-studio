<script setup lang="ts">
type Vector = [x: number, y: number, z: number]
type Quad = [a: number, b: number, c: number, d: number]
type Surface = { points: Quad; normal: Vector; center: Vector; edge: boolean; layer: number }
type Geometry = { vertices: Vector[]; surfaces: Surface[] }
type Pose = { pitch: number; yaw: number; roll: number }
type Shade = { fill: string; points: Quad; depth: number; highlight: string }

const stage = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const isDrawn = ref(false)
const viewWidth = 900
const viewHeight = 800
const cameraDistance = 6.4
const basePose: Pose = { pitch: .66, yaw: -.48, roll: -.29 }

const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const subtract = (a: Vector, b: Vector): Vector => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const normalize = (v: Vector): Vector => {
  const norm = Math.hypot(...v) || 1
  return [v[0] / norm, v[1] / norm, v[2] / norm]
}
const cross = (a: Vector, b: Vector): Vector => [
  a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0],
]
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function makeGeometry(samples: number): Geometry {
  const vertices: Vector[] = []
  const surfaces: Surface[] = []
  const bands = 7
  const bandSpacing = .193
  const halfWidth = .084
  const halfThickness = .017

  for (let band = 0; band < bands; band++) {
    const lane = (band - (bands - 1) / 2) * bandSpacing
    const start = vertices.length
    for (let section = 0; section <= samples; section++) {
      const theta = section / samples * Math.PI * 2
      const radialX = Math.cos(theta)
      const radialY = Math.sin(theta)
      const radius = 1.57 + .33 * Math.cos(3 * theta + .22)
      const twist = 1.5 * theta + .35 + .28 * Math.sin(3 * theta)
      const axisZ = .23 * Math.sin(3 * theta) + .19 * Math.cos(theta + .65)
      const turnCos = Math.cos(twist)
      const turnSin = Math.sin(twist)

      for (const [side, face] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
        const width = lane + side * halfWidth
        const thickness = face * halfThickness
        const r = radius + width * turnCos - thickness * turnSin
        const z = axisZ + width * turnSin + thickness * turnCos
        vertices.push([r * radialX, r * radialY, z])
      }
    }

    for (let section = 0; section < samples; section++) {
      const row = start + section * 4
      for (let side = 0; side < 4; side++) {
        const next = (side + 1) % 4
        const points: Quad = [row + side, row + next, row + 4 + next, row + 4 + side]
        const [a, b, c, d] = points.map(index => vertices[index]!) as [Vector, Vector, Vector, Vector]
        surfaces.push({
          points,
          normal: normalize(cross(subtract(d, a), subtract(b, a))),
          center: [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4],
          edge: side % 2 !== 0,
          layer: Math.abs(band - (bands - 1) / 2),
        })
      }
    }
  }

  return { vertices, surfaces }
}

function makeRotation(pose: Pose) {
  const cp = Math.cos(pose.pitch)
  const sp = Math.sin(pose.pitch)
  const cy = Math.cos(pose.yaw)
  const sy = Math.sin(pose.yaw)
  const cr = Math.cos(pose.roll)
  const sr = Math.sin(pose.roll)

  return ([x, y, z]: Vector): Vector => {
    const pitchedY = y * cp - z * sp
    const pitchedZ = y * sp + z * cp
    const yawedX = x * cy + pitchedZ * sy
    return [yawedX * cr - pitchedY * sr, yawedX * sr + pitchedY * cr, -x * sy + pitchedZ * cy]
  }
}

const amberLight = normalize([-.68, .79, .46])
const softbox = normalize([.82, .28, .52])
const goldBounce = normalize([.13, .82, .52])
const reflection = normalize([-.36, -.84, -.39])

function shadeMesh(geometry: Geometry, pose: Pose) {
  const rotate = makeRotation(pose)
  const projected = geometry.vertices.map(vertex => {
    const [x, y, z] = rotate(vertex)
    const perspective = cameraDistance / (cameraDistance - z)
    return [viewWidth * .50 + x * 141 * perspective, viewHeight * .54 - y * 141 * perspective] as const
  })

  const faces: Shade[] = []
  for (const surface of geometry.surfaces) {
    const normal = rotate(surface.normal)
    const center = rotate(surface.center)
    const view = normalize([-center[0], -center[1], cameraDistance - center[2]])
    const incidence = dot(view, normal)
    if (incidence < -.035) continue

    const mirror: Vector = [
      2 * incidence * normal[0] - view[0],
      2 * incidence * normal[1] - view[1],
      2 * incidence * normal[2] - view[2],
    ]
    const warm = Math.max(0, dot(mirror, amberLight))
    const cool = Math.max(0, dot(mirror, softbox))
    const wine = Math.max(0, dot(mirror, reflection))
    const bronze = Math.max(0, dot(mirror, goldBounce))
    const glow = 96 * warm ** 3 + 170 * warm ** 20 + 38 * bronze ** 5
    const steel = 82 * cool ** 3 + 126 * cool ** 24
    const bounced = 39 * wine ** 3
    const facing = Math.max(0, dot(normal, amberLight))
    const rim = (1 - Math.max(0, incidence)) ** 3
    const temperature = surface.layer / 3
    const base = 17 + 19 * facing + 6 * temperature
    const edge = surface.edge ? 10 + 40 * warm + 18 * rim : 0
    const rgb = [
      base + glow + steel * .69 + bounced * 1.32 + edge,
      base + glow * .68 + steel * .91 + bounced * .49 + edge * .62,
      base * 1.19 + glow * .38 + steel + bounced * .75 + edge * .38,
    ].map(value => Math.round(clamp(value, 0, 255)))

    faces.push({
      points: surface.points,
      depth: center[2],
      fill: `rgb(${rgb.join(',')})`,
      highlight: `rgba(246,196,127,${surface.edge ? .05 + .37 * warm ** 4 : .016 + .1 * warm ** 8})`,
    })
  }

  faces.sort((first, second) => first.depth - second.depth)
  return { projected, faces }
}

let cleanup: (() => void) | undefined

onMounted(() => {
  const element = stage.value
  const surface = canvas.value
  const context = surface?.getContext('2d')
  if (!element || !surface || !context) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const mesh = makeGeometry(84)
  const current = { ...basePose }
  let target = { ...basePose }
  let pointerX = 0
  let pointerY = 0
  let scroll = 0
  let frame = 0
  let visible = true
  let size = { width: 0, height: 0 }

  function paint() {
    if (!size.width || !size.height) return
    const { projected, faces } = shadeMesh(mesh, current)
    const scale = Math.min(size.width / viewWidth, size.height / viewHeight)
    const offsetX = (size.width - viewWidth * scale) / 2
    const offsetY = (size.height - viewHeight * scale) / 2
    context!.setTransform(1, 0, 0, 1, 0, 0)
    context!.clearRect(0, 0, size.width, size.height)
    context!.setTransform(scale, 0, 0, scale, offsetX, offsetY)

    for (const face of faces) {
      const [a, b, c, d] = face.points.map(index => projected[index]!)
      context!.beginPath()
      context!.moveTo(a![0], a![1])
      context!.lineTo(b![0], b![1])
      context!.lineTo(c![0], c![1])
      context!.lineTo(d![0], d![1])
      context!.closePath()
      context!.fillStyle = face.fill
      context!.fill()
      // A shallow stroke in the same material closes canvas seams. The upper
      // edge carries a separate warm reflection where the light grazes it.
      context!.lineWidth = .78
      context!.strokeStyle = face.fill
      context!.stroke()
      context!.beginPath()
      context!.moveTo(a![0], a![1])
      context!.lineTo(d![0], d![1])
      context!.lineWidth = .62
      context!.strokeStyle = face.highlight
      context!.stroke()
    }
    isDrawn.value = true
  }

  function tick() {
    frame = 0
    if (!visible) return
    current.pitch += (target.pitch - current.pitch) * .115
    current.yaw += (target.yaw - current.yaw) * .115
    current.roll += (target.roll - current.roll) * .115
    paint()
    if (Math.abs(target.pitch - current.pitch) + Math.abs(target.yaw - current.yaw) + Math.abs(target.roll - current.roll) > .002) {
      frame = window.requestAnimationFrame(tick)
    }
  }

  function updatePose() {
    if (reducedMotion.matches || !visible) return
    target = {
      pitch: basePose.pitch + .18 * pointerY - .25 * scroll,
      yaw: basePose.yaw + .31 * pointerX + .72 * scroll,
      roll: basePose.roll + .13 * pointerX - .38 * scroll,
    }
    if (!frame) frame = window.requestAnimationFrame(tick)
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.7)
    const width = Math.round(element!.clientWidth * ratio)
    const height = Math.round(element!.clientHeight * ratio)
    if (size.width === width && size.height === height) return
    size = { width, height }
    surface!.width = width
    surface!.height = height
    if (visible) paint()
  }

  function trackScroll() {
    scroll = clamp(window.scrollY / Math.max(1, window.innerHeight), 0, 1)
    updatePose()
  }

  function trackPointer(event: PointerEvent) {
    if (!finePointer.matches || event.pointerType !== 'mouse' || reducedMotion.matches) return
    pointerX = clamp(2 * event.clientX / window.innerWidth - 1, -1, 1)
    pointerY = clamp(2 * event.clientY / window.innerHeight - 1, -1, 1)
    updatePose()
  }

  function resetPointer() {
    pointerX = 0
    pointerY = 0
    updatePose()
  }

  function onMotionChange() {
    if (reducedMotion.matches) {
      window.cancelAnimationFrame(frame)
      frame = 0
      Object.assign(current, basePose)
      target = { ...basePose }
      paint()
    } else {
      trackScroll()
    }
  }

  const sizes = 'ResizeObserver' in window ? new ResizeObserver(resize) : undefined
  sizes?.observe(element)
  if (!sizes) window.addEventListener('resize', resize, { passive: true })
  const visibility = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting)
    if (!visible) return
    trackScroll()
    paint()
  }) : undefined
  visibility?.observe(element)
  window.addEventListener('scroll', trackScroll, { passive: true })
  window.addEventListener('pointermove', trackPointer, { passive: true })
  document.documentElement.addEventListener('pointerleave', resetPointer, { passive: true })
  reducedMotion.addEventListener('change', onMotionChange)
  resize()

  cleanup = () => {
    sizes?.disconnect()
    visibility?.disconnect()
    if (!sizes) window.removeEventListener('resize', resize)
    window.cancelAnimationFrame(frame)
    window.removeEventListener('scroll', trackScroll)
    window.removeEventListener('pointermove', trackPointer)
    document.documentElement.removeEventListener('pointerleave', resetPointer)
    reducedMotion.removeEventListener('change', onMotionChange)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="stage" class="application-sculpture" :class="{ 'application-sculpture--live': isDrawn }" aria-hidden="true">
    <div class="application-sculpture__field" />
    <img
      class="application-sculpture__still"
      src="/img/studio/application-sculpture.webp"
      width="1350"
      height="1200"
      fetchpriority="high"
      alt=""
    >
    <canvas ref="canvas" class="application-sculpture__canvas" />
  </div>
</template>

<style scoped>
.application-sculpture {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  isolation: isolate;
}
.application-sculpture__field, .application-sculpture__still, .application-sculpture__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.application-sculpture__field {
  z-index: -1;
  background:
    radial-gradient(ellipse at 56% 46%, #702f361b, transparent 55%),
    radial-gradient(ellipse at 52% 37%, #5d493331, transparent 63%);
}
.application-sculpture__field::before {
  position: absolute;
  inset: 2% 2% 7%;
  background-image:
    linear-gradient(to right, #c4ad9620 1px, transparent 1px),
    linear-gradient(to bottom, #c4ad9620 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(ellipse, #0003 0 34%, #000b 48%, transparent 73%);
  content: '';
}
.application-sculpture__still { object-fit: contain; }
.application-sculpture__canvas { visibility: hidden; }
.application-sculpture--live .application-sculpture__canvas { visibility: visible; }
.application-sculpture--live .application-sculpture__still { visibility: hidden; }
</style>
