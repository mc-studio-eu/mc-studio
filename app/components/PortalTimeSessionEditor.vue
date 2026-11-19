<script setup lang="ts">
import type { PortalTimeSession } from '#shared/portal-project-timer'
import { portalTimerDuration } from '#shared/portal-project-timer'
import { sessionDurationSeconds, sessionParisCandidates, sessionParisTime, type SessionEditorClient, type SessionEditorProject } from '#shared/portal-time-session-editor'

const props = defineProps<{ clients: SessionEditorClient[]; projects: SessionEditorProject[] }>()
const emit = defineEmits<{ saved: [] }>()
const dialog = ref<HTMLDialogElement>()
const headingId = useId()
const original = ref<PortalTimeSession>()
const clientId = ref('')
const projectId = ref('')
const description = ref('')
const startLocal = ref('')
const endLocal = ref('')
const startOccurrence = ref('')
const endOccurrence = ref('')
const duration = ref('01:00:00')
const busy = ref(false)
const error = ref('')
const requestId = ref('')
const initialStart = ref('')
const initialEnd = ref('')
const projects = computed(() => props.projects.filter(project => project.organizationId === clientId.value))
const startChoices = computed(() => sessionParisCandidates(startLocal.value))
const endChoices = computed(() => sessionParisCandidates(endLocal.value))
const orphan = computed(() => Boolean(original.value && original.value.projectId === null))

function resolveTime(local: string, occurrence: string, initial: string) {
  const choices = sessionParisCandidates(local)
  const chosen = choices.length === 1 ? choices[0] : choices.find(choice => choice === occurrence)
  if (chosen && initial && sessionParisTime(initial) === sessionParisTime(chosen)) {
    const roundedInitial = new Date(Math.floor(Date.parse(initial) / 1000) * 1000).toISOString()
    if (chosen === roundedInitial) return initial
  }
  return chosen
}

const start = computed(() => resolveTime(startLocal.value, startOccurrence.value, initialStart.value))
const end = computed(() => resolveTime(endLocal.value, endOccurrence.value, initialEnd.value))

function setTime(which: 'start' | 'end', timestamp: string) {
  const local = sessionParisTime(timestamp)
  const occurrence = new Date(Math.floor(Date.parse(timestamp) / 1000) * 1000).toISOString()
  if (which === 'start') {
    initialStart.value = timestamp
    startLocal.value = local
    startOccurrence.value = occurrence
  } else {
    initialEnd.value = timestamp
    endLocal.value = local
    endOccurrence.value = occurrence
  }
}

function updateDuration() {
  if (start.value && end.value && end.value >= start.value) {
    duration.value = portalTimerDuration((Date.parse(end.value) - Date.parse(start.value)) / 1000)
  }
}

function changeDuration() {
  const seconds = sessionDurationSeconds(duration.value)
  if (!start.value || seconds === null) return
  const milliseconds = Date.parse(start.value) + seconds * 1000
  if (milliseconds > 253402300799999) return
  setTime('end', new Date(milliseconds).toISOString())
}

function occurrenceLabel(index: number, timestamp: string) {
  const offset = (Date.parse(`${sessionParisTime(timestamp)}Z`) - Date.parse(timestamp)) / 3600000
  return `${index === 0 ? 'Première' : 'Seconde'} occurrence (UTC+${offset})`
}

async function open(session?: PortalTimeSession, defaultProjectId?: string) {
  if (busy.value) return
  original.value = session ? { ...session } : undefined
  error.value = ''
  const project = props.projects.find(item => item.id === (session?.projectId ?? defaultProjectId))
  clientId.value = project?.organizationId ?? ''
  projectId.value = session?.projectId ?? project?.id ?? ''
  description.value = session?.description ?? ''
  const stoppedAt = session?.stoppedAt ?? new Date(Math.floor(Date.now() / 1000) * 1000).toISOString()
  setTime('start', session?.startedAt ?? new Date(Date.parse(stoppedAt) - 3600000).toISOString())
  setTime('end', stoppedAt)
  updateDuration()
  requestId.value = crypto.randomUUID()
  await nextTick()
  dialog.value?.showModal()
}

function close() {
  if (!busy.value) dialog.value?.close()
}

async function save() {
  if (busy.value) return
  error.value = ''
  if (!projectId.value && !orphan.value) {
    error.value = 'Sélectionnez un client et un projet.'
    return
  }
  if (!start.value || !end.value) {
    error.value = 'Vérifiez les horaires de Paris et choisissez l’occurrence si une heure apparaît deux fois.'
    return
  }
  const seconds = sessionDurationSeconds(duration.value)
  if (seconds === null || seconds !== Math.floor((Date.parse(end.value) - Date.parse(start.value)) / 1000)) {
    error.value = 'Renseignez une durée au format HH:MM:SS cohérente avec les horaires.'
    return
  }
  busy.value = true
  try {
    const body = { action: 'saveSession', projectId: projectId.value || null, description: description.value,
      startedAt: start.value, stoppedAt: end.value, requestId: requestId.value,
      ...(original.value ? { id: original.value.id, expected: {
        projectId: original.value.projectId, description: original.value.description, startedAt: original.value.startedAt,
        stoppedAt: original.value.stoppedAt, durationSeconds: original.value.durationSeconds,
      } } : {}),
    }
    await $fetch('/api/portal/admin/commercial/timer', { method: 'POST', body })
    dialog.value?.close()
    emit('saved')
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('mc-portal-project-timer')
      channel.postMessage('historyChanged')
      channel.close()
    }
  } catch (cause) {
    const failure = cause as { data?: { data?: { message?: string }; message?: string } }
    error.value = failure?.data?.data?.message ?? failure?.data?.message ?? 'Impossible d’enregistrer la session. Réessayez.'
  } finally {
    busy.value = false
  }
}

