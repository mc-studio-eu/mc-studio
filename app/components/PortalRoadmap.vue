<script setup lang="ts">
import { roadmapStatuses, type RoadmapData, type RoadmapPhase, type RoadmapStatus, type RoadmapStep, type RoadmapStepKind, type RoadmapValidation } from '#shared/portal-roadmap'
import { portalDate, resourceLabels, type ResourceKind } from '~/types/portal'
import { localRoadmapToday, roadmapDateLabel, roadmapPeriodLabel, toRoadmapDay } from '~/utils/portalRoadmapDates'

const props = defineProps<{ projectId: string; itemId?: string; embedded?: boolean }>()
const emit = defineEmits<{ changed: [summary: RoadmapData['summary'], project: RoadmapData['project']]; resource: [kind: ResourceKind] }>()
const labels: Record<RoadmapStatus, string> = {
  planned: 'Planifié', in_progress: 'En cours', awaiting_validation: 'En attente de validation', blocked: 'Bloqué', done: 'Terminé',
}
const kinds: Record<RoadmapStepKind, string> = { step: 'Étape', milestone: 'Date clé', deliverable: 'Livrable', checklist: 'Action' }
const decisions: Record<RoadmapValidation['status'], string> = {
  pending: 'En attente', approved: 'Approuvée', changes: 'Modifications demandées', cancelled: 'Annulée',
}
const dateNow = localRoadmapToday()
const baseUrl = '/api/portal/roadmap'
const data = shallowRef<RoadmapData>()
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const formError = ref('')
const feedback = ref('')
let loadSequence = 0
let alive = true
const phases = computed(() => data.value?.phases || [])
const steps = computed(() => phases.value.flatMap(phase => phase.steps))
const canEdit = computed(() => Boolean(data.value?.permissions.canEdit))
const canReview = computed(() => Boolean(data.value?.permissions.canReview))
const duration = computed(() => {
  const project = data.value?.project
  if (!project?.startDate || !project.endDate) return 'À définir'
  const days = Math.max(1, toRoadmapDay(project.endDate) - toRoadmapDay(project.startDate) + 1)
  const weeks = Math.floor(days / 7)
  const remainder = days % 7
  return [weeks && `${weeks} semaine${weeks > 1 ? 's' : ''}`, remainder && `${remainder} jour${remainder > 1 ? 's' : ''}`].filter(Boolean).join(' et ')
})
const doneSteps = computed(() => steps.value.filter(step => step.status === 'done').length)
const donePhases = computed(() => phases.value.filter(phase => phase.status === 'done').length)
const pending = computed(() => steps.value.filter(step => step.validations.some(item => item.status === 'pending')))
const members = computed(() => (data.value?.members || []).filter(member => !member.suspended && member.memberRole !== 'viewer'))
const resources = computed(() => data.value?.resources || [])
const showAll = ref(false)

const urgency: Record<RoadmapStatus, number> = { awaiting_validation: 0, blocked: 1, in_progress: 2, planned: 3, done: 4 }
const pendingFor = (step: RoadmapStep) => step.validations.find(item => item.status === 'pending')
const stepDate = (step: RoadmapStep) => pendingFor(step)?.dueDate || (step.status === 'planned' && step.startDate && step.startDate >= dateNow ? step.startDate : step.endDate || step.startDate)
const upcoming = computed(() => steps.value.filter(step => step.status !== 'done').sort((a, b) => {
  return urgency[a.status] - urgency[b.status] || (stepDate(a) || '9999').localeCompare(stepDate(b) || '9999') || a.title.localeCompare(b.title, 'fr')
}))
const keyDates = computed(() => steps.value
  .filter(step => (step.kind === 'milestone' || step.kind === 'deliverable') && (step.endDate || step.startDate))
  .sort((a, b) => (a.endDate || a.startDate || '').localeCompare(b.endDate || b.startDate || '')))
const visibleDates = computed(() => keyDates.value.slice().sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done')).slice(0, 6))
const dependencies = computed(() => steps.value.filter(step => step.id !== (dialogMode.value === 'step' ? editId.value : selectedId.value)))

type DialogMode = 'details' | 'phase' | 'step' | 'delete' | 'submit' | 'decision' | 'archive'
type ItemKind = 'phase' | 'step'
const dialog = ref<HTMLDialogElement>()
const dialogMode = ref<DialogMode>('details')
const selectedId = ref('')
const itemKind = ref<ItemKind>('phase')
const selectedPhase = computed(() => phases.value.find(phase => phase.id === selectedId.value))
const selectedStep = computed(() => steps.value.find(step => step.id === selectedId.value))
const selectedPrerequisites = computed(() => phases.value.flatMap(phase => phase.steps
  .filter(step => selectedPhase.value?.prerequisiteStepIds.includes(step.id))
  .map(step => ({ step, phaseTitle: phase.title }))))
const selectedItem = computed(() => itemKind.value === 'phase' ? selectedPhase.value : selectedStep.value)
const selectedSiblings = computed(() => itemKind.value === 'phase' ? phases.value : phases.value.find(phase => phase.id === selectedStep.value?.phaseId)?.steps || [])
const selectedPosition = computed(() => selectedSiblings.value.findIndex(item => item.id === selectedId.value))
const editId = ref('')
const prerequisitePhases = computed(() => phases.value.filter(phase => phase.id !== editId.value && phase.steps.length))
const itemForm = reactive({
  title: '', description: '', status: 'planned' as RoadmapStatus, startDate: '', endDate: '',
  phaseId: '', kind: 'step' as RoadmapStepKind, responsibleId: '', blocker: '', requiresValidation: false,
  resourceIds: [] as string[], dependencyIds: [] as string[], prerequisiteStepIds: [] as string[],
})
const validationForm = reactive({ description: '', url: '', resourceId: '', dueDate: '' })
const decisionForm = reactive({ id: '', decision: 'approved' as 'approved' | 'changes', comment: '' })
const dialogTitle = computed(() => {
  switch (dialogMode.value) {
    case 'details': return selectedItem.value?.title || 'Détails'
    case 'phase': return editId.value ? 'Modifier la phase' : 'Ajouter une phase'
    case 'step': return editId.value ? 'Modifier l’étape' : 'Ajouter une étape'
    case 'delete': return itemKind.value === 'phase' ? 'Supprimer la phase' : 'Supprimer l’étape'
    case 'submit': return 'Demander une validation'
    case 'decision': return 'Répondre à la demande'
    case 'archive': return 'Validations archivées'
  }
})
const dialogHeading = ref<HTMLElement>()
const availableStatuses = computed(() => roadmapStatuses.filter(status => {
  if (dialogMode.value === 'phase') return true
  if (status === 'awaiting_validation') return selectedStep.value?.status === status
  if (status === 'done') return !itemForm.requiresValidation || selectedStep.value?.status === status
  return true
}))

function errorMessage(cause: unknown, fallback: string) {
  const failure = cause as { data?: { statusMessage?: string; message?: string } } | null
  return failure?.data?.statusMessage || failure?.data?.message || fallback
}

async function load() {
  const sequence = ++loadSequence
  const projectId = props.projectId
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<RoadmapData>(baseUrl, { query: { projectId } })
    if (alive && sequence === loadSequence && props.projectId === projectId) data.value = response
    return response
  } catch (cause) {
    if (alive && sequence === loadSequence && props.projectId === projectId) error.value = errorMessage(cause, 'Le planning n’a pas pu être chargé.')
  } finally {
    if (alive && sequence === loadSequence) loading.value = false
  }
}

