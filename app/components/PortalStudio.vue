<script setup lang="ts">
import { portalDate } from '~/types/portal'
import {
  studioCategories, studioClassifications, studioPriorities,
  type StudioCategory, type StudioCockpit, type StudioItem, type StudioLaunchResult,
  type StudioOnboardingInput, type StudioOnboardingPlan, type StudioOnboardingProject, type StudioQualification,
  type StudioTemplate, type StudioTemplateDefinition, type StudioTemplateId, type StudioTemplateSummary
} from '#shared/portal-studio'

const props = defineProps<{ clients: { id: string; name: string; projects?: { id: string }[] }[] }>()
const emit = defineEmits<{ 'project-created': []; invite: [organizationId: string] }>()
const localePath = useLocalePath()
const route = useRoute()
const api = '/api/portal/admin/studio'
const sections = [
  { id: 'today', label: 'Aujourd’hui', icon: 'i-tabler-calendar-event' },
  { id: 'onboarding', label: 'Lancer un projet', icon: 'i-tabler-rocket' },
  { id: 'templates', label: 'Modèles', icon: 'i-tabler-template' }
] as const
const view = ref<typeof sections[number]['id']>('today')
const categories: Record<StudioCategory, { label: string; icon: string }> = {
  request: { label: 'Demandes', icon: 'i-tabler-messages' },
  validation: { label: 'Validations', icon: 'i-tabler-circle-check' },
  document: { label: 'Documents', icon: 'i-tabler-file-description' },
  deliverable: { label: 'Livrables', icon: 'i-tabler-package' },
  payment: { label: 'Paiements', icon: 'i-tabler-credit-card' }
}
const classLabels = { bug: 'Bug', evolution: 'Évolution', question: 'Question', out_of_scope: 'Hors périmètre' }
const priorityLabels = { low: 'Basse', normal: 'Normale', high: 'Haute', urgent: 'Urgente' }
const stepLabels = { step: 'Étape', milestone: 'Jalon', deliverable: 'Livrable', checklist: 'Checklist' }
const cockpit = ref<StudioCockpit>()
const loading = ref(false)
const loadError = ref('')
const category = ref<StudioCategory | 'all'>('all')
const showSnoozed = ref(false)
const limit = ref(12)
const errorLabel = (error: unknown, fallback: string) => {
  const statusMessage = (error as { data?: { statusMessage?: unknown } })?.data?.statusMessage
  return typeof statusMessage === 'string' ? statusMessage : fallback
}
const adminLink = (query: Record<string, string>) => ({ path: localePath('/portal/admin'), query })
const itemContext = (item: StudioItem) => [item.organizationName, item.projectName].filter(Boolean).join(' · ')
const focusedItems = computed(() => (cockpit.value?.items || []).filter(item => item.snoozed === showSnoozed.value))
const counts = computed(() => {
  return focusedItems.value.reduce((counts, { category }) => {
    counts[category] += 1
    return counts
  }, { request: 0, validation: 0, document: 0, deliverable: 0, payment: 0 })
})
const visibleItems = computed(() => focusedItems.value.filter(item => category.value === 'all' || item.category === category.value))
const snoozedCount = computed(() => cockpit.value?.items.filter(item => item.snoozed).length || 0)
const tomorrow = computed(() => {
  if (!cockpit.value) return ''
  const next = new Date(cockpit.value.today + 'T00:00:00Z')
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
})
watch([category, showSnoozed], () => { limit.value = 12 })
watch(showSnoozed, showing => { if (showing) category.value = 'all' })

async function loadCockpit() {
  if (loading.value) return
  loading.value = true
  loadError.value = ''
  try {
    cockpit.value = await $fetch<StudioCockpit>(api)
    if (!form.startDate && !result.value) form.startDate = cockpit.value.today
  } catch (error) {
    loadError.value = errorLabel(error, 'Le cockpit est indisponible.')
  } finally {
    loading.value = false
  }
}

const editedRequest = ref<StudioItem>()
const qualification = reactive<StudioQualification>({ classification: null, priority: 'normal', responsibleId: null, dueDate: null, snoozedUntil: null })
const qualifier = ref<HTMLFormElement>()
const qualificationError = ref('')
const savingQualification = ref(false)
const qualificationNotice = ref('')
async function openQualification(item: StudioItem) {
  if (!item.qualification || savingQualification.value) return
  qualificationError.value = ''
  qualificationNotice.value = ''
  Object.assign(qualification, item.qualification)
  if (!item.snoozed) qualification.snoozedUntil = null
  editedRequest.value = item
  await nextTick()
  qualifier.value?.querySelector('select')?.focus()
}
async function saveQualification() {
  const item = editedRequest.value
  if (!item || savingQualification.value) return
  savingQualification.value = true
  qualificationError.value = ''
  try {
    await $fetch(`${api}/requests/${encodeURIComponent(item.id)}`, {
      method: 'PATCH',
      body: { ...qualification, organizationId: item.organizationId, projectId: item.projectId }
    })
    editedRequest.value = undefined
    qualificationNotice.value = 'Qualification enregistrée.'
    await loadCockpit()
  } catch (error) {
    qualificationError.value = errorLabel(error, 'La demande n’a pas pu être mise à jour.')
  } finally {
    savingQualification.value = false
  }
}

