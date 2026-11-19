<script setup lang="ts">
import { clockifyLocalDate, clockifyWeeks, type PortalClockifySnapshot } from '#shared/portal-clockify'
import { portalTimerDuration, type PortalTimeSession } from '#shared/portal-project-timer'

const data = ref<PortalClockifySnapshot>()
const loading = ref(false)
const error = ref('')
const clientId = ref('')
const projectId = ref('')
const timer = ref<{ canRestart: boolean; start: (description: string, projectId: string) => void }>()
const sessionEditor = ref<{ open: (session?: PortalTimeSession, defaultProjectId?: string) => void }>()
const projects = computed(() => data.value?.projects.filter(project => project.organizationId === clientId.value) ?? [])
const project = computed(() => projects.value.find(item => item.id === projectId.value))
const clientsById = computed(() => new Map(data.value?.clients.map(client => [client.id, client.name])))
const projectsById = computed(() => new Map(data.value?.projects.map(item => [item.id, item])))
const weeks = computed(() => clockifyWeeks(data.value?.timeSessions ?? []))
const lastStoppedSessionId = computed(() => data.value?.timeSessions[0]?.id ?? null)

const weekFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'UTC' })
const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
const timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
const shortDateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })
const calendarDay = (date: string) => new Date(`${date}T00:00:00Z`)
const time = (value: string) => timeFormat.format(new Date(value))

function weekLabel(monday: string) {
  const first = calendarDay(monday)
  const last = calendarDay(monday)
  last.setUTCDate(last.getUTCDate() + 6)
  return weekFormat.formatRange(first, last)
}

function stopTime(session: PortalTimeSession, date: string) {
  if (!session.stoppedAt) return ''
  const ending = time(session.stoppedAt)
  return clockifyLocalDate(session.stoppedAt) === date
    ? ending
    : `${shortDateFormat.format(new Date(session.stoppedAt))} · ${ending}`
}

function clientName(session: PortalTimeSession) {
  const item = session.projectId ? projectsById.value.get(session.projectId) : undefined
  return item ? clientsById.value.get(item.organizationId) : undefined
}

async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    data.value = await $fetch<PortalClockifySnapshot>('/api/portal/admin/clockify')
    if (clientId.value && !clientsById.value.has(clientId.value)) clientId.value = ''
    if (!project.value) projectId.value = ''
  } catch {
    error.value = 'Impossible de charger les projets et les sessions.'
  } finally {
    loading.value = false
  }
}

function restart(session: PortalTimeSession) {
  const item = session.projectId ? projectsById.value.get(session.projectId) : undefined
  if (!item || !timer.value?.canRestart) return
  clientId.value = item.organizationId
  projectId.value = item.id
  timer.value.start(session.description, item.id)
}

onMounted(refresh)
</script>

<template>
  <section class="clockify" aria-labelledby="clockify-title">
    <header class="clockify-heading">
      <h1 id="clockify-title">Clockify</h1>
      <button type="button" class="quiet-button" :disabled="!data" @click="sessionEditor?.open(undefined, projectId)"><UIcon name="i-tabler-plus" aria-hidden="true" /> Ajouter une session</button>
    </header>

    <PortalProjectTimer ref="timer" :project="project" :last-stopped-session-id="lastStoppedSessionId" :history-revision="data?.historyRevision"
      description-label="Tâche (facultative)" description-placeholder="Ex. Intégrer la page d’accueil"
      @recorded="refresh" @history-changed="refresh">
      <template #selection="{ pending }">
        <div class="clockify-selection">
          <label>Client
            <select v-model="clientId" :disabled="pending || !data" @change="projectId = ''">
              <option value="">Choisir un client</option>
              <option v-for="client in data?.clients" :key="client.id" :value="client.id">{{ client.name }}</option>
            </select>
          </label>
          <label>Projet
            <select v-model="projectId" :disabled="pending || !projects.length">
              <option value="">{{ clientId && !projects.length ? 'Aucun projet pour ce client' : 'Choisir un projet' }}</option>
              <option v-for="item in projects" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
        </div>
      </template>
    </PortalProjectTimer>

    <p v-if="loading && !data" class="clockify-muted" role="status">Chargement des projets et des sessions…</p>
    <div v-if="error" class="clockify-error">
      <p role="alert">{{ error }}</p>
      <button type="button" class="quiet-button" @click="refresh">Réessayer</button>
    </div>

    <section v-if="data" class="clockify-history" aria-labelledby="clockify-history-title" :aria-busy="loading">
      <h2 id="clockify-history-title">Historique des sessions</h2>
      <p v-if="!weeks.length" class="clockify-empty clockify-muted">Les sessions terminées apparaîtront ici.</p>
      <section v-for="week in weeks" :key="week.monday" class="clockify-week" :aria-labelledby="`clockify-week-${week.monday}`">
        <header class="clockify-week-heading">
          <h3 :id="`clockify-week-${week.monday}`">Semaine du {{ weekLabel(week.monday) }}</h3>
          <p>Total semaine <strong>{{ portalTimerDuration(week.seconds) }}</strong></p>
        </header>
        <div v-for="day in week.days" :key="day.date" class="clockify-day">
          <header class="clockify-day-heading">
            <h4><time :datetime="day.date">{{ dayFormat.format(calendarDay(day.date)) }}</time></h4>
            <p>Total jour <strong>{{ portalTimerDuration(day.seconds) }}</strong></p>
          </header>
          <ul class="clockify-sessions">
            <li v-for="session in day.sessions" :key="session.id" class="clockify-session">
              <div class="clockify-task">
                <strong>{{ session.description || 'Tâche sans description' }}</strong>
                <p class="clockify-muted">
                  <span v-if="clientName(session)">{{ clientName(session) }} · </span>{{ session.projectName }}<span v-if="!session.projectId"> (projet supprimé)</span>
                  <span v-if="session.author"> · {{ session.author }}</span>
                </p>
              </div>
              <div class="clockify-duration">
                <span class="clockify-muted">
                  <time :datetime="session.startedAt">{{ time(session.startedAt) }}</time>
                  <template v-if="session.stoppedAt"> → <time :datetime="session.stoppedAt">{{ stopTime(session, day.date) }}</time></template>
                </span>
                <strong>{{ portalTimerDuration(session.durationSeconds ?? 0) }}</strong>
              </div>
              <div class="clockify-session-actions">
                <button type="button" class="quiet-button" @click="sessionEditor?.open(session)">Modifier</button>
                <button v-if="session.projectId" type="button" class="quiet-button" :disabled="!timer?.canRestart" @click="restart(session)">
                  <UIcon name="i-tabler-player-play" aria-hidden="true" /> Relancer
                </button>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </section>
    <PortalTimeSessionEditor ref="sessionEditor" :clients="data?.clients ?? []" :projects="data?.projects ?? []" @saved="refresh" />
  </section>
