<script setup lang="ts">
import { resourceLabels, resourceIcons, money, portalDate, type PortalResource, type ResourceKind, type PortalMember } from '~/types/portal'
import { PORTAL_FILE_MAX_BYTES } from '#shared/portal-upload'
const props = defineProps<{projectId:string; kind?:ResourceKind|'assets'|'satisfaction'|'requests'; initialKind?:ResourceKind|'assets'|'satisfaction'|'requests'; admin?:boolean;canContribute?:boolean;canReview?:boolean;members?:PortalMember[]}>()
const canWrite = computed(()=>Boolean(props.admin || props.canContribute))
const canValidate = computed(()=>Boolean(props.admin || props.canReview))
const emit = defineEmits<{changed:[]}>()
const resources = ref<PortalResource[]>([])
type ReviewDecision={id:string;resourceId:string;versionId:string|null;state:string;feedback:string;author:string;createdAt:string}
const reviewHistory=ref<ReviewDecision[]>([])
const activity = ref<{id:string;message:string;createdAt:string}[]>([])
type FileRequest={id:string;projectId:string;title:string;description:string;status:'open'|'fulfilled';resourceId?:string|null;fileName?:string|null;createdAt:string;fulfilledAt?:string|null;createdBy:string;responsibleId?:string;responsibleName?:string;dueDate?:string;uploadedBy?:string|null}
const fileRequests=ref<FileRequest[]>([]),showFileRequestForm=ref(false),requestTitle=ref(''),requestDescription=ref(''),requestResponsible=ref(''),requestDueDate=ref('')
const activeKind = ref<ResourceKind|'assets'|'satisfaction'|'requests'>(props.initialKind || 'payment')
watch(()=>props.initialKind,value=>{if(value)activeKind.value=value})
const kind = computed(() => props.kind || activeKind.value)
const items = computed(() => resources.value.filter(r=>r.kind===kind.value && (r.kind!=='mockup' || Number(r.versionCount || 0)===0)))
const loading = ref(true), busy = ref(false), error = ref(''), success = ref(''), search = ref('')
const { uploading, progress: uploadProgress, processing: uploadProcessing, send: sendUpload, reset: resetUpload } = usePortalUpload()
const uploadProjectId = ref('')
const projectUploading = computed(()=>uploading.value && uploadProjectId.value===props.projectId)
const filtered = computed(() => items.value.filter(r=>(r.title+' '+r.description+' '+r.content).toLowerCase().includes(search.value.toLowerCase())))
const editing = ref(false), editingId = ref(''), reading = ref<PortalResource|null>(null), reviewing = ref<PortalResource|null>(null), feedback = ref('')
const emptyForm = () => ({title:'',description:'',url:'',content:'',amount:0,status:'available',dueDate:'',global:false})
const form = reactive(emptyForm())
const load = async () => {
 if (!props.projectId) return
 loading.value=true; error.value=''
 try { const [data,requests]=await Promise.all([ $fetch<{resources:PortalResource[];activity:typeof activity.value;reviewHistory:ReviewDecision[]}>('/api/portal/resources',{query:{projectId:props.projectId}}), kind.value==='file'?$fetch<{requests:FileRequest[]}>('/api/portal/files/requests',{query:{projectId:props.projectId}}):Promise.resolve({requests:[] as FileRequest[]}) ]); resources.value=data.resources; activity.value=data.activity;reviewHistory.value=data.reviewHistory || [];fileRequests.value=requests.requests }
 catch(e:any){error.value=e?.data?.statusMessage || 'Impossible de charger les ressources.'}
 finally{loading.value=false}
}
watch(()=>props.projectId, load, {immediate:true})
watch(kind,()=>{search.value='';editing.value=false;reading.value=null;reviewing.value=null;error.value='';success.value='';showFileRequestForm.value=false;load()})
const createFileRequest=async()=>{
 busy.value=true;error.value='';success.value=''
 try{await $fetch('/api/portal/files/requests',{method:'POST',body:{projectId:props.projectId,title:requestTitle.value,description:requestDescription.value,responsibleId:requestResponsible.value || null,dueDate:requestDueDate.value}});requestTitle.value='';requestDescription.value='';requestResponsible.value='';requestDueDate.value='';showFileRequestForm.value=false;await load();success.value='La demande a été envoyée au client.'}
 catch(e:any){error.value=e?.data?.statusMessage||'Impossible de créer la demande.'}finally{busy.value=false}
}
const edit = (r?:PortalResource) => {
 editingId.value=r?.id || ''; Object.assign(form,emptyForm(),r || {}, {amount:(r?.amount || 0)/100,global:r ? r.projectId===null : false,status:r?.status || (kind.value==='payment'?'due':kind.value==='mockup'?'pending':'available')});editing.value=true
}
const save = async () => {
 busy.value=true;error.value=''
 try {
  await $fetch(editingId.value?`/api/portal/resources/${editingId.value}`:'/api/portal/resources',{method:editingId.value?'PATCH':'POST',body:{...form,kind:kind.value,projectId:props.projectId,amount:Math.round(Number(form.amount)*100)}})
  editing.value=false;success.value='Ressource enregistrée.';await load();emit('changed')
 }catch(e:any){error.value=e?.data?.statusMessage || 'Enregistrement impossible.'}finally{busy.value=false}
}
const archiveTarget = ref<PortalResource|null>(null)
const deleteTarget = ref<PortalResource|null>(null)
const removeTarget = ref<PortalResource|null>(null)
const dialogPanel = ref<HTMLElement|null>(null)
let previousFocus: HTMLElement|null = null
watch(() => Boolean(reading.value || reviewing.value || archiveTarget.value || removeTarget.value), async open => {
 if (open) { previousFocus=document.activeElement as HTMLElement; await nextTick(); dialogPanel.value?.focus() }
 else previousFocus?.focus()
})
watch(() => Boolean(deleteTarget.value), async open => {
 if (open) { previousFocus=document.activeElement as HTMLElement; await nextTick(); dialogPanel.value?.focus() }
 else previousFocus?.focus()
})
const trapFocus = (event:KeyboardEvent) => {
 if(event.key!=='Tab')return
 const elements=dialogPanel.value?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],textarea,input,select')
 if(!elements?.length){event.preventDefault();return}
 const first=elements[0]!,last=elements[elements.length-1]!
 if(event.shiftKey && (document.activeElement===first || document.activeElement===dialogPanel.value)){event.preventDefault();last.focus()}
 else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus()}
}

