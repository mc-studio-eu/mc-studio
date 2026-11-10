<script setup lang="ts">
import type { RoadmapPhase, RoadmapStep } from '#shared/portal-roadmap'
import { fromRoadmapDay, localRoadmapToday, roadmapBounds, roadmapCalendar, roadmapPeriodLabel, toRoadmapDay, type TimelineMode } from '~/utils/portalRoadmapDates'

const props = defineProps<{
  phases: RoadmapPhase[]
  project: { startDate: string | null; endDate: string | null }
  labels: Record<string, string>
}>()
const emit = defineEmits<{ select: [id: string, kind: 'phase' | 'step'] }>()
const modes: { id: TimelineMode; title: string }[] = [
  { id: 'week', title: 'Semaine' }, { id: 'month', title: 'Mois' }, { id: 'global', title: 'Global' },
]
const mode = ref<TimelineMode>('week')
const expanded = ref(new Set<string>())
const scroller = ref<HTMLElement>()
const track = ref<HTMLElement>()
const sticky = ref<HTMLElement>()
const scrollLeft = ref(0)
const scrollMax = ref(0)
const today = toRoadmapDay(localRoadmapToday())
const bounds = computed(() => roadmapBounds([props.project, ...props.phases.flatMap(phase => [phase, ...phase.steps])]))
const calendar = computed(() => bounds.value ? roadmapCalendar(bounds.value, mode.value) : null)
const hasToday = computed(() => calendar.value && today >= calendar.value.start && today < calendar.value.end)
const rows = computed(() => props.phases.flatMap(phase => {
  const range = roadmapBounds(phase.steps)
  const item = {
    ...phase,
    startDate: phase.startDate || (range ? fromRoadmapDay(range.start) : null),
    endDate: phase.endDate || (range ? fromRoadmapDay(range.end) : null),
  }
  return [
    { kind: 'phase' as const, item },
    ...(expanded.value.has(phase.id) ? phase.steps.map(step => ({ kind: 'step' as const, item: step })) : []),
  ]
}))

function toggle(phaseId: string) {
  if (expanded.value.has(phaseId)) expanded.value.delete(phaseId)
  else expanded.value.add(phaseId)
}

function measure() {
  scrollLeft.value = scroller.value?.scrollLeft || 0
  scrollMax.value = Math.max(0, (scroller.value?.scrollWidth || 0) - (scroller.value?.clientWidth || 0))
}

function move(direction: number) {
  if (scroller.value) scroller.value.scrollBy({ left: direction * Math.max(140, (scroller.value.clientWidth - (sticky.value?.clientWidth || 0)) * .75) })
}

function goToday() {
  if (!calendar.value || !track.value || !scroller.value) return
  const offset = (today - calendar.value.start + .5) * track.value.clientWidth / calendar.value.total
  scroller.value.scrollTo({ left: Math.max(0, offset - (scroller.value.clientWidth - (sticky.value?.clientWidth || 0)) / 2) })
}

watch(mode, async () => {
  await nextTick()
  scroller.value?.scrollTo({ left: 0 })
  measure()
})
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(measure)
  watch([scroller, track], ([scroll, ruler], _, onCleanup) => {
    if (scroll) observer?.observe(scroll)
    if (ruler) observer?.observe(ruler)
    onCleanup(() => observer?.disconnect())
    measure()
  }, { immediate: true })
})
onBeforeUnmount(() => observer?.disconnect())

function interval(start: number, end: number) {
  const range = calendar.value
  if (!range) return {}
  return {
    left: `${100 * (start - range.start) / range.total}%`,
    width: `${100 * (end - start) / range.total}%`,
  }
}

function barStyle(item: RoadmapPhase | RoadmapStep) {
  const start = item.startDate || item.endDate
  const end = item.endDate || item.startDate
  return start && end ? interval(toRoadmapDay(start), toRoadmapDay(end) + 1) : {}
}
</script>

