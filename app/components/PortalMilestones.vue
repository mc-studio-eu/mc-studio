<script setup lang="ts">
import { portalDate, type PortalMember, type PortalMilestone } from '~/types/portal'
const props = defineProps<{ projectId:string; admin?:boolean; members?:PortalMember[]; userId?:string; canContribute?:boolean }>()
const emit = defineEmits<{ changed:[] }>()
const items = ref<PortalMilestone[]>([]), loading = ref(false), busy = ref(false), error = ref(''), success = ref('')
const editing = ref(false), editingId = ref(''), deleteId = ref('')
const defaults = () => ({ title:'', description:'', kind:'milestone' as PortalMilestone['kind'], status:'todo' as PortalMilestone['status'], dueDate:'', responsibleId:'', blocker:'' })
const form = reactive(defaults())
const statuses = { todo:'À faire', in_progress:'En cours', done:'Terminé', blocked:'Bloqué' }
const kinds = { milestone:'Jalon', deliverable:'Livrable', checklist:'Contenu / checklist' }
const activeMembers = computed(() => (props.members || []).filter(member => !member.suspended && member.memberRole!=='viewer'))
const done = computed(() => items.value.filter(item => item.status==='done').length)
const canEdit = (item:PortalMilestone) => props.admin || (props.canContribute && Boolean(props.userId) && item.responsibleId===props.userId)
let request = 0
async function load() {
  const id = ++request; loading.value = true; error.value = ''
  try { const data = await $fetch<{milestones:PortalMilestone[]}>('/api/portal/resources', { query:{projectId:props.projectId} }); if (id===request) items.value = data.milestones || [] }
  catch (cause:any) { if (id===request) error.value = cause?.data?.statusMessage || 'Impossible de charger les jalons.' }
  finally { if (id===request) loading.value = false }
}
function edit(item?:PortalMilestone) { Object.assign(form,defaults(),item || {}, {responsibleId:item?.responsibleId || ''}); editingId.value=item?.id || ''; editing.value=true; error.value=''; success.value='' }
async function save() {
  busy.value=true; error.value=''; success.value=''
  try {
    const body = props.admin ? {...form, projectId:props.projectId, responsibleId:form.responsibleId || null} : {status:form.status, blocker:form.blocker}
    await $fetch(editingId.value ? `/api/portal/milestones/${editingId.value}` : '/api/portal/milestones', {method:editingId.value?'PATCH':'POST', body})
    editing.value=false; await load(); emit('changed'); success.value='Le suivi du projet a été mis à jour.'
  } catch (cause:any) { error.value=cause?.data?.statusMessage || 'Impossible d’enregistrer cette étape.' }
  finally { busy.value=false }
}
async function remove() {
  busy.value=true; error.value=''
  try { await $fetch(`/api/portal/milestones/${deleteId.value}`, {method:'DELETE'}); deleteId.value=''; await load(); emit('changed') }
  catch (cause:any) { error.value=cause?.data?.statusMessage || 'Impossible de supprimer cette étape.' }
  finally { busy.value=false }
}
watch(() => props.projectId, () => { items.value=[]; editing.value=false; deleteId.value=''; load() }, {immediate:true})
</script>
<template><section class="milestones"><header><div><h2>Jalons et livrables</h2><p>{{ done }} / {{ items.length }} terminés · responsables, dates et contenus attendus</p></div><button v-if="admin" class="primary" :disabled="busy" @click="edit()">+ Ajouter une étape</button></header><p v-if="error" class="error-message" role="alert">{{ error }} <button v-if="!editing" @click="load">Réessayer</button></p><p v-if="success" role="status" class="success-message">{{ success }}</p><form v-if="editing" class="milestone-form" @submit.prevent="save"><h3>{{ admin ? editingId ? 'Modifier une étape' : 'Nouvelle étape' : form.title }}</h3><template v-if="admin"><label>Type<select v-model="form.kind"><option v-for="(label,key) in kinds" :key="key" :value="key">{{ label }}</option></select></label><label>Titre<input v-model="form.title" required maxlength="160"></label><label class="wide">Description<textarea v-model="form.description" rows="3" maxlength="3000"/></label><label>Responsable<select v-model="form.responsibleId"><option value="">À attribuer</option><option v-for="member in activeMembers" :key="member.id" :value="member.id">{{ member.name }}</option></select></label><label>Date attendue<input v-model="form.dueDate" type="date"></label></template><label>Statut<select v-model="form.status"><option v-for="(label,key) in statuses" :key="key" :value="key">{{ label }}</option></select></label><label class="wide">Blocage ou information utile<textarea v-model="form.blocker" rows="2" maxlength="1000" :required="form.status==='blocked'" placeholder="Précisez ce qui manque pour avancer…"/></label><div class="wide actions"><button type="button" :disabled="busy" @click="editing=false">Annuler</button><button class="primary" :disabled="busy">{{ busy ? 'Enregistrement…' : 'Enregistrer' }}</button></div></form><p v-if="loading" role="status">Chargement des étapes…</p><p v-else-if="!items.length" class="empty">{{ admin ? 'Ajoutez les jalons, les livrables et les contenus à réunir pour ce projet.' : 'MC Studio détaillera ici les prochaines étapes et les contenus attendus.' }}</p><div v-else class="milestone-list"><article v-for="item in items" :key="item.id" :class="{blocked:item.status==='blocked',done:item.status==='done'}"><div class="milestone-copy"><small>{{ kinds[item.kind] }}</small><h3>{{ item.title }}</h3><p v-if="item.description">{{ item.description }}</p><p class="meta">{{ item.responsibleName || 'À attribuer' }} · {{ portalDate(item.dueDate) }}</p><p v-if="item.blocker" class="blocker"><strong>{{ item.status==='blocked' ? 'Blocage :' : 'Note :' }}</strong> {{ item.blocker }}</p></div><div class="milestone-actions"><span :class="['status',item.status]">{{ statuses[item.status] }}</span><button v-if="canEdit(item)" :disabled="busy" @click="edit(item)">{{ admin ? 'Modifier' : 'Mettre à jour' }}</button><button v-if="admin" :disabled="busy" @click="deleteId=item.id">Supprimer</button></div><div v-if="deleteId===item.id" class="delete-confirm"><p>Supprimer cette étape du projet ?</p><button :disabled="busy" @click="deleteId=''">Annuler</button><button :disabled="busy" @click="remove">{{ busy ? 'Suppression…' : 'Confirmer la suppression' }}</button></div></article></div></section></template>
<style scoped>
.milestones{border:1px solid var(--portal-line,#333);border-radius:8px;background:var(--portal-surface,#181818);color:var(--portal-text,#eee)}
header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px}
h2{margin:0}
h3{font-weight:500;margin:5px 0}
p{color:var(--portal-muted,#999);line-height:1.6;margin:7px 0}
small{font-size:12px;color:var(--portal-muted,#999)}
button,input,select,textarea{font:inherit;color:inherit;border:1px solid var(--portal-line,#444);border-radius:8px;background:var(--portal-raised,#232323);padding:9px 12px}
button{cursor:pointer;font-size:12px}
button:disabled{opacity:.5;cursor:default}
.primary{border-color:var(--portal-accent);background:var(--portal-accent);color:var(--portal-accent-ink,#fff)}
.milestone-list article{display:flex;align-items:flex-start;gap:20px;border-top:1px solid var(--portal-line,#333);flex-wrap:wrap}
.milestone-copy{flex:1;min-width:180px;overflow-wrap:anywhere}
.milestone-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.blocked .status,.blocker{color:var(--portal-warning)}
.meta{font-size:12px}
.milestone-form{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--portal-line,#444);border-radius:8px;margin:18px 0}
.milestone-form h3{grid-column:1/-1;margin:0 0 4px}
label{display:grid;gap:7px}
input,select,textarea{width:100%;min-width:0;background:var(--portal-surface,#151515)}
textarea{resize:vertical}
.wide{grid-column:1/-1}
.actions{display:flex;justify-content:flex-end;gap:8px}
.delete-confirm{width:100%;border:1px solid var(--portal-danger);border-radius:8px}
.delete-confirm button{margin:6px 8px 0 0}
.error-message{color:var(--portal-danger)}
@media(max-width:700px){header{align-items:flex-start;flex-wrap:wrap}
.milestone-form{grid-template-columns:1fr}}
.milestones{margin:24px 32px;padding:24px;font:14px/1.5 Inter,Arial,sans-serif}
h2{font-size:18px;font-weight:600}
h3{font-size:14px}
p{font-size:13px}
button,input,select{min-height:40px;border-radius:8px;font-size:13px}
textarea{font-size:13px;line-height:1.6;background:var(--portal-raised)}
input,select{background:var(--portal-raised)}
label{font-size:13px}
.milestone-list article{padding:22px 0}
.status{font-size:11px;font-weight:500;border:0;border-radius:6px;background:var(--portal-raised);color:var(--portal-muted);padding:5px 8px}
.status.in_progress{background:var(--portal-info-soft);color:var(--portal-info)}
.blocked .status{background:var(--portal-warning-soft);color:var(--portal-warning)}
.done .status{background:var(--portal-success-soft);color:var(--portal-success)}
.milestone-form{padding:22px;background:var(--portal-bg);gap:18px}
.delete-confirm{background:var(--portal-danger-soft);padding:16px}
.delete-confirm p{color:var(--portal-danger)}
.error-message,.success-message{padding:12px 16px;border:1px solid var(--portal-danger);background:var(--portal-danger-soft);color:var(--portal-danger);border-radius:8px}
.success-message{border-color:var(--portal-success);background:var(--portal-success-soft);color:var(--portal-success)}
.empty{padding:24px;border:1px dashed var(--portal-line);border-radius:8px;text-align:center}
@media(max-width:700px){.milestones{margin:20px 16px;padding:20px 16px}
.milestone-form{padding:16px}
.milestone-actions{width:100%}
.milestone-copy{min-width:0;flex-basis:100%}}
</style>
