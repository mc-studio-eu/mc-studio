<script setup lang="ts">
type Scenario = 'reminders' | 'weekly_report'
type Status = 'queued' | 'running' | 'draft' | 'approved' | 'succeeded' | 'failed'
type Project = {id:string; name:string; paused:boolean}
type Run = {
 id:string; projectId:string; projectName:string; scenario:Scenario; status:Status;
 source:'manual' | 'scheduled' | 'replay'; attempts:number; availableAt:string; createdAt:string;
 notifications:number | null; hasReplay:boolean; errorCode:string | null;
 report:{title:string; body:string} | null
}
type Operations = {
 paused:boolean;
 projects:Project[];
 scenarios:{id:Scenario; paused:boolean; scheduled:boolean}[];
 runs:Run[];
 events:{id:string; event:string; attempt:number | null; scenario:Scenario | null; createdAt:string; projectName:string | null; actor:string | null}[];
 connections:{
  database:'postgres' | 'sqlite'; scheduler:boolean; lastTickAt:string | null;
  email:'configured' | 'disabled' | 'unconfigured'; figma:boolean; analytics:boolean; storage:boolean; mcp:boolean;
  transport:{sent:number; failed:number; pending:number; uncertain:number; cancelled:number}
 }
}

const props = defineProps<{projectId?:string}>()
const selectedProject = ref('')
const projectChoices = ref<Project[]>([])
const projectScope = computed(() => props.projectId || selectedProject.value)
const project = computed(() => snapshot.value?.projects.find(item => item.id === projectScope.value))
const snapshot = ref<Operations>()
const loading = ref(false)
const busy = ref(false)
const notice = ref('')
const error = ref('')
const launchKeys = new Map<string, string>()
let revision = 0
const date = new Intl.DateTimeFormat('fr-FR', {dateStyle:'short', timeStyle:'short'})
const formatDate = (value:string) => date.format(new Date(value))

const scenarios = {
 reminders:{label:'Relances', schedule:'Chaque jour', description:'Vérifie les actions qui attendent un retour et respecte les préférences de chaque membre.', launch:'Déclencher les relances'},
 weekly_report:{label:'Bilan hebdomadaire', schedule:'Chaque vendredi', description:'Prépare un bilan à partir de la roadmap et du journal du projet. Vous vérifiez le contenu avant de prévenir le client.', launch:'Préparer le bilan'}
}
const statuses: Record<Status,string> = {
 queued:'En file', running:'En cours', draft:'À valider', approved:'Validé', succeeded:'Terminé', failed:'En échec'
}
const sources = {manual:'Manuel', scheduled:'Planifié', replay:'Rejeu'}
const eventLabels: Record<string,string> = {
 queued:'Mis en file', claimed:'Exécution démarrée', deferred:'Remis en file après une pause',
 succeeded:'Exécution terminée', draft:'Brouillon prêt', approved:'Bilan validé',
 retry:'Nouvelle tentative programmée', lease_retry:'Exécution interrompue, reprise programmée',
 failed:'Tentatives épuisées', lease_failed:'Exécution interrompue, tentatives épuisées',
 paused:'Mis en pause', resumed:'Repris', schedule_enabled:'Planification activée', schedule_disabled:'Planification désactivée'
}
const emailLabels = {configured:'Configurée', disabled:'Désactivée', unconfigured:'Non configurée'}
const configured = (value:boolean) => value ? 'Configuré, accès à vérifier' : 'Non configuré'

async function refresh() {
 const current = ++revision
 loading.value = true
 try {
  const fresh = await $fetch<Operations>('/api/portal/admin/operations', {
   query:projectScope.value ? {projectId:projectScope.value} : undefined
  })
  if (current !== revision) return
  snapshot.value = fresh
  if (!projectScope.value) projectChoices.value = fresh.projects
 } catch {
  if (current === revision) error.value = 'Impossible de charger les automatisations.'
 } finally {
  if (current === revision) loading.value = false
 }
}