defineExpose({ open, close })
</script>

<template>
  <dialog ref="dialog" class="session-editor" :aria-labelledby="headingId" @cancel.prevent="close">
    <form @submit.prevent="save">
      <header>
        <h2 :id="headingId">{{ original ? 'Modifier la session' : 'Ajouter une session' }}</h2>
        <button type="button" class="quiet-button" aria-label="Fermer le formulaire de session" :disabled="busy" @click="close"><UIcon name="i-tabler-x" aria-hidden="true" /></button>
      </header>
      <p class="session-zone">Horaires de Paris (Europe/Paris)</p>
      <fieldset :disabled="busy" class="session-fields">
        <label>Client
          <select v-model="clientId" @change="projectId = ''">
            <option value="">{{ orphan ? 'Projet supprimé' : 'Choisir un client' }}</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
          </select>
        </label>
        <label>Projet
          <select v-model="projectId" :required="!orphan" :disabled="!clientId">
            <option value="">{{ orphan && !clientId ? original?.projectName : 'Choisir un projet' }}</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
          </select>
        </label>
        <label class="session-wide">Tâche (facultative)
          <input v-model="description" maxlength="160" autofocus />
        </label>
        <label>Début
          <input v-model="startLocal" type="datetime-local" step="1" required @change="updateDuration" />
          <span v-if="startLocal && !startChoices.length" class="session-invalid">Cette heure n’existe pas à Paris.</span>
          <select v-if="startChoices.length > 1" v-model="startOccurrence" aria-label="Occurrence de l’heure de début" required @change="updateDuration">
            <option value="">Choisir l’occurrence</option>
            <option v-for="(choice, index) in startChoices" :key="choice" :value="choice">{{ occurrenceLabel(index, choice) }}</option>
          </select>
        </label>
        <label>Fin
          <input v-model="endLocal" type="datetime-local" step="1" required @change="updateDuration" />
          <span v-if="endLocal && !endChoices.length" class="session-invalid">Cette heure n’existe pas à Paris.</span>
          <select v-if="endChoices.length > 1" v-model="endOccurrence" aria-label="Occurrence de l’heure de fin" required @change="updateDuration">
            <option value="">Choisir l’occurrence</option>
            <option v-for="(choice, index) in endChoices" :key="choice" :value="choice">{{ occurrenceLabel(index, choice) }}</option>
          </select>
        </label>
        <label class="session-wide">Durée (HH:MM:SS)
          <input v-model="duration" inputmode="numeric" pattern="[0-9]{1,6}:[0-5][0-9]:[0-5][0-9]" placeholder="01:30:00" required @input="changeDuration" />
          <span class="session-hint">Modifier la durée ajuste l’heure de fin.</span>
        </label>
      </fieldset>
      <p v-if="error" role="alert" class="session-invalid">{{ error }}</p>
      <footer>
        <button type="button" class="quiet-button" :disabled="busy" @click="close">Annuler</button>
        <button class="portal-primary" :disabled="busy">{{ busy ? 'Enregistrement…' : 'Enregistrer' }}</button>
      </footer>
    </form>
  </dialog>
</template>

<style scoped>
.session-editor { position: fixed; inset: 0; margin: auto; padding: clamp(1rem, 3vw, 1.5rem); width: min(640px, calc(100% - 24px)); max-width: none; max-height: calc(100dvh - 24px); overflow: auto; border: 1px solid var(--portal-line); border-radius: var(--portal-radius); background: var(--portal-surface); color: var(--portal-text); }
.session-editor::backdrop { background: rgba(0,0,0,.68); }
.session-editor form { display: grid; gap: 1rem; }
.session-editor header, .session-editor footer { display: flex; gap: .6rem; align-items: center; justify-content: space-between; }
.session-editor h2 { margin: 0; font-size: 1.25rem; }
.session-editor p { margin: 0; }
.session-editor footer { justify-content: flex-end; }
.session-fields { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: .9rem; border: 0; padding: 0; margin: 0; min-width: 0; }
.session-fields label { display: grid; align-content: start; gap: .35rem; min-width: 0; font-size: .875rem; }
.session-wide { grid-column: 1 / -1; }
.session-fields :is(input, select) { width: 100%; min-height: 44px; padding: .5rem .65rem; border: 1px solid var(--portal-line); background: var(--portal-control); }
.session-zone, .session-hint { color: var(--portal-muted); font-size: .8rem; }
.session-invalid { color: var(--portal-danger); font-size: .875rem; }
@media (max-width: 540px) { .session-fields { grid-template-columns: minmax(0,1fr); } }
</style>
