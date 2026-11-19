<script setup lang="ts">
import { clockifyLocalDate, type PortalClockifySnapshot } from '#shared/portal-clockify'
import { clockifyReport, clockifyReportCustomRange, clockifyReportDate, clockifyReportMove, clockifyReportRange, type ClockifyReportPeriod } from '#shared/portal-clockify-report'
import { portalTimerDuration } from '#shared/portal-project-timer'

const props = defineProps<{ data: PortalClockifySnapshot }>()
const route = useRoute()
const router = useRouter()
const today = ref(clockifyLocalDate(new Date().toISOString()))
type ReportPeriod = ClockifyReportPeriod | 'custom'
const period = computed<ReportPeriod>(() => route.query.period === 'custom' ? 'custom' : route.query.period === 'month' ? 'month' : 'week')
const anchor = computed(() => clockifyReportDate(route.query.date) ? route.query.date : today.value)
const queryText = (value: unknown) => typeof value === 'string' ? value : ''
const clientId = computed(() => queryText(route.query.reportClient))
const projectId = computed(() => queryText(route.query.reportProject))
const projects = computed(() => props.data.projects.filter(project => !clientId.value || project.organizationId === clientId.value))
const range = computed(() => period.value === 'custom'
  ? clockifyReportCustomRange(queryText(route.query.from), queryText(route.query.to))
  : clockifyReportRange(anchor.value, period.value))
const report = computed(() => range.value ? clockifyReport(props.data, range.value, { clientId: clientId.value, projectId: projectId.value }) : undefined)
const draftFrom = ref('')
const draftTo = ref('')
const filterError = ref('')
watch([() => route.query.from, () => route.query.to, period], () => {
  draftFrom.value = queryText(route.query.from) || range.value?.start || anchor.value
  draftTo.value = queryText(route.query.to) || range.value?.end || anchor.value
  filterError.value = ''
}, { immediate: true })
const breakdown = ref<'projects' | 'clients'>('projects')
const groups = computed(() => report.value?.[breakdown.value] ?? [])
const selectedDate = ref('')
const selectedDay = computed(() => report.value?.days.find(day => day.date === selectedDate.value)
  ?? report.value?.days.find(day => day.seconds > 0) ?? report.value?.days[0])
const chartMax = computed(() => Math.max(3600, Math.ceil(Math.max(...(report.value?.days.map(day => day.seconds) ?? [0])) / 3600) * 3600))
const fullDateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'UTC' })
const rangeFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'UTC' })
const monthFormat = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const weekdayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'UTC' })
const shortMonthFormat = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const dateObject = (date: string) => new Date(`${date}T00:00:00Z`)
const fullDate = (date: string) => fullDateFormat.format(dateObject(date))
const heading = computed(() => {
  if (!range.value) return ''
  return period.value === 'month' ? monthFormat.format(dateObject(range.value.start))
    : rangeFormat.formatRange(dateObject(range.value.start), dateObject(range.value.end))
})
const percent = (seconds: number) => report.value?.totalSeconds ? seconds / report.value.totalSeconds * 100 : 0
const chartTitle = computed(() => range.value?.aggregation === 'month' ? 'Temps par mois'
  : range.value?.aggregation === 'year' ? range.value.bucketYears > 1 ? 'Temps par groupe d’années' : 'Temps par année' : 'Temps par jour')

function bucketLabel(start: string, end: string) {
  return start === end ? fullDate(start) : rangeFormat.formatRange(dateObject(start), dateObject(end))
}

function shortBucketLabel(start: string, end: string) {
  if (range.value?.aggregation === 'month') return shortMonthFormat.format(dateObject(start))
  if (range.value?.aggregation === 'year') return start.slice(0,4) === end.slice(0,4) ? start.slice(0,4) : `${start.slice(0,4)}–${end.slice(0,4)}`
  return String(Number(start.slice(8)))
}

function navigate(date: string, nextPeriod: ClockifyReportPeriod) {
  if (!clockifyReportDate(date)) return
  return router.push({ query: { ...route.query, view: 'rapport', period: nextPeriod, date, from: undefined, to: undefined } })
}

function goCurrent() {
  today.value = clockifyLocalDate(new Date().toISOString())
  if (period.value !== 'custom') return navigate(today.value, period.value)
}