function paused(scenario:Scenario, projectId = projectScope.value) {
 return Boolean(snapshot.value?.paused || snapshot.value?.projects.find(item => item.id === projectId)?.paused ||
  snapshot.value?.scenarios.find(item => item.id === scenario)?.paused)
}

async function mutate(body:Record<string, unknown>) {
 if (busy.value) return
 busy.value = true
 notice.value = ''
 error.value = ''
 try {
  const response = await $fetch<{run?:Run}>('/api/portal/admin/operations', {method:'POST', body})
  if (response.run) {
   const {status, notifications} = response.run
   notice.value = ['approved','succeeded'].includes(status)
    ? statuses[status] + ' · ' + (notifications ?? 0) + ' notification(s) mise(s) en file.'
    : statuses[status] + '.'
  } else {
   notice.value = 'Paramètre enregistré.'
  }
  await refresh()
  return true
 } catch (cause:any) {
  error.value = cause?.data?.statusMessage || 'L’action a échoué. Vous pouvez réessayer.'
 } finally {
  busy.value = false
 }
}

async function launch(scenario:Scenario) {
 const projectId = projectScope.value
 const selection = projectId + ':' + scenario
 const key = launchKeys.get(selection) || Array.from(crypto.getRandomValues(new Uint8Array(16)), value =>
  value.toString(16).padStart(2, '0')).join('')
 launchKeys.set(selection, key)
 if (await mutate({action:'launch', projectId, scenario, key})) launchKeys.delete(selection)
}

onMounted(refresh)
watch(projectScope, () => {
 snapshot.value = undefined
 error.value = ''
 notice.value = ''
 refresh()
})
</script>