<template>
  <section class="rm-card rm-timeline" aria-label="Planning du projet">
    <div class="rm-timeline-heading">
      <div><h2><UIcon name="i-tabler-chart-gantt"/> Planning du projet</h2><p>Dépliez les phases pour afficher leurs étapes.</p></div>
      <div v-if="calendar" class="rm-timeline-actions">
        <div class="rm-modes" role="group" aria-label="Échelle du planning">
          <button v-for="option in modes" :key="option.id" type="button" :aria-pressed="mode===option.id" @click="mode=option.id">{{ option.title }}</button>
        </div>
        <div class="rm-paging" role="group" aria-label="Déplacement dans le planning">
          <button type="button" :disabled="scrollLeft<=1" aria-label="Voir les dates précédentes" @click="move(-1)"><UIcon name="i-tabler-chevron-left"/></button>
          <button v-if="hasToday" type="button" aria-label="Aller à aujourd’hui" title="Aller à aujourd’hui" @click="goToday"><UIcon name="i-tabler-calendar-dot"/></button>
          <button type="button" :disabled="scrollLeft>=scrollMax-1" aria-label="Voir les dates suivantes" @click="move(1)"><UIcon name="i-tabler-chevron-right"/></button>
        </div>
      </div>
    </div>
    <p v-if="!calendar" class="rm-no-dates"><UIcon name="i-tabler-calendar-off"/> Les dates de planification restent à définir.</p>
    <div ref="scroller" class="rm-scroll" :tabindex="calendar ? 0 : undefined" role="region" aria-label="Planning avec défilement horizontal" @scroll.passive="measure">
      <div class="rm-grid" :class="{'rm-with-dates': calendar}" :style="{'--calendar-width':(calendar?.minWidth || 0)+'px'}">
        <div ref="sticky" class="rm-sticky rm-columns">Phases et étapes</div>
        <div v-if="calendar" ref="track" class="rm-ruler">
          <div class="rm-months">
            <div v-for="tick in calendar.months" :key="tick.start" class="rm-tick" :style="interval(tick.start,tick.end)" :title="tick.title">{{ tick.title }}</div>
          </div>
          <div v-if="calendar.ticks.length" class="rm-weeks">
            <div v-for="tick in calendar.ticks" :key="tick.start" class="rm-tick" :style="interval(tick.start,tick.end)"><strong>{{ tick.title }}</strong><small>{{ tick.description }}</small></div>
          </div>
          <div v-if="hasToday" class="rm-today-marker" :style="interval(today+.5,today+.5)"><span>Aujourd’hui</span></div>
        </div>
        <template v-for="row in rows" :key="row.item.id">
          <div :class="['rm-sticky','rm-row-label',row.kind, row.item.status]">
            <button v-if="row.kind==='phase' && row.item.steps.length" type="button" class="rm-toggle" :aria-label="`${expanded.has(row.item.id) ? 'Replier' : 'Déplier'} ${row.item.title}`" :aria-expanded="expanded.has(row.item.id)" @click="toggle(row.item.id)"><UIcon :name="expanded.has(row.item.id) ? 'i-tabler-chevron-down' : 'i-tabler-chevron-right'"/></button>
            <span v-else class="rm-toggle-spacer"><UIcon v-if="row.kind==='step'" name="i-tabler-corner-down-right"/></span>
            <button type="button" class="rm-row-name" @click="emit('select',row.item.id,row.kind)">
              <strong>{{ row.item.title }}</strong><small>{{ roadmapPeriodLabel(row.item.startDate,row.item.endDate) }}</small>
            </button>
            <span class="rm-status-dot" :aria-label="labels[row.item.status]" :title="labels[row.item.status]"/>
          </div>
          <div v-if="calendar" :class="['rm-lane',row.kind,row.item.status]">
            <i v-for="tick in calendar.ticks.length ? calendar.ticks : calendar.months" :key="tick.start" class="rm-lane-line" :style="interval(tick.start,tick.end)"/>
            <i v-if="hasToday" class="rm-today-line" :style="interval(today+.5,today+.5)"/>
            <button v-if="row.item.startDate || row.item.endDate" type="button" class="rm-bar" :class="{'rm-date-point':row.kind==='step' && (row.item.kind==='milestone' || row.item.startDate===row.item.endDate || !row.item.startDate || !row.item.endDate)}" :style="barStyle(row.item)" :title="`${row.item.title} · ${labels[row.item.status]} · ${roadmapPeriodLabel(row.item.startDate,row.item.endDate)}`" :aria-label="`${row.item.title}, ${labels[row.item.status]}`" @click="emit('select',row.item.id,row.kind)">
              <i v-if="row.kind==='phase'" :style="{width:row.item.progress+'%'}"/><span v-if="row.kind==='phase' && row.item.progress">{{ row.item.progress }} %</span>
            </button>
            <span v-else class="rm-undated">Sans date</span>
          </div>
        </template>
      </div>
    </div>
    <ul class="rm-legend" aria-label="Légende du planning"><li v-for="(label,status) in labels" :key="status" :class="status"><span class="rm-status-dot"/>{{ label }}</li></ul>
  </section>