function changePeriod(value: ReportPeriod) {
  if (value === 'custom') return router.push({ query: { ...route.query, period: 'custom', from: range.value?.start ?? anchor.value, to: range.value?.end ?? anchor.value } })
  return navigate(period.value === 'custom' ? range.value?.start ?? anchor.value : anchor.value, value)
}

function changeClient(value: string) {
  return router.push({ query: { ...route.query, reportClient: value || undefined, reportProject: undefined } })
}

function changeProject(value: string) {
  return router.push({ query: { ...route.query, reportProject: value || undefined } })
}

function applyCustomRange() {
  if (!clockifyReportCustomRange(draftFrom.value, draftTo.value)) {
    filterError.value = 'Renseignez des dates valides, avec une fin postérieure ou égale au début.'
    return
  }
  filterError.value = ''
  return router.push({ query: { ...route.query, period: 'custom', date: undefined, from: draftFrom.value, to: draftTo.value } })
}

function reset() {
  today.value = clockifyLocalDate(new Date().toISOString())
  filterError.value = ''
  return router.push({ query: { ...route.query, period: 'week', date: today.value, from: undefined, to: undefined,
    reportClient: undefined, reportProject: undefined } })
}
</script>

<template>
  <section class="clockify-report" aria-label="Rapport de temps">
    <div class="report-filters">
      <label>Client
        <select :value="clientId" @change="changeClient(($event.target as HTMLSelectElement).value)">
          <option value="">Tous les clients</option>
          <option v-if="clientId && !data.clients.some(client => client.id === clientId)" :value="clientId" disabled>Client indisponible</option>
          <option v-for="client in data.clients" :key="client.id" :value="client.id">{{ client.name }}</option>
        </select>
      </label>
      <label>Projet
        <select :value="projectId" @change="changeProject(($event.target as HTMLSelectElement).value)">
          <option value="">Tous les projets</option>
          <option v-if="projectId && !projects.some(project => project.id === projectId)" :value="projectId" disabled>Projet indisponible</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
        </select>
      </label>
      <button type="button" class="quiet-button" @click="reset">Réinitialiser</button>
    </div>
    <div class="report-controls">
      <label>Période
        <select :value="period" @change="changePeriod(($event.target as HTMLSelectElement).value as ReportPeriod)">
          <option value="week">Semaine</option>
          <option value="month">Mois</option>
          <option value="custom">Personnalisée</option>
        </select>
      </label>
      <div v-if="period !== 'custom'" class="report-navigation" aria-label="Navigation de la période">
        <button type="button" class="quiet-button" :aria-label="period === 'week' ? 'Semaine précédente' : 'Mois précédent'" @click="navigate(clockifyReportMove(anchor, period, -1), period)"><UIcon name="i-tabler-chevron-left" aria-hidden="true" /></button>
        <button type="button" class="quiet-button" @click="goCurrent">{{ period === 'week' ? 'Cette semaine' : 'Ce mois' }}</button>
        <button type="button" class="quiet-button" :aria-label="period === 'week' ? 'Semaine suivante' : 'Mois suivant'" @click="navigate(clockifyReportMove(anchor, period, 1), period)"><UIcon name="i-tabler-chevron-right" aria-hidden="true" /></button>
      </div>
      <label v-if="period !== 'custom'">Date de référence · Paris
        <input type="date" :value="anchor" @change="navigate(($event.target as HTMLInputElement).value, period)" />
      </label>
      <form v-else class="report-custom-range" @submit.prevent="applyCustomRange">
        <label>Début · Paris<input v-model="draftFrom" type="date" required /></label>
        <label>Fin incluse · Paris<input v-model="draftTo" type="date" required /></label>
        <button class="quiet-button">Appliquer</button>
      </form>
    </div>
    <p v-if="filterError || !range" class="report-filter-error" role="alert">{{ filterError || 'La plage du lien est invalide. Choisissez un début et une fin valides.' }}</p>

    <template v-if="report && range && selectedDay">
    <div class="report-summary" aria-live="polite" aria-atomic="true">
      <div><h2 id="clockify-report-heading">{{ heading }}</h2><p>{{ report.sessionCount }} session{{ report.sessionCount > 1 ? 's' : '' }} terminée{{ report.sessionCount > 1 ? 's' : '' }}</p></div>
      <div class="report-total"><span>Temps total</span><strong>{{ portalTimerDuration(report.totalSeconds) }}</strong></div>
    </div>
    <p class="report-convention">Chaque session est rattachée à sa date de début à Paris, même si elle se poursuit après minuit.</p>

    <p v-if="!report.sessionCount" class="report-empty">Aucune session terminée pour ces critères.</p>

    <section class="report-panel" aria-labelledby="report-daily-title">
      <header class="report-chart-heading">
        <h3 id="report-daily-title">{{ chartTitle }}</h3>
        <p class="report-day-value" aria-live="polite"><span>{{ bucketLabel(selectedDay.date, selectedDay.endDate) }}</span><strong>{{ portalTimerDuration(selectedDay.seconds) }}</strong></p>
      </header>
      <div class="report-chart" :class="{'report-wide-chart': report.days.length > 14 || range.aggregation !== 'day'}">
        <div class="report-axis" aria-hidden="true"><span>{{ numberFormat.format(chartMax / 3600) }} h</span><span>{{ numberFormat.format(chartMax / 7200) }} h</span><span>0 h</span></div>
        <div class="report-chart-scroll" tabindex="0" role="region" :aria-label="`${chartTitle}, défilement horizontal si nécessaire`">
          <ol class="report-bars" :style="{'--days': report.days.length, '--chart-width': `${Math.max(620, report.days.length * (range.aggregation === 'day' ? 24 : 62))}px`}">
            <li v-for="day in report.days" :key="day.date">
              <button type="button" class="report-day-bar" :class="{'report-day-selected': selectedDay.date === day.date}"
                :aria-label="`${bucketLabel(day.date, day.endDate)} · ${portalTimerDuration(day.seconds)}`"
                @mouseenter="selectedDate = day.date" @focus="selectedDate = day.date" @click="selectedDate = day.date">
                <span :style="{height: `${day.seconds / chartMax * 100}%`, minHeight: day.seconds ? '3px' : '0'}" aria-hidden="true" />
              </button>
              <span class="report-day-label" aria-hidden="true"><span v-if="period === 'week'">{{ weekdayFormat.format(dateObject(day.date)) }}</span>{{ shortBucketLabel(day.date, day.endDate) }}</span>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section class="report-panel" aria-labelledby="report-breakdown-title">
      <header class="report-chart-heading">
        <h3 id="report-breakdown-title">Répartition du temps</h3>
        <label>Regrouper par
          <select v-model="breakdown"><option value="projects">Projet</option><option value="clients">Client</option></select>
        </label>
      </header>
      <p v-if="!groups.length" class="report-no-breakdown">Aucune durée à répartir.</p>
      <ol v-else class="report-breakdown">
        <li v-for="group in groups" :key="group.key">
          <div class="report-group-heading"><div><strong>{{ group.name }}</strong><span v-if="group.detail">{{ group.detail }}</span></div><p><strong>{{ portalTimerDuration(group.seconds) }}</strong><span>{{ numberFormat.format(percent(group.seconds)) }} %</span></p></div>
          <div class="report-share-track" aria-hidden="true"><span :style="{width: `${percent(group.seconds)}%`}" /></div>
        </li>
      </ol>
    </section>
    </template>
  </section>