<template>
 <section class="operations" aria-labelledby="operations-title">
  <header class="operations-heading">
   <div>
    <h2 id="operations-title">Automatisations</h2>
    <p>Planifiez les relances et les bilans, puis suivez leur exécution.</p>
   </div>
   <button type="button" :disabled="busy || loading" @click="error = ''; refresh()">Actualiser</button>
  </header>
  <label v-if="!props.projectId && projectChoices.length" class="project-select">
   Projet
   <select v-model="selectedProject" :disabled="busy || loading">
    <option value="">Tous les projets</option>
    <option v-for="item in projectChoices" :key="item.id" :value="item.id">{{ item.name }}</option>
   </select>
  </label>
  <p v-if="error" class="operation-error" role="alert">{{ error }}</p>
  <p v-if="notice" role="status" class="operation-notice">{{ notice }}</p>
  <p v-if="loading && !snapshot" role="status">Chargement des automatisations…</p>

  <template v-if="snapshot">
   <section class="operation-card pause-card" aria-label="Pauses">
    <div>
     <strong>Tous les projets</strong>
     <button type="button" :disabled="busy" @click="mutate({action:'pause', scope:'global', paused:!snapshot.paused})">
      {{ snapshot.paused ? 'Reprendre les automatisations' : 'Tout mettre en pause' }}
     </button>
    </div>
    <div v-if="project">
     <strong>{{ project.name }}</strong>
     <button type="button" :disabled="busy" @click="mutate({action:'pause', scope:'project', projectId:project.id, paused:!project.paused})">
      {{ project.paused ? 'Reprendre ce projet' : 'Mettre ce projet en pause' }}
     </button>
    </div>
    <p v-if="snapshot.paused">La pause globale est active.</p>
   </section>

   <div class="operation-grid">
    <section v-for="scenario in snapshot.scenarios" :key="scenario.id" class="operation-card scenario-card">
     <div>
      <h3>{{ scenarios[scenario.id].label }}</h3>
      <p>{{ scenarios[scenario.id].description }}</p>
      <p>
       {{ scenario.scheduled ? scenarios[scenario.id].schedule : 'Planification désactivée' }}
       <span v-if="paused(scenario.id)"> · En pause</span>
      </p>
     </div>
     <div class="operation-actions">
      <button type="button" :disabled="busy" @click="mutate({action:'schedule', scenario:scenario.id, scheduled:!scenario.scheduled})">
       {{ scenario.scheduled ? 'Désactiver la planification' : 'Activer la planification' }}
      </button>
      <button type="button" :disabled="busy" @click="mutate({action:'pause', scope:'scenario', scenario:scenario.id, paused:!scenario.paused})">
       {{ scenario.paused ? 'Reprendre le scénario' : 'Mettre le scénario en pause' }}
      </button>
      <button type="button" :disabled="busy || !project || paused(scenario.id)" @click="launch(scenario.id)">
       {{ scenarios[scenario.id].launch }}
      </button>
     </div>
    </section>
   </div>
   <p v-if="!project && projectChoices.length">Sélectionnez un projet pour lancer une automatisation.</p>
   <p v-else-if="!project">Ajoutez un projet pour lancer une automatisation.</p>

   <section class="operation-card" aria-labelledby="operation-connection-title">
    <h3 id="operation-connection-title">État des connexions</h3>
    <dl class="connection-grid">
     <div><dt>Base du portail</dt><dd>Accessible · {{ snapshot.connections.database === 'postgres' ? 'PostgreSQL' : 'SQLite' }}</dd></div>
     <div><dt>Ordonnanceur</dt><dd>{{ snapshot.connections.scheduler ? 'Configuré' : 'Non configuré' }}</dd>
      <dd>{{ snapshot.connections.lastTickAt ? 'Dernier passage le ' + formatDate(snapshot.connections.lastTickAt) : 'Aucun passage enregistré' }}</dd>
     </div>
     <div><dt>Messagerie</dt><dd>{{ emailLabels[snapshot.connections.email] }}</dd></div>
     <div><dt>Figma</dt><dd>{{ configured(snapshot.connections.figma) }}</dd></div>
     <div><dt>Google Analytics et Search Console</dt><dd>{{ configured(snapshot.connections.analytics) }}</dd></div>
     <div><dt>Stockage R2</dt><dd>{{ configured(snapshot.connections.storage) }}</dd></div>
     <div><dt>MCP</dt><dd>{{ configured(snapshot.connections.mcp) }}</dd></div>
    </dl>
    <p class="transport-counts">
     Courriels · {{ snapshot.connections.transport.sent }} accepté(s) par le fournisseur,
     {{ snapshot.connections.transport.pending }} en attente, {{ snapshot.connections.transport.failed }} en échec,
     {{ snapshot.connections.transport.uncertain }} au résultat incertain, {{ snapshot.connections.transport.cancelled }} annulé(s).
    </p>
   </section>

   <section class="operation-card" aria-labelledby="operation-runs-title">
    <h3 id="operation-runs-title">Exécutions récentes</h3>
    <p v-if="!snapshot.runs.length">Aucune exécution enregistrée.</p>
    <ol v-else class="operation-list">
     <li v-for="run in snapshot.runs" :key="run.id">
      <div class="run-heading">
       <div><strong>{{ scenarios[run.scenario].label }}</strong> · {{ run.projectName }}
        <small>{{ formatDate(run.createdAt) }} · {{ sources[run.source] }} · {{ run.attempts }} / 3 tentative(s)</small>
       </div>
       <span class="run-status" :class="'run-' + run.status">{{ statuses[run.status] }}</span>
      </div>
      <p v-if="run.status === 'queued' && run.errorCode">Prochaine tentative possible le {{ formatDate(run.availableAt) }}.</p>
      <p v-if="run.notifications !== null">{{ run.notifications }} notification(s) mise(s) en file.</p>
      <p v-if="run.status === 'failed'">
       {{ run.errorCode === 'lease_expired' ? 'L’exécution a dépassé le délai de reprise.' : 'Le scénario a échoué après plusieurs tentatives.' }}
      </p>
      <div v-if="run.status === 'failed' || run.status === 'queued' || run.status === 'running'" class="operation-actions">
       <button v-if="run.status === 'failed' && !run.hasReplay" type="button" :disabled="busy || paused(run.scenario,run.projectId)" @click="mutate({action:'replay', runId:run.id})">Rejouer</button>
       <button v-if="run.status === 'queued' || run.status === 'running'" type="button" :disabled="busy || paused(run.scenario,run.projectId)" @click="mutate({action:'execute', runId:run.id})">Vérifier et reprendre</button>
       <p v-if="run.hasReplay">Une nouvelle exécution a été créée.</p>
      </div>
      <details v-if="run.report" class="report">
       <summary>{{ run.report.title }}</summary>
       <p class="report-body">{{ run.report.body }}</p>
       <div v-if="run.status === 'draft'" class="operation-actions">
        <button type="button" :disabled="busy || paused(run.scenario,run.projectId)" @click="mutate({action:'approve', runId:run.id})">Valider et prévenir le client</button>
        <p>Chaque membre reçoit le bilan selon ses préférences de notification.</p>
       </div>
      </details>
     </li>
    </ol>
   </section>

   <details class="operation-card journal">
    <summary>Journal des événements</summary>
    <p v-if="!snapshot.events.length">Aucun événement enregistré.</p>
    <ol v-else class="operation-list">
     <li v-for="entry in snapshot.events" :key="entry.id">
      <strong>{{ eventLabels[entry.event] || entry.event }}</strong>
      <small>{{ [formatDate(entry.createdAt), entry.projectName, entry.scenario && scenarios[entry.scenario].label, entry.actor, entry.attempt && 'Tentative ' + entry.attempt].filter(Boolean).join(' · ') }}</small>
     </li>
    </ol>
   </details>
  </template>
 </section>