const archive = async () => {
 if(!archiveTarget.value)return
 busy.value=true
 try{await $fetch(`/api/portal/resources/${archiveTarget.value.id}`,{method:'PATCH',body:{archived:true}});archiveTarget.value=null;await load();emit('changed')}
 catch(e:any){error.value=e?.data?.statusMessage || 'Archivage impossible.'}finally{busy.value=false}
}
const deleteFile = async () => {
 if(!deleteTarget.value || !canWrite.value)return
 busy.value=true;error.value=''
 try{await $fetch(`/api/portal/files/${deleteTarget.value.id}`,{method:'DELETE'});deleteTarget.value=null;success.value='Fichier supprimé.';await load();emit('changed')}
 catch(e:any){error.value=e?.data?.statusMessage || 'Suppression impossible.'}finally{busy.value=false}
}
const removeResource = async () => {
 if(!removeTarget.value)return
 busy.value=true;error.value=''
 try{await $fetch(`/api/portal/resources/${removeTarget.value.id}`,{method:'DELETE'});removeTarget.value=null;success.value='Ressource supprimée.';await load();emit('changed')}
 catch(e:any){error.value=e?.data?.statusMessage || 'Suppression impossible.'}finally{busy.value=false}
}
const upload = async (event:Event,requestId='') => {
 const input=event.target as HTMLInputElement, file=input.files?.[0];if(!file || !canWrite.value)return
 if(busy.value)return
 if(!file.size || file.size>PORTAL_FILE_MAX_BYTES){error.value=!file.size?'Choisissez un fichier non vide.':'Le fichier dépasse la limite de 50 Mo.';input.value='';return}
 const projectId=props.projectId
 uploadProjectId.value=projectId
 busy.value=true;error.value='';success.value=''
 try{
  const body=new FormData();body.append('file',file);if(requestId)body.append('requestId',requestId)
  await sendUpload(`/api/portal/files?${new URLSearchParams({projectId})}`,body)
  if(props.projectId!==projectId)return
  await load()
  if(props.projectId!==projectId)return
  success.value=requestId?'Fichier envoyé pour la demande.':'Fichier déposé.'
  if(error.value)error.value='Le fichier est enregistré, mais la liste n’a pas pu être actualisée. Actualisez la page.'
  emit('changed')
 }
 catch(e:any){if(props.projectId===projectId)error.value=e?.data?.statusMessage || 'Le dépôt a échoué. Vérifiez la liste avant de réessayer.'}
 finally{busy.value=false;input.value='';resetUpload()}
}
const review = async (state:'approved'|'changes') => {
 if(!reviewing.value || !canValidate.value)return
 busy.value=true;error.value=''
 try{await $fetch('/api/portal/client/review',{method:'POST',body:{projectId:props.projectId,resourceId:reviewing.value.id,state,feedback:feedback.value}});reviewing.value=null;feedback.value='';await load();success.value='Votre retour a été transmis à MC Studio.';emit('changed')}
 catch(e:any){error.value=e?.data?.statusMessage || 'Retour non enregistré.'}finally{busy.value=false}
}
const labels:Record<string,string>={due:'À régler',paid:'Réglé',cancelled:'Annulé',available:'Disponible',pending:'Votre avis est attendu',approved:'Validée',changes:'Modifications demandées'}
</script>
<template>
 <section class="pr">
  <nav v-if="admin" class="pr-tabs" aria-label="Ressources du client"><button v-for="(label,key) in resourceLabels" :key="key" :class="{active:kind===key}" @click="activeKind=key"><UIcon :name="resourceIcons[key]"/>{{label}}</button><button :class="{active:kind==='assets'}" @click="activeKind='assets'"><UIcon name="i-tabler-photo"/>Assets</button><button :class="{active:kind==='requests'}" @click="activeKind='requests'"><UIcon name="i-tabler-messages"/>Demandes</button><button :class="{active:kind==='satisfaction'}" @click="activeKind='satisfaction'"><UIcon name="i-tabler-heart-handshake"/>Satisfaction</button></nav>
  <PortalSatisfaction v-if="kind==='satisfaction'" :project-id="projectId" :admin="admin" @changed="emit('changed')"/>
  <PortalRequests v-else-if="kind==='requests'" :project-id="projectId" :admin="admin" @changed="emit('changed')"/>
  <PortalAssets v-else-if="kind==='assets'" :project-id="projectId" :admin="admin"/>
  <template v-else>
  <PortalMockups v-if="kind==='mockup'" :project-id="projectId" :admin="admin" :can-contribute="canWrite" :can-review="canValidate" @changed="load();emit('changed')"/>
  <section v-if="kind==='mockup' && reviewHistory.length" class="pr-review-history"><h3>Historique des décisions</h3><article v-for="decision in reviewHistory" :key="decision.id"><div><strong>{{decision.state==='approved'?'Validation':'Modifications demandées'}}</strong><span>{{resources.find(resource=>resource.id===decision.resourceId)?.title || 'Maquette'}}</span></div><p>{{decision.author}} · {{portalDate(decision.createdAt)}}</p><p v-if="decision.feedback">{{decision.feedback}}</p></article></section><template v-if="kind!=='mockup' || items.length">
  <div class="pr-heading"><div><h2>{{resourceLabels[kind]}}</h2><p>{{kind==='payment'?'Vos échéances et liens de règlement.':kind==='file'?'Les fichiers partagés et les éléments demandés par MC Studio.':kind==='wiki'?'Les guides pour avancer sereinement avec MC Studio.':kind==='analytics'?'Les performances de votre site, au même endroit.':'Tout ce dont vous avez besoin pour votre projet.'}}</p></div><div v-if="admin" class="pr-heading-actions"><button v-if="kind==='file'" class="pr-secondary" @click="showFileRequestForm=!showFileRequestForm"><UIcon name="i-tabler-file-plus"/>Demander un fichier</button><button class="pr-primary" @click="edit()"><UIcon name="i-tabler-plus"/>Ajouter</button></div></div>
  <p v-if="error" class="pr-error" role="alert">{{error}}</p><p v-if="success" class="pr-success" role="status">{{success}}</p>
  <form v-if="kind==='file' && admin && showFileRequestForm" class="pr-editor" @submit.prevent="createFileRequest"><header><h3>Demander un fichier au client</h3><p>Le client recevra une demande avec un bouton pour déposer directement son fichier dans ce projet.</p></header><label>Fichier attendu<input v-model="requestTitle" required maxlength="160" placeholder="Ex. Logo en haute définition"></label><label>Consigne<textarea v-model="requestDescription" rows="3" maxlength="1000" placeholder="Format souhaité, dimensions ou informations utiles…"/></label><div class="pr-fields"><label>Responsable<select v-model="requestResponsible"><option value="">Équipe client</option><option v-for="member in (members || []).filter(m=>!m.suspended && m.memberRole!=='viewer')" :key="member.id" :value="member.id">{{member.name}}</option></select></label><label>Date attendue<input v-model="requestDueDate" type="date"></label></div><div class="pr-actions"><button type="button" class="pr-secondary" @click="showFileRequestForm=false">Annuler</button><button class="pr-primary" :disabled="busy">{{busy?'Envoi…':'Envoyer la demande'}}</button></div></form>
  <form v-if="editing" class="pr-editor" @submit.prevent="save">
   <h3>{{editingId?'Modifier la ressource':'Nouvelle ressource'}}</h3>
   <label>Titre<input v-model="form.title" required maxlength="160" placeholder="Ex. Acompte de lancement"></label>
   <label>Description<textarea v-model="form.description" rows="2" maxlength="3000" placeholder="Les informations utiles au client"/></label>
   <label>Lien HTTPS<input v-model="form.url" type="url" placeholder="https://…" :required="kind==='payment' && form.status==='due'"></label>
   <label v-if="kind==='wiki'">Article<textarea v-model="form.content" rows="10" maxlength="40000" placeholder="Rédigez votre guide ici…"/></label>
   <label v-if="kind==='analytics'">Identifiant de propriété GA4<input v-model="form.content" inputmode="numeric" pattern="[0-9]*" placeholder="Ex. 123456789"><small>Pour afficher les chiffres ici, le compte de service Google configuré sur le serveur doit avoir accès à cette propriété.</small></label>
   <div v-if="kind==='payment'" class="pr-fields"><label>Montant (€)<input v-model="form.amount" type="number" min="0" max="1000000" step="0.01" required></label><label>Échéance<input v-model="form.dueDate" type="date"></label></div>
   <label v-if="kind==='payment' || kind==='mockup'">Statut<select v-model="form.status"><template v-if="kind==='payment'"><option value="due">À régler</option><option value="paid">Réglé — confirmé par MC Studio</option><option value="cancelled">Annulé</option></template><template v-else><option value="pending">Avis attendu</option><option value="available">Disponible</option><option value="approved">Validée</option><option value="changes">Modifications demandées</option></template></select></label>
   <label v-if="kind==='wiki' && !editingId" class="pr-checkbox"><input v-model="form.global" type="checkbox">Partager cet article avec tous les clients</label>
   <div class="pr-actions"><button type="button" class="pr-secondary" @click="editing=false">Annuler</button><button class="pr-primary" :disabled="busy">{{busy?'Enregistrement…':'Enregistrer'}}</button></div>
  </form>
  <p v-if="!canWrite && !admin" class="pr-reader-note">Votre accès est en lecture seule. Vous pouvez consulter et télécharger les ressources du projet.</p><label v-if="kind==='file' && canWrite" class="pr-upload"><UIcon name="i-tabler-cloud-upload"/><strong>{{projectUploading?'Dépôt en cours…':'Déposer un fichier'}}</strong><span>50 Mo par fichier · 500 Mo de stockage par projet</span><input type="file" :disabled="busy" aria-label="Choisir un fichier à déposer" @change="upload"></label>
  <div v-if="kind==='file' && projectUploading" class="pr-upload-progress" role="status" aria-live="polite"><span>{{uploadProcessing?'Transfert terminé · enregistrement du fichier…':uploadProgress===null?'Préparation du transfert…':`Transfert : ${uploadProgress} %`}}</span><progress :value="uploadProgress ?? undefined" max="100" aria-label="Progression du transfert du fichier"/></div>
  <section v-if="kind==='file' && fileRequests.length" class="pr-file-requests"><div class="pr-request-heading"><h3>Demandes de fichiers</h3><span>{{fileRequests.filter(request=>request.status==='open').length}} en attente</span></div><article v-for="request in fileRequests" :key="request.id" class="pr-file-request"><div class="pr-request-copy"><div><h4>{{request.title}}</h4><span :class="['pr-request-status',request.status]">{{request.status==='open'?'À envoyer':'Reçu'}}</span></div><p v-if="request.description">{{request.description}}</p><small v-if="request.responsibleName || request.dueDate">{{request.responsibleName || 'Équipe client'}} · {{portalDate(request.dueDate || '')}}</small><small v-if="request.status==='fulfilled'">{{request.uploadedBy||'Client'}} · {{request.fileName||'Fichier envoyé'}}</small></div><label v-if="!admin && canWrite && request.status==='open'" class="pr-request-file"><UIcon name="i-tabler-cloud-upload"/><span>{{busy?'Envoi…':'Choisir le fichier'}}</span><input type="file" :disabled="busy" :aria-label="'Envoyer le fichier demandé : '+request.title" @change="upload($event,request.id)"></label><small v-else-if="admin && request.status==='open'" class="pr-request-meta">Demande envoyée le {{portalDate(request.createdAt)}}</small></article></section>
  <div v-if="kind==='payment' && items.length" class="pr-money"><div><span>À régler</span><strong>{{money(items.filter(r=>r.status==='due').reduce((s,r)=>s+r.amount,0))}}</strong></div><div><span>Déjà réglé</span><strong>{{money(items.filter(r=>r.status==='paid').reduce((s,r)=>s+r.amount,0))}}</strong></div><p>Le statut est confirmé par MC Studio après réception du règlement.</p></div>
  <div class="pr-toolbar"><span>{{items.length}} ressource{{items.length>1?'s':''}}</span><label class="pr-search-box"><UIcon name="i-tabler-search"/><input v-model="search" class="pr-search" aria-label="Rechercher une ressource" placeholder="Rechercher…"></label></div>
  <p v-if="loading" role="status">Chargement…</p>
  <div v-else-if="!filtered.length" class="pr-empty"><UIcon :name="resourceIcons[kind]"/><h3>{{search?'Aucun résultat':'Tout sera réuni ici.'}}</h3><p>{{search?'Essayez un autre mot-clé.':admin?'Ajoutez la première ressource de cette rubrique.':'MC Studio ajoutera les ressources au fil du projet.'}}</p></div>
  <div v-else class="pr-grid">
   <div class="pr-list-head"><span>Nom</span><span>Statut</span><span>{{kind==='payment'?'Montant / échéance':'Date d’ajout'}}</span><span>Actions</span></div>
   <article v-for="r in filtered" :key="r.id" class="pr-card">
    <div class="pr-resource-name"><UIcon :name="resourceIcons[r.kind]"/><div><h3>{{r.title}}</h3><p v-if="r.description" class="pr-description">{{r.description}}</p><p v-if="r.fileName" class="pr-meta">{{(r.fileSize/1024/1024).toFixed(2)}} Mo</p></div></div>
    <div><span :class="['pr-badge',r.status]">{{r.projectId===null?'Guide commun':labels[r.status]}}</span></div>
    <div class="pr-date"><template v-if="r.kind==='payment'"><strong class="pr-amount">{{money(r.amount)}}</strong><small>{{portalDate(r.dueDate)}}</small></template><template v-else>{{portalDate(r.createdAt)}}</template></div>
    <div class="pr-actions">
     <a v-if="r.fileName" class="pr-secondary" :href="`/api/portal/files/${r.id}`" :aria-label="'Télécharger '+r.title"><UIcon name="i-tabler-download"/>Télécharger</a>
     <a v-if="r.url && !(r.kind==='payment' && r.status!=='due')" :class="r.kind==='payment'?'pr-primary':'pr-secondary'" :href="r.url" target="_blank" rel="noopener noreferrer">{{r.kind==='payment'?'Régler':'Ouvrir'}}<UIcon name="i-tabler-arrow-up-right"/></a>
     <button v-if="r.kind==='wiki' && r.content" class="pr-secondary" @click="reading=r">Lire<UIcon name="i-tabler-arrow-up-right"/></button>
     <button v-if="r.kind==='mockup' && !admin && canValidate" class="pr-primary" @click="reviewing=r;feedback=''">Donner mon avis</button>
     <template v-if="admin"><button class="pr-icon-button" :aria-label="'Modifier '+r.title" @click="edit(r)"><UIcon name="i-tabler-pencil"/></button><button v-if="r.kind==='file'" class="pr-icon-button pr-delete-button" :aria-label="'Supprimer '+r.title" @click="deleteTarget=r"><UIcon name="i-tabler-trash"/></button><button v-else class="pr-icon-button pr-delete-button" :aria-label="'Supprimer '+r.title" @click="removeTarget=r"><UIcon name="i-tabler-trash"/></button></template>
     <button v-else-if="r.kind==='file' && canWrite && r.canDelete" class="pr-icon-button pr-delete-button" :aria-label="'Supprimer '+r.title" @click="deleteTarget=r"><UIcon name="i-tabler-trash"/></button>
    </div>
    <div v-if="r.kind==='analytics' && r.content" class="pr-analytics"><PortalAnalytics :resource-id="r.id"/></div>
   </article>
  </div>
  <section v-if="admin && activity.length" class="pr-journal"><h3>Journal du projet</h3><article v-for="event in activity.slice(0,12)" :key="event.id"><p>{{event.message}}</p><time>{{portalDate(event.createdAt)}}</time></article></section>
  <div v-if="reading || reviewing || archiveTarget || deleteTarget || removeTarget" class="pr-modal-backdrop" @click.self="reading=null;reviewing=null;archiveTarget=null;deleteTarget=null;removeTarget=null" @keydown.esc="reading=null;reviewing=null;archiveTarget=null;deleteTarget=null;removeTarget=null">
   <section ref="dialogPanel" class="pr-modal" @keydown="trapFocus" role="dialog" aria-modal="true" :aria-label="reading?.title || reviewing?.title || (deleteTarget ? 'Supprimer le fichier' : removeTarget ? 'Supprimer la ressource' : 'Archiver la ressource')" tabindex="-1">
    <p v-if="error && (archiveTarget || deleteTarget || removeTarget)" class="pr-error" role="alert">{{error}}</p>
    <button class="pr-close" aria-label="Fermer" @click="reading=null;reviewing=null;archiveTarget=null;deleteTarget=null;removeTarget=null">×</button>
    <template v-if="reading"><h2>{{reading.title}}</h2><p>{{reading.description}}</p><div class="pr-article">{{reading.content}}</div></template>
    <template v-if="reviewing"><h2>{{reviewing.title}}</h2><a v-if="reviewing.url" :href="reviewing.url" target="_blank" rel="noopener noreferrer" class="pr-secondary">Ouvrir la maquette ↗</a><label>Vos remarques<textarea v-model="feedback" rows="6" maxlength="3000" placeholder="Indiquez les éléments à ajuster…"/></label><p v-if="error" role="alert" class="pr-error">{{error}}</p><div class="pr-actions"><button class="pr-secondary" :disabled="busy || !feedback.trim()" @click="review('changes')">Demander des modifications</button><button class="pr-primary" :disabled="busy" @click="review('approved')">Valider la maquette</button></div></template>
    <template v-if="archiveTarget"><h2>Archiver « {{archiveTarget.title}} » ?</h2><p>Cette ressource sera masquée dans l’espace client. Son contenu est conservé.</p><div class="pr-actions"><button class="pr-secondary" @click="archiveTarget=null">Annuler</button><button class="pr-primary" :disabled="busy" @click="archive">Archiver</button></div></template>
    <template v-if="deleteTarget"><h2>Supprimer « {{deleteTarget.title}} » ?</h2><p>Le fichier et son contenu seront définitivement supprimés du projet. Cette action est irréversible.</p><div class="pr-actions"><button class="pr-secondary" :disabled="busy" @click="deleteTarget=null">Annuler</button><button class="pr-danger" :disabled="busy" @click="deleteFile"><UIcon name="i-tabler-trash"/>{{busy?'Suppression…':'Supprimer définitivement'}}</button></div></template>
    <template v-if="removeTarget"><h2>Supprimer « {{removeTarget.title}} » ?</h2><p>Cette ressource et son contenu seront définitivement supprimés{{removeTarget.kind==='mockup'?' avec ses versions, écrans et commentaires':''}}. Cette action est irréversible.</p><div class="pr-actions"><button class="pr-secondary" :disabled="busy" @click="removeTarget=null">Annuler</button><button class="pr-danger" :disabled="busy" @click="removeResource"><UIcon name="i-tabler-trash"/>{{busy?'Suppression…':'Supprimer définitivement'}}</button></div></template>
   </section>
  </div>
  </template>
  </template>
 </section>