function changeDialog(mode: DialogMode) {
  dialogMode.value = mode
  formError.value = ''
  if (!dialog.value?.open) dialog.value?.showModal()
  nextTick(() => dialogHeading.value?.focus())
}

function closeDialog() {
  if (!busy.value) dialog.value?.close()
}

function select(id: string, kind: ItemKind) {
  selectedId.value = id
  itemKind.value = kind
  changeDialog('details')
}

function edit(kind: ItemKind, item?: RoadmapPhase | RoadmapStep, phaseId?: string) {
  editId.value = item?.id || ''
  const step = item && 'phaseId' in item ? item : null
  selectedId.value = item?.id || ''
  itemKind.value = kind
  Object.assign(itemForm, {
    title: item?.title || '', description: item?.description || '', status: item?.status || 'planned',
    startDate: item?.startDate || '', endDate: item?.endDate || '', phaseId: step?.phaseId || phaseId || phases.value[0]?.id || '',
    kind: step?.kind || 'step', responsibleId: step?.responsibleId || '', blocker: step?.blocker || '',
    requiresValidation: step?.requiresValidation || false, resourceIds: [...(step?.resourceIds || [])], dependencyIds: [...(step?.dependencyIds || [])],
    prerequisiteStepIds: item && 'prerequisiteStepIds' in item ? [...item.prerequisiteStepIds] : [],
  })
  changeDialog(kind)
}

function returnToDetails() {
  if (selectedItem.value) changeDialog('details')
  else closeDialog()
}

function cancelForm() {
  if (['phase', 'step'].includes(dialogMode.value) && !editId.value) closeDialog()
  else returnToDetails()
}

async function mutate(path: string, method: 'POST' | 'PATCH' | 'DELETE', body: Record<string, unknown> | undefined, success: string, after: 'details' | 'close' = 'details') {
  if (busy.value) return
  busy.value = true
  formError.value = ''
  feedback.value = ''
  const projectId = props.projectId
  try {
    await $fetch(`${baseUrl}${path}`, { method, body })
    if (!alive || props.projectId !== projectId) return
    const response = await load()
    if (!alive || props.projectId !== projectId) return
    feedback.value = success
    busy.value = false
    if (after === 'close') closeDialog()
    else returnToDetails()
    if (response) emit('changed', response.summary, response.project)
  } catch (cause) {
    if (alive && props.projectId === projectId) formError.value = errorMessage(cause, 'L’action n’a pas pu être enregistrée.')
  } finally {
    if (alive && props.projectId === projectId) busy.value = false
  }
}

function saveItem() {
  if (!itemForm.title.trim()) { formError.value = 'Saisissez un titre.'; return }
  if (itemForm.startDate && itemForm.endDate && itemForm.startDate > itemForm.endDate) {
    formError.value = 'La date de fin doit suivre la date de début.'
    return
  }
  const { title, description, status, startDate, endDate } = itemForm
  const body: Record<string, unknown> = { projectId: props.projectId, title, description, status, startDate: startDate || null, endDate: endDate || null }
  const step = dialogMode.value === 'step'
  if (step) Object.assign(body, {
    phaseId: itemForm.phaseId, kind: itemForm.kind, responsibleId: itemForm.responsibleId || null,
    blocker: itemForm.blocker, requiresValidation: itemForm.requiresValidation, resourceIds: itemForm.resourceIds, dependencyIds: itemForm.dependencyIds,
  })
  else body.prerequisiteStepIds = itemForm.prerequisiteStepIds
  const path = step ? '/steps' : '/phases'
  if (editId.value) mutate(`${path}/${editId.value}`, 'PATCH', body, 'Modifications enregistrées.')
  else mutate(path, 'POST', body, step ? 'Étape ajoutée.' : 'Phase ajoutée.', 'close')
}

function reorder(direction: -1 | 1) {
  const position = selectedPosition.value + direction
  if (!selectedItem.value || position < 0 || position >= selectedSiblings.value.length) return
  mutate(`/${itemKind.value==='phase' ? 'phases' : 'steps'}/${selectedId.value}`, 'PATCH', { position }, 'Ordre mis à jour.')
}

function removeItem() {
  mutate(`/${itemKind.value==='phase' ? 'phases' : 'steps'}/${selectedId.value}`, 'DELETE', undefined, 'Suppression enregistrée.', 'close')
}

function requestValidation() {
  Object.assign(validationForm, { description: '', url: '', resourceId: '', dueDate: '' })
  changeDialog('submit')
}

function submitValidation() {
  if (!validationForm.description.trim()) {
    formError.value = 'Décrivez le contenu à valider.'
    return
  }
  if (validationForm.url && !externalUrl(validationForm.url, true)) {
    formError.value = 'Saisissez une adresse HTTPS valide.'
    return
  }
  mutate(`/steps/${selectedId.value}/validation`, 'POST', {
    description: validationForm.description, url: validationForm.url, resourceId: validationForm.resourceId || null, dueDate: validationForm.dueDate || null,
  }, 'Demande de validation envoyée.')
}

function decide(item: RoadmapValidation) {
  Object.assign(decisionForm, { id: item.id, decision: 'approved', comment: '' })
  changeDialog('decision')
}

