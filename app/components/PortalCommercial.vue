<script setup lang="ts">
interface Contact {
  id: string; name: string; company: string; email: string; phone: string; role: string; notes: string
  organizationId: string | null; organizationName: string | null; archivedAt: string | null
}
interface Opportunity {
  id: string; title: string; contactId: string | null; source: string; stage: Stage; amountCents: number
  probability: number | null; nextAction: string; nextActionDate: string; lostReason: string
  organizationId: string | null; projectId: string | null; convertedAt: string | null
}
interface Call {
  id: string; opportunityId: string; occurredOn: string; rawNotes: string; summary: string
  commitments: string; owners: string; unknowns: string; author: string | null
}
type DocumentKind = 'quote' | 'contract'
interface CommercialDocument { id: string; opportunityId: string; kind: DocumentKind }
interface Version {
  id: string; documentId: string; version: number; title: string; scope: string; exclusions: string
  schedule: string; amountCents: number; externalUrl: string; createdAt: string; author: string | null
  signer: string | null; signedOn: string | null; evidence: string | null; recordedAt: string | null; recordedBy: string | null
}
interface Invoice {
  id: string; projectId: string | null; projectName: string; organizationName: string
  reference: string; title: string; issuedOn: string; externalUrl: string
  totalCents: number; netCents: number; cancelledAt: string | null; cancellationReason: string
}
interface Installment {
  id: string; invoiceId: string; dueDate: string; amountCents: number; remainingCents: number
  receipts: number; refunds: number; entries: number
}
interface Entry {
  id: string; installmentId: string; source: 'manual' | 'webhook'; reference: string; kind: 'receipt' | 'refund' | 'failed'
  amountCents: number; occurredOn: string; note: string; recordedBy: string | null; recordedAt: string
}
interface Project {
  id: string; name: string; organizationName: string; estimatedMinutes: number | null; estimatedCents: number | null
}
interface Cost {
  id: string; projectId: string | null; projectName: string; label: string; occurredOn: string
  minutes: number; costCents: number; author: string | null
}
interface Snapshot {
  today: string; contacts: Contact[]; opportunities: Opportunity[]
  history: Array<{ id: string; opportunityId: string; kind: keyof typeof historyLabels; author: string | null; createdAt: string
    snapshot: Partial<Opportunity> & { message?: string; audience?: string; social?: string } }>
  calls: Call[]; documents: CommercialDocument[]; versions: Version[]
  organizations: Array<{ id: string; name: string }>; projects: Project[]
  invoices: Invoice[]; installments: Installment[]; entries: Entry[]; costs: Cost[]
  outstanding: Array<Installment & { title: string; reference: string; organizationName: string }>
  summary: { expectedCents: number; overdueCents: number; receipts: number; refunds: number }
}

const stageLabels = {
  network: 'Réseau', new: 'Nouveau', qualified: 'Qualifié', proposal: 'Proposition',
  negotiation: 'Négociation', won: 'Gagné', lost: 'Perdu'
}
type Stage = keyof typeof stageLabels
const historyLabels = { created: 'Création', updated: 'Modification', converted: 'Conversion en projet' }
const documentLabels = { quote: 'Devis', contract: 'Contrat' }
const entryLabels = { receipt: 'Encaissement', refund: 'Remboursement', failed: 'Paiement échoué' }
const tabs = { pipeline: 'Pipeline', contacts: 'Contacts', invoices: 'Factures et échéances', margins: 'Temps et marge' }
type Tab = keyof typeof tabs
type Editor = 'opportunity' | 'contact' | 'convert' | 'call' | 'version' | 'signature' | 'invoice' | 'cancelInvoice' | 'entry' | 'budget' | 'cost' | 'deleteCost'
type Decimal = number | string
const endpoint = '/api/portal/admin/commercial'
const emit = defineEmits<{ changed: [] }>()
const route = useRoute()
const localePath = useLocalePath()
const snapshot = ref<Snapshot>()
const tab = ref<Tab>('pipeline')
const editor = ref<Editor>()
const working = ref(false)
const loading = ref(false)
const error = ref('')
const feedback = ref('')
const query = ref('')
const stageFilter = ref<Stage | ''>('')
const showArchived = ref(false)
const activeOpportunityId = ref('')
const activeContactId = ref('')
const activeInvoiceId = ref('')
const activeProjectId = ref('')
const activeOpportunity = computed(() => snapshot.value?.opportunities.find(item => item.id === activeOpportunityId.value))
const activeContact = computed(() => snapshot.value?.contacts.find(item => item.id === activeContactId.value))
const activeInvoice = computed(() => snapshot.value?.invoices.find(item => item.id === activeInvoiceId.value))
const activeProject = computed(() => snapshot.value?.projects.find(item => item.id === activeProjectId.value))
const activeInstallments = computed(() => snapshot.value?.installments.filter(item => item.invoiceId === activeInvoiceId.value) || [])
const invoiceLocked = computed(() => activeInstallments.value.some(item => item.entries > 0))
const isLockedInvoiceEdit = computed(() => Boolean(invoiceForm.id) && invoiceLocked.value)
const activeCalls = computed(() => snapshot.value?.calls.filter(item => item.opportunityId === activeOpportunityId.value) || [])
const activeDocuments = computed(() => snapshot.value?.documents.filter(item => item.opportunityId === activeOpportunityId.value) || [])
const activeHistory = computed(() => snapshot.value?.history.filter(item => item.opportunityId === activeOpportunityId.value) || [])
const activeCosts = computed(() => snapshot.value?.costs.filter(item => item.projectId === activeProjectId.value) || [])
const costTotal = computed(() => activeCosts.value.reduce((sum, item) => sum + item.costCents, 0))
const minutesTotal = computed(() => activeCosts.value.reduce((sum, item) => sum + item.minutes, 0))
const orphanCosts = computed(() => snapshot.value?.costs.filter(item => !item.projectId) || [])
const billedInvoices = computed(() => snapshot.value?.invoices.filter(item => item.projectId === activeProjectId.value && !item.cancelledAt) || [])
const billed = computed(() => billedInvoices.value.reduce((sum, item) => sum + item.netCents, 0))
const margin = computed(() => billedInvoices.value.length && activeCosts.value.length ? billed.value - costTotal.value : null)
const estimatedMargin = computed(() => billedInvoices.value.length && activeProject.value?.estimatedCents != null ? billed.value - activeProject.value.estimatedCents : null)
const contactById = computed(() => new Map(snapshot.value?.contacts.map(contact => [contact.id, contact])))
const activeOpportunityContact = computed(() => contactById.value.get(activeOpportunity.value?.contactId || ''))
const formatMoney = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const formatDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Europe/Paris' })
const formatTimestamp = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' })
const money = (value: number) => formatMoney.format(value / 100)
const when = (value: string) => formatDate.format(new Date(value))
const timestamp = (value: string) => formatTimestamp.format(new Date(value))
const euros = (value: number) => value / 100
const asCents = (value: Decimal) => value === '' ? undefined : Math.round(Number(value) * 100)
const minutes = (value: number) => `${Math.floor(value / 60)} h ${String(value % 60).padStart(2, '0')}`
const matches = (...fields: Array<string | null | undefined>) => {
  const needle = query.value.trim().toLocaleLowerCase('fr')
  return !needle || fields.some(value => value?.toLocaleLowerCase('fr').includes(needle))
}
const opportunities = computed(() => snapshot.value?.opportunities.filter(item => (!stageFilter.value || item.stage === stageFilter.value) &&
  matches(item.title, item.source, contactById.value.get(item.contactId || '')?.name, contactById.value.get(item.contactId || '')?.company)) || [])