const templateState = ref<{ templates: StudioTemplate[]; versions: StudioTemplateSummary[]; existingProjects: StudioOnboardingProject[] }>()
const templateLoading = ref(false)
const templateLoadError = ref('')
const form = reactive({ organizationId: '', existingProjectId: '', name: '', description: '', startDate: '', template: '' })
const eligibleProjects = computed(() => templateState.value?.existingProjects.filter(project => project.organizationId === form.organizationId) || [])
const plan = ref<StudioOnboardingPlan>()
const previewInput = ref<StudioOnboardingInput>()
const launchKey = ref('')
const onboardingBusy = ref<'preview' | 'launch' | ''>('')
const onboardingError = ref('')
const result = ref<StudioLaunchResult>()

async function loadTemplates() {
  if (templateLoading.value) return
  templateLoading.value = true
  templateLoadError.value = ''
  try {
    const data = await $fetch<NonNullable<typeof templateState.value>>(`${api}/templates`)
    templateState.value = data
    const first = data.templates[0]
    if (first && !form.template) form.template = `${first.id}:${first.version}`
  } catch (error) {
    templateLoadError.value = errorLabel(error, 'Impossible de charger les modèles.')
  } finally {
    templateLoading.value = false
  }
}

async function openView(section: typeof view.value) {
  view.value = section
  if (section === 'onboarding' || (section === 'templates' && !templateState.value)) await loadTemplates()
  if (section === 'templates' && !draft.value && templateState.value?.templates[0]) editTemplate(templateState.value.templates[0])
}
watch(form, () => {
  plan.value = undefined
  previewInput.value = undefined
  launchKey.value = ''
  onboardingError.value = ''
  linkedProject.value = undefined
})
watch(() => form.organizationId, () => { form.existingProjectId = '' })

const linkedProject = ref<{ clientId: string; projectId: string }>()
const linkedId = computed(() => typeof route.query.onboardingProjectId === 'string' ? route.query.onboardingProjectId : '')
async function openLinkedOnboarding() {
  const projectId = linkedId.value
  if (!projectId) return
  await openView('onboarding')
  if (!templateState.value || projectId !== linkedId.value) return
  const eligible = templateState.value.existingProjects.find(project => project.id === projectId)
  if (eligible) {
    form.organizationId = eligible.organizationId
    await nextTick()
    form.existingProjectId = eligible.id
    return
  }
  const client = props.clients.find(client => client.projects?.some(project => project.id === projectId))
  if (client) linkedProject.value = { clientId: client.id, projectId }
  onboardingError.value = 'Ce projet n’est plus disponible pour un onboarding depuis un modèle.'
}

function retryTemplateLoad() {
  if (view.value === 'onboarding' && linkedId.value) return openLinkedOnboarding()
  return openView(view.value)
}

async function previewOnboarding() {
  const [templateId, version] = form.template.split(':')
  if (!templateId || onboardingBusy.value) return
  onboardingBusy.value = 'preview'
  onboardingError.value = ''
  plan.value = undefined
  try {
    const input: StudioOnboardingInput = {
      organizationId: form.organizationId, existingProjectId: form.existingProjectId || undefined,
      name: form.existingProjectId ? '' : form.name, description: form.existingProjectId ? '' : form.description, startDate: form.startDate,
      templateId: templateId as StudioTemplateId, templateVersion: Number(version)
    }
    plan.value = await $fetch<StudioOnboardingPlan>(`${api}/onboarding/preview`, { method: 'POST', body: input })
    const previousInput = previewInput.value
    if (!previousInput || JSON.stringify(previousInput) !== JSON.stringify(input) || !launchKey.value) {
      launchKey.value = crypto.randomUUID()
    }
    previewInput.value = input
  } catch (error) {
    onboardingError.value = errorLabel(error, 'Impossible de préparer l’aperçu.')
  } finally {
    onboardingBusy.value = ''
  }
}

async function launchOnboarding() {
  if (!previewInput.value || !launchKey.value || !plan.value || onboardingBusy.value) return
  onboardingBusy.value = 'launch'
  onboardingError.value = ''
  try {
    result.value = await $fetch<StudioLaunchResult>(`${api}/onboarding`, {
      method: 'POST', body: { ...previewInput.value, idempotencyKey: launchKey.value }
    })
    if (templateState.value) templateState.value.existingProjects = templateState.value.existingProjects.filter(project => project.id !== result.value?.projectId)
    emit('project-created')
    await loadCockpit()
  } catch (error) {
    onboardingError.value = errorLabel(error, 'Le projet n’a pas pu être créé. Vous pouvez réessayer.')
  } finally {
    onboardingBusy.value = ''
  }
}

function resetOnboarding() {
  result.value = undefined
  Object.assign(form, { organizationId: '', existingProjectId: '', name: '', description: '', startDate: cockpit.value?.today || '' })
}

const draft = ref<StudioTemplateDefinition>()
const draftTemplate = ref<StudioTemplate>()
const publishing = ref(false)
const templateError = ref('')
const templateNotice = ref('')
const history = ref<StudioTemplate>()
const readingVersion = ref(false)