function submitDecision() {
  if (decisionForm.decision === 'changes' && !decisionForm.comment.trim()) { formError.value = 'Précisez les modifications attendues.'; return }
  const { id, ...body } = decisionForm
  mutate(`/validations/${id}/decision`, 'POST', body, 'Votre décision a été enregistrée.')
}

function externalUrl(url?: string | null, httpsOnly = false) {
  if (!url) return null
  try {
    const link = new URL(url)
    return !link.username && !link.password && (link.protocol === 'https:' || (!httpsOnly && link.protocol === 'http:')) ? url : null
  } catch { return null }
}

function resourceLink(id: string | null, storedUrl?: string) {
  if (externalUrl(storedUrl)) return storedUrl
  const resource = resources.value.find(item => item.id === id)
  if (resource?.fileName && resource.kind === 'file') return `/api/portal/files/${resource.id}`
  return externalUrl(resource?.url)
}

function resourceKind(id: string | null) {
  const kind = resources.value.find(item => item.id === id)?.kind
  return kind && kind in resourceLabels ? kind as ResourceKind : null
}

function resourceTitle(id: string) {
  return resources.value.find(item => item.id === id)?.title || 'Ressource indisponible'
}

function openResource(id: string | null) {
  const kind = resourceKind(id)
  if (kind) { closeDialog(); emit('resource', kind) }
}

watch(() => props.projectId, () => {
  dialog.value?.close()
  data.value = undefined
  busy.value = false
  showAll.value = false
  feedback.value = ''
  load()
}, { immediate: true })
watch([() => props.itemId, data], ([id]) => {
  if (id && steps.value.some(step => step.id === id) && !dialog.value?.open) select(id, 'step')
}, { flush: 'post' })
watch(() => itemForm.requiresValidation, required => {
  if (required && itemForm.status === 'done' && selectedStep.value?.status !== 'done') itemForm.status = 'planned'
})
onBeforeUnmount(() => { alive = false })
</script>