const contacts = computed(() => snapshot.value?.contacts.filter(item => Boolean(item.archivedAt) === showArchived.value &&
  matches(item.name, item.company, item.email, item.organizationName)) || [])
const invoices = computed(() => snapshot.value?.invoices.filter(item => matches(item.title, item.reference, item.organizationName, item.projectName)) || [])

const contactForm = reactive({ id: '', organizationId: '', name: '', company: '', email: '', phone: '', role: '', notes: '' })
const opportunityForm = reactive({ id: '', title: '', contactId: '', source: '', stage: 'new' as Stage, amount: 0 as Decimal,
  probability: '' as Decimal, nextAction: '', nextActionDate: '', lostReason: '' })
const convertForm = reactive({ organizationId: '', organizationName: '', projectName: '', description: '', dueDate: '' })
const callForm = reactive({ id: '', occurredOn: '', rawNotes: '', summary: '', commitments: '', owners: '', unknowns: '' })
const versionForm = reactive({ documentId: '', kind: 'quote' as DocumentKind, title: '', scope: '', exclusions: '', schedule: '', amount: 0 as Decimal, externalUrl: '' })
const signatureForm = reactive({ versionId: '', title: '', version: 0, signer: '', signedOn: '', evidence: '' })
interface InstallmentForm { key: number; dueDate: string; amount: Decimal }
let nextTermKey = 0
const invoiceForm = reactive({ id: '', projectId: '', reference: '', title: '', issuedOn: '', externalUrl: '', total: '' as Decimal,
  net: '' as Decimal, installments: [] as InstallmentForm[] })
const entryForm = reactive({ installmentId: '', reference: '', kind: 'receipt' as Entry['kind'], occurredOn: '', amount: '' as Decimal, note: '' })
const cancellationReason = ref('')
const budgetForm = reactive({ estimatedMinutes: 0 as Decimal, estimatedCost: 0 as Decimal })
const costForm = reactive({ id: '', label: '', occurredOn: '', minutes: 0 as Decimal, cost: 0 as Decimal })
const costToDelete = ref<Cost>()

function clearEditor() {
  editor.value = undefined
  error.value = ''
}
function changeTab(value: Tab) {
  tab.value = value
  query.value = ''
  feedback.value = ''
  clearEditor()
}
function chooseOpportunity(id: string) {
  clearEditor()
  activeOpportunityId.value = id
}
function chooseContact(id: string) {
  clearEditor()
  activeContactId.value = id
}
function chooseInvoice(id: string) {
  clearEditor()
  activeInvoiceId.value = id
}
function chooseProject() {
  clearEditor()
}
function edit(kind: Editor) {
  editor.value = kind
  error.value = ''
  feedback.value = ''
  nextTick(() => {
    const panel = document.getElementById('commercial-editor')
    panel?.scrollIntoView({ block: 'nearest' })
    panel?.focus({ preventScroll: true })
  })
}
function errorMessage(cause: unknown) {
  const failure = cause as { data?: { data?: { message?: string }; statusMessage?: string } }
  return failure?.data?.data?.message || failure?.data?.statusMessage || 'L’opération a échoué. Réessayez.'
}

async function refresh() {
  if (loading.value) return false
  loading.value = true
  try {
    snapshot.value = await $fetch<Snapshot>(endpoint)
    if (!activeProject.value) activeProjectId.value = snapshot.value.projects[0]?.id || ''
    return true
  } catch (cause) {
    error.value = errorMessage(cause)
    return false
  } finally {
    loading.value = false
  }
}

async function save(action: string, fields: object, onSuccess?: (id: string) => void) {
  if (working.value) return
  working.value = true
  error.value = ''
  feedback.value = ''
  try {
    const result = await $fetch<{ id: string; duplicate?: boolean }>(endpoint, { method: 'POST', body: { action, ...fields } })
    clearEditor()
    const refreshed = await refresh()
    onSuccess?.(result.id)
    feedback.value = refreshed
      ? result.duplicate ? 'Ce mouvement est déjà enregistré.' : 'Enregistré.'
      : 'Modification enregistrée. Actualisez la vue pour voir les données à jour.'
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    working.value = false
  }
}

const onboardingLink = (id: string) => ({ path: localePath('/portal/admin'), query: { tab: 'today', onboardingProjectId: id } })
const projectLink = (organizationId: string, projectId: string) => ({
  path: localePath('/portal/admin'), query: { tab: 'roadmap', clientId: organizationId, projectId }
})

watch(() => route.query.invoiceId, value => {
  if (typeof value === 'string' && value) {
    changeTab('invoices')
    chooseInvoice(value)
  }
}, { immediate: true })
watch(() => route.query.opportunityId, value => {
  if (typeof value === 'string' && value) {
    changeTab('pipeline')
    chooseOpportunity(value)
  }
}, { immediate: true })

function editContact(item?: Contact) {
  Object.assign(contactForm, { id: item?.id || '', organizationId: item?.organizationId || '', name: item?.name || '',
    company: item?.company || '', email: item?.email || '', phone: item?.phone || '', role: item?.role || '', notes: item?.notes || '' })
  edit('contact')
}