function editTemplate(template: StudioTemplate) {
  draftTemplate.value = template
  // Versions in the catalogue remain immutable while their definition is edited.
  draft.value = JSON.parse(JSON.stringify(template.definition))
  history.value = undefined
  templateError.value = ''
  templateNotice.value = ''
}

async function showVersion(version: number) {
  const source = draftTemplate.value
  if (!source || readingVersion.value) return
  readingVersion.value = true
  templateError.value = ''
  try {
    const revision = await $fetch<StudioTemplate>(`${api}/templates/${source.id}`, { query: { version } })
    if (draftTemplate.value?.id === source.id) history.value = revision
  } catch (error) {
    templateError.value = errorLabel(error, 'Version du modèle indisponible.')
  } finally {
    readingVersion.value = false
  }
}

function useVersion(revision: StudioTemplate) {
  form.template = `${revision.id}:${revision.version}`
  if (result.value) resetOnboarding()
  void openView('onboarding')
}
function addPhase() {
  if (!draft.value) return
  const nextDay = Math.min(730, (draft.value.phases.at(-1)?.endDay ?? -1) + 1)
  draft.value.phases.push({ title: '', description: '', startDay: nextDay, endDay: nextDay, steps: [] })
}
async function publishTemplate() {
  const source = draftTemplate.value
  if (!source || !draft.value || publishing.value) return
  publishing.value = true
  templateError.value = ''
  templateNotice.value = ''
  try {
    const updated = await $fetch<StudioTemplate>(`${api}/templates/${source.id}`, { method: 'POST', body: { version: source.version, definition: draft.value } })
    if (templateState.value) {
      templateState.value.templates = templateState.value.templates.map(template => template.id === updated.id ? updated : template)
      templateState.value.versions.unshift({ id: updated.id, version: updated.version, title: updated.definition.title })
    }
    if (form.template === `${source.id}:${source.version}`) form.template = `${updated.id}:${updated.version}`
    editTemplate(updated)
    templateNotice.value = `Version ${updated.version} publiée.`
  } catch (error) {
    templateError.value = errorLabel(error, 'Le modèle n’a pas pu être publié.')
  } finally {
    publishing.value = false
  }
}
onMounted(() => {
  void loadCockpit()
  void openLinkedOnboarding()
})
watch(linkedId, openLinkedOnboarding)
</script>

