<script setup lang="ts">
import { portalTimerDuration, type PortalTimeSession } from '#shared/portal-project-timer'

const props = defineProps<{
  project?: { id: string; name: string }
  lastStoppedSessionId: string | null
  descriptionLabel?: string
  descriptionPlaceholder?: string
}>()
const emit = defineEmits<{
  recorded: []
  historyChanged: []
}>()

const endpoint = '/api/portal/admin/commercial/timer'
const active = ref<PortalTimeSession | null>(null)
const ready = ref(false)
const pending = ref(false)
const description = ref('')
const error = ref('')
const feedback = ref('')
const clock = ref(0)
let anchor = { server: 0, client: 0 }
let channel: BroadcastChannel | undefined
let tick: ReturnType<typeof setInterval> | undefined
let poll: ReturnType<typeof setInterval> | undefined
let syncing = false
let revision = 0

const canRestart = computed(() => ready.value && !active.value && !pending.value)
const canStart = computed(() => Boolean(props.project && canRestart.value))
const elapsed = computed(() => active.value
  ? portalTimerDuration((anchor.server + clock.value - anchor.client - Date.parse(active.value.startedAt)) / 1000)
  : '00:00:00')

function applyState(session: PortalTimeSession | null, serverNow: string) {
  anchor = { server: Date.parse(serverNow), client: performance.now() }
  clock.value = anchor.client
  active.value = session
}

async function sync() {
  if (syncing || pending.value) return
  const currentRevision = revision
  syncing = true
  try {
    const state = await $fetch<{ active: PortalTimeSession | null; lastStoppedSessionId: string | null; serverNow: string }>(endpoint)
    if (currentRevision !== revision) return
    applyState(state.active, state.serverNow)
    if (!ready.value) error.value = ''
    ready.value = true
    if (state.lastStoppedSessionId !== props.lastStoppedSessionId) emit('historyChanged')
  } catch {
    if (currentRevision === revision && !ready.value) error.value = 'Impossible de charger le chronomètre. Réessayez.'
  } finally {
    syncing = false
  }
}

function syncWhenVisible() {
  if (document.visibilityState === 'visible') void sync()
}

type Command = { action: 'start'; projectId: string; description: string } | { action: 'stop'; id: string }

async function write(body: Command) {
  pending.value = true
  revision++
  error.value = ''
  feedback.value = ''
  let retry = false
  try {
    const state = await $fetch<{ session: PortalTimeSession; serverNow: string }>(endpoint, { method: 'POST', body })
    applyState(body.action === 'start' ? state.session : null, state.serverNow)
    description.value = ''
    if (body.action === 'stop') {
      emit('recorded')
      feedback.value = 'Session enregistrée.'
    }
  } catch (cause) {
    const failure = cause as { data?: { data?: { message?: string } } }
    error.value = failure?.data?.data?.message || 'L’opération a échoué. Réessayez.'
    retry = true
  } finally {
    pending.value = false
    channel?.postMessage('changed')
    if (retry) void sync()
  }
}

function start(value = description.value, projectId = props.project?.id) {
  if (canRestart.value && projectId) void write({ action: 'start', projectId, description: value })
}

function stop() {
  if (active.value && !pending.value) void write({ action: 'stop', id: active.value.id })
}

defineExpose({ canStart, canRestart, start })

onMounted(() => {
  void sync()
  tick = setInterval(() => { if (active.value) clock.value = performance.now() }, 250)
  poll = setInterval(syncWhenVisible, 10_000)
  window.addEventListener('focus', syncWhenVisible)
  document.addEventListener('visibilitychange', syncWhenVisible)
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel('mc-portal-project-timer')
    channel.onmessage = () => { void sync() }
  }
})

onUnmounted(() => {
  revision++
  clearInterval(tick)
  clearInterval(poll)
  window.removeEventListener('focus', syncWhenVisible)
  document.removeEventListener('visibilitychange', syncWhenVisible)
  channel?.close()
  channel = undefined
})
</script>

<template>
  <section class="project-timer" aria-labelledby="project-timer-title">
    <div class="timer-heading">
      <div>
        <h2 id="project-timer-title">Chronomètre de projet</h2>
        <p v-if="active" class="timer-state">
          En cours · {{ active.projectName }}<span v-if="!active.projectId"> (projet supprimé)</span>
          <span v-if="active.description"> · {{ active.description }}</span>
        </p>
        <p v-else-if="project && !$slots.selection" class="timer-state">{{ project.name }}</p>
      </div>
      <span role="timer" aria-live="off" aria-label="Temps écoulé" class="timer-display">{{ elapsed }}</span>
    </div>

    <div v-if="active" class="timer-actions">
      <button type="button" class="portal-primary" :disabled="pending" @click="stop">Arrêter</button>
    </div>
    <form v-else-if="project || $slots.selection" class="timer-form" @submit.prevent="start()">
      <slot name="selection" :pending="pending" />
      <label>{{ descriptionLabel || 'Description (facultative)' }}
        <input v-model="description" type="text" :placeholder="descriptionPlaceholder || 'Ex. Maquette de l’accueil'" maxlength="160" :disabled="pending" />
      </label>
      <button type="submit" class="portal-primary" :disabled="!canStart">Démarrer</button>
    </form>
    <p v-if="!ready && !error" class="timer-state" role="status">Chargement du chronomètre…</p>
    <p v-if="!active && !project && !$slots.selection && ready" class="timer-state">Sélectionnez un projet pour démarrer.</p>
    <p v-if="error" class="timer-error" role="alert">{{ error }}</p>
    <button v-if="!ready && error" type="button" class="quiet-button" @click="sync">Réessayer</button>
    <p v-if="feedback" class="timer-feedback" role="status">{{ feedback }}</p>
  </section>
</template>

<style scoped>
.project-timer {
  display: grid;
  gap: .9rem;
  min-width: 0;
  padding: clamp(.9rem, 2vw, 1.25rem);
  margin-bottom: .85rem;
  border: 1px solid var(--portal-line);
  border-radius: var(--portal-radius);
  background: var(--portal-surface);
}
.timer-heading, .timer-form { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .65rem 1rem; min-width: 0; }
.timer-heading { align-items: start; }
.timer-heading > div { min-width: 0; }
.project-timer h2 { margin: 0; font-size: 1.25rem; line-height: 1.2; }
.project-timer p { margin: 0; font-size: .875rem; overflow-wrap: anywhere; }
.timer-heading .timer-state { margin-top: .3rem; }
.timer-state { color: var(--portal-muted); }
.timer-display { font-size: clamp(1.75rem, 5vw, 2.5rem); line-height: 1; font-variant-numeric: tabular-nums; color: var(--portal-accent-text); }
.timer-form, .timer-actions { align-items: end; }
.timer-form label { display: grid; gap: .35rem; flex: 1 1 14rem; min-width: 0; font-size: .875rem; }
.timer-form input { width: 100%; min-height: 44px; padding: .5rem .65rem; border: 1px solid var(--portal-line); background: var(--portal-control); }
.timer-actions { display: flex; justify-content: flex-end; }
.timer-error { color: var(--portal-danger); }
.timer-feedback { color: var(--portal-success); }
.project-timer > .quiet-button { justify-self: start; }
@media (max-width: 460px) {
  .timer-actions, .timer-form { display: grid; grid-template-columns: minmax(0, 1fr); }
}
</style>