</template>

<style scoped>
.rm-timeline{--labels-width:clamp(160px,23%,255px);min-width:0;overflow:hidden}
.rm-timeline-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:18px 20px}
.rm-timeline-heading h2{display:flex;align-items:center;gap:10px;font-size:16px;margin:0;font-weight:600}
.rm-timeline-heading h2 .iconify{color:var(--portal-accent-text);font-size:19px}
.rm-timeline-heading p,.rm-no-dates{font-size:12px;color:var(--portal-muted);margin:5px 0 0}
.rm-no-dates{display:flex;align-items:center;gap:8px;padding:12px 20px;margin:0;border-top:1px solid var(--portal-line);background:var(--portal-accent-soft);color:var(--portal-accent-text)}
.rm-timeline-actions,.rm-modes,.rm-paging{display:flex;align-items:center;gap:4px}
.rm-timeline-actions{gap:10px;flex-wrap:wrap}
.rm-modes,.rm-paging{padding:3px;border:1px solid var(--portal-line);border-radius:9px;background:var(--portal-bg)}
.rm-modes button,.rm-paging button{display:inline-grid;place-items:center;min-height:34px;padding:4px 10px;color:var(--portal-muted);font-size:12px;border:1px solid transparent;border-radius:6px}
.rm-modes button:hover,.rm-paging button:hover:not(:disabled){color:var(--portal-text);background:var(--portal-hover)}
.rm-modes button[aria-pressed=true]{color:var(--portal-accent-text);background:var(--portal-accent-soft);border-color:color-mix(in srgb,var(--portal-accent),transparent 60%)}
.rm-paging button{min-width:34px;padding:4px;font-size:16px}
.rm-paging button:disabled{opacity:.35}
.rm-scroll{overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;border-block:1px solid var(--portal-line)}
.rm-scroll:focus-visible{outline:2px solid var(--portal-focus);outline-offset:-2px}
.rm-grid{display:grid;grid-template-columns:minmax(0,1fr);width:100%}
.rm-grid.rm-with-dates{grid-template-columns:var(--labels-width) minmax(var(--calendar-width),1fr);grid-template-columns:var(--labels-width) minmax(max(160px,var(--calendar-width)),1fr)}
.rm-sticky{position:sticky;left:0;z-index:3;background:var(--portal-surface);min-width:0;border-bottom:1px solid var(--portal-line)}
.rm-with-dates .rm-sticky{border-right:1px solid var(--portal-line)}
.rm-columns{display:flex;align-items:center;padding:10px 14px;background:var(--portal-raised);font-size:11px;font-weight:600;color:var(--portal-muted)}
.rm-ruler{position:relative;min-height:44px;background:var(--portal-raised);border-bottom:1px solid var(--portal-line)}
.rm-months,.rm-weeks{position:relative;min-height:30px}
.rm-months:only-child{min-height:44px}
.rm-weeks{min-height:43px;border-top:1px solid var(--portal-line)}
.rm-tick{position:absolute;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;overflow:hidden;white-space:nowrap;border-right:1px solid var(--portal-line);color:var(--portal-muted);font-size:10px}
.rm-months .rm-tick{text-transform:capitalize;font-weight:600;color:var(--portal-strong)}
.rm-weeks strong{color:var(--portal-text);font-size:11px;font-variant-numeric:tabular-nums}
.rm-weeks small{font-size:10px}
.rm-today-marker,.rm-today-line{position:absolute;top:0;bottom:0;border-left:1px dashed var(--portal-accent);pointer-events:none;z-index:2}
.rm-today-marker span{position:absolute;left:0;top:0;padding:2px 5px;border-radius:0 0 4px 0;background:var(--portal-accent);color:var(--portal-accent-ink);font-size:9px;font-weight:700;white-space:nowrap}
.rm-row-label,.rm-lane{display:flex;align-items:center;min-height:59px;border-bottom:1px solid var(--portal-line)}
.rm-row-label:last-child,.rm-lane:last-child,.rm-with-dates .rm-row-label:nth-last-child(2){border-bottom:0}
.rm-row-label{gap:4px;padding:0 10px 0 4px;--state:var(--portal-subtle)}
.rm-row-label.step{min-height:50px;padding-left:17px;background:var(--portal-bg)}
.rm-row-label.in_progress{background:color-mix(in srgb,var(--portal-accent-soft),var(--portal-surface) 30%)}
.rm-row-name{min-width:0;display:grid;gap:3px;text-align:left;flex:1;padding:7px 0}
.rm-row-name strong,.rm-row-name small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rm-row-name strong{font-size:12px;font-weight:600}
.rm-row-name small{color:var(--portal-muted);font-size:10px}
.rm-row-name:hover strong{color:var(--portal-accent-text)}
.rm-toggle,.rm-toggle-spacer{width:32px;min-width:32px;height:36px;display:grid;place-items:center;color:var(--portal-muted);border-radius:6px}
.rm-toggle:hover{color:var(--portal-text);background:var(--portal-hover)}
.rm-status-dot{display:inline-block;width:8px;height:8px;flex:none;border-radius:50%;border:1px solid var(--state,var(--portal-subtle));background:var(--state-fill,transparent)}
.in_progress{--state:var(--portal-accent-text);--state-fill:var(--portal-accent);--bar:var(--portal-accent)}
.done{--state:var(--portal-success);--state-fill:var(--portal-success);--bar:var(--portal-success)}
.awaiting_validation{--state:var(--portal-info);--state-fill:var(--portal-info);--bar:var(--portal-info)}
.blocked{--state:var(--portal-danger);--state-fill:var(--portal-danger);--bar:var(--portal-danger)}
.rm-lane{position:relative;min-width:0;background:var(--portal-surface)}
.rm-lane.step{min-height:50px;background:var(--portal-bg)}
.rm-lane-line{position:absolute;inset-block:0;border-right:1px solid var(--portal-line);pointer-events:none}
.rm-lane-line:nth-child(even){background:color-mix(in srgb,var(--portal-raised),transparent 76%)}
.rm-bar{position:absolute;z-index:1;display:flex;align-items:center;min-width:4px;min-height:27px;height:27px;overflow:hidden;border-radius:6px;background:color-mix(in srgb,var(--bar,var(--portal-subtle)),var(--portal-surface) 55%);border:1px solid color-mix(in srgb,var(--bar,var(--portal-subtle)),transparent 35%);transition:filter .15s}
.rm-bar:hover,.rm-bar:focus-visible{filter:brightness(1.2)}
.rm-bar:focus-visible{z-index:3;outline-offset:0}
.rm-bar i{height:100%;position:absolute;inset:0 auto 0 0;background:color-mix(in srgb,var(--bar,var(--portal-subtle)),var(--portal-surface) 26%)}
.rm-bar span{position:relative;padding:0 6px;white-space:nowrap;font-size:10px;font-weight:700;color:var(--portal-text)}
.step .rm-bar{height:19px;min-height:19px}
.rm-bar.rm-date-point{min-width:0;min-height:28px;height:28px;background:transparent;border:0;overflow:visible;justify-content:center}
.rm-date-point::before{content:'';flex:none;width:11px;height:11px;border-radius:3px;transform:rotate(45deg);background:var(--bar,var(--portal-subtle))}
.rm-undated{position:relative;margin-left:14px;color:var(--portal-muted);font-size:11px}
.rm-legend{display:flex;align-items:center;gap:10px 18px;flex-wrap:wrap;margin:0;padding:12px 20px;list-style:none}
.rm-legend li{display:flex;align-items:center;gap:6px;color:var(--portal-muted);font-size:11px}
@media(max-width:700px){
  .rm-timeline{--labels-width:138px}
  .rm-timeline-heading{padding:14px}
  .rm-timeline-actions{width:100%;justify-content:space-between;gap:4px}
  .rm-modes button,.rm-paging button{min-height:40px}
  .rm-modes button{padding-inline:6px}
  .rm-paging button{min-width:26px}
  .rm-row-label{gap:3px;padding-right:5px}
  .rm-row-label.step{padding-left:5px}
  .rm-toggle,.rm-toggle-spacer{width:26px;min-width:26px}
  .rm-row-name strong{font-size:11px}
  .rm-legend{padding:10px 14px}
}
</style>