</template>

<style scoped>
.clockify, .clockify-history { display: grid; gap: 1rem; min-width: 0; }
.clockify :is(h1, h2, h3, h4, p) { margin: 0; overflow-wrap: anywhere; }
.clockify h1 { font-size: clamp(1.65rem, 3vw, 2.2rem); }
.clockify h2 { font-size: 1.25rem; }
.clockify-heading, .clockify-session-actions { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; }
.clockify-heading { justify-content: space-between; }
.clockify-selection { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); flex: 1 1 100%; gap: .65rem 1rem; min-width: 0; }
.clockify-selection label { display: grid; align-content: start; gap: .35rem; min-width: 0; font-size: .875rem; }
.clockify-selection select { width: 100%; min-height: 44px; padding: .5rem .65rem; border: 1px solid var(--portal-line); background: var(--portal-control); }
.clockify-muted { color: var(--portal-muted); font-size: .875rem; }
.clockify-empty, .clockify-day { border: 1px solid var(--portal-line); border-radius: var(--portal-radius); background: var(--portal-surface); }
.clockify-empty { padding: 1.15rem; }
.clockify-week { display: grid; gap: .65rem; }
.clockify-week-heading, .clockify-day-heading { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: .25rem 1rem; }
.clockify-week-heading h3 { font-size: 1.05rem; }
.clockify-day-heading { padding: .55rem 1rem; border-bottom: 1px solid var(--portal-line); background: var(--portal-raised); border-radius: var(--portal-radius) var(--portal-radius) 0 0; }
.clockify-day-heading h4 { font-size: .9rem; text-transform: capitalize; }
.clockify-week-heading p, .clockify-day-heading p { color: var(--portal-muted); font-size: .85rem; }
.clockify :is(.clockify-week-heading, .clockify-day-heading) strong { margin-left: .35rem; color: var(--portal-accent-text); }
.clockify :is(.clockify-duration, .clockify-week-heading, .clockify-day-heading) strong { font-variant-numeric: tabular-nums; }
.clockify-sessions { margin: 0; padding: 0; list-style: none; }
.clockify-session { display: grid; grid-template-columns: minmax(0, 1fr) minmax(7rem, auto) auto; align-items: center; gap: .5rem 1rem; padding: .7rem 1rem; }
.clockify-session + .clockify-session { border-top: 1px solid var(--portal-line); }
.clockify-task { min-width: 0; overflow-wrap: anywhere; }
.clockify-task p { margin-top: .15rem; }
.clockify-duration { display: grid; justify-items: end; gap: .1rem; }
.clockify-error { display: flex; align-items: center; flex-wrap: wrap; gap: .65rem; color: var(--portal-danger); }
@media (max-width: 540px) {
  .clockify-selection { grid-template-columns: minmax(0, 1fr); }
  .clockify-session { grid-template-columns: minmax(0, 1fr) auto; }
  .clockify-task { grid-column: 1 / -1; }
  .clockify-duration { justify-items: start; }
  .clockify-session-actions { grid-column: 2; }
}
</style>