<template>
  <section class="studio">
    <header class="studio-header">
      <div>
        <h1>{{ view === 'today' ? 'Aujourd’hui' : sections.find(section => section.id === view)?.label }}</h1>
        <p v-if="view === 'today' && cockpit"><time :datetime="cockpit.today">{{ portalDate(cockpit.today) }}</time></p>
      </div>
      <button v-if="view === 'today'" type="button" class="studio-button" :disabled="loading" @click="loadCockpit">
        <UIcon name="i-tabler-refresh" /> Actualiser
      </button>
    </header>
    <nav aria-label="Cockpit" class="studio-tabs">
      <button v-for="section in sections" :key="section.id" type="button" :aria-current="view === section.id ? 'page' : undefined" @click="openView(section.id)">
        <UIcon :name="section.icon" /> {{ section.label }}
      </button>
    </nav>

    <template v-if="view === 'today'">
      <p v-if="loadError" class="studio-error" role="alert">{{ loadError }}</p>
      <p v-if="loading && !cockpit" class="studio-empty" role="status">Chargement du cockpit…</p>
      <template v-if="cockpit">
        <section class="studio-priorities" aria-labelledby="studio-priority-title">
          <h2 id="studio-priority-title">Priorités du jour</h2>
          <div v-if="cockpit.priorities.length" class="studio-priority-grid">
            <NuxtLink v-for="item in cockpit.priorities" :key="`${item.category}:${item.id}`" :to="adminLink(item.link)" class="studio-priority">
              <span class="studio-category"><UIcon :name="categories[item.category].icon" /> {{ categories[item.category].label }}</span>
              <strong>{{ item.title }}</strong>
              <span class="studio-muted">{{ itemContext(item) }}</span>
              <span class="studio-reason">{{ item.reason }} <UIcon name="i-tabler-arrow-up-right" /></span>
            </NuxtLink>
          </div>
          <p v-else class="studio-empty">Aucune priorité immédiate.</p>
        </section>
        <section v-if="cockpit.decisions.length" class="studio-panel" aria-labelledby="studio-decisions-title">
          <h2 id="studio-decisions-title">À décider</h2>
          <ul class="studio-list studio-decisions">
            <li v-for="decision in cockpit.decisions" :key="decision.id">
              <NuxtLink :to="adminLink(decision.link)">
                <span class="studio-item-link"><strong>{{ decision.title }}</strong><span>{{ decision.detail }}</span></span>
                <time v-if="decision.dueDate" :datetime="decision.dueDate" :class="{ 'studio-overdue': decision.dueDate < cockpit.today }">{{ portalDate(decision.dueDate) }}</time>
                <UIcon name="i-tabler-arrow-up-right" />
              </NuxtLink>
            </li>
          </ul>
        </section>
        <section class="studio-panel studio-queue" aria-labelledby="studio-queue-title">
          <header class="studio-section-heading">
            <h2 id="studio-queue-title">À suivre</h2>
            <label class="studio-check"><input v-model="showSnoozed" type="checkbox"> Demandes reportées ({{ snoozedCount }})</label>
          </header>
          <div class="studio-filters" aria-label="Filtrer les actions">
            <button type="button" :aria-pressed="category === 'all'" @click="category = 'all'">Tout <span>{{ focusedItems.length }}</span></button>
            <button v-for="key in studioCategories" :key="key" type="button" :aria-pressed="category === key" @click="category = key">
              {{ categories[key].label }} <span>{{ counts[key] }}</span>
            </button>
          </div>
          <p v-if="qualificationNotice" class="studio-notice" role="status">{{ qualificationNotice }}</p>
          <ul v-if="visibleItems.length" class="studio-list">
            <li v-for="item in visibleItems.slice(0, limit)" :key="`${item.category}:${item.id}`">
              <div class="studio-item-row">
                <span class="studio-item-icon"><UIcon :name="categories[item.category].icon" /></span>
                <NuxtLink class="studio-item-link" :to="adminLink(item.link)">
                  <strong>{{ item.title }}</strong>
                  <span>{{ itemContext(item) }} · {{ item.qualification?.classification ? classLabels[item.qualification.classification] : item.detail }}</span>
                </NuxtLink>
                <div class="studio-item-meta">
                  <strong v-if="item.snoozed && item.qualification?.snoozedUntil">Reprise le {{ portalDate(item.qualification.snoozedUntil) }}</strong>
                  <strong v-else-if="item.dueDate" :class="{ 'studio-overdue': item.dueDate < cockpit.today }">{{ portalDate(item.dueDate) }}</strong>
                  <span v-if="item.responsibleName">{{ item.responsibleName }}</span>
                  <span v-else-if="item.category === 'request'">Non assignée</span>
                </div>
                <button v-if="item.qualification" type="button" class="studio-button" :disabled="savingQualification" :aria-expanded="editedRequest?.id === item.id" @click="openQualification(item)">
                  {{ item.qualification.classification ? 'Modifier' : 'Qualifier' }}
                </button>
                <NuxtLink v-else class="studio-icon-link" :aria-label="`Ouvrir ${item.title}`" :to="adminLink(item.link)"><UIcon name="i-tabler-arrow-up-right" /></NuxtLink>
              </div>
              <form v-if="item.category === 'request' && editedRequest?.id === item.id" :ref="element => { qualifier = element as HTMLFormElement | undefined }" class="studio-qualification" @submit.prevent="saveQualification">
                <div class="studio-fields">
                  <label>Catégorie<select v-model="qualification.classification"><option :value="null">À qualifier</option><option v-for="code in studioClassifications" :key="code" :value="code">{{ classLabels[code] }}</option></select></label>
                  <label>Priorité<select v-model="qualification.priority"><option v-for="code in studioPriorities" :key="code" :value="code">{{ priorityLabels[code] }}</option></select></label>
                  <label>Responsable<select v-model="qualification.responsibleId"><option :value="null">Non assignée</option><option v-for="admin in cockpit.admins" :key="admin.id" :value="admin.id">{{ admin.name }}</option></select></label>
                  <label>Échéance<input v-model="qualification.dueDate" type="date"></label>
                  <label>Reporter au<input v-model="qualification.snoozedUntil" type="date" :min="tomorrow"></label>
                </div>
                <p v-if="qualificationError" class="studio-error" role="alert">{{ qualificationError }}</p>
                <div class="studio-actions">
                  <button type="button" class="studio-button" :disabled="savingQualification" @click="editedRequest = undefined">Annuler</button>
                  <button type="submit" class="studio-button studio-primary" :disabled="savingQualification">{{ savingQualification ? 'Enregistrement…' : 'Enregistrer' }}</button>
                </div>
              </form>
            </li>
          </ul>
          <p v-else class="studio-empty">Aucune action dans cette vue.</p>
          <button v-if="visibleItems.length > limit" type="button" class="studio-button studio-more" @click="limit += 12">Afficher plus</button>
        </section>
      </template>
    </template>

    <template v-else>
      <p v-if="templateLoading" role="status" class="studio-empty">Chargement des modèles…</p>
      <div v-if="templateLoadError" class="studio-inline">
        <p class="studio-error" role="alert">{{ templateLoadError }}</p>
        <button type="button" class="studio-button" @click="retryTemplateLoad">Réessayer</button>
      </div>

      <template v-if="view === 'onboarding' && templateState">
        <section v-if="result" class="studio-panel studio-result">
          <h2><UIcon name="i-tabler-circle-check" /> {{ plan?.name || 'Projet' }} est prêt</h2>
          <p>Le projet, sa roadmap et les demandes de fichiers sont disponibles. Vous pouvez maintenant inviter les membres du client.</p>
          <div class="studio-actions">
            <button type="button" class="studio-button" @click="resetOnboarding">Lancer un autre projet</button>
            <button type="button" class="studio-button" @click="emit('invite', result.organizationId)">Inviter l’équipe</button>
            <NuxtLink class="studio-button studio-primary" :to="adminLink({ clientId: result.organizationId, projectId: result.projectId, tab: 'roadmap' })">Ouvrir le projet <UIcon name="i-tabler-arrow-up-right" /></NuxtLink>
          </div>
        </section>
        <template v-else>
          <form class="studio-panel studio-onboarding" @submit.prevent="previewOnboarding">
            <h2>Configurer le projet</h2>
            <fieldset :disabled="!!onboardingBusy" class="studio-fields">
              <label>Client<select v-model="form.organizationId" required><option value="" disabled>Sélectionner un client</option><option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option></select></label>
              <label>Modèle<select v-model="form.template" required><option v-for="template in templateState.versions" :key="`${template.id}:${template.version}`" :value="`${template.id}:${template.version}`">{{ template.title }} · v{{ template.version }}</option></select></label>
              <label v-if="eligibleProjects.length">Projet<select v-model="form.existingProjectId"><option value="">Nouveau projet</option><option v-for="project in eligibleProjects" :key="project.id" :value="project.id">{{ project.name }}</option></select></label>
              <label v-if="!form.existingProjectId">Nom du projet<input v-model.trim="form.name" minlength="2" maxlength="160" required></label>
              <label>Date de démarrage<input v-model="form.startDate" type="date" required></label>
              <label v-if="!form.existingProjectId" class="studio-wide">Description<textarea v-model.trim="form.description" maxlength="1500" rows="3" /></label>
            </fieldset>
            <p v-if="!clients.length" class="studio-muted">Créez d’abord un client depuis la liste des clients.</p>
            <div class="studio-actions">
              <button type="submit" class="studio-button" :class="{ 'studio-primary': !plan }" :disabled="!!onboardingBusy || !clients.length">{{ onboardingBusy === 'preview' ? 'Préparation…' : 'Prévisualiser' }}</button>
            </div>
          </form>
          <p v-if="onboardingError" class="studio-error" role="alert">{{ onboardingError }}</p>
          <div v-if="linkedProject"><NuxtLink class="studio-button" :to="adminLink({ ...linkedProject, tab: 'roadmap' })">Consulter le projet <UIcon name="i-tabler-arrow-up-right" /></NuxtLink></div>
          <section v-if="plan" class="studio-panel">
            <header class="studio-section-heading">
              <div><h2>{{ plan.name }}</h2><p>{{ plan.organizationName }} · {{ plan.templateTitle }} v{{ plan.templateVersion }}</p></div>
              <p>Échéance du projet <strong>{{ portalDate(plan.dueDate) }}</strong></p>
            </header>
            <div class="studio-plan">
              <section>
                <h3>Roadmap</h3>
                <article v-for="(phase, index) in plan.phases" :key="index">
                  <div><strong>{{ phase.title }}</strong><span>{{ portalDate(phase.startDate) }} – {{ portalDate(phase.endDate) }}</span></div>
                  <p v-if="phase.description">{{ phase.description }}</p>
                  <ul><li v-for="(step, stepIndex) in phase.steps" :key="stepIndex"><span>{{ step.title }}<small>{{ stepLabels[step.kind] }}{{ step.requiresValidation ? ' · Validation requise' : '' }}</small><small v-if="step.description">{{ step.description }}</small></span><span>{{ portalDate(step.startDate) }} – {{ portalDate(step.endDate) }}</span></li></ul>
                </article>
              </section>
              <section>
                <h3>Fichiers à demander</h3>
                <p v-if="!plan.files.length" class="studio-muted">Aucune demande de fichier dans ce modèle.</p>
                <article v-for="(file, index) in plan.files" :key="index">
                  <div><strong>{{ file.title }}</strong><span>{{ portalDate(file.dueDate) }}</span></div>
                  <p v-if="file.description">{{ file.description }}</p>
                </article>
              </section>
            </div>
            <div class="studio-actions">
              <button type="button" class="studio-button studio-primary" :disabled="!!onboardingBusy" @click="launchOnboarding">{{ onboardingBusy === 'launch' ? 'Création…' : 'Créer le projet' }}</button>
            </div>
          </section>
        </template>
      </template>

      <template v-if="view === 'templates' && templateState">
        <div class="studio-template-picker" aria-label="Choisir un modèle">
          <button v-for="template in templateState.templates" :key="template.id" type="button" :aria-pressed="draftTemplate?.id === template.id" :disabled="publishing" @click="editTemplate(template)">
            <UIcon name="i-tabler-template" /> <strong>{{ template.definition.title }}</strong><span>v{{ template.version }}</span>
          </button>
        </div>
        <form v-if="draft && draftTemplate" class="studio-panel studio-editor" @submit.prevent="publishTemplate">
          <header class="studio-section-heading">
            <div><h2>Modifier le modèle</h2><p>Les jours sont calculés à partir du démarrage du projet. Jour 0 correspond à la date choisie.</p></div>
            <button type="button" class="studio-button" :disabled="publishing || templateLoading" @click="loadTemplates().then(() => { const latest = templateState?.templates.find(template => template.id === draftTemplate?.id); if (latest) editTemplate(latest) })">Recharger</button>
          </header>
          <fieldset :disabled="publishing">
            <label>Nom du modèle<input v-model.trim="draft.title" maxlength="100" required></label>
            <div class="studio-editor-section">
              <h3>Phases et étapes</h3>
              <article v-for="(phase, index) in draft.phases" :key="index" class="studio-editor-block">
                <div class="studio-editor-heading"><h4>Phase {{ index + 1 }}</h4><button type="button" class="studio-icon-link" :aria-label="`Supprimer la phase ${index + 1}`" :disabled="draft.phases.length === 1" @click="draft.phases.splice(index, 1)"><UIcon name="i-tabler-trash" /></button></div>
                <div class="studio-fields studio-offset-fields">
                  <label>Titre de la phase<input v-model.trim="phase.title" maxlength="160" required></label>
                  <label>Début (jour)<input v-model.number="phase.startDay" type="number" min="0" max="730" required></label>
                  <label>Fin (jour)<input v-model.number="phase.endDay" type="number" :min="phase.startDay" max="730" required></label>
                  <label class="studio-wide">Description<textarea v-model.trim="phase.description" maxlength="1000" rows="2" /></label>
                </div>
                <div v-for="(step, stepIndex) in phase.steps" :key="stepIndex" class="studio-editor-step">
                  <div class="studio-editor-heading"><h4>Étape {{ stepIndex + 1 }}</h4><button type="button" class="studio-icon-link" :aria-label="`Supprimer l’étape ${stepIndex + 1} de la phase ${index + 1}`" @click="phase.steps.splice(stepIndex, 1)"><UIcon name="i-tabler-trash" /></button></div>
                  <div class="studio-fields studio-offset-fields">
                    <label>Titre de l’étape<input v-model.trim="step.title" maxlength="160" required></label>
                    <label>Début (jour)<input v-model.number="step.startDay" type="number" :min="phase.startDay" :max="phase.endDay" required></label>
                    <label>Fin (jour)<input v-model.number="step.endDay" type="number" :min="step.startDay" :max="phase.endDay" required></label>
                    <label>Type<select v-model="step.kind"><option v-for="(label, value) in stepLabels" :key="value" :value="value">{{ label }}</option></select></label>
                    <label class="studio-check"><input v-model="step.requiresValidation" type="checkbox"> Validation requise</label>
                    <label class="studio-wide">Description<textarea v-model.trim="step.description" maxlength="1000" rows="2" /></label>
                  </div>
                </div>
                <button type="button" class="studio-button" :disabled="phase.steps.length >= 24 || draft.phases.reduce((sum, entry) => sum + entry.steps.length, 0) >= 60" @click="phase.steps.push({ title: '', description: '', startDay: phase.startDay, endDay: phase.endDay, kind: 'step', requiresValidation: false })"><UIcon name="i-tabler-plus" /> Ajouter une étape</button>
              </article>
              <button type="button" class="studio-button" :disabled="draft.phases.length >= 12" @click="addPhase"><UIcon name="i-tabler-plus" /> Ajouter une phase</button>
            </div>
            <div class="studio-editor-section">
              <h3>Demandes de fichiers</h3>
              <article v-for="(file, index) in draft.files" :key="index" class="studio-editor-block">
                <div class="studio-editor-heading"><h4>Fichier {{ index + 1 }}</h4><button type="button" class="studio-icon-link" :aria-label="`Supprimer le fichier ${index + 1}`" @click="draft.files.splice(index, 1)"><UIcon name="i-tabler-trash" /></button></div>
                <div class="studio-fields">
                  <label>Titre du fichier<input v-model.trim="file.title" maxlength="160" required></label>
                  <label>Échéance (jour)<input v-model.number="file.dueDay" type="number" min="0" max="730" required></label>
                  <label class="studio-wide">Consigne<textarea v-model.trim="file.description" maxlength="1000" rows="2" /></label>
                </div>
              </article>
              <button type="button" class="studio-button" :disabled="draft.files.length >= 24" @click="draft.files.push({ title: '', description: '', dueDay: 0 })"><UIcon name="i-tabler-plus" /> Ajouter une demande</button>
            </div>
          </fieldset>
          <p v-if="templateError" class="studio-error" role="alert">{{ templateError }}</p>
          <p v-if="templateNotice" class="studio-notice" role="status">{{ templateNotice }}</p>
          <div class="studio-actions"><button type="submit" class="studio-button studio-primary" :disabled="publishing">{{ publishing ? 'Publication…' : `Publier la version ${draftTemplate.version + 1}` }}</button></div>
        </form>
        <section v-if="draftTemplate" class="studio-panel studio-history">
          <h2>Versions publiées</h2>
          <div class="studio-actions">
            <button v-for="version in templateState.versions.filter(version => version.id === draftTemplate?.id)" :key="version.version" type="button" class="studio-button" :aria-pressed="history?.version === version.version" :disabled="readingVersion" @click="showVersion(version.version)">{{ version.title }} · v{{ version.version }}</button>
          </div>
          <div v-if="history" class="studio-version">
            <p>{{ history.definition.phases.length }} phase(s) · {{ history.definition.phases.reduce((sum, phase) => sum + phase.steps.length, 0) }} étape(s) · {{ history.definition.files.length }} fichier(s)</p>
            <ul><li v-for="(phase, index) in history.definition.phases" :key="index">{{ phase.title }}</li></ul>
            <button type="button" class="studio-button" @click="useVersion(history)">Utiliser cette version</button>
          </div>
        </section>
      </template>
    </template>
  </section>