</template>
<style scoped>
.pr{color:var(--portal-text);font:14px/1.5 Inter,Arial,sans-serif;min-width:0}
.pr *{box-sizing:border-box}
.pr button,.pr input,.pr textarea,.pr select{font:inherit}
.pr button,.pr a{cursor:pointer}
.pr h2,.pr h3{font-family:inherit;color:var(--portal-text);font-weight:600;letter-spacing:-.025em}
.pr h2{font-size:26px;margin:0 0 8px}
.pr h3{font-size:16px;margin:0 0 12px}
.pr p{color:var(--portal-muted);font-size:13px;line-height:1.6}
.pr button:disabled{opacity:.5;cursor:default}
.pr :focus-visible{outline:2px solid var(--portal-accent);outline-offset:3px}
.pr-tabs{display:flex;flex-wrap:wrap;gap:8px;border-bottom:1px solid var(--portal-line);padding-bottom:20px;margin-bottom:28px}
.pr-tabs button{display:flex;gap:8px;align-items:center;min-height:40px;padding:8px 12px;background:transparent;border:1px solid transparent;color:var(--portal-muted);border-radius:8px;font-size:13px}
.pr-tabs button:hover{background:var(--portal-raised);color:var(--portal-text)}
.pr-tabs button.active{color:var(--portal-accent-text);background:var(--portal-accent-soft)}
.pr-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}
.pr-heading p{margin:0;max-width:640px}
.pr-heading-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pr-primary,.pr-secondary,.pr-danger{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:9px 14px;border-radius:8px;text-decoration:none;font-size:13px!important;font-weight:500;line-height:1.4}
.pr-primary{background:var(--portal-accent);border:1px solid var(--portal-accent);color:var(--portal-accent-ink,#fff)!important}
.pr-primary:hover{background:var(--portal-accent-hover)}
.pr-secondary{background:var(--portal-raised);border:1px solid var(--portal-line);color:var(--portal-text)!important}
.pr-secondary:hover{border-color:var(--portal-muted)}
.pr-danger{background:var(--portal-danger-soft);border:1px solid var(--portal-danger);color:var(--portal-danger)}
.pr-danger:hover{background:var(--portal-danger);color:var(--portal-bg)}
.pr-icon-button{display:inline-grid;place-items:center;min-width:36px;height:40px;padding:0;border:1px solid var(--portal-line);background:var(--portal-raised);border-radius:8px;color:var(--portal-muted);font-size:17px!important}
.pr-delete-button{color:var(--portal-danger)!important}
.pr-delete-button:hover{background:var(--portal-danger-soft)}
.pr-toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:24px 0 16px;color:var(--portal-muted);font-size:12px}
.pr label.pr-search-box{display:flex;align-items:center;gap:8px;margin:0;padding:0 12px;min-height:40px;max-width:280px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised)}
.pr-search-box:focus-within{outline:2px solid var(--portal-accent);outline-offset:2px}
.pr-search{width:100%;min-width:0;padding:0;background:none;border:0;color:var(--portal-text);font-size:13px!important;outline:none!important}
.pr-grid{border:1px solid var(--portal-line);border-radius:8px;overflow:hidden;background:var(--portal-surface)}
.pr-list-head,.pr-card{display:grid;grid-template-columns:minmax(180px,1fr) minmax(100px,.55fr) minmax(110px,.5fr) minmax(120px,auto);gap:20px;align-items:center;padding:18px 20px;border-bottom:1px solid var(--portal-line)}
.pr-list-head{font-size:12px;color:var(--portal-muted);background:var(--portal-raised);font-weight:500}
.pr-list-head>:last-child{text-align:right}
.pr-card{min-height:90px}
.pr-card:last-child{border-bottom:0}
.pr-resource-name{display:flex;gap:12px;align-items:flex-start;min-width:0}
.pr-resource-name>.iconify{font-size:21px;color:var(--portal-muted);margin-top:3px;flex:none}
.pr-resource-name>div{min-width:0}
.pr-card h3{font-size:14px;font-weight:500;margin:0 0 4px;overflow-wrap:anywhere}
.pr-description{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px!important}
.pr-meta{font-size:11px!important;margin:4px 0 0;overflow-wrap:anywhere}
.pr-badge{display:inline-flex;font-size:11px;font-weight:500;padding:4px 8px;border-radius:6px;color:var(--portal-info);background:var(--portal-info-soft);max-width:100%}
.pr-badge.paid,.pr-badge.approved{color:var(--portal-success);background:var(--portal-success-soft)}
.pr-badge.due,.pr-badge.pending{color:var(--portal-warning);background:var(--portal-warning-soft)}
.pr-badge.changes,.pr-badge.cancelled{color:var(--portal-danger);background:var(--portal-danger-soft)}
.pr-date{font-size:12px;color:var(--portal-muted)}
.pr-amount{display:block;font-size:17px;font-weight:500;color:var(--portal-text);font-variant-numeric:tabular-nums}
.pr-date small{display:block;margin-top:4px;font-size:11px}
.pr-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:flex-end;margin-top:20px}
.pr-card>.pr-actions{margin:0}
.pr-analytics{grid-column:1/-1;min-width:0}
.pr-empty{padding:48px 24px;text-align:center;background:var(--portal-surface);border:1px dashed var(--portal-line);border-radius:8px}
.pr-empty>.iconify{font-size:32px;color:var(--portal-muted)}
.pr-empty h3{margin:16px 0 8px}
.pr-empty p{margin-bottom:0}
.pr-money{display:flex;gap:48px;align-items:center;flex-wrap:wrap;padding:24px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface);margin-bottom:24px}
.pr-money span{display:block;font-size:12px;color:var(--portal-muted)}
.pr-money strong{display:block;font-size:30px;letter-spacing:-.03em;font-weight:600;margin-top:6px;font-variant-numeric:tabular-nums}
.pr-money>div:first-child strong{color:var(--portal-warning)}
.pr-money>div:nth-child(2) strong{color:var(--portal-success)}
.pr-money p{font-size:12px;max-width:260px;margin:0 0 0 auto}
.pr-upload{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;padding:32px;border:1px dashed var(--portal-line);background:var(--portal-surface);border-radius:8px;margin-bottom:24px}
.pr-upload:hover{border-color:var(--portal-accent);background:var(--portal-accent-soft)}
.pr-upload>.iconify{font-size:28px;color:var(--portal-accent-text)}
.pr-upload strong{font-size:14px;font-weight:500}
.pr-upload span{font-size:12px;color:var(--portal-muted)}
.pr-upload input,.pr-request-file input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.pr-upload:focus-within,.pr-request-file:focus-within{outline:2px solid var(--portal-accent);outline-offset:3px}
.pr-upload-progress{display:grid;gap:8px;margin:-8px 0 24px;font-size:12px;color:var(--portal-muted)}
.pr-upload-progress progress{width:100%;height:6px;accent-color:var(--portal-accent)}
.pr-reader-note{font-size:12px;color:var(--portal-muted);padding:14px 16px;border:1px solid var(--portal-line);border-radius:8px;margin:16px 0;background:var(--portal-surface)}
.pr-editor{display:grid;gap:24px;padding:24px;border:1px solid var(--portal-line);background:var(--portal-surface);border-radius:8px;margin-bottom:24px}
.pr label:not(.pr-upload,.pr-search-box,.pr-request-file){display:grid;gap:8px;margin-top:24px;font-size:13px}
.pr label small{line-height:1.6;color:var(--portal-muted);font-size:12px}
.pr-editor input,.pr-editor textarea,.pr-editor select,.pr-modal textarea{width:100%;min-height:44px;min-width:0;background:var(--portal-raised);border:1px solid var(--portal-line);color:var(--portal-text);border-radius:8px;padding:10px 12px;outline-offset:3px}
.pr textarea{resize:vertical;line-height:1.6}
.pr-editor>h3{margin:0}
.pr-editor>header h3{margin:0 0 8px}
.pr-editor>header p{margin:0}
.pr-editor label:not(.pr-upload,.pr-search-box,.pr-request-file){margin:0}
.pr-editor>.pr-actions{margin:0}
.pr-editor .pr-primary,.pr-editor .pr-secondary,.pr-modal .pr-primary,.pr-modal .pr-secondary,.pr-modal .pr-danger{min-height:44px}
.pr-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start}
.pr label.pr-checkbox{display:flex!important;align-items:center}
.pr-checkbox input{width:16px;min-height:16px;flex:none;accent-color:var(--portal-accent)}
.pr-error,.pr-success{margin:0 0 24px;padding:14px 16px;border:1px solid var(--portal-danger);background:var(--portal-danger-soft);border-radius:8px;color:var(--portal-danger)!important;font-size:13px}
.pr-success{border-color:var(--portal-success);background:var(--portal-success-soft);color:var(--portal-success)!important}
.pr-modal-backdrop{position:fixed;inset:0;background:#0009;z-index:100;display:grid;place-items:center;padding:24px;backdrop-filter:blur(4px)}
.pr-modal{position:relative;width:min(680px,100%);max-height:calc(100dvh - 48px);overflow-y:auto;background:var(--portal-surface);border:1px solid var(--portal-line);border-radius:8px;padding:32px;box-shadow:0 24px 80px #0006;overflow-wrap:anywhere}
.pr-modal h2{padding-right:28px;font-size:23px;line-height:1.3;margin-bottom:16px}
.pr-close{position:absolute;right:16px;top:16px;display:grid;place-items:center;width:32px;height:32px;background:none;border:0;border-radius:8px;color:var(--portal-muted);font-size:26px!important;line-height:1}
.pr-close:hover{background:var(--portal-raised)}
.pr-article{white-space:pre-wrap;line-height:1.8;color:var(--portal-text);margin-top:24px;overflow-wrap:anywhere}
.pr-journal{margin-top:32px}
.pr-journal article{display:flex;gap:20px;justify-content:space-between;padding:16px 0;border-top:1px solid var(--portal-line)}
.pr-journal p{white-space:pre-wrap;margin:0;font-size:13px;overflow-wrap:anywhere}
.pr-journal time{white-space:nowrap;font-size:12px;color:var(--portal-muted)}
.pr-review-history{margin:24px 0;padding:20px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface)}
.pr-review-history article{padding:14px 0;border-top:1px solid var(--portal-line)}
.pr-review-history article>div{display:flex;gap:10px;flex-wrap:wrap;font-size:13px}
.pr-review-history strong{font-weight:500}
.pr-review-history span,.pr-review-history p{font-size:12px;color:var(--portal-muted);margin:5px 0;white-space:pre-wrap}
.pr-file-requests{margin:24px 0;padding:22px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface)}
.pr-request-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}
.pr-request-heading h3{margin:0;font-size:17px}
.pr-request-heading>span,.pr-request-meta{color:var(--portal-muted);font-size:12px}
.pr-file-request{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px 0;border-top:1px solid var(--portal-line)}
.pr-file-request:last-child{padding-bottom:0}
.pr-request-copy{min-width:0;overflow-wrap:anywhere}
.pr-request-copy>div{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pr-request-copy h4{margin:0;font-size:14px;font-weight:500;color:var(--portal-text)}
.pr-request-copy p{margin:8px 0 0;white-space:pre-wrap;font-size:13px}
.pr-request-copy small{display:block;margin-top:8px;color:var(--portal-muted);font-size:12px}
.pr-request-status{padding:4px 8px;border-radius:6px;background:var(--portal-warning-soft);color:var(--portal-warning);font-size:11px}
.pr-request-status.fulfilled{color:var(--portal-success);background:var(--portal-success-soft)}
.pr label.pr-request-file{position:relative;display:inline-flex!important;align-items:center;gap:8px;flex:none;margin:0;min-height:44px;padding:9px 14px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);color:var(--portal-text);font-size:13px;cursor:pointer;overflow:hidden}
@media(max-width:1150px){.pr-list-head,.pr-card{grid-template-columns:minmax(150px,1fr) 110px 110px;gap:16px}
.pr-list-head>:last-child{display:none}
.pr-card>.pr-actions{grid-column:1/-1;justify-content:flex-start}
.pr-heading{align-items:flex-start}
.pr-money{gap:28px}
.pr-money p{margin-left:0}}
@media(max-width:700px){.pr h2{font-size:24px}
.pr-heading{flex-wrap:wrap;gap:16px;margin-bottom:24px}
.pr-heading-actions{width:100%}
.pr-tabs{gap:6px}
.pr-tabs button{font-size:12px;padding:8px 10px}
.pr-toolbar{flex-wrap:wrap}
.pr label.pr-search-box{max-width:none;flex:1}
.pr-list-head{display:none}
.pr-card{grid-template-columns:minmax(0,1fr) auto;padding:20px 16px;gap:14px}
.pr-resource-name{grid-column:1/-1}
.pr-date{text-align:right}
.pr-card>.pr-actions{grid-column:1/-1}
.pr-money{padding:20px;gap:24px}
.pr-money strong{font-size:26px}
.pr-money p{width:100%;max-width:none}
.pr-upload{padding:24px 16px}
.pr-editor{padding:20px 16px}
.pr-fields{grid-template-columns:minmax(0,1fr)}
.pr-actions{justify-content:flex-start}
.pr-modal-backdrop{padding:12px}
.pr-modal{padding:28px 20px;max-height:calc(100dvh - 24px)}
.pr-modal h2{font-size:21px}
.pr-modal .pr-actions>*{flex:1;white-space:normal;text-align:center}
.pr-file-request{align-items:flex-start;flex-direction:column;gap:14px}
.pr-file-requests{padding:20px 16px}
.pr-journal article{flex-wrap:wrap;gap:8px}
.pr-primary,.pr-secondary,.pr-danger{font-size:12px!important}}
</style>