function editOpportunity(item?: Opportunity) {
  Object.assign(opportunityForm, { id: item?.id || '', title: item?.title || '', contactId: item?.contactId || '', source: item?.source || '',
    stage: item?.stage || 'new', amount: euros(item?.amountCents || 0), probability: item?.probability ?? '',
    nextAction: item?.nextAction || '', nextActionDate: item?.nextActionDate || '', lostReason: item?.lostReason || '' })
  edit('opportunity')
}
function startConvert(item: Opportunity) {
  Object.assign(convertForm, { organizationId: activeOpportunityContact.value?.organizationId || '',
    organizationName: activeOpportunityContact.value?.company || '', projectName: item.title, description: '', dueDate: '' })
  edit('convert')
}
function editCall(item?: Call) {
  Object.assign(callForm, { id: item?.id || '', occurredOn: item?.occurredOn || snapshot.value?.today || '', rawNotes: item?.rawNotes || '',
    summary: item?.summary || '', commitments: item?.commitments || '', owners: item?.owners || '', unknowns: item?.unknowns || '' })
  edit('call')
}
function prepareDraft() {
  const sections = { summary: [] as string[], commitments: [] as string[], owners: [] as string[], unknowns: [] as string[] }
  const labels = {
    résumé: 'summary', synthèse: 'summary', contexte: 'summary',
    engagement: 'commitments', engagements: 'commitments', action: 'commitments', actions: 'commitments',
    responsable: 'owners', responsables: 'owners',
    question: 'unknowns', questions: 'unknowns', inconnues: 'unknowns', 'points à clarifier': 'unknowns'
  } as const
  let section: keyof typeof sections = 'summary'
  for (const line of callForm.rawNotes.split(/\r?\n/)) {
    const heading = /^\s*(?:#+\s*)?([^:]+?)\s*(?::\s*(.*))?$/.exec(line)
    const key = heading?.[1]?.trim().toLocaleLowerCase('fr') as keyof typeof labels | undefined
    if (heading && key && Object.hasOwn(labels, key)) {
      section = labels[key]
      if (heading[2]) sections[section].push(heading[2])
    } else {
      sections[section].push(line)
    }
  }
  for (const key of Object.keys(sections) as Array<keyof typeof sections>) {
    const draft = sections[key].join('\n').trim()
    if (!callForm[key] && draft) callForm[key] = draft.slice(0, key === 'summary' ? 12000 : 6000)
  }
}
const versionsOf = (id: string) => snapshot.value?.versions.filter(item => item.documentId === id) || []
function editVersion(kind: DocumentKind, item?: CommercialDocument) {
  const version = item && versionsOf(item.id)[0]
  Object.assign(versionForm, { documentId: item?.id || '', kind, title: version?.title || '', scope: version?.scope || '',
    exclusions: version?.exclusions || '', schedule: version?.schedule || '',
    amount: euros(version?.amountCents ?? activeOpportunity.value?.amountCents ?? 0), externalUrl: version?.externalUrl || '' })
  edit('version')
}
function startSignature(item: Version) {
  Object.assign(signatureForm, { versionId: item.id, title: item.title, version: item.version,
    signer: '', signedOn: snapshot.value?.today || '', evidence: '' })
  edit('signature')
}
function addTerm(dueDate = '', amount: Decimal = '') {
  invoiceForm.installments.push({ key: ++nextTermKey, dueDate, amount })
}
function editInvoice(item?: Invoice) {
  Object.assign(invoiceForm, { id: item?.id || '', projectId: item?.projectId || '', reference: item?.reference || '',
    title: item?.title || '', issuedOn: item?.issuedOn || snapshot.value?.today || '', externalUrl: item?.externalUrl || '',
    total: item ? euros(item.totalCents) : '', net: item ? euros(item.netCents) : '', installments: [] })
  if (item) activeInstallments.value.forEach(term => addTerm(term.dueDate, euros(term.amountCents)))
  else addTerm()
  edit('invoice')
}
function saveInvoice() {
  if (isLockedInvoiceEdit.value) {
    void save('saveInvoice', { id: invoiceForm.id, title: invoiceForm.title, externalUrl: invoiceForm.externalUrl })
    return
  }
  const { total, net, installments, ...fields } = invoiceForm
  void save('saveInvoice', { ...fields, totalCents: asCents(total), netCents: asCents(net),
    installments: installments.map(term => ({ dueDate: term.dueDate, amountCents: asCents(term.amount) })) }, id => { activeInvoiceId.value = id })
}
function startEntry(item: Installment, kind: Entry['kind']) {
  Object.assign(entryForm, { installmentId: item.id, kind, reference: '', occurredOn: snapshot.value?.today || '',
    amount: euros(kind === 'refund' ? item.receipts - item.refunds : item.remainingCents), note: '' })
  edit('entry')
}
function startCancelInvoice() {
  cancellationReason.value = ''
  edit('cancelInvoice')
}
function editBudget(item: Project) {
  Object.assign(budgetForm, { estimatedMinutes: item.estimatedMinutes ?? 0, estimatedCost: euros(item.estimatedCents ?? 0) })
  edit('budget')
}
function editCost(item?: Cost) {
  Object.assign(costForm, { id: item?.id || '', label: item?.label || '', occurredOn: item?.occurredOn || snapshot.value?.today || '',
    minutes: item?.minutes || 0, cost: euros(item?.costCents || 0) })
  edit('cost')
}
function startDeleteCost(item: Cost) {
  costToDelete.value = item
  edit('deleteCost')
}
const entriesOf = (id: string) => snapshot.value?.entries.filter(item => item.installmentId === id) || []

onMounted(refresh)
</script>

<template>
  <section class="commercial" aria-labelledby="commercial-title" :aria-busy="loading || working">
    <header class="heading">
      <h1 id="commercial-title">CRM et finances</h1>
      <button type="button" class="quiet-button" :disabled="loading || working" @click="refresh">
        <UIcon name="i-tabler-refresh" aria-hidden="true" /> Actualiser
      </button>
    </header>
    <nav class="commercial-tabs" aria-label="Rubriques du CRM">
      <button v-for="(label, item) in tabs" :key="item" type="button" :disabled="working"
        :aria-current="tab === item ? 'page' : undefined" @click="changeTab(item)">{{ label }}</button>
    </nav>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <p v-if="feedback" class="notice success" role="status">{{ feedback }}</p>
    <p v-if="!snapshot && loading" class="muted" role="status">Chargement des données commerciales…</p>

    <section v-if="editor && snapshot" id="commercial-editor" class="panel editor" tabindex="-1" aria-label="Formulaire commercial">
      <form v-if="editor === 'contact'" @submit.prevent="save('saveContact', contactForm, id => { activeContactId = id })">
        <h2>{{ contactForm.id ? 'Modifier le contact' : 'Nouveau contact' }}</h2>
        <fieldset :disabled="working" class="fields">
          <label>Nom <input v-model="contactForm.name" required maxlength="150" /></label>
          <label>Entreprise <input v-model="contactForm.company" maxlength="150" /></label>
          <label>Courriel <input v-model="contactForm.email" type="email" maxlength="254" /></label>
          <label>Téléphone <input v-model="contactForm.phone" type="tel" maxlength="80" /></label>
          <label>Fonction <input v-model="contactForm.role" maxlength="120" placeholder="Direction, comptabilité…" /></label>
          <label>Organisation du portail
            <select v-model="contactForm.organizationId">
              <option value="">Sans organisation</option>
              <option v-for="item in snapshot.organizations" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label class="wide">Notes privées <textarea v-model="contactForm.notes" maxlength="6000" rows="3" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Enregistrer</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'opportunity'"
        @submit.prevent="save('saveOpportunity', { ...opportunityForm, amountCents: asCents(opportunityForm.amount), probability: opportunityForm.probability === '' ? null : Number(opportunityForm.probability) },
          id => { activeOpportunityId = id; stageFilter = ''; query = '' })">
        <h2>{{ opportunityForm.id ? 'Modifier l’opportunité' : 'Nouvelle opportunité' }}</h2>
        <fieldset :disabled="working" class="fields">
          <label>Titre <input v-model="opportunityForm.title" required maxlength="160" /></label>
          <label>Contact
            <select v-model="opportunityForm.contactId">
              <option value="">Sans contact</option>
              <option v-for="item in snapshot.contacts.filter(contact => !contact.archivedAt || contact.id === opportunityForm.contactId)"
                :key="item.id" :value="item.id">{{ item.name }}{{ item.company ? ' · ' + item.company : '' }}{{ item.archivedAt ? ' (archivé)' : '' }}</option>
            </select>
          </label>
          <label>Provenance <input v-model="opportunityForm.source" required maxlength="200" placeholder="Recommandation, formulaire du site…" /></label>
          <label>Étape
            <select v-model="opportunityForm.stage" :disabled="Boolean(opportunityForm.id && activeOpportunity?.convertedAt)">
              <option v-for="(label, item) in stageLabels" :key="item" :value="item">{{ label }}</option>
            </select>
          </label>
          <label>Montant HT (€) <input v-model="opportunityForm.amount" type="number" required min="0" max="20000000" step="0.01" /></label>
          <label>Probabilité (%) <input v-model="opportunityForm.probability" type="number" min="0" max="100" step="1" /></label>
          <label>Prochaine action <input v-model="opportunityForm.nextAction" maxlength="500" :required="Boolean(opportunityForm.nextActionDate)" /></label>
          <label>Date de relance <input v-model="opportunityForm.nextActionDate" type="date" /></label>
          <label v-if="opportunityForm.stage === 'lost'" class="wide">Motif de perte <textarea v-model="opportunityForm.lostReason" required maxlength="500" rows="2" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Enregistrer</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'convert' && activeOpportunity" @submit.prevent="save('convertOpportunity', { id: activeOpportunity.id, ...convertForm }, () => emit('changed'))">
        <h2>Créer le projet</h2>
        <p class="muted">Cette conversion crée un projet pour {{ activeOpportunity.title }}. L’accès au portail se gère ensuite dans la fiche du projet.</p>
        <fieldset :disabled="working" class="fields">
          <label>Organisation du portail
            <select v-model="convertForm.organizationId">
              <option value="">Créer une organisation</option>
              <option v-for="item in snapshot.organizations" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label v-if="!convertForm.organizationId">Nom de l’organisation <input v-model="convertForm.organizationName" required maxlength="120" /></label>
          <label>Nom du projet <input v-model="convertForm.projectName" required maxlength="160" /></label>
          <label>Échéance du projet <input v-model="convertForm.dueDate" type="date" /></label>
          <label class="wide">Description <textarea v-model="convertForm.description" maxlength="1500" rows="3" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Créer le projet</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'call' && activeOpportunity" @submit.prevent="save('saveCall', { opportunityId: activeOpportunity.id, ...callForm })">
        <h2>{{ callForm.id ? 'Modifier le compte rendu' : 'Compte rendu d’appel' }}</h2>
        <fieldset :disabled="working" class="fields">
          <label>Date de l’appel <input v-model="callForm.occurredOn" type="date" required :max="snapshot.today" /></label>
          <label class="wide">Notes sources <textarea v-model="callForm.rawNotes" maxlength="24000" rows="4" /></label>
          <div class="wide draft-action">
            <button type="button" class="quiet-button" :disabled="!callForm.rawNotes.trim()" @click="prepareDraft">Préparer un brouillon</button>
            <p class="muted">Reprend le texte fourni et les rubriques « Engagements », « Responsables » et « Questions » lorsqu’elles figurent dans les notes. Relisez le brouillon avant de l’enregistrer.</p>
          </div>
          <label class="wide">Synthèse <textarea v-model="callForm.summary" required maxlength="12000" rows="4" /></label>
          <label>Engagements <textarea v-model="callForm.commitments" maxlength="6000" rows="3" /></label>
          <label>Responsables <textarea v-model="callForm.owners" maxlength="6000" rows="3" /></label>
          <label class="wide">Questions et points à clarifier <textarea v-model="callForm.unknowns" maxlength="6000" rows="3" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Enregistrer</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'version' && activeOpportunity"
        @submit.prevent="save('saveDocumentVersion', { opportunityId: activeOpportunity.id, ...versionForm, amountCents: asCents(versionForm.amount) })">
        <h2>{{ versionForm.documentId ? 'Nouvelle version · ' : '' }}{{ documentLabels[versionForm.kind] }}</h2>
        <fieldset :disabled="working" class="fields">
          <label>Titre <input v-model="versionForm.title" required maxlength="160" /></label>
          <label>Montant HT (€) <input v-model="versionForm.amount" type="number" required min="0" max="20000000" step="0.01" /></label>
          <label class="wide">Périmètre <textarea v-model="versionForm.scope" required maxlength="10000" rows="3" /></label>
          <label class="wide">Exclusions <textarea v-model="versionForm.exclusions" required maxlength="10000" rows="3" placeholder="Indiquez « Aucune » si nécessaire" /></label>
          <label class="wide">Échéancier <textarea v-model="versionForm.schedule" required maxlength="10000" rows="3" /></label>
          <label class="wide">Lien HTTPS du document <input v-model="versionForm.externalUrl" type="url" maxlength="2000" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Enregistrer la version</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'signature'" @submit.prevent="save('recordSignature', signatureForm)">
        <h2>Confirmer une signature externe</h2>
        <p class="muted">{{ signatureForm.title }} · Version {{ signatureForm.version }}. Vérifiez la preuve de signature avant de confirmer.</p>
        <fieldset :disabled="working" class="fields">
          <label>Nom du signataire <input v-model="signatureForm.signer" required maxlength="160" /></label>
          <label>Date de signature <input v-model="signatureForm.signedOn" type="date" required :max="snapshot.today" /></label>
          <label class="wide">Référence de la preuve <textarea v-model="signatureForm.evidence" required maxlength="3000" rows="3" placeholder="Emplacement du document signé ou identifiant du dossier" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Confirmer manuellement</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'invoice'" @submit.prevent="saveInvoice">
        <h2>{{ invoiceForm.id ? 'Modifier la facture' : 'Référencer une facture' }}</h2>
        <fieldset :disabled="working" class="fields">
          <label>Titre <input v-model="invoiceForm.title" required maxlength="160" /></label>
          <label>Lien HTTPS de la facture <input v-model="invoiceForm.externalUrl" type="url" maxlength="2000" /></label>
          <template v-if="!isLockedInvoiceEdit">
            <label>Projet
              <select v-model="invoiceForm.projectId" required>
                <option value="">Sélectionner un projet</option>
                <option v-for="item in snapshot.projects" :key="item.id" :value="item.id">{{ item.organizationName }} · {{ item.name }}</option>
              </select>
            </label>
            <label>Référence <input v-model="invoiceForm.reference" required :readonly="Boolean(invoiceForm.id)" maxlength="100" /></label>
            <label>Date d’émission <input v-model="invoiceForm.issuedOn" type="date" :max="snapshot.today" required /></label>
            <label>Total TTC (€) <input v-model="invoiceForm.total" type="number" required min="0.01" max="20000000" step="0.01" /></label>
            <label>Total HT (€) <input v-model="invoiceForm.net" type="number" required min="0" :max="Number(invoiceForm.total) || 20000000" step="0.01" /></label>
            <div class="wide terms">
              <h3>Échéancier</h3>
              <div v-for="(term, index) in invoiceForm.installments" :key="term.key" class="term-row">
                <label>Date de l’échéance {{ index + 1 }} <input v-model="term.dueDate" type="date" required :min="invoiceForm.issuedOn" /></label>
                <label>Montant TTC (€) <input v-model="term.amount" type="number" min="0.01" max="20000000" step="0.01" required /></label>
                <button type="button" class="quiet-button" :disabled="invoiceForm.installments.length < 2"
                  :aria-label="'Retirer l’échéance ' + (index + 1)" @click="invoiceForm.installments.splice(index, 1)">Retirer</button>
              </div>
              <button type="button" class="quiet-button" :disabled="invoiceForm.installments.length >= 36" @click="addTerm()">Ajouter une échéance</button>
              <p class="muted">Total saisi {{ money(invoiceForm.installments.reduce((sum, term) => sum + (asCents(term.amount) || 0), 0)) }} TTC.</p>
            </div>
          </template>
          <p v-else class="wide muted">Les montants et échéances sont figés depuis la première écriture.</p>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Enregistrer</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'cancelInvoice' && activeInvoice" @submit.prevent="save('cancelInvoice', { id: activeInvoice.id, reason: cancellationReason })">
        <h2>Annuler la facture {{ activeInvoice.reference }}</h2>
        <fieldset :disabled="working" class="fields">
          <label class="wide">Motif d’annulation <textarea v-model="cancellationReason" required maxlength="500" rows="3" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-danger" :disabled="working">Confirmer l’annulation</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'entry'" @submit.prevent="save('recordEntry', { ...entryForm, amountCents: asCents(entryForm.amount) })">
        <h2>{{ { receipt: 'Confirmer un encaissement', refund: 'Déclarer un remboursement', failed: 'Noter un paiement échoué' }[entryForm.kind] }}</h2>
        <p class="muted">Vérifiez le relevé ou le justificatif et indiquez sa référence pour éviter les doublons.</p>
        <fieldset :disabled="working" class="fields">
          <label>Référence du mouvement <input v-model="entryForm.reference" required maxlength="180" /></label>
          <label>Date du mouvement <input v-model="entryForm.occurredOn" type="date" :max="snapshot.today" required /></label>
          <label>Montant TTC (€) <input v-model="entryForm.amount" type="number" required min="0.01" max="20000000" step="0.01" /></label>
          <label class="wide">Note de rapprochement <textarea v-model="entryForm.note" maxlength="2000" rows="3" /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Inscrire au journal</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'budget' && activeProject"
        @submit.prevent="save('saveBudget', { projectId: activeProject.id, estimatedMinutes: Number(budgetForm.estimatedMinutes), estimatedCents: asCents(budgetForm.estimatedCost) })">
        <h2>Estimation · {{ activeProject.name }}</h2>
        <fieldset :disabled="working" class="fields">
          <label>Temps estimé (minutes) <input v-model="budgetForm.estimatedMinutes" type="number" min="0" max="60000000" step="1" required /></label>
          <label>Coûts estimés HT (€) <input v-model="budgetForm.estimatedCost" type="number" min="0" max="20000000" step="0.01" required /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Enregistrer</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'cost' && activeProject"
        @submit.prevent="save('saveCost', { ...costForm, projectId: activeProject.id, minutes: Number(costForm.minutes), costCents: asCents(costForm.cost) })">
        <h2>{{ costForm.id ? 'Modifier la saisie' : 'Saisir le temps ou le coût réel' }}</h2>
        <fieldset :disabled="working" class="fields">
          <label>Libellé <input v-model="costForm.label" required maxlength="160" /></label>
          <label>Date <input v-model="costForm.occurredOn" type="date" :max="snapshot.today" required /></label>
          <label>Temps réel (minutes) <input v-model="costForm.minutes" type="number" min="0" max="60000000" step="1" required /></label>
          <label>Coût réel HT (€) <input v-model="costForm.cost" type="number" min="0" max="20000000" step="0.01" required /></label>
        </fieldset>
        <div class="form-actions"><button class="portal-primary" :disabled="working">Enregistrer</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>

      <form v-else-if="editor === 'deleteCost' && costToDelete" @submit.prevent="save('removeCost', { id: costToDelete.id })">
        <h2>Supprimer « {{ costToDelete.label }} » ?</h2>
        <div class="form-actions"><button class="portal-danger" :disabled="working">Supprimer la saisie</button><button type="button" class="quiet-button" :disabled="working" @click="clearEditor">Fermer</button></div>
      </form>
    </section>

    <template v-if="snapshot">
      <section v-if="tab === 'pipeline'" aria-label="Pipeline commercial">
        <div class="list-controls">
          <label>Rechercher <input v-model="query" type="search" placeholder="Opportunité, contact, provenance" /></label>
          <label>Étape
            <select v-model="stageFilter">
              <option value="">Toutes les étapes</option>
              <option v-for="(label, item) in stageLabels" :key="item" :value="item">{{ label }}</option>
            </select>
          </label>
          <button type="button" class="portal-primary" :disabled="working" @click="editOpportunity()">Nouvelle opportunité</button>
        </div>

        <div class="workspace">
          <div class="list panel" aria-label="Opportunités">
            <p v-if="!opportunities.length" class="muted list-empty">Aucune opportunité à afficher.</p>
            <button v-for="item in opportunities" :key="item.id" type="button" :disabled="working"
              :aria-current="item.id === activeOpportunityId ? 'true' : undefined" @click="chooseOpportunity(item.id)">
              <strong>{{ item.title }}</strong>
              <span><span class="badge" :class="{ success: item.stage === 'won' }">{{ stageLabels[item.stage] }}</span> {{ money(item.amountCents) }} HT</span>
              <span v-if="item.nextActionDate && !['won', 'lost'].includes(item.stage)" class="due" :class="{ overdue: item.nextActionDate < snapshot.today }">
                {{ when(item.nextActionDate) }} · {{ item.nextAction }}
              </span>
            </button>
          </div>

          <div v-if="activeOpportunity" class="detail">
            <section class="panel">
              <header class="heading">
                <div>
                  <h2>{{ activeOpportunity.title }}</h2>
                  <p>{{ stageLabels[activeOpportunity.stage] }} · {{ money(activeOpportunity.amountCents) }} HT</p>
                </div>
                <button type="button" class="quiet-button" :disabled="working" @click="editOpportunity(activeOpportunity)">Modifier</button>
              </header>
              <dl class="facts">
                <div><dt>Provenance</dt><dd>{{ activeOpportunity.source }}</dd></div>
                <div><dt>Contact</dt><dd>{{ activeOpportunityContact?.name || '—' }}</dd></div>
                <div v-if="activeOpportunity.probability != null"><dt>Probabilité</dt><dd>{{ activeOpportunity.probability }} %</dd></div>
                <div v-if="activeOpportunity.nextAction"><dt>Prochaine action</dt><dd>{{ activeOpportunity.nextAction }}<span v-if="activeOpportunity.nextActionDate"> · {{ when(activeOpportunity.nextActionDate) }}</span></dd></div>
                <div v-if="activeOpportunity.lostReason"><dt>Motif de perte</dt><dd>{{ activeOpportunity.lostReason }}</dd></div>
              </dl>
              <div v-if="activeOpportunity.stage === 'won'" class="action-row">
                <template v-if="activeOpportunity.projectId && activeOpportunity.organizationId">
                  <NuxtLink class="inline-link" :to="projectLink(activeOpportunity.organizationId, activeOpportunity.projectId)">Ouvrir le projet</NuxtLink>
                  <NuxtLink class="inline-link" :to="onboardingLink(activeOpportunity.projectId)">Préparer l’onboarding</NuxtLink>
                </template>
                <p v-else-if="activeOpportunity.convertedAt" class="muted">Le projet issu de cette conversion a été supprimé.</p>
                <button v-else type="button" class="portal-primary" :disabled="working" @click="startConvert(activeOpportunity)">Créer le projet</button>
              </div>
            </section>

            <section class="panel">
              <header class="heading">
                <h3>Appels</h3>
                <button type="button" class="quiet-button" :disabled="working" @click="editCall()">Ajouter un compte rendu</button>
              </header>
              <p v-if="!activeCalls.length" class="muted">Aucun compte rendu.</p>
              <article v-for="item in activeCalls" :key="item.id" class="subitem">
                <header class="heading">
                  <p><strong>{{ when(item.occurredOn) }}</strong><span v-if="item.author"> · {{ item.author }}</span></p>
                  <button type="button" class="quiet-button" :disabled="working" @click="editCall(item)">Modifier</button>
                </header>
                <p class="pre">{{ item.summary }}</p>
                <dl v-if="item.commitments || item.owners || item.unknowns" class="facts">
                  <div v-if="item.commitments"><dt>Engagements</dt><dd class="pre">{{ item.commitments }}</dd></div>
                  <div v-if="item.owners"><dt>Responsables</dt><dd class="pre">{{ item.owners }}</dd></div>
                  <div v-if="item.unknowns"><dt>Questions</dt><dd class="pre">{{ item.unknowns }}</dd></div>
                </dl>
                <details v-if="item.rawNotes"><summary>Notes sources</summary><p class="pre">{{ item.rawNotes }}</p></details>
              </article>
            </section>

            <section class="panel">
              <header class="heading">
                <h3>Devis et contrats</h3>
                <div class="action-row">
                  <button type="button" class="quiet-button" :disabled="working" @click="editVersion('quote')">Nouveau devis</button>
                  <button type="button" class="quiet-button" :disabled="working" @click="editVersion('contract')">Nouveau contrat</button>
                </div>
              </header>
              <p v-if="!activeDocuments.length" class="muted">Aucun document.</p>
              <article v-for="item in activeDocuments" :key="item.id" class="subitem">
                <header class="heading">
                  <p><strong>{{ versionsOf(item.id)[0]?.title || documentLabels[item.kind] }}</strong> · {{ documentLabels[item.kind] }}</p>
                  <button type="button" class="quiet-button" :disabled="working" @click="editVersion(item.kind, item)">Nouvelle version</button>
                </header>
                <details v-for="version in versionsOf(item.id)" :key="version.id" class="version">
                  <summary>Version {{ version.version }} · {{ timestamp(version.createdAt) }} · {{ money(version.amountCents) }} HT
                    <span v-if="version.signedOn" class="badge success">Signature confirmée</span>
                  </summary>
                  <p><strong>{{ version.title }}</strong><span v-if="version.author"> · {{ version.author }}</span></p>
                  <dl class="facts">
                    <div><dt>Périmètre</dt><dd class="pre">{{ version.scope }}</dd></div>
                    <div><dt>Exclusions</dt><dd class="pre">{{ version.exclusions }}</dd></div>
                    <div><dt>Échéancier</dt><dd class="pre">{{ version.schedule }}</dd></div>
                  </dl>
                  <div class="action-row">
                    <a v-if="version.externalUrl" class="inline-link" :href="version.externalUrl" target="_blank" rel="noopener noreferrer">Ouvrir le document</a>
                    <button v-if="!version.signedOn" type="button" class="quiet-button" :disabled="working" @click="startSignature(version)">Confirmer une signature externe</button>
                  </div>
                  <dl v-if="version.signedOn" class="facts">
                    <div><dt>Signature externe</dt><dd>{{ version.signer }} · {{ when(version.signedOn) }}</dd></div>
                    <div><dt>Preuve déclarée</dt><dd class="pre">{{ version.evidence }}</dd></div>
                    <div v-if="version.recordedAt"><dt>Confirmation manuelle</dt><dd>{{ timestamp(version.recordedAt) }}<span v-if="version.recordedBy"> · {{ version.recordedBy }}</span></dd></div>
                  </dl>
                </details>
              </article>
            </section>

            <section class="panel">
              <h3>Historique</h3>
              <ol class="record-list">
                <li v-for="item in activeHistory" :key="item.id">
                  <strong>{{ historyLabels[item.kind] }}</strong> · {{ timestamp(item.createdAt) }}<span v-if="item.author"> · {{ item.author }}</span>
                  <p v-if="item.snapshot.stage">{{ item.snapshot.title }} · {{ stageLabels[item.snapshot.stage] }}<span v-if="item.snapshot.amountCents != null"> · {{ money(item.snapshot.amountCents) }} HT</span></p>
                  <p v-if="item.snapshot.source">Provenance · {{ item.snapshot.source }}</p>
                  <p v-if="item.snapshot.nextAction">Prochaine action · {{ item.snapshot.nextAction }}<span v-if="item.snapshot.nextActionDate"> · {{ when(item.snapshot.nextActionDate) }}</span></p>
                  <p v-if="item.snapshot.lostReason">Motif de perte · {{ item.snapshot.lostReason }}</p>
                  <p v-if="item.snapshot.message" class="pre">{{ item.snapshot.message }}</p>
                  <p v-if="item.snapshot.audience">Site ou audience · {{ item.snapshot.audience }}</p>
                  <p v-if="item.snapshot.social">Réseau social · {{ item.snapshot.social }}</p>
                </li>
              </ol>
            </section>
          </div>
          <p v-else class="panel muted empty-detail">{{ activeOpportunityId ? 'Opportunité introuvable.' : 'Sélectionnez une opportunité pour voir ses appels, documents et historique.' }}</p>
        </div>
      </section>

      <section v-else-if="tab === 'contacts'" aria-label="Contacts">
        <div class="list-controls">
          <label>Rechercher <input v-model="query" type="search" placeholder="Nom, entreprise, courriel" /></label>
          <label class="checkbox"><input v-model="showArchived" type="checkbox" /> Contacts archivés</label>
          <button type="button" class="portal-primary" :disabled="working" @click="editContact()">Nouveau contact</button>
        </div>
        <div class="workspace">
          <div class="list panel" aria-label="Liste des contacts">
            <p v-if="!contacts.length" class="muted list-empty">Aucun contact à afficher.</p>
            <button v-for="item in contacts" :key="item.id" type="button" :disabled="working"
              :aria-current="item.id === activeContactId ? 'true' : undefined" @click="chooseContact(item.id)">
              <strong>{{ item.name }}</strong>
              <span>{{ item.company || item.email || item.role || item.organizationName || 'Sans organisation' }}</span>
            </button>
          </div>
          <section v-if="activeContact" class="panel">
            <header class="heading">
              <div><h2>{{ activeContact.name }}</h2><p>{{ activeContact.company }}<span v-if="activeContact.company && activeContact.role"> · </span>{{ activeContact.role }}</p></div>
              <div class="action-row">
                <button type="button" class="quiet-button" :disabled="working" @click="editContact(activeContact)">Modifier</button>
                <button type="button" class="quiet-button" :disabled="working"
                  @click="save('archiveContact', { id: activeContact.id, archived: !activeContact.archivedAt }, () => { activeContactId = '' })">
                  {{ activeContact.archivedAt ? 'Restaurer' : 'Archiver' }}
                </button>
              </div>
            </header>
            <dl class="facts">
              <div><dt>Organisation</dt><dd>{{ activeContact.organizationName || 'Sans organisation' }}</dd></div>
              <div v-if="activeContact.email"><dt>Courriel</dt><dd>{{ activeContact.email }}</dd></div>
              <div v-if="activeContact.phone"><dt>Téléphone</dt><dd>{{ activeContact.phone }}</dd></div>
              <div><dt>Fiche</dt><dd>{{ activeContact.archivedAt ? 'Archivée' : 'Active' }} · Contact CRM sans accès associé</dd></div>
              <div v-if="activeContact.notes"><dt>Notes privées</dt><dd class="pre">{{ activeContact.notes }}</dd></div>
            </dl>
          </section>
          <p v-else class="panel muted empty-detail">Sélectionnez un contact pour consulter ses coordonnées.</p>
        </div>
      </section>

      <section v-else-if="tab === 'invoices'" aria-label="Factures et échéances">
        <dl class="metrics">
          <div class="panel"><dt>Reste à encaisser</dt><dd>{{ money(snapshot.summary.expectedCents) }}</dd></div>
          <div class="panel"><dt>Échéances dépassées</dt><dd :class="{ overdue: snapshot.summary.overdueCents > 0 }">{{ money(snapshot.summary.overdueCents) }}</dd></div>
          <div class="panel"><dt>Encaissements confirmés</dt><dd>{{ money(snapshot.summary.receipts) }}</dd></div>
          <div class="panel"><dt>Remboursements</dt><dd>{{ money(snapshot.summary.refunds) }}</dd></div>
          <div class="panel"><dt>Encaissements nets</dt><dd>{{ money(snapshot.summary.receipts - snapshot.summary.refunds) }}</dd></div>
        </dl>
        <p class="muted finance-note">Suivi interne des factures référencées en euros. Les liens de paiement des espaces clients se gèrent dans leurs ressources.</p>
        <details v-if="snapshot.outstanding.length" class="panel outstanding">
          <summary>Prochaines échéances à encaisser ({{ snapshot.outstanding.length }})</summary>
          <ol class="record-list">
            <li v-for="item in snapshot.outstanding" :key="item.id">
              <button type="button" class="link-button" :disabled="working" @click="chooseInvoice(item.invoiceId)">
                {{ when(item.dueDate) }} · {{ item.reference }} · {{ item.organizationName }} · {{ money(item.remainingCents) }} TTC
              </button>
            </li>
          </ol>
        </details>
        <div class="list-controls">
          <label>Rechercher <input v-model="query" type="search" placeholder="Référence, projet, organisation" /></label>
          <button type="button" class="portal-primary" :disabled="working || !snapshot.projects.length" @click="editInvoice()">Référencer une facture</button>
        </div>
        <p v-if="!snapshot.projects.length" class="muted">Créez un projet pour référencer sa première facture.</p>

        <div class="workspace">
          <div class="list panel" aria-label="Liste des factures">
            <p v-if="!invoices.length" class="muted list-empty">Aucune facture à afficher.</p>
            <button v-for="item in invoices" :key="item.id" type="button" :disabled="working"
              :aria-current="item.id === activeInvoiceId ? 'true' : undefined" @click="chooseInvoice(item.id)">
              <strong>{{ item.reference }} · {{ item.title }}</strong>
              <span>{{ item.organizationName }} · {{ money(item.totalCents) }} TTC</span>
              <span v-if="item.cancelledAt" class="badge">Annulée</span>
            </button>
          </div>
          <div v-if="activeInvoice" class="detail">
            <section class="panel">
              <header class="heading">
                <div>
                  <h2>{{ activeInvoice.reference }} · {{ activeInvoice.title }}</h2>
                  <p>{{ activeInvoice.organizationName }} · {{ activeInvoice.projectName }}<template v-if="!activeInvoice.projectId"> (projet supprimé)</template></p>
                </div>
                <div v-if="!activeInvoice.cancelledAt" class="action-row">
                  <button v-if="activeInvoice.projectId || invoiceLocked" type="button" class="quiet-button" :disabled="working" @click="editInvoice(activeInvoice)">Modifier</button>
                  <button type="button" class="quiet-button" :disabled="working" @click="startCancelInvoice">Annuler la facture</button>
                </div>
              </header>
              <dl class="facts">
                <div><dt>Émise le</dt><dd>{{ when(activeInvoice.issuedOn) }}</dd></div>
                <div><dt>Total TTC</dt><dd>{{ money(activeInvoice.totalCents) }}</dd></div>
                <div><dt>Total HT</dt><dd>{{ money(activeInvoice.netCents) }}</dd></div>
                <div v-if="activeInvoice.cancelledAt"><dt>Annulée le {{ timestamp(activeInvoice.cancelledAt) }}</dt><dd>{{ activeInvoice.cancellationReason }}</dd></div>
              </dl>
              <a v-if="activeInvoice.externalUrl" class="inline-link" :href="activeInvoice.externalUrl" target="_blank" rel="noopener noreferrer">Ouvrir la facture</a>
            </section>

            <section class="panel">
              <h3>Échéances et journal</h3>
              <article v-for="term in activeInstallments" :key="term.id" class="subitem">
                <header class="heading">
                  <p><strong>{{ when(term.dueDate) }} · {{ money(term.amountCents) }} TTC</strong></p>
                  <span v-if="!activeInvoice.cancelledAt" class="badge" :class="{ success: !term.remainingCents, overdue: term.remainingCents > 0 && term.dueDate < snapshot.today }">
                    {{ term.remainingCents ? money(term.remainingCents) + ' à encaisser' : 'Réglée' }}
                  </span>
                </header>
                <div v-if="!activeInvoice.cancelledAt" class="action-row">
                  <button v-if="term.remainingCents" type="button" class="quiet-button" :disabled="working" @click="startEntry(term, 'receipt')">Confirmer un encaissement</button>
                  <button v-if="term.receipts > term.refunds" type="button" class="quiet-button" :disabled="working" @click="startEntry(term, 'refund')">Déclarer un remboursement</button>
                  <button v-if="term.remainingCents" type="button" class="quiet-button" :disabled="working" @click="startEntry(term, 'failed')">Noter un paiement échoué</button>
                </div>
                <ol v-if="term.entries" class="record-list">
                  <li v-for="entry in entriesOf(term.id)" :key="entry.id">
                    <strong>{{ entryLabels[entry.kind] }} · {{ money(entry.amountCents) }}</strong> · {{ when(entry.occurredOn) }}
                    <p>{{ entry.reference }} · {{ entry.source === 'manual' ? 'Saisie manuelle' : 'Webhook signé' }}<span v-if="entry.recordedBy"> par {{ entry.recordedBy }}</span> · {{ timestamp(entry.recordedAt) }}</p>
                    <p v-if="entry.note" class="pre">{{ entry.note }}</p>
                  </li>
                </ol>
                <p v-else class="muted">Aucun mouvement confirmé pour cette échéance.</p>
              </article>
            </section>
          </div>
          <p v-else class="panel muted empty-detail">{{ activeInvoiceId ? 'Facture introuvable.' : 'Sélectionnez une facture pour voir ses échéances et son journal.' }}</p>
        </div>
      </section>

      <section v-else aria-label="Temps et marge par projet">
        <div class="list-controls">
          <label>Projet
            <select v-model="activeProjectId" :disabled="working" @change="chooseProject">
              <option v-if="!snapshot.projects.length" value="">Aucun projet</option>
              <option v-for="item in snapshot.projects" :key="item.id" :value="item.id">{{ item.organizationName }} · {{ item.name }}</option>
            </select>
          </label>
        </div>
        <template v-if="activeProject">
          <dl class="metrics">
            <div class="panel"><dt>Temps estimé</dt><dd>{{ activeProject.estimatedMinutes != null ? minutes(activeProject.estimatedMinutes) : '—' }}</dd></div>
            <div class="panel"><dt>Temps saisi</dt><dd>{{ activeCosts.length ? minutes(minutesTotal) : '—' }}</dd></div>
            <div class="panel"><dt>Coûts HT estimés</dt><dd>{{ activeProject.estimatedCents != null ? money(activeProject.estimatedCents) : '—' }}</dd></div>
            <div class="panel"><dt>Coûts HT saisis</dt><dd>{{ activeCosts.length ? money(costTotal) : '—' }}</dd></div>
          </dl>
          <section class="panel">
            <header class="heading">
              <h2>Marge indicative</h2>
              <button type="button" class="quiet-button" :disabled="working" @click="editBudget(activeProject)">Modifier l’estimation</button>
            </header>
            <dl class="facts">
              <div><dt>Facturé HT</dt><dd>{{ billedInvoices.length ? money(billed) : '—' }}</dd></div>
              <div><dt>Facturé HT moins coûts estimés</dt><dd>{{ estimatedMargin != null ? money(estimatedMargin) : '—' }}</dd></div>
              <div><dt>Facturé HT moins coûts saisis</dt><dd>{{ margin != null ? money(margin) : '—' }}</dd></div>
              <div v-if="activeProject.estimatedMinutes != null && activeCosts.length"><dt>Écart de temps réel / estimé</dt><dd>{{ minutesTotal - activeProject.estimatedMinutes }} min</dd></div>
              <div v-if="activeProject.estimatedCents != null && activeCosts.length"><dt>Écart de coût réel / estimé</dt><dd>{{ money(costTotal - activeProject.estimatedCents) }}</dd></div>
            </dl>
            <p class="muted">Le calcul utilise les factures actives et les coûts HT saisis. Renseignez le coût du temps dans chaque saisie concernée. Les remboursements affectent la trésorerie. Pour ajuster le facturé HT, annulez la facture lorsque le solde encaissé est nul et référencez le document de remplacement.</p>
          </section>
          <section class="panel">
            <header class="heading">
              <h3>Temps et coûts réels</h3>
              <button type="button" class="portal-primary" :disabled="working" @click="editCost()">Ajouter une saisie</button>
            </header>
            <p v-if="!activeCosts.length" class="muted">Aucune saisie pour ce projet.</p>
            <article v-for="item in activeCosts" :key="item.id" class="subitem">
              <header class="heading">
                <div><p><strong>{{ item.label }}</strong></p><p>{{ when(item.occurredOn) }} · {{ minutes(item.minutes) }} · {{ money(item.costCents) }} HT</p></div>
                <div class="action-row">
                  <button type="button" class="quiet-button" :disabled="working" @click="editCost(item)">Modifier</button>
                  <button type="button" class="quiet-button" :disabled="working" @click="startDeleteCost(item)">Supprimer</button>
                </div>
              </header>
            </article>
          </section>
        </template>
        <p v-else class="muted">Créez un projet pour suivre ses coûts et son temps.</p>

        <details v-if="orphanCosts.length" class="panel orphan-costs">
          <summary>Saisies conservées de projets supprimés</summary>
          <ol class="record-list">
            <li v-for="item in orphanCosts" :key="item.id">{{ item.projectName }} · {{ item.label }} · {{ when(item.occurredOn) }} · {{ minutes(item.minutes) }} · {{ money(item.costCents) }} HT</li>
          </ol>
        </details>
      </section>
    </template>
  </section>