</template>

<style scoped>
.studio { --studio-border: var(--portal-line); display: grid; gap: 22px; min-width: 0; font-size: 13px; }
.studio-header, .studio-section-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.studio h1 { margin: 0; font-size: clamp(25px, 4vw, 34px); font-weight: 650; letter-spacing: -.035em; line-height: 1.18; }
.studio h2 { margin: 0; font-size: 17px; font-weight: 620; line-height: 1.35; }
.studio h3 { margin: 0; font-size: 14px; font-weight: 600; }
.studio h4 { margin: 0; font-size: 12px; font-weight: 550; }
.studio-header p, .studio-section-heading p, .studio-result p { margin: 5px 0 0; color: var(--portal-muted); }
.studio-tabs, .studio-filters, .studio-actions, .studio-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.studio-tabs { padding-bottom: 10px; border-bottom: 1px solid var(--studio-border); }
.studio-button, .studio-tabs button, .studio-filters button, .studio-icon-link {
  display: inline-flex; justify-content: center; align-items: center; gap: 7px; min-height: 38px; padding: 7px 12px;
  border: 1px solid var(--studio-border); border-radius: 7px; background: var(--portal-control); color: var(--portal-text);
  font-size: 12px; font-weight: 530; text-align: center; text-decoration: none;
}
.studio-tabs button { border-color: transparent; color: var(--portal-muted); background: transparent; }
.studio-button:hover, .studio-tabs button:hover, .studio-filters button:hover, .studio-icon-link:hover { background: var(--portal-hover); }
.studio button[aria-current], .studio button[aria-pressed=true] { border-color: var(--portal-accent-deep); background: var(--portal-accent-soft); color: var(--portal-accent-text); }
.studio button:disabled { cursor: default; opacity: .55; }
.studio .studio-primary { background: var(--portal-accent); border-color: var(--portal-accent); color: var(--portal-accent-ink); }
.studio .studio-primary:hover { background: var(--portal-accent-hover); border-color: var(--portal-accent-hover); }
.studio-button .iconify, .studio-tabs .iconify, .studio-icon-link .iconify { width: 16px; height: 16px; flex: none; }
.studio-priorities { display: grid; gap: 12px; }
.studio-priority-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 205px), 1fr)); gap: 12px; }
.studio-priority {
  display: flex; flex-direction: column; gap: 6px; min-width: 0; padding: 17px; border: 1px solid var(--studio-border);
  border-radius: 9px; background: var(--portal-surface); color: var(--portal-text); text-decoration: none; overflow-wrap: anywhere;
}
.studio-priority:hover { border-color: var(--portal-accent-deep); }
.studio-category { display: flex; align-items: center; gap: 6px; color: var(--portal-accent-text); font-size: 11px; }
.studio-category .iconify { width: 16px; height: 16px; }
.studio-priority strong { margin-top: 2px; font-size: 15px; font-weight: 620; }
.studio-reason { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 12px; margin-top: auto; font-size: 12px; }
.studio-reason .iconify { flex: none; color: var(--portal-muted); }
.studio-muted, .studio-item-link > span, .studio-item-meta > span { color: var(--portal-muted); }
.studio-panel { min-width: 0; padding: clamp(15px, 2.1vw, 23px); border: 1px solid var(--studio-border); border-radius: 10px; background: var(--portal-surface); }
.studio-panel .studio-section-heading { align-items: flex-start; }
.studio-filters { margin: 16px 0 4px; }
.studio-filters button > span { color: var(--portal-muted); font-variant-numeric: tabular-nums; }
.studio-list, .studio-plan ul { list-style: none; margin: 0; padding: 0; }
.studio-list > li { border-bottom: 1px solid var(--studio-border); }
.studio-list > li:last-child { border-bottom: 0; }
.studio-decisions { margin-top: 7px; }
.studio-decisions a { display: flex; align-items: center; gap: 12px; padding: 10px 0; text-decoration: none; }
.studio-decisions .studio-item-link { flex: 1; }
.studio-decisions a:hover strong { text-decoration: underline; }
.studio-decisions time { font-size: 11px; }
.studio-decisions .iconify { flex: none; color: var(--portal-muted); }
.studio-item-row { display: grid; align-items: center; grid-template-columns: auto minmax(0, 1fr) minmax(0, auto) auto; gap: 12px; padding: 13px 0; }
.studio-item-icon { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 7px; background: var(--portal-raised); color: var(--portal-muted); }
.studio-item-icon .iconify { width: 18px; height: 18px; }
.studio-item-link { display: grid; gap: 3px; color: var(--portal-text); text-decoration: none; overflow-wrap: anywhere; }
.studio-item-link:hover > strong { text-decoration: underline; }
.studio-item-link > strong { font-size: 13px; font-weight: 600; }
.studio-item-link > span, .studio-item-meta { font-size: 11px; }
.studio-item-meta { display: grid; gap: 3px; max-width: 180px; text-align: right; overflow-wrap: anywhere; }
.studio-item-meta > strong { font-weight: 550; }
.studio-overdue { color: var(--portal-danger); }
.studio-icon-link { width: 38px; padding: 0; }
.studio-list .studio-item-row > button { min-width: 76px; }
.studio-empty { margin: 0; padding: 15px 0; color: var(--portal-muted); }
.studio-more { margin-top: 12px; }
.studio-check { display: flex !important; align-items: center; flex-direction: row; gap: 7px; font-size: 12px; }
.studio-check input { width: 16px; height: 16px; margin: 0; accent-color: var(--portal-focus); }
.studio-qualification, .studio-version {
  display: grid; gap: 12px; padding: 14px; margin-bottom: 12px; border: 1px solid var(--studio-border);
  border-radius: 8px; background: var(--portal-bg);
}
.studio-qualification .studio-fields { grid-template-columns: repeat(auto-fit, minmax(min(100%, 135px), 1fr)); }
.studio-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
.studio label:not(.studio-check) { display: grid; align-content: start; gap: 5px; min-width: 0; font-size: 12px; font-weight: 540; }
.studio fieldset { min-width: 0; padding: 0; margin: 0; border: 0; }
.studio .studio-wide { grid-column: 1 / -1; }
.studio label :is(input:not([type=checkbox]), select, textarea) {
  width: 100%; min-width: 0; min-height: 39px; padding: 8px 10px; border: 1px solid var(--studio-border); border-radius: 6px;
  background: var(--portal-control); color: var(--portal-text); font: inherit; font-size: 13px;
}
.studio textarea { resize: vertical; }
.studio-qualification .studio-actions, .studio-panel > .studio-actions { justify-content: flex-end; }
.studio-panel > .studio-actions { margin-top: 16px; }
.studio-onboarding > h2 { margin-bottom: 16px; }
.studio-onboarding > .studio-muted { margin: 13px 0 0; }
.studio-error, .studio-notice { margin: 0; padding: 10px 12px; border-radius: 7px; }
.studio-error { background: var(--portal-danger-soft); color: var(--portal-danger); }
.studio-notice { background: var(--portal-success-soft); color: var(--portal-success); }
.studio-panel > .studio-error, .studio-panel > .studio-notice { margin-top: 12px; }
.studio-result h2 { display: flex; align-items: center; gap: 8px; }
.studio-result .iconify { width: 18px; height: 18px; flex: none; }
.studio-result h2 .iconify { color: var(--portal-success); }
.studio-plan { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 20px; margin-top: 18px; }
.studio-plan section { display: grid; align-content: start; gap: 8px; min-width: 0; }
.studio-plan article { padding: 11px 12px; border: 1px solid var(--studio-border); border-radius: 7px; overflow-wrap: anywhere; }
.studio-plan article > div, .studio-plan li { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin: 0; }
.studio-plan strong { font-weight: 600; }
.studio-plan article > div > span, .studio-plan li > span:last-child { flex: none; max-width: 47%; color: var(--portal-muted); font-size: 11px; text-align: right; }
.studio-plan li { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--studio-border); font-size: 12px; }
.studio-plan small, .studio-plan article p { display: block; margin: 4px 0 0; color: var(--portal-muted); font-size: 11px; }
.studio-template-picker { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 164px), 1fr)); gap: 9px; }
.studio-template-picker button {
  display: flex; align-items: center; gap: 8px; min-width: 0; padding: 13px; border: 1px solid var(--studio-border);
  border-radius: 8px; background: var(--portal-surface); text-align: left; overflow-wrap: anywhere;
}
.studio-template-picker button > span { margin-left: auto; color: var(--portal-muted); font-size: 11px; white-space: nowrap; }
.studio-template-picker button .iconify { width: 16px; height: 16px; flex: none; }
.studio-template-picker button strong { font-weight: 580; }
.studio-editor > fieldset { margin-top: 16px; }
.studio-editor > fieldset > label { max-width: 420px; }
.studio-editor-section { display: grid; gap: 10px; margin-top: 20px; }
.studio-editor-section > button, .studio-editor-block > button, .studio-version > button { justify-self: start; }
.studio-editor-block, .studio-editor-step { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--studio-border); border-radius: 8px; }
.studio-editor-step { background: var(--portal-bg); }
.studio-editor-heading { display: flex; justify-content: space-between; align-items: center; gap: 9px; }
.studio-offset-fields { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr); }
.studio-offset-fields > .studio-check { align-self: end; min-height: 39px; }
.studio-history > .studio-actions { justify-content: flex-start; }
.studio-version { margin: 12px 0 0; }
.studio-version p, .studio-version ul { margin: 0; }
.studio-version ul { padding-left: 16px; }
@media (max-width: 760px) {
  .studio-plan { grid-template-columns: 1fr; }
  .studio-item-row { grid-template-columns: minmax(0, 1fr) minmax(0, auto) auto; gap: 8px; }
  .studio-item-icon { display: none; }
}
@media (max-width: 470px) {
  .studio-header, .studio-section-heading { align-items: flex-start; }
  .studio-queue .studio-section-heading { flex-direction: column; gap: 8px; }
  .studio-fields { grid-template-columns: minmax(0, 1fr); }
  .studio-offset-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .studio-offset-fields > label:first-child { grid-column: 1 / -1; }
  .studio-item-row { grid-template-columns: minmax(0, 1fr) auto; }
  .studio-item-meta { grid-row: 2; text-align: left; }
  .studio-item-row > :last-child { grid-column: 2; grid-row: 1 / 3; }
  .studio label :is(input:not([type=checkbox]), select, textarea) { font-size: 16px; }
}
</style>