</template>

<style scoped>
.clockify-report { display: grid; gap: .9rem; min-width: 0; }
.clockify-report :is(h2,h3,p) { margin: 0; }
.clockify-report h2 { font-size: 1.25rem; }
.clockify-report h3 { font-size: 1rem; }
.report-controls { display: flex; flex-wrap: wrap; align-items: end; gap: .6rem 1rem; }
.report-filters { display: flex; flex-wrap: wrap; align-items: end; gap: .6rem 1rem; }
.report-filters label { flex: 1 1 14rem; min-width: 0; }
.report-filters select { width: 100%; }
.report-custom-range { display: flex; flex-wrap: wrap; align-items: end; gap: .6rem 1rem; }
.report-filter-error { color: var(--portal-danger); font-size: .875rem; }
.clockify-report label { display: grid; align-content: start; gap: .35rem; font-size: .8rem; color: var(--portal-muted); }
.clockify-report :is(select,input) { min-height: 44px; padding: .5rem .65rem; border: 1px solid var(--portal-line); background: var(--portal-control); color: var(--portal-text); }
.report-navigation { display: flex; gap: .35rem; }
.report-navigation button { min-height: 44px; }
.report-summary { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .8rem 1.5rem; padding: 1.15rem 1.25rem; border: 1px solid var(--portal-line); border-radius: var(--portal-radius); background: var(--portal-surface); }
.report-summary h2 { text-transform: capitalize; }
.report-summary p, .report-total span { color: var(--portal-muted); font-size: .8rem; }
.report-summary p { margin-top: .25rem; }
.report-total { display: grid; gap: .25rem; }
.report-total strong { font-size: clamp(1.65rem, 4vw, 2.1rem); color: var(--portal-accent-text); font-variant-numeric: tabular-nums; }
.report-convention { color: var(--portal-muted); font-size: .8rem; }
.report-empty { padding: .8rem 1rem; border: 1px solid var(--portal-line); border-radius: var(--portal-radius); color: var(--portal-muted); }
.report-panel { padding: clamp(.9rem, 2vw, 1.25rem); border: 1px solid var(--portal-line); border-radius: var(--portal-radius); background: var(--portal-surface); min-width: 0; }
.report-chart-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .65rem 1rem; margin-bottom: 1.15rem; }
.report-day-value { display: flex; flex-wrap: wrap; gap: .4rem .8rem; font-size: .8rem; color: var(--portal-muted); }
.report-day-value strong { color: var(--portal-text); font-variant-numeric: tabular-nums; }
.report-chart { display: grid; grid-template-columns: 3rem minmax(0,1fr); gap: .5rem; }
.report-axis { height: 200px; display: flex; flex-direction: column; justify-content: space-between; align-items: end; font-size: .75rem; color: var(--portal-muted); }
.report-chart-scroll { min-width: 0; overflow-x: auto; padding: 2px 2px .35rem; }
.report-bars { display: grid; grid-template-columns: repeat(var(--days),minmax(0,1fr)); gap: clamp(.3rem,1vw,1rem); list-style: none; margin: 0; padding: 0; background: repeating-linear-gradient(to top, transparent 0 98px, var(--portal-line) 99px 100px); background-size: 100% 200px; background-repeat: no-repeat; }
.report-bars li { min-width: 0; }
.report-day-bar { display: flex; align-items: end; justify-content: center; width: 100%; height: 200px; padding: 0 8%; background: transparent; border: 0; border-bottom: 1px solid var(--portal-line); cursor: pointer; }
.report-day-bar > span { display: block; width: 100%; max-width: 56px; background: var(--portal-accent); border-radius: 4px 4px 0 0; }
.report-day-bar:hover > span, .report-day-selected > span { background: var(--portal-accent-hover); }
.report-day-bar:focus-visible { outline: 2px solid var(--portal-focus); outline-offset: 1px; }
.report-day-label { display: flex; flex-direction: column; align-items: center; gap: .12rem; margin-top: .45rem; font-size: .75rem; color: var(--portal-muted); }
.report-wide-chart .report-bars { min-width: var(--chart-width); gap: .45rem; }
.report-wide-chart .report-day-bar { padding: 0; }
.report-breakdown { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
.report-group-heading { display: flex; justify-content: space-between; gap: .5rem 1rem; font-size: .875rem; }
.report-group-heading > div { display: grid; gap: .2rem; min-width: 0; overflow-wrap: anywhere; }
.report-group-heading p { display: flex; gap: .6rem; flex-wrap: wrap; align-content: start; justify-content: end; font-variant-numeric: tabular-nums; }
.report-group-heading span { color: var(--portal-muted); font-size: .8rem; }
.report-share-track { margin-top: .45rem; height: 8px; overflow: hidden; background: var(--portal-raised); border-radius: 4px; }
.report-share-track span { display: block; height: 100%; background: var(--portal-accent); border-radius: 4px; }
.report-no-breakdown { color: var(--portal-muted); font-size: .875rem; }
@media (max-width: 540px) {
  .report-controls > label:first-child { flex: 1 1 100%; }
  .report-controls > label:last-child { flex: 1 1 100%; }
  .report-controls input { width: 100%; }
  .report-custom-range, .report-custom-range label { width: 100%; }
  .report-summary { align-items: start; padding: 1rem; }
  .report-total { flex: 1 1 100%; }
  .report-chart-heading { align-items: start; }
  .report-chart-heading > label { width: 100%; }
  .report-group-heading p { min-width: 5.5rem; }
  .report-day-bar { padding: 0 3%; }
}
</style>
