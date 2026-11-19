<script setup lang="ts">
import { portalTimerDuration, type PortalTimeSession } from '#shared/portal-project-timer'

const emit = defineEmits<{ deleted: [] }>()
const dialog = ref<HTMLDialogElement>()
const session = ref<PortalTimeSession>()
const busy = ref(false)
const error = ref('')
const titleId = useId()
const descriptionId = useId()
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', dateStyle: 'medium', timeStyle: 'short',
})

async function open(value: PortalTimeSession) {
  if (busy.value || !value.stoppedAt) return
  session.value = { ...value }
  error.value = ''
  await nextTick()
  dialog.value?.showModal()
}

function close() {
  if (!busy.value) dialog.value?.close()
}

async function remove() {
  if (busy.value || !session.value) return
  const current = session.value
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/portal/admin/commercial/timer', { method: 'POST', body: {
      action: 'deleteSession', id: current.id, expected: {
        projectId: current.projectId, description: current.description, startedAt: current.startedAt,
        stoppedAt: current.stoppedAt, durationSeconds: current.durationSeconds,
      },
    } })
    dialog.value?.close()
    emit('deleted')
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('mc-portal-project-timer')
      channel.postMessage('historyChanged')
      channel.close()
    }
  } catch (cause) {
    const failure = cause as { data?: { data?: { message?: string }; message?: string } }
    error.value = failure?.data?.data?.message ?? failure?.data?.message ?? 'Impossible de supprimer la session. Réessayez.'
  } finally {
    busy.value = false
  }
}

defineExpose({ open, close })
</script>

<template>
  <dialog ref="dialog" class="session-delete" :aria-labelledby="titleId" :aria-describedby="descriptionId" @cancel.prevent="close">
    <form v-if="session" @submit.prevent="remove">
      <h2 :id="titleId">Supprimer cette session ?</h2>
      <dl>
        <div><dt>Tâche</dt><dd>{{ session.description || 'Session sans description' }}</dd></div>
        <div><dt>Projet</dt><dd>{{ session.projectName }}<span v-if="!session.projectId"> (projet supprimé)</span></dd></div>
        <div><dt>Début · Paris</dt><dd>{{ dateFormat.format(new Date(session.startedAt)) }}</dd></div>
        <div><dt>Fin · Paris</dt><dd>{{ dateFormat.format(new Date(session.stoppedAt!)) }}</dd></div>
        <div><dt>Durée</dt><dd>{{ portalTimerDuration(session.durationSeconds ?? 0) }}</dd></div>
      </dl>
      <p :id="descriptionId">Cette suppression est définitive. La durée sera retirée des totaux du projet.</p>
      <p v-if="error" class="session-delete-error" role="alert">{{ error }}</p>
      <footer>
        <button type="button" class="quiet-button" :disabled="busy" autofocus @click="close">Annuler</button>
        <button class="portal-danger" :disabled="busy">{{ busy ? 'Suppression…' : 'Supprimer la session' }}</button>
      </footer>
    </form>
  </dialog>
</template>

<style scoped>
.session-delete { position: fixed; inset: 0; margin: auto; padding: clamp(1rem, 3vw, 1.5rem); width: min(520px, calc(100% - 24px)); max-width: none; max-height: calc(100dvh - 24px); overflow: auto; border: 1px solid var(--portal-line); border-radius: var(--portal-radius); background: var(--portal-surface); color: var(--portal-text); }
.session-delete::backdrop { background: rgba(0,0,0,.68); }
.session-delete form { display: grid; gap: 1rem; }
.session-delete h2 { margin: 0; font-size: 1.25rem; }
.session-delete p { margin: 0; color: var(--portal-muted); font-size: .875rem; }
.session-delete dl { display: grid; gap: .7rem; margin: 0; }
.session-delete dt { color: var(--portal-muted); font-size: .8rem; }
.session-delete dd { margin: .15rem 0 0; overflow-wrap: anywhere; }
.session-delete footer { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: .6rem; }
.session-delete .session-delete-error { color: var(--portal-danger); }
</style>