</template>

<style scoped>
.commercial { display: grid; gap: 1rem; min-width: 0; }
.heading { display: flex; gap: .75rem 1rem; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; }
.heading > div { min-width: 0; }
.commercial :is(h1,h2,h3) { margin: 0; line-height: 1.2; overflow-wrap: anywhere; }
.commercial h1 { font-size: clamp(1.65rem, 3vw, 2.2rem); }
.commercial h2 { font-size: 1.25rem; }
.commercial h3 { font-size: 1rem; }
.commercial p { margin: 0; overflow-wrap: anywhere; }
.heading p { color: var(--portal-muted); margin-top: .3rem; font-size: .875rem; }
.commercial-tabs { display: flex; flex-wrap: wrap; gap: .25rem .7rem; border-bottom: 1px solid var(--portal-line); }
.commercial-tabs button { min-height: 44px; padding: .4rem .65rem; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--portal-muted); }
.commercial-tabs button[aria-current] { color: var(--portal-accent-text); border-bottom-color: var(--portal-accent); }
.commercial-tabs button:hover { color: var(--portal-text); }
.panel { background: var(--portal-surface); border: 1px solid var(--portal-line); border-radius: var(--portal-radius); padding: clamp(.9rem, 2vw, 1.25rem); min-width: 0; }
.editor:focus { outline: 2px solid var(--portal-focus); outline-offset: 2px; }
.editor :is(h2, .form-actions) { margin-bottom: 0; }
.editor form { display: grid; gap: 1rem; }
.fields { border: 0; margin: 0; padding: 0; min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; }
.wide { grid-column: 1 / -1; }
.commercial label { display: grid; align-content: start; gap: .35rem; color: var(--portal-text); font-size: .875rem; }
.commercial :is(input:not([type="checkbox"]), select, textarea) { width: 100%; min-height: 42px; padding: .5rem .65rem; border: 1px solid var(--portal-line); background: var(--portal-control); }
.draft-action { display: flex; gap: .6rem; align-items: center; flex-wrap: wrap; }
.draft-action p { flex: 1 1 15rem; }
.commercial .muted { color: var(--portal-muted); font-size: .875rem; }
.notice { border-radius: var(--portal-radius); padding: .7rem .85rem; }
.error { color: var(--portal-danger); background: var(--portal-danger-soft); }
.success { color: var(--portal-success); background: var(--portal-success-soft); }
.form-actions, .action-row { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.list-controls { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin-bottom: 1rem; }
.list-controls label:first-child { flex: 1 1 16rem; max-width: 30rem; }
.list-controls .checkbox { display: flex; align-items: center; min-height: 44px; gap: .5rem; padding-right: .5rem; }
.workspace { display: grid; grid-template-columns: minmax(13rem, .74fr) minmax(0, 1.55fr); gap: 1rem; align-items: start; }
.list { padding: .35rem; display: grid; gap: .2rem; max-height: 70vh; overflow-y: auto; }
.list button { border: 1px solid transparent; padding: .7rem .75rem; text-align: left; border-radius: var(--portal-radius); background: transparent; color: var(--portal-text); display: grid; justify-items: start; gap: .25rem; overflow-wrap: anywhere; }
.list button:hover { background: var(--portal-hover); }
.list button[aria-current] { background: var(--portal-accent-soft); border-color: var(--portal-accent); }
.list button > span { color: var(--portal-muted); font-size: .8rem; }
.list .list-empty { padding: .6rem; }
.commercial .badge { display: inline-block; padding: .13rem .42rem; border-radius: .3rem; font-size: .75rem; background: var(--portal-raised); color: var(--portal-muted); }
.commercial .badge.success { color: var(--portal-success); background: var(--portal-success-soft); }
.commercial .overdue, .commercial .badge.overdue { color: var(--portal-warning); }
.commercial .badge.overdue { background: var(--portal-warning-soft); }
.detail { display: grid; gap: .9rem; min-width: 0; }
.detail .panel, .workspace > .panel:not(.list) { display: grid; gap: .85rem; }
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); gap: .7rem 1rem; margin: 0; }
.facts dt, .metrics dt { color: var(--portal-muted); font-size: .8rem; }
.facts dd { margin: .2rem 0 0; overflow-wrap: anywhere; }
.commercial .inline-link, .link-button { color: var(--portal-accent-text); text-decoration: underline; text-underline-offset: .18em; }
.link-button { background: transparent; border: 0; padding: .2rem 0; text-align: left; }
.subitem { display: grid; gap: .7rem; border-top: 1px solid var(--portal-line); padding-top: .75rem; }
.subitem + .subitem { margin-top: .15rem; }
.subitem .heading p { margin-top: 0; }
.commercial .pre { white-space: pre-wrap; }
.commercial summary { color: var(--portal-text); cursor: pointer; overflow-wrap: anywhere; }
.commercial details[open] > summary { margin-bottom: .6rem; }
.version { padding: .45rem .6rem; background: var(--portal-raised); border-radius: var(--portal-radius); }
.version > :not(summary) + :not(summary) { margin-top: .55rem; }
.record-list { display: grid; gap: .65rem; list-style: none; margin: 0; padding: 0; font-size: .875rem; }
.record-list > li { border-top: 1px solid var(--portal-line); padding-top: .6rem; overflow-wrap: anywhere; }
.record-list p { color: var(--portal-muted); margin-top: .15rem; }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); gap: .6rem; margin: 0 0 .8rem; }
.metrics dd { margin: .35rem 0 0; font-size: 1.15rem; font-weight: 600; overflow-wrap: anywhere; }
.commercial .finance-note { margin-bottom: .75rem; }
.outstanding { margin-bottom: 1rem; }
.terms { display: grid; gap: .65rem; justify-items: start; }
.term-row { display: grid; gap: .65rem; align-items: end; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)) auto; }
.commercial section[aria-label="Temps et marge par projet"] > .panel + .panel { margin-top: .85rem; }
.commercial section[aria-label="Temps et marge par projet"] > .panel :is(.facts, .muted, .subitem) { margin-top: .7rem; }
.commercial .orphan-costs { margin-top: .85rem; }
@media (max-width: 730px) {
  .workspace { grid-template-columns: 1fr; }
  .list { max-height: 15rem; }
}
@media (max-width: 460px) {
  .fields, .term-row { grid-template-columns: minmax(0, 1fr); }
  .term-row { padding-bottom: .6rem; border-bottom: 1px solid var(--portal-line); }
}
</style>