<template>
  <section class="rm-page" :class="{'rm-embedded':embedded}">
    <div v-if="error" class="rm-notice rm-error" role="alert"><span>{{ error }}</span><button type="button" class="rm-button" :disabled="loading" @click="load">Réessayer</button></div>
    <div v-if="loading && !data" class="rm-card rm-empty" role="status"><UIcon name="i-tabler-loader-2" class="rm-spinner"/> Chargement de la roadmap…</div>
    <template v-if="data">
      <header class="rm-heading">
        <div>
          <h1>{{ data.project.name }}</h1>
          <p class="rm-description">{{ data.project.description || 'Suivez le planning, les prochaines étapes et les décisions du projet.' }}</p>
        </div>
        <div v-if="canEdit" class="rm-actions">
          <button v-if="phases.length" type="button" class="rm-button" @click="edit('step')"><UIcon name="i-tabler-list-details"/> Ajouter une étape</button>
          <button type="button" class="rm-button rm-primary" @click="edit('phase')"><UIcon name="i-tabler-plus"/> Ajouter une phase</button>
        </div>
      </header>
      <p v-if="feedback" class="rm-notice rm-success" role="status"><UIcon name="i-tabler-circle-check"/> {{ feedback }}</p>
      <div class="rm-metrics">
        <article class="rm-card rm-metric">
          <span class="rm-icon"><UIcon name="i-tabler-calendar-week"/></span>
          <div><h2>Durée du projet</h2><strong>{{ duration }}</strong><small>{{ roadmapPeriodLabel(data.project.startDate,data.project.endDate) }}</small></div>
        </article>
        <article class="rm-card rm-metric">
          <span class="rm-icon"><UIcon name="i-tabler-target-arrow"/></span>
          <div><h2>Progression globale</h2><strong>{{ data.summary.progress }} %</strong><div class="rm-progress" role="progressbar" aria-label="Progression globale" :aria-valuenow="data.summary.progress"><i :style="{width:data.summary.progress+'%'}"/></div></div>
        </article>
        <article class="rm-card rm-metric">
          <span class="rm-icon"><UIcon name="i-tabler-stack-2"/></span>
          <div><h2>Phase actuelle</h2><button v-if="data.summary.currentPhase" type="button" class="rm-metric-link" @click="select(data.summary.currentPhase.id,'phase')">{{ data.summary.currentPhase.title }} <UIcon name="i-tabler-chevron-right"/></button><strong v-else>{{ data.summary.progress===100 ? 'Terminé' : phases.length ? 'À venir' : 'À définir' }}</strong><small v-if="data.summary.currentPhase">{{ labels[data.summary.currentPhase.status] }}</small></div>
        </article>
        <article class="rm-card rm-metric">
          <span class="rm-icon"><UIcon name="i-tabler-flag"/></span>
          <div><h2>Prochaine étape</h2><button v-if="data.summary.nextStep" type="button" class="rm-metric-link" @click="select(data.summary.nextStep.id,'step')">{{ data.summary.nextStep.title }} <UIcon name="i-tabler-chevron-right"/></button><strong v-else>Aucune étape à venir</strong><small v-if="data.summary.nextStep">{{ roadmapPeriodLabel(data.summary.nextStep.startDate,data.summary.nextStep.endDate) }}</small></div>
        </article>
      </div>
      <div v-if="pending.length" class="rm-notice rm-pending">
        <UIcon name="i-tabler-clipboard-check"/>
        <div><strong>{{ pending.length }} validation{{ pending.length>1?'s':'' }} en attente</strong><span v-if="!canReview && !canEdit"> · {{ data.project.decisionMakerName || 'Le décideur du projet' }} peut répondre aux demandes.</span></div>
        <button type="button" class="rm-button" @click="select(pending[0]!.id,'step')">Voir la demande <UIcon name="i-tabler-arrow-right"/></button>
      </div>
      <PortalRoadmapTimeline v-if="phases.length" :key="projectId" :project="data.project" :phases="phases" :labels="labels" @select="select"/>
      <div v-else class="rm-card rm-empty">
        <span class="rm-icon"><UIcon name="i-tabler-route-off"/></span>
        <h2>Le planning reste à définir</h2>
        <p>{{ canEdit ? 'Ajoutez une première phase, puis renseignez ses dates et les étapes à suivre.' : 'Les phases et étapes apparaîtront ici quand MC Studio aura préparé votre planning.' }}</p>
        <button v-if="canEdit" type="button" class="rm-button rm-primary" @click="edit('phase')"><UIcon name="i-tabler-plus"/> Ajouter la première phase</button>
      </div>
      <div v-if="phases.length" class="rm-panels">
        <section class="rm-card rm-panel">
          <h2><span class="rm-icon"><UIcon name="i-tabler-list-check"/></span> Prochaines étapes</h2>
          <p v-if="!upcoming.length" class="rm-muted">Aucune étape ouverte pour le moment.</p>
          <ul v-else class="rm-items">
            <li v-for="step in showAll ? upcoming : upcoming.slice(0,6)" :key="step.id">
              <button type="button" class="rm-item" :class="step.status" @click="select(step.id,'step')">
                <span class="rm-item-symbol"><UIcon :name="step.status==='blocked' ? 'i-tabler-alert-circle' : step.status==='awaiting_validation' ? 'i-tabler-clipboard-check' : 'i-tabler-circle'"/></span>
                <span><strong>{{ step.title }}</strong><small>{{ labels[step.status] }}<template v-if="step.kind==='deliverable'"> · Livrable</template></small></span>
                <time v-if="stepDate(step)" :datetime="stepDate(step) || undefined" :class="{'rm-overdue':stepDate(step)!<dateNow && step.status==='awaiting_validation'}">{{ roadmapDateLabel(stepDate(step)) }}</time>
              </button>
            </li>
          </ul>
          <button v-if="upcoming.length>6" type="button" class="rm-button rm-more" :aria-expanded="showAll" @click="showAll=!showAll">{{ showAll?'Afficher moins':`Afficher les ${upcoming.length} étapes` }}</button>
        </section>
        <section class="rm-card rm-panel">
          <h2><span class="rm-icon"><UIcon name="i-tabler-flag-3"/></span> Dates clés</h2>
          <p v-if="!keyDates.length" class="rm-muted">Les livrables et événements datés apparaîtront ici.</p>
          <ul v-else class="rm-items">
            <li v-for="step in visibleDates" :key="step.id"><button type="button" class="rm-item" :class="step.status" @click="select(step.id,'step')">
              <span class="rm-item-symbol"><UIcon :name="step.status==='done'?'i-tabler-circle-check-filled':'i-tabler-diamond'"/></span>
              <span><strong>{{ step.title }}</strong><small>{{ kinds[step.kind] }}</small></span><time :datetime="step.endDate || step.startDate || undefined">{{ roadmapDateLabel(step.endDate || step.startDate) }}</time>
            </button></li>
          </ul>
        </section>
        <section class="rm-card rm-panel">
          <h2><span class="rm-icon"><UIcon name="i-tabler-chart-donut"/></span> Vue d’ensemble</h2>
          <div class="rm-overview">
            <div class="rm-ring" :style="{'--rm-percent':data.summary.progress+'%'}" aria-hidden="true"><strong>{{ data.summary.progress }} %</strong></div>
            <div><p><UIcon name="i-tabler-circle-check" class="rm-complete"/> <strong>{{ donePhases }} / {{ phases.length }}</strong> phases terminées</p><p><UIcon name="i-tabler-list-check"/> <strong>{{ doneSteps }} / {{ steps.length }}</strong> étapes terminées</p><p><UIcon name="i-tabler-clipboard-check"/> <strong>{{ data.summary.pendingValidations }}</strong> en attente de validation</p></div>
          </div>
          <button v-if="canEdit && data.archivedValidations.length" type="button" class="rm-button rm-more" @click="changeDialog('archive')"><UIcon name="i-tabler-archive"/> Validations archivées</button>
        </section>
      </div>
      <button v-else-if="canEdit && data.archivedValidations.length" type="button" class="rm-button rm-more" @click="changeDialog('archive')"><UIcon name="i-tabler-archive"/> Validations archivées</button>
    </template>
    <dialog ref="dialog" class="rm-dialog" aria-labelledby="rm-dialog-title" @cancel.prevent="closeDialog">
      <header class="rm-dialog-heading">
        <div>
          <p class="rm-kicker">{{ dialogMode==='details' ? itemKind==='phase' ? 'Phase' : selectedStep ? kinds[selectedStep.kind] : 'Étape' : 'Roadmap du projet' }}</p>
          <h2 id="rm-dialog-title" ref="dialogHeading" tabindex="-1">{{ dialogTitle }}</h2>
        </div>
        <button type="button" class="rm-button rm-icon-button" aria-label="Fermer" :disabled="busy" @click="closeDialog"><UIcon name="i-tabler-x"/></button>
      </header>
      <div class="rm-dialog-body">
        <p v-if="formError" class="rm-notice rm-error" role="alert">{{ formError }}</p>
        <template v-if="dialogMode==='details' && selectedItem">
          <div class="rm-details-meta">
            <span class="rm-pill" :class="selectedItem.status">{{ labels[selectedItem.status] }}</span>
            <span><UIcon name="i-tabler-calendar"/> {{ roadmapPeriodLabel(selectedItem.startDate,selectedItem.endDate) }}</span>
            <span v-if="selectedStep?.responsibleName"><UIcon name="i-tabler-user"/> {{ selectedStep.responsibleName }}</span>
          </div>
          <p v-if="selectedItem.description" class="rm-copy">{{ selectedItem.description }}</p>
          <p v-if="selectedStep?.blocker" class="rm-notice rm-error"><UIcon name="i-tabler-alert-circle"/> {{ selectedStep.blocker }}</p>
          <section v-if="selectedPhase" class="rm-detail-section">
            <h3>Prérequis</h3>
            <p v-if="!selectedPrerequisites.length" class="rm-muted">Aucun prérequis pour cette phase.</p>
            <template v-else>
              <p v-if="selectedPrerequisites.some(({ step }) => step.status !== 'done')" class="rm-muted">Terminez ces étapes pour avancer dans cette phase.</p>
              <ul class="rm-items">
                <li v-for="{ step, phaseTitle } in selectedPrerequisites" :key="step.id">
                  <button type="button" class="rm-item" :class="step.status" @click="select(step.id,'step')">
                    <span class="rm-item-symbol"><UIcon :name="step.status === 'done' ? 'i-tabler-check' : 'i-tabler-link'"/></span>
                    <span><strong>{{ step.title }}</strong><small>{{ phaseTitle }} · {{ labels[step.status] }}</small></span>
                    <UIcon name="i-tabler-chevron-right"/>
                  </button>
                </li>
              </ul>
            </template>
          </section>
          <section v-if="selectedPhase" class="rm-detail-section">
            <div class="rm-section-heading">
              <div><h3>Étapes de la phase</h3><p>{{ selectedPhase.progress }} % terminé</p></div>
              <button v-if="canEdit" type="button" class="rm-button" @click="edit('step',undefined,selectedPhase.id)"><UIcon name="i-tabler-plus"/> Ajouter une étape</button>
            </div>
            <p v-if="!selectedPhase.steps.length" class="rm-muted">Aucune étape dans cette phase.</p>
            <ul v-else class="rm-items">
              <li v-for="step in selectedPhase.steps" :key="step.id"><button type="button" class="rm-item" :class="step.status" @click="select(step.id,'step')">
                <span class="rm-item-symbol"><UIcon name="i-tabler-circle"/></span><span><strong>{{ step.title }}</strong><small>{{ roadmapPeriodLabel(step.startDate,step.endDate) }}</small></span><UIcon name="i-tabler-chevron-right"/>
              </button></li>
            </ul>
          </section>
          <section v-if="selectedStep?.dependencyIds.length" class="rm-detail-section">
            <h3>Dépendances</h3>
            <ul class="rm-items">
              <li v-for="dependency in dependencies.filter(step=>selectedStep?.dependencyIds.includes(step.id))" :key="dependency.id"><button type="button" class="rm-item" :class="dependency.status" @click="select(dependency.id,'step')"><span class="rm-item-symbol"><UIcon name="i-tabler-link"/></span><span><strong>{{ dependency.title }}</strong><small>{{ labels[dependency.status] }}</small></span><UIcon name="i-tabler-chevron-right"/></button></li>
            </ul>
          </section>
          <section v-if="selectedStep?.resourceIds.length" class="rm-detail-section">
            <h3>Livrables associés</h3>
            <ul class="rm-resources">
              <li v-for="id in selectedStep.resourceIds" :key="id">
                <a v-if="resourceLink(id)" class="rm-link" :href="resourceLink(id)!" target="_blank" rel="noopener noreferrer"><UIcon name="i-tabler-paperclip"/> {{ resourceTitle(id) }} <UIcon name="i-tabler-external-link"/></a>
                <button v-else-if="resourceKind(id)" type="button" class="rm-link" @click="openResource(id)"><UIcon name="i-tabler-paperclip"/> {{ resourceTitle(id) }} <UIcon name="i-tabler-arrow-up-right"/></button>
                <span v-else class="rm-muted">{{ resourceTitle(id) }}</span>
              </li>
            </ul>
          </section>
        </template>
        <section v-if="dialogMode==='archive' || (dialogMode==='details' && selectedStep)" class="rm-detail-section rm-validations">
          <div v-if="dialogMode!=='archive'" class="rm-section-heading">
            <div><h3>Validations</h3><p v-if="selectedStep?.requiresValidation">Une approbation du client est requise.</p></div>
            <button v-if="canEdit && selectedStep && selectedStep.status!=='done' && !pendingFor(selectedStep)" type="button" class="rm-button rm-primary" @click="requestValidation"><UIcon name="i-tabler-send"/> Demander une validation</button>
          </div>
          <p v-if="dialogMode!=='archive' && !selectedStep?.validations.length" class="rm-muted">Aucune demande de validation pour cette étape.</p>
          <ol v-else class="rm-history">
            <li v-for="item in (dialogMode==='archive' ? data?.archivedValidations : selectedStep?.validations)" :key="item.id">
              <div class="rm-history-heading"><h4>{{ item.title }}</h4><span class="rm-pill" :class="item.status">{{ decisions[item.status] }}</span></div>
              <p class="rm-muted">{{ item.requestedByName || 'MC Studio' }} · Demande du {{ portalDate(item.requestedAt) }}</p>
              <p v-if="item.dueDate" class="rm-muted" :class="{'rm-overdue':item.status==='pending' && item.dueDate<dateNow}">Réponse attendue le {{ roadmapDateLabel(item.dueDate) }}</p>
              <p v-if="item.description" class="rm-copy">{{ item.description }}</p>
              <div v-if="item.url || item.resourceId || item.resourceTitle" class="rm-resource-links">
                <a v-if="externalUrl(item.url)" class="rm-link" :href="externalUrl(item.url)!" target="_blank" rel="noopener noreferrer"><UIcon name="i-tabler-external-link"/> Consulter le lien</a>
                <a v-if="resourceLink(item.resourceId,item.resourceUrl)" class="rm-link" :href="resourceLink(item.resourceId,item.resourceUrl)!" target="_blank" rel="noopener noreferrer"><UIcon name="i-tabler-paperclip"/> {{ item.resourceTitle || 'Consulter la ressource' }}</a>
                <button v-else-if="resourceKind(item.resourceId)" type="button" class="rm-link" @click="openResource(item.resourceId)"><UIcon name="i-tabler-paperclip"/> {{ item.resourceTitle || resourceTitle(item.resourceId!) }}</button>
                <span v-else-if="item.resourceTitle" class="rm-muted">{{ item.resourceTitle }}</span>
              </div>
              <div v-if="item.decidedAt" class="rm-decision">
                <p><strong>{{ item.decidedByName || 'Équipe du projet' }}</strong> · {{ portalDate(item.decidedAt) }}</p><p v-if="item.comment" class="rm-copy">{{ item.comment }}</p>
              </div>
              <button v-if="item.status==='pending' && canReview" type="button" class="rm-button rm-primary rm-reply" @click="decide(item)"><UIcon name="i-tabler-message-check"/> Répondre</button>
              <p v-else-if="item.status==='pending' && !canEdit" class="rm-muted">Réponse réservée à {{ data?.project.decisionMakerName || 'la personne désignée pour valider le projet' }}.</p>
            </li>
          </ol>
        </section>
        <form v-if="dialogMode==='phase' || dialogMode==='step'" class="rm-form" @submit.prevent="saveItem">
          <fieldset :disabled="busy">
            <label class="rm-wide">Titre<input v-model="itemForm.title" required maxlength="160"></label>
            <label class="rm-wide">Description<textarea v-model="itemForm.description" rows="3" maxlength="3000"/></label>
            <template v-if="dialogMode==='step'">
              <label>Phase parente<select v-model="itemForm.phaseId" required><option v-for="phase in phases" :key="phase.id" :value="phase.id">{{ phase.title }}</option></select></label>
              <label>Type<select v-model="itemForm.kind"><option v-for="(label,kind) in kinds" :key="kind" :value="kind">{{ label }}</option></select></label>
            </template>
            <label>Date de début<input v-model="itemForm.startDate" type="date" min="0001-01-01" max="9999-12-31"></label>
            <label>Date de fin<input v-model="itemForm.endDate" type="date" :min="itemForm.startDate || '0001-01-01'" max="9999-12-31"></label>
            <label>Statut<select v-model="itemForm.status"><option v-for="status in availableStatuses" :key="status" :value="status">{{ labels[status] }}</option></select></label>
            <div v-if="dialogMode==='phase'" class="rm-wide rm-checkboxes" role="group" aria-label="Prérequis">
              <p>Prérequis</p>
              <p v-if="!prerequisitePhases.length">Aucune étape disponible dans les autres phases.</p>
              <template v-for="phase in prerequisitePhases" :key="phase.id">
                <p><strong>{{ phase.title }}</strong></p>
                <label v-for="step in phase.steps" :key="step.id" class="rm-check">
                  <input v-model="itemForm.prerequisiteStepIds" type="checkbox" :value="step.id">
                  {{ step.title }} · {{ labels[step.status] }}
                </label>
              </template>
            </div>
            <template v-if="dialogMode==='step'">
              <label>Responsable<select v-model="itemForm.responsibleId"><option value="">À attribuer</option><option v-if="selectedStep?.responsibleId && !members.some(member=>member.id===selectedStep?.responsibleId)" :value="selectedStep.responsibleId">{{ selectedStep.responsibleName || 'Responsable précédent' }}</option><option v-for="member in members" :key="member.id" :value="member.id">{{ member.name }}</option></select></label>
              <label class="rm-check rm-wide"><input v-model="itemForm.requiresValidation" type="checkbox" :disabled="Boolean(selectedStep?.validations.length)"> Approbation du client requise pour terminer cette étape</label>
              <label v-if="itemForm.status==='blocked' || itemForm.blocker" class="rm-wide">Blocage<textarea v-model="itemForm.blocker" rows="2" maxlength="1000" :required="itemForm.status==='blocked'" placeholder="Précisez ce qui manque pour avancer…"/></label>
              <div v-if="resources.length" class="rm-wide rm-checkboxes" role="group" aria-label="Livrables associés">
                <p>Livrables associés</p><label v-for="resource in resources" :key="resource.id" class="rm-check"><input v-model="itemForm.resourceIds" type="checkbox" :value="resource.id"> {{ resource.title }}</label>
              </div>
              <div v-if="dependencies.length" class="rm-wide rm-checkboxes" role="group" aria-label="Dépendances">
                <p>Dépendances</p><label v-for="step in dependencies" :key="step.id" class="rm-check"><input v-model="itemForm.dependencyIds" type="checkbox" :value="step.id"> {{ step.title }}</label>
              </div>
              <p v-if="selectedStep?.status==='awaiting_validation' && itemForm.status!=='awaiting_validation'" class="rm-notice rm-pending rm-wide">Ce changement annule la demande de validation en cours.</p>
            </template>
          </fieldset>
          <div class="rm-form-actions">
            <button type="button" class="rm-button" :disabled="busy" @click="cancelForm">Annuler</button>
            <button type="submit" class="rm-button rm-primary" :disabled="busy">{{ busy?'Enregistrement…':'Enregistrer' }}</button>
          </div>
        </form>
        <form v-if="dialogMode==='submit'" class="rm-form" @submit.prevent="submitValidation">
          <p class="rm-muted">Le décideur du projet recevra une notification pour « {{ selectedStep?.title }} ».</p>
          <fieldset :disabled="busy">
            <label class="rm-wide">Consignes pour la validation<textarea v-model="validationForm.description" required rows="4" maxlength="3000" placeholder="Indiquez les éléments à vérifier…"/></label>
            <label v-if="resources.length">Pièce jointe<select v-model="validationForm.resourceId"><option value="">Choisir une ressource du projet</option><option v-for="resource in resources" :key="resource.id" :value="resource.id">{{ resource.title }}</option></select></label>
            <label>Lien externe<input v-model.trim="validationForm.url" type="url" maxlength="2000" placeholder="https://…"></label>
            <label>Date limite de réponse<input v-model="validationForm.dueDate" type="date" min="0001-01-01" max="9999-12-31"></label>
          </fieldset>
          <div class="rm-form-actions">
            <button type="button" class="rm-button" :disabled="busy" @click="returnToDetails">Annuler</button>
            <button type="submit" class="rm-button rm-primary" :disabled="busy">{{ busy?'Envoi…':'Envoyer la demande' }}</button>
          </div>
        </form>
        <form v-if="dialogMode==='decision'" class="rm-form" @submit.prevent="submitDecision">
          <p class="rm-muted">Votre réponse pour « {{ selectedStep?.title }} » restera dans l’historique du projet.</p>
          <fieldset :disabled="busy">
            <label class="rm-wide">Décision<select v-model="decisionForm.decision"><option value="approved">Approuver</option><option value="changes">Demander des modifications</option></select></label>
            <label class="rm-wide">{{ decisionForm.decision==='changes'?'Modifications attendues':'Commentaire (facultatif)' }}<textarea v-model="decisionForm.comment" rows="4" maxlength="3000" :required="decisionForm.decision==='changes'"/></label>
          </fieldset>
          <div class="rm-form-actions">
            <button type="button" class="rm-button" :disabled="busy" @click="returnToDetails">Annuler</button>
            <button type="submit" class="rm-button rm-primary" :disabled="busy">{{ busy?'Enregistrement…':'Enregistrer ma décision' }}</button>
          </div>
        </form>
        <template v-if="dialogMode==='delete'">
          <p class="rm-copy">Supprimer « {{ selectedItem?.title }} » de la roadmap ?</p>
          <p v-if="selectedPhase?.steps.length" class="rm-muted">Les étapes de cette phase seront archivées et les demandes de validation en attente seront annulées.</p>
          <div class="rm-form-actions">
            <button type="button" class="rm-button" :disabled="busy" @click="returnToDetails">Annuler</button>
            <button type="button" class="rm-button rm-danger" :disabled="busy" @click="removeItem">{{ busy?'Suppression…':'Supprimer' }}</button>
          </div>
        </template>
      </div>
      <footer v-if="dialogMode==='details' && canEdit && selectedItem" class="rm-dialog-footer">
        <div v-if="selectedSiblings.length>1" class="rm-actions rm-order" role="group" aria-label="Ordre d’affichage">
          <button type="button" class="rm-button rm-icon-button" aria-label="Monter dans la liste" title="Monter dans la liste" :disabled="busy || selectedPosition===0" @click="reorder(-1)"><UIcon name="i-tabler-arrow-up"/></button>
          <button type="button" class="rm-button rm-icon-button" aria-label="Descendre dans la liste" title="Descendre dans la liste" :disabled="busy || selectedPosition===selectedSiblings.length-1" @click="reorder(1)"><UIcon name="i-tabler-arrow-down"/></button>
        </div>
        <div class="rm-actions">
          <button type="button" class="rm-button rm-delete" :disabled="busy" @click="changeDialog('delete')"><UIcon name="i-tabler-trash"/> Supprimer</button>
          <button type="button" class="rm-button rm-primary" :disabled="busy" @click="edit(itemKind,selectedItem)"><UIcon name="i-tabler-pencil"/> Modifier</button>
        </div>
      </footer>
    </dialog>
  </section>
