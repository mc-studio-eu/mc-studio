<script setup lang="ts">
type RequestStatus = 'open' | 'resolved'
type ProjectRequest = { id:string; projectId:string; title:string; body:string; status:RequestStatus; authorId:string; authorName:string; createdAt:string; updatedAt:string; resolvedAt:string|null; resolvedByName:string; messageCount:number }
type RequestMessage = { id:string; body:string; authorId:string; authorName:string; authorRole:string; createdAt:string; type:'reply'|'status'; status:RequestStatus|null }
type RequestDetail = { request:ProjectRequest; messages:RequestMessage[]; permissions:{canReply:boolean;canChangeStatus:boolean} }
const props = defineProps<{projectId:string; requestId?:string; admin?:boolean}>()
const emit = defineEmits<{changed:[]; select:[id:string]}>()
const requests = ref<ProjectRequest[]>([]), canCreate = ref(false), loading = ref(true), listError = ref('')
const search = ref(''), filter = ref<'all'|RequestStatus>('all')
const creating = ref(false), title = ref(''), body = ref(''), reply = ref(''), busy = ref(false), error = ref(''), success = ref('')
const selectedId = ref(''), detail = ref<RequestDetail|null>(null), detailLoading = ref(false), detailError = ref('')
const titleInput = ref<HTMLInputElement|null>(null), newButton = ref<HTMLButtonElement|null>(null), detailHeading = ref<HTMLElement|null>(null), listHeading = ref<HTMLElement|null>(null)
let listGeneration = 0, detailGeneration = 0, projectGeneration = 0
const counts = computed(() => ({all:requests.value.length,open:requests.value.filter(item=>item.status==='open').length,resolved:requests.value.filter(item=>item.status==='resolved').length}))
const filters = computed(() => [{id:'all' as const,label:'Toutes',count:counts.value.all},{id:'open' as const,label:'Ouvertes',count:counts.value.open},{id:'resolved' as const,label:'Résolues',count:counts.value.resolved}])
const filtered = computed(() => {
  const query=search.value.trim().toLocaleLowerCase('fr')
  return requests.value.filter(item=>(filter.value==='all'||item.status===filter.value)&&(!query||`${item.title} ${item.body} ${item.authorName}`.toLocaleLowerCase('fr').includes(query)))
})
const statusLabel = (status:RequestStatus) => status==='resolved'?'Résolue':'Ouverte'
const date = (value:string) => new Date(value).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})
const timestamp = (value:string) => new Date(value).toLocaleString('fr-FR',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
const failure = (cause:any, fallback:string) => cause?.data?.statusMessage || fallback

async function loadList() {
  const generation=++listGeneration, projectId=props.projectId
  loading.value=true;listError.value=''
  try {
    const data=await $fetch<{requests:ProjectRequest[];permissions:{canCreate:boolean}}>('/api/portal/requests',{query:{projectId}})
    if(generation!==listGeneration||projectId!==props.projectId)return
    requests.value=data.requests;canCreate.value=data.permissions.canCreate
  } catch(cause) { if(generation===listGeneration)listError.value=failure(cause,'Impossible de charger les demandes.') }
  finally { if(generation===listGeneration)loading.value=false }
}
async function loadDetail(id=selectedId.value, focus=false) {
  if(!id)return
  const generation=++detailGeneration, projectId=props.projectId
  detailLoading.value=true;detailError.value=''
  try {
    const data=await $fetch<RequestDetail>(`/api/portal/requests/${encodeURIComponent(id)}`)
    if(generation!==detailGeneration||projectId!==props.projectId||selectedId.value!==id)return
    if(data.request.projectId!==projectId){detail.value=null;detailError.value='Cette demande appartient à un autre projet. Revenez à la liste pour consulter les demandes de ce projet.';return}
    detail.value=data
    if(focus){await nextTick();detailHeading.value?.focus()}
  } catch(cause) { if(generation===detailGeneration)detailError.value=failure(cause,'Impossible de charger cette demande.') }
  finally { if(generation===detailGeneration)detailLoading.value=false }
}
function openRequest(id:string, updateRoute=true) {
  selectedId.value=id;detail.value=null;creating.value=false;reply.value='';error.value='';success.value=''
  if(updateRoute)emit('select',id)
  void loadDetail(id,true)
}
async function closeDetail() {
  if(busy.value)return
  ++detailGeneration;selectedId.value='';detail.value=null;detailLoading.value=false;detailError.value='';error.value='';success.value='';reply.value=''
  emit('select','');await nextTick();listHeading.value?.focus()
}
async function startCreate() {
  creating.value=true;error.value='';success.value='';await nextTick();titleInput.value?.focus()
}
async function cancelCreate() {
  if(busy.value)return
  creating.value=false;error.value='';await nextTick();newButton.value?.focus()
}
async function createRequest() {
  if(busy.value||!canCreate.value||!title.value.trim()||!body.value.trim())return
  const generation=projectGeneration, projectId=props.projectId
  busy.value=true;error.value='';success.value=''
  try {
    const result=await $fetch<{id:string}>('/api/portal/requests',{method:'POST',body:{projectId,title:title.value.trim(),body:body.value.trim()}})
    if(generation!==projectGeneration)return
    title.value='';body.value='';creating.value=false;emit('changed');await loadList()
    if(generation!==projectGeneration)return
    openRequest(result.id);success.value='Votre demande a été créée.'
  } catch(cause) { if(generation===projectGeneration)error.value=failure(cause,'Impossible de créer la demande.') }
  finally { if(generation===projectGeneration)busy.value=false }
}
async function sendReply() {
  if(busy.value||!detail.value?.permissions.canReply||!reply.value.trim())return
  const generation=projectGeneration, id=selectedId.value
  busy.value=true;error.value='';success.value=''
  try {
    await $fetch(`/api/portal/requests/${encodeURIComponent(id)}/messages`,{method:'POST',body:{body:reply.value.trim()}})
    if(generation!==projectGeneration)return
    reply.value='';success.value='Votre réponse a été envoyée.';emit('changed');await Promise.all([loadDetail(id),loadList()])
  } catch(cause) { if(generation===projectGeneration)error.value=failure(cause,'Impossible d’envoyer votre réponse.') }
  finally { if(generation===projectGeneration)busy.value=false }
}
async function changeStatus() {
  if(busy.value||!detail.value?.permissions.canChangeStatus)return
  const generation=projectGeneration, id=selectedId.value, status=detail.value.request.status==='open'?'resolved':'open'
  busy.value=true;error.value='';success.value=''
  try {
    await $fetch(`/api/portal/requests/${encodeURIComponent(id)}`,{method:'PATCH',body:{status}})
    if(generation!==projectGeneration)return
    success.value=status==='resolved'?'La demande a été résolue.':'La demande a été rouverte.';emit('changed');await Promise.all([loadDetail(id),loadList()])
  } catch(cause) { if(generation===projectGeneration)error.value=failure(cause,'Impossible de modifier le statut.') }
  finally { if(generation===projectGeneration)busy.value=false }
}
watch(()=>props.projectId,()=>{
  ++projectGeneration;++listGeneration;++detailGeneration
  requests.value=[];canCreate.value=false;selectedId.value='';detail.value=null;detailLoading.value=false;detailError.value='';busy.value=false;creating.value=false;title.value='';body.value='';reply.value='';search.value='';filter.value='all';error.value='';success.value=''
  void loadList()
  if(props.requestId)openRequest(props.requestId,false)
},{immediate:true})
watch(()=>props.requestId,id=>{
  if((id||'')===selectedId.value)return
  if(id)openRequest(id,false)
  else{++detailGeneration;selectedId.value='';detail.value=null;detailLoading.value=false;detailError.value='';error.value='';success.value=''}
})
onBeforeUnmount(()=>{++projectGeneration;++listGeneration;++detailGeneration})
</script>

<template>
  <section class="requests-panel" :class="{embedded:admin}" aria-label="Demandes du projet">
    <header class="requests-heading">
      <div><h2 ref="listHeading" tabindex="-1">Demandes</h2><p>Une question, une idée ou un ajustement ? Échangez avec {{admin?'l’équipe client':'MC Studio'}} et suivez chaque réponse.</p></div>
      <button v-if="!selectedId && canCreate && !creating" ref="newButton" class="rq-primary" :disabled="loading" @click="startCreate"><UIcon name="i-tabler-plus"/>Nouvelle demande</button>
    </header>
    <p v-if="success" class="rq-success" role="status">{{success}}</p>
    <p v-if="error" class="rq-error" role="alert">{{error}}</p>

    <template v-if="selectedId">
      <button class="rq-back" :disabled="busy" @click="closeDetail"><UIcon name="i-tabler-arrow-left"/>Toutes les demandes</button>
      <p v-if="detailLoading && !detail" class="rq-loading" role="status">Chargement de la discussion…</p>
      <p v-if="detailError" class="rq-error" role="alert">{{detailError}} <button class="rq-secondary" :disabled="detailLoading" @click="loadDetail(selectedId,true)">Réessayer</button></p>
      <article v-if="detail" class="rq-detail" :aria-busy="detailLoading">
        <header class="rq-detail-heading"><div><span :class="['rq-status',detail.request.status]"><i/>{{statusLabel(detail.request.status)}}</span><h3 ref="detailHeading" tabindex="-1">{{detail.request.title}}</h3><p>{{detail.request.authorName}} <span>·</span> <time :datetime="detail.request.createdAt">{{timestamp(detail.request.createdAt)}}</time></p></div><button v-if="detail.permissions.canChangeStatus" class="rq-secondary" :disabled="busy||detailLoading" @click="changeStatus"><UIcon :name="detail.request.status==='open'?'i-tabler-circle-check':'i-tabler-refresh'"/>{{busy?'Enregistrement…':detail.request.status==='open'?'Marquer comme résolue':'Rouvrir la demande'}}</button></header>
        <p class="rq-body">{{detail.request.body}}</p>
        <p v-if="detail.request.status==='resolved' && detail.request.resolvedAt" class="rq-resolution"><UIcon name="i-tabler-circle-check"/>Résolue{{detail.request.resolvedByName?' par '+detail.request.resolvedByName:''}} le {{timestamp(detail.request.resolvedAt)}}</p>
        <section class="rq-discussion" aria-label="Discussion"><h4>Discussion <span>{{detail.request.messageCount}} réponse{{detail.request.messageCount>1?'s':''}}</span></h4><p v-if="!detail.messages.length" class="rq-muted">La discussion commence ici. Chaque réponse sera conservée dans cette demande.</p><ol v-else class="rq-messages"><li v-for="message in detail.messages" :key="message.id" :class="{'rq-event':message.type==='status'}"><template v-if="message.type==='status'"><UIcon :name="message.status==='resolved'?'i-tabler-circle-check':'i-tabler-refresh'"/><div><p>{{message.body}}</p><time :datetime="message.createdAt">{{timestamp(message.createdAt)}}</time></div></template><template v-else><div class="rq-avatar" aria-hidden="true">{{message.authorName.slice(0,1).toUpperCase()}}</div><article><header><strong>{{message.authorName}}</strong><span v-if="message.authorRole==='admin'" class="rq-team">MC Studio</span><time :datetime="message.createdAt">{{timestamp(message.createdAt)}}</time></header><p class="rq-body">{{message.body}}</p></article></template></li></ol></section>
        <form v-if="detail.permissions.canReply" class="rq-reply" @submit.prevent="sendReply"><label for="request-reply">Votre réponse</label><textarea id="request-reply" v-model="reply" rows="4" maxlength="10000" required :disabled="busy" placeholder="Apportez une précision ou répondez à l’équipe…"/><div class="rq-form-footer"><small>Votre réponse sera visible par l’équipe du projet.</small><button class="rq-primary" :disabled="busy||detailLoading||!reply.trim()"><UIcon name="i-tabler-send"/>{{busy?'Envoi en cours…':'Envoyer la réponse'}}</button></div></form>
        <p v-else class="rq-reader"><UIcon name="i-tabler-lock"/>Vous avez un accès en lecture seule à cette discussion.</p>
      </article>
    </template>

    <template v-else>
      <form v-if="creating && canCreate" class="rq-create" aria-labelledby="new-request-title" @submit.prevent="createRequest" @keydown.esc.prevent="cancelCreate"><header><h3 id="new-request-title">Nouvelle demande</h3><p>Donnez un titre précis et décrivez votre besoin pour faciliter les échanges.</p></header><label for="request-title">Titre<input id="request-title" ref="titleInput" v-model="title" maxlength="160" required :disabled="busy" placeholder="Ex. Modifier le texte de la page d’accueil"></label><label for="request-description">Description<textarea id="request-description" v-model="body" rows="5" maxlength="10000" required :disabled="busy" placeholder="Décrivez votre demande et les informations utiles à l’équipe…"/></label><div class="rq-form-footer"><small>La demande sera partagée avec toute l’équipe du projet.</small><div><button type="button" class="rq-secondary" :disabled="busy" @click="cancelCreate">Annuler</button><button class="rq-primary" :disabled="busy||!title.trim()||!body.trim()">{{busy?'Création en cours…':'Créer la demande'}}</button></div></div></form>
      <div class="rq-toolbar"><div class="rq-filters" role="group" aria-label="Filtrer les demandes par statut"><button v-for="item in filters" :key="item.id" :aria-pressed="filter===item.id" :class="{active:filter===item.id}" @click="filter=item.id">{{item.label}}<span>{{item.count}}</span></button></div><label class="rq-search"><UIcon name="i-tabler-search"/><span class="rq-sr-only">Rechercher une demande</span><input v-model="search" type="search" placeholder="Rechercher une demande…"></label></div>
      <p v-if="listError" class="rq-error" role="alert">{{listError}} <button class="rq-secondary" :disabled="loading" @click="loadList">Réessayer</button></p>
      <p v-if="loading" class="rq-loading" role="status">Chargement des demandes…</p>
      <template v-else-if="!listError">
        <p v-if="!canCreate" class="rq-reader"><UIcon name="i-tabler-lock"/>Votre rôle de lecteur vous permet de consulter les demandes et les discussions.</p>
        <div v-if="!requests.length" class="rq-empty"><span><UIcon name="i-tabler-messages"/></span><h3>Aucune demande pour le moment</h3><p>{{canCreate?'Partagez une question ou un besoin avec l’équipe. Les échanges et leur statut seront regroupés ici.':'Les demandes de votre équipe et les réponses de MC Studio apparaîtront ici.'}}</p><button v-if="canCreate&&!creating" class="rq-primary" @click="startCreate"><UIcon name="i-tabler-plus"/>Créer une demande</button></div>
        <div v-else-if="!filtered.length" class="rq-empty"><UIcon name="i-tabler-search"/><h3>Aucune demande trouvée</h3><p>Essayez d’autres mots ou un autre statut.</p><button class="rq-secondary" @click="search='';filter='all'">Réinitialiser les filtres</button></div>
        <div v-else class="rq-list"><div class="rq-list-head" aria-hidden="true"><span>Demande</span><span>Statut</span><span>Discussion</span><span/></div><article v-for="item in filtered" :key="item.id" class="rq-row"><button class="rq-open" @click="openRequest(item.id)"><span class="rq-request-icon"><UIcon name="i-tabler-message-circle"/></span><span><strong>{{item.title}}</strong><span class="rq-excerpt">{{item.body}}</span><small>{{item.authorName}} <span>·</span> <time :datetime="item.createdAt" :title="timestamp(item.createdAt)">{{date(item.createdAt)}}</time></small></span></button><div><span :class="['rq-status',item.status]"><i/>{{statusLabel(item.status)}}</span></div><span class="rq-replies"><UIcon name="i-tabler-messages"/>{{item.messageCount}} réponse{{item.messageCount>1?'s':''}}</span><button class="rq-row-arrow" :aria-label="'Ouvrir la demande '+item.title" @click="openRequest(item.id)"><UIcon name="i-tabler-arrow-up-right"/></button></article></div>
        <p v-if="requests.length" class="rq-summary" aria-live="polite">{{filtered.length}} demande{{filtered.length>1?'s':''}} affichée{{filtered.length>1?'s':''}} sur {{requests.length}}</p>
      </template>
    </template>
  </section>
</template>

<style scoped>
.requests-panel{padding:32px;min-width:0;color:var(--portal-text);font:14px/1.5 Inter,Arial,sans-serif}
.requests-panel.embedded{padding:0}
.requests-panel *{box-sizing:border-box}.requests-panel h2,.requests-panel h3,.requests-panel h4{color:var(--portal-text);font-family:inherit;font-weight:600;letter-spacing:-.025em;margin:0}.requests-panel h2{font-size:26px}.requests-panel h3{font-size:20px}.requests-panel p{line-height:1.65}.requests-panel button,.requests-panel input,.requests-panel textarea{font:inherit}.requests-panel button{cursor:pointer}.requests-panel button:disabled{cursor:default;opacity:.5}.requests-panel :focus-visible{outline:2px solid var(--portal-accent);outline-offset:3px}.requests-panel .iconify{flex:none;font-size:18px}
.requests-heading{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:28px}.requests-heading p{color:var(--portal-muted);font-size:13px;margin:8px 0 0;max-width:650px}.requests-heading>button{flex:none}
.rq-primary,.rq-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:8px;padding:9px 14px;font-size:13px!important;font-weight:500;line-height:1.4}.rq-primary{background:var(--portal-accent);border:1px solid var(--portal-accent);color:var(--portal-accent-ink,#fff)}.rq-primary:hover:not(:disabled){background:var(--portal-accent-hover)}.rq-secondary{background:var(--portal-raised);border:1px solid var(--portal-line);color:var(--portal-text)}.rq-secondary:hover:not(:disabled){border-color:var(--portal-muted)}
.rq-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px}.rq-filters{display:flex;flex-wrap:wrap;gap:6px}.rq-filters button{display:flex;gap:8px;align-items:center;border:1px solid transparent;border-radius:8px;min-height:40px;background:transparent;color:var(--portal-muted);padding:8px 11px;font-size:13px}.rq-filters button:hover{background:var(--portal-raised)}.rq-filters button.active{color:var(--portal-accent-text);background:var(--portal-accent-soft);border-color:var(--portal-accent-line,var(--portal-line))}.rq-filters span{font-size:11px;padding:1px 6px;border-radius:5px;background:var(--portal-raised);font-variant-numeric:tabular-nums}.rq-search{display:flex;gap:9px;align-items:center;min-height:40px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);color:var(--portal-muted);padding:0 12px;width:280px}.rq-search:focus-within{outline:2px solid var(--portal-accent);outline-offset:2px}.rq-search input{background:none;border:0;outline:none!important;color:var(--portal-text);width:100%;min-width:0;font-size:13px}
.rq-list{border:1px solid var(--portal-line);border-radius:8px;overflow:hidden;background:var(--portal-surface)}.rq-list-head,.rq-row{display:grid;grid-template-columns:minmax(0,1fr) 100px 115px 34px;gap:20px;align-items:center;padding:16px 20px}.rq-list-head{background:var(--portal-raised);font-size:12px;color:var(--portal-muted)}.rq-row{border-top:1px solid var(--portal-line);min-height:112px}.rq-open{display:flex;gap:14px;align-items:flex-start;padding:0;background:none;border:0;text-align:left;color:var(--portal-text);min-width:0}.rq-open>span:last-child{min-width:0}.rq-open strong{display:block;font-size:14px;font-weight:500;overflow-wrap:anywhere}.rq-open:hover strong{color:var(--portal-accent-text)}.rq-request-icon{display:grid;place-items:center;width:36px;height:36px;flex:none;background:var(--portal-raised);border:1px solid var(--portal-line);border-radius:8px;color:var(--portal-muted)}.rq-excerpt{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;font-size:12px;color:var(--portal-muted);margin:4px 0 8px}.rq-open small{display:block;font-size:11px;color:var(--portal-muted);overflow-wrap:anywhere}.rq-open small>span{margin:0 5px}.rq-status{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-size:11px;padding:4px 8px;border-radius:6px;color:var(--portal-accent-text);background:var(--portal-accent-soft)}.rq-status i{width:5px;height:5px;border-radius:50%;background:currentColor}.rq-status.resolved{color:var(--portal-success);background:var(--portal-success-soft)}.rq-replies{display:flex;gap:7px;align-items:center;font-size:12px;color:var(--portal-muted)}.rq-replies .iconify{font-size:16px}.rq-row-arrow{display:grid;place-items:center;min-height:34px;width:34px;background:transparent;color:var(--portal-muted);border:1px solid var(--portal-line);border-radius:8px}.rq-row-arrow:hover{background:var(--portal-accent-soft);color:var(--portal-accent-text)}.rq-summary{font-size:12px;color:var(--portal-muted);margin:16px 0 0}
.rq-create,.rq-detail{padding:28px;border:1px solid var(--portal-line);background:var(--portal-surface);border-radius:8px;margin-bottom:28px}.rq-create header p{margin:8px 0 0;color:var(--portal-muted);font-size:13px}.rq-create label{display:grid;gap:8px;margin-top:24px;font-size:13px}.requests-panel input:not([type=search]),.requests-panel textarea{width:100%;min-height:44px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);color:var(--portal-text);padding:10px 12px;font-size:13px}.requests-panel textarea{resize:vertical;line-height:1.7}.rq-form-footer{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:24px}.rq-form-footer small{line-height:1.6;color:var(--portal-muted);font-size:12px}.rq-form-footer>div{display:flex;gap:8px;flex:none}.rq-back{display:inline-flex;align-items:center;gap:8px;background:none;border:0;color:var(--portal-muted);padding:0;min-height:40px;margin:0 0 16px;font-size:13px!important}.rq-back:hover{color:var(--portal-text)}.rq-detail-heading{display:flex;gap:24px;align-items:flex-start;justify-content:space-between;padding-bottom:24px;border-bottom:1px solid var(--portal-line)}.rq-detail-heading>div{min-width:0}.rq-detail-heading h3{font-size:24px;line-height:1.4;margin-top:12px;overflow-wrap:anywhere}.rq-detail-heading p{color:var(--portal-muted);font-size:12px;margin:10px 0 0}.rq-detail-heading p>span{margin:0 5px}.rq-detail-heading button{flex:none}.rq-body{white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;color:var(--portal-text);margin:24px 0}.rq-resolution{display:flex;gap:8px;align-items:flex-start;padding:12px 14px;background:var(--portal-success-soft);color:var(--portal-success);border-radius:8px;font-size:12px}.rq-discussion{margin-top:32px;border-top:1px solid var(--portal-line);padding-top:24px}.rq-discussion h4{font-size:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.rq-discussion>.rq-muted{margin:12px 0 0}.rq-discussion h4 span{font-weight:400;font-size:12px;letter-spacing:0;color:var(--portal-muted)}.rq-muted{color:var(--portal-muted);font-size:13px}.rq-messages{list-style:none;margin:24px 0 0;padding:0}.rq-messages li{display:flex;gap:12px;margin-top:24px}.rq-avatar{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:8px;background:var(--portal-accent-soft);color:var(--portal-accent-text);font-size:12px}.rq-messages article{flex:1;min-width:0}.rq-messages article header{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-height:32px}.rq-messages strong{font-size:13px;font-weight:500;overflow-wrap:anywhere}.rq-messages time{font-size:11px;color:var(--portal-muted);margin-left:auto}.rq-team{font-size:10px;padding:3px 6px;border-radius:4px;background:var(--portal-raised);color:var(--portal-muted)}.rq-messages .rq-body{margin:8px 0 0}.rq-messages .rq-event{align-items:flex-start;padding:12px 14px;border-radius:8px;background:var(--portal-raised);color:var(--portal-muted);font-size:12px}.rq-event p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.rq-event time{display:block;margin-top:5px!important}.rq-reply{border-top:1px solid var(--portal-line);margin-top:28px;padding-top:24px}.rq-reply label{display:block;font-size:13px;font-weight:500;margin-bottom:8px}
.rq-reader{display:flex;align-items:flex-start;gap:8px;color:var(--portal-muted);font-size:12px;padding:14px 16px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface);margin:18px 0}.rq-detail>.rq-reader{margin-bottom:0}.rq-loading{padding:28px 0;color:var(--portal-muted);font-size:13px}.rq-error,.rq-success{margin:0 0 24px;padding:14px 16px;border:1px solid var(--portal-danger);background:var(--portal-danger-soft);color:var(--portal-danger);border-radius:8px;font-size:13px;overflow-wrap:anywhere}.rq-error button{margin-left:8px}.rq-success{border-color:var(--portal-success);background:var(--portal-success-soft);color:var(--portal-success)}.rq-empty{text-align:center;border:1px dashed var(--portal-line);border-radius:8px;padding:48px 24px;background:var(--portal-surface)}.rq-empty>span{display:inline-grid;place-items:center;width:52px;height:52px;border-radius:12px;background:var(--portal-accent-soft);color:var(--portal-accent-text);margin-bottom:20px}.rq-empty>.iconify{font-size:28px;color:var(--portal-muted);margin-bottom:20px}.rq-empty h3{font-size:17px}.rq-empty p{max-width:440px;margin:10px auto 20px;font-size:13px;color:var(--portal-muted)}.rq-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:1000px){.rq-list-head,.rq-row{grid-template-columns:minmax(0,1fr) 100px 34px;gap:14px}.rq-list-head>span:nth-child(3){display:none}.rq-replies{grid-column:1;grid-row:2;padding-left:50px}.rq-row-arrow{grid-column:3;grid-row:1}.rq-row{row-gap:10px}.rq-detail-heading{flex-direction:column;gap:18px}.rq-toolbar{flex-wrap:wrap}.rq-search{flex:1;min-width:220px}.rq-form-footer{flex-wrap:wrap}}
@media(max-width:650px){.requests-panel{padding:24px 16px}.requests-panel.embedded{padding:0}.requests-heading{align-items:flex-start;flex-direction:column;gap:18px;margin-bottom:24px}.requests-panel h2{font-size:24px}.rq-toolbar{gap:14px}.rq-filters{width:100%;gap:4px}.rq-filters button{padding:8px 9px;font-size:12px}.rq-search{width:100%;min-width:0}.rq-list-head{display:none}.rq-row{grid-template-columns:minmax(0,1fr) 34px;padding:20px 16px}.rq-row:first-child{border-top:0}.rq-open{grid-column:1/-1;gap:10px}.rq-request-icon{width:32px;height:32px}.rq-row>div{grid-column:1;grid-row:2;padding-left:42px}.rq-replies{grid-column:1;grid-row:3;padding-left:42px}.rq-row-arrow{grid-column:2;grid-row:2/4}.rq-create,.rq-detail{padding:22px 16px}.rq-detail-heading h3{font-size:21px}.rq-messages time{margin-left:0;width:100%}.rq-messages article header{gap:6px}.rq-form-footer{gap:14px}.rq-form-footer>div{width:100%;flex-wrap:wrap}.rq-form-footer>div button{flex:1}.rq-form-footer>.rq-primary{width:100%}.rq-empty{padding:40px 20px}.rq-empty .rq-primary{font-size:12px!important}}
</style>