</template>

<style scoped>
.operations{display:grid;gap:16px;color:var(--portal-text)}
.operations h2,.operations h3,.operations p{margin:0}
.operations h2{font-size:22px;font-weight:650}
.operations h3,.operations summary{font-size:16px;font-weight:650}
.operations p,.operations label,.operations dd,.operations small{font-size:13px;line-height:1.6;color:var(--portal-muted)}
.operations-heading,.run-heading,.pause-card>div{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.operations-heading>div,.scenario-card>div:first-child{display:grid;gap:6px}
.operation-card{min-width:0;display:grid;gap:12px;border:1px solid var(--portal-line);border-radius:10px;background:var(--portal-surface);padding:18px}
.operation-grid,.connection-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:12px}
.connection-grid{margin:0}
.connection-grid div{padding:10px;border:1px solid var(--portal-line);border-radius:7px}
.connection-grid dt,.run-heading strong,.operation-list strong{font-size:13px;font-weight:600}
.connection-grid dd{margin:2px 0 0}
.operation-actions,.project-select{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.operations select,.operations button{font:inherit;font-size:13px;min-height:40px;padding:8px 11px;border:1px solid var(--portal-line);border-radius:7px;background:var(--portal-control);color:var(--portal-text)}
.operations button:enabled,.operations summary{cursor:pointer}
.operations button:enabled:hover,.operations button:focus-visible{border-color:var(--portal-accent)}
.operations button:disabled{opacity:.55}
.operation-list{display:grid;gap:10px;margin:0;list-style:none;padding:0}
.operation-list li{display:grid;gap:8px;border-top:1px solid var(--portal-line);padding-top:12px;overflow-wrap:anywhere}
.operation-list small{display:block;margin-top:1px}
.run-status{font-size:12px;border:1px solid var(--portal-line);border-radius:999px;padding:4px 8px}
.run-draft{color:var(--portal-accent)}
.run-failed,.operations .operation-error{color:var(--portal-danger)}
.operations .operation-error,.operation-notice{padding:10px 12px;border:1px solid var(--portal-line);border-radius:7px}
.operations .operation-error{background:var(--portal-danger-soft)}
.report{border:1px solid var(--portal-line);border-radius:7px;background:var(--portal-control);padding:12px}
.report summary{font-size:13px}
.report[open]>:not(summary){margin-top:10px}
.operations .report-body{white-space:pre-wrap;color:var(--portal-text)}
.journal[open]>:not(summary){margin-top:10px}
@media(max-width:560px){.operation-card{padding:14px}.operation-actions>button{flex:1 1 100%}}
</style>