</template>

<style scoped>
.rm-page{display:grid;gap:20px;min-width:0;padding:30px 32px 40px;color:var(--portal-text);font-size:14px}
.rm-page.rm-embedded{padding:4px 0 24px}
.rm-heading,.rm-section-heading,.rm-details-meta,.rm-actions,.rm-history-heading,.rm-resource-links{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rm-heading,.rm-section-heading,.rm-history-heading{justify-content:space-between}
.rm-heading{align-items:flex-end;gap:16px}
.rm-kicker{display:flex;align-items:center;gap:7px;margin:0;color:var(--portal-accent-text);font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.rm-kicker .iconify{font-size:15px}
.rm-heading h1{margin:6px 0 4px;font-size:clamp(24px,3vw,34px);font-weight:650;line-height:1.2;overflow-wrap:anywhere}
.rm-description{max-width:68ch;margin:0;color:var(--portal-muted);font-size:13px;overflow-wrap:anywhere}
.rm-page .rm-card{border:1px solid var(--portal-line);border-radius:12px;background:var(--portal-surface)}
.rm-metrics,.rm-panels{display:grid;gap:14px;grid-template-columns:repeat(4,minmax(0,1fr))}
.rm-metric{display:flex;align-items:flex-start;gap:12px;padding:16px;min-width:0}
.rm-metric>div{min-width:0;flex:1}
.rm-icon{display:inline-grid;place-items:center;flex:none;width:34px;height:34px;border-radius:9px;background:var(--portal-accent-soft);color:var(--portal-accent-text);font-size:18px}
.rm-metric h2{margin:0 0 5px;color:var(--portal-muted);font-size:11px;font-weight:500;letter-spacing:0}
.rm-metric strong,.rm-metric-link{display:block;color:var(--portal-text);font-size:15px;font-weight:650;line-height:1.25;overflow-wrap:anywhere;text-align:left}
.rm-metric-link:hover{color:var(--portal-accent-text)}
.rm-metric-link .iconify{vertical-align:middle;font-size:13px}
.rm-metric small{display:block;margin-top:5px;color:var(--portal-muted);font-size:11px}
.rm-progress{height:6px;overflow:hidden;margin-top:9px;border-radius:10px;background:var(--portal-line)}
.rm-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--portal-accent-deep),var(--portal-accent-hover));transition:width .2s ease}
.rm-notice{display:flex;align-items:center;gap:10px;padding:11px 14px;margin:0;border:1px solid var(--portal-line);border-radius:9px;font-size:13px;overflow-wrap:anywhere}
.rm-notice>.iconify{flex:none;font-size:17px}
.rm-notice>.rm-button{margin-left:auto}
.rm-error{background:var(--portal-danger-soft);color:var(--portal-danger);border-color:color-mix(in srgb,var(--portal-danger),transparent 65%)}
.rm-success{background:var(--portal-success-soft);color:var(--portal-success)}
.rm-pending{background:var(--portal-info-soft);color:var(--portal-info)}
.rm-pending>div{flex:1}
.rm-pending strong{font-weight:650}
.rm-empty{display:grid;justify-items:center;gap:10px;text-align:center;padding:34px 20px;color:var(--portal-muted)}
.rm-empty h2{font-size:19px;margin:0}
.rm-empty p{font-size:13px;margin:0}
.rm-empty .rm-icon{width:44px;height:44px;font-size:24px}
.rm-empty button{margin-top:5px}
.rm-spinner{animation:rm-spin 1s linear infinite;font-size:23px;color:var(--portal-accent-text)}
@keyframes rm-spin{to{transform:rotate(360deg)}}
.rm-panels{grid-template-columns:repeat(3,minmax(0,1fr));align-items:start}
.rm-panel{min-width:0;padding:14px}
.rm-panel h2{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:15px;font-weight:600}
.rm-panel .rm-icon{width:30px;height:30px;font-size:16px}
.rm-muted{font-size:12px;color:var(--portal-muted);margin:5px 0;line-height:1.55}
.rm-overdue{color:var(--portal-danger)!important}
.rm-items,.rm-history,.rm-resources{list-style:none;margin:0;padding:0}
.rm-items>li+li{border-top:1px solid var(--portal-line)}
.rm-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;min-height:47px;padding:6px;border-radius:7px;text-align:left;color:var(--portal-text)}
.rm-item:hover{background:var(--portal-hover)}
.rm-item strong,.rm-item small{display:block;overflow-wrap:anywhere}
.rm-item strong{font-size:12px;font-weight:600}
.rm-item small,.rm-item time{font-size:10px;color:var(--portal-muted)}
.rm-item time{text-align:right;font-variant-numeric:tabular-nums}
.rm-item-symbol{color:var(--state,var(--portal-muted));font-size:16px;line-height:1}
.rm-item.awaiting_validation{background:var(--portal-info-soft)}
.rm-item.awaiting_validation:hover{background:color-mix(in srgb,var(--portal-info-soft),var(--portal-info) 10%)}
.rm-overview{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:6px 0}
.rm-overview p{margin:5px 0;font-size:12px;color:var(--portal-muted)}
.rm-overview .iconify{vertical-align:middle;color:var(--portal-accent-text)}
.rm-overview .rm-complete{color:var(--portal-success)}
.rm-ring{display:grid;place-items:center;flex:none;width:75px;height:75px;border-radius:50%;background:conic-gradient(var(--portal-accent) var(--rm-percent),var(--portal-line) 0);font-size:15px;font-variant-numeric:tabular-nums}
.rm-ring strong{display:grid;place-items:center;width:61px;height:61px;border-radius:50%;background:var(--portal-surface)}
.rm-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:8px 12px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);color:var(--portal-text);font-size:12px;font-weight:600;cursor:pointer}
.rm-button:hover:not(:disabled){background:var(--portal-hover)}
.rm-button:disabled{opacity:.5;cursor:default}
.rm-button.rm-primary{border-color:var(--portal-accent);background:var(--portal-accent);color:var(--portal-accent-ink)}
.rm-button.rm-primary:hover:not(:disabled){background:var(--portal-accent-hover)}
.rm-button .iconify{flex:none;font-size:16px}
.rm-more,.rm-reply{margin-top:12px}
.rm-dialog{inset:0;width:min(650px,calc(100vw - 32px));max-height:min(800px,calc(100dvh - 32px));margin:auto;padding:0;overflow:auto;overscroll-behavior:contain;border:1px solid var(--portal-line);border-radius:14px;background:var(--portal-surface);color:var(--portal-text);box-shadow:var(--portal-shadow);font-size:14px}
.rm-dialog::backdrop{background:#08080da8;backdrop-filter:blur(4px)}
.rm-dialog-heading,.rm-dialog-footer{position:sticky;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;background:var(--portal-surface)}
.rm-dialog-heading{top:0;border-bottom:1px solid var(--portal-line)}
.rm-dialog-heading h2{font-size:23px;font-weight:650;line-height:1.25;margin:4px 0 0;overflow-wrap:anywhere}
.rm-dialog-heading h2:focus{outline:none}
.rm-dialog-body{padding:18px 20px}
.rm-dialog-body>.rm-error{margin-bottom:14px}
.rm-dialog-footer{bottom:0;border-top:1px solid var(--portal-line);justify-content:flex-end;flex-wrap:wrap}
.rm-dialog-footer .rm-order{margin-right:auto}
.rm-icon-button{min-width:42px;padding:6px}
.rm-details-meta{font-size:12px;color:var(--portal-muted);gap:8px 14px}
.rm-details-meta .iconify{vertical-align:middle}
.rm-copy{font-size:13px;margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere}
.rm-detail-section{border-top:1px solid var(--portal-line);padding-top:14px;margin-top:14px}
.rm-detail-section h3{font-size:16px;font-weight:600;margin:0 0 6px}
.rm-section-heading p{margin:3px 0 6px;color:var(--portal-muted);font-size:12px}
.rm-pill{display:inline-flex;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:600;color:var(--state,var(--portal-muted));background:var(--state-bg,var(--portal-raised))}
.in_progress{--state:var(--portal-accent-text);--state-bg:var(--portal-accent-soft)}
.done,.approved{--state:var(--portal-success);--state-bg:var(--portal-success-soft)}
.awaiting_validation,.pending{--state:var(--portal-info);--state-bg:var(--portal-info-soft)}
.blocked,.changes{--state:var(--portal-danger);--state-bg:var(--portal-danger-soft)}
.rm-history{display:grid;gap:10px;margin-top:12px}
.rm-history>li{border:1px solid var(--portal-line);border-radius:9px;padding:12px;background:var(--portal-bg)}
.rm-history h4{margin:0;font-weight:600;overflow-wrap:anywhere}
.rm-history .rm-copy{margin:6px 0}
.rm-decision{border-left:2px solid var(--portal-line);padding:4px 0 4px 10px;margin-top:10px;font-size:12px}
.rm-decision p{margin:0;color:var(--portal-muted)}
.rm-decision p+p{margin-top:4px}
.rm-resources{display:flex;flex-wrap:wrap;gap:8px}
.rm-link{display:inline-flex;gap:6px;align-items:center;min-height:36px;padding:4px 7px;color:var(--portal-accent-text);font-size:12px;text-align:left;text-decoration:underline;overflow-wrap:anywhere}
.rm-link .iconify{flex:none}
.rm-form fieldset{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;border:0;padding:0;margin:0;min-width:0}
.rm-form>p{margin:0 0 14px}
.rm-form label{display:grid;align-content:start;gap:5px;font-size:12px;min-width:0;font-weight:500}
.rm-form input:not([type=checkbox]),.rm-form select,.rm-form textarea{width:100%;min-width:0;min-height:42px;padding:8px 10px;border:1px solid var(--portal-line);border-radius:7px;background:var(--portal-control);color:var(--portal-text);font-size:14px}
.rm-form textarea{resize:vertical}
.rm-form .rm-check{display:flex;align-items:flex-start;gap:8px;padding:6px 0}
.rm-form .rm-check input{flex:none;width:16px;height:16px;accent-color:var(--portal-accent)}
.rm-checkboxes{max-height:160px;overflow:auto;padding:10px;border:1px solid var(--portal-line);border-radius:7px}
.rm-checkboxes p{margin:0 0 5px;color:var(--portal-muted);font-size:12px}
.rm-wide{grid-column:1/-1}
.rm-form-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:18px}
.rm-button.rm-delete{color:var(--portal-danger)}
.rm-button.rm-danger,.rm-button.rm-danger:hover:not(:disabled){background:var(--portal-danger-fill);border-color:var(--portal-danger-fill);color:var(--portal-danger-ink)}
@media(max-width:1150px){
  .rm-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
  .rm-panels{grid-template-columns:repeat(2,minmax(0,1fr))}
  .rm-panel:last-child{grid-column:1/-1}
}
@media(max-width:960px){.rm-page{padding:24px}}
@media(max-width:700px){
  .rm-page{padding:20px 16px;gap:14px}
  .rm-metrics{gap:8px}
  .rm-metric{padding:10px;gap:6px}
  .rm-metric .rm-icon{width:26px;height:26px;font-size:14px}
  .rm-metric strong,.rm-metric-link{font-size:13px}
  .rm-metric small{font-size:10px}
  .rm-panels{grid-template-columns:minmax(0,1fr);gap:10px}
  .rm-button{min-height:44px}
  .rm-dialog{width:calc(100vw - 20px);max-height:calc(100dvh - 20px)}
  .rm-dialog-heading,.rm-dialog-footer,.rm-dialog-body{padding:12px}
  .rm-form input:not([type=checkbox]),.rm-form select,.rm-form textarea{font-size:16px}
  .rm-notice{flex-wrap:wrap}
}
@media(max-width:400px){
  .rm-form fieldset{grid-template-columns:minmax(0,1fr)}
  .rm-metric .rm-icon{display:none}
}
</style>
