<script setup lang="ts">
import { resourceLabels, resourceIcons, money, portalDate, type PortalResource, type ResourceKind } from '~/types/portal'
const props = defineProps<{projectId:string; kind?:ResourceKind; admin?:boolean}>()
const emit = defineEmits<{changed:[]}>()
const resources = ref<PortalResource[]>([])
const activity = ref<{id:string;message:string;createdAt:string}[]>([])
const activeKind = ref<ResourceKind>('payment')
const kind = computed(() => props.kind || activeKind.value)
const items = computed(() => resources.value.filter(r=>r.kind===kind.value && (r.kind!=='mockup' || Number(r.versionCount || 0)===0)))
const loading = ref(true), busy = ref(false), error = ref(''), success = ref(''), search = ref('')
const filtered = computed(() => items.value.filter(r=>(r.title+' '+r.description+' '+r.content).toLowerCase().includes(search.value.toLowerCase())))
const editing = ref(false), editingId = ref(''), reading = ref<PortalResource|null>(null), reviewing = ref<PortalResource|null>(null), feedback = ref('')
const emptyForm = () => ({title:'',description:'',url:'',content:'',amount:0,status:'available',dueDate:'',global:false})
const form = reactive(emptyForm())
const load = async () => {
 if (!props.projectId) return
 loading.value=true; error.value=''
 try { const data=await $fetch<{resources:PortalResource[];activity:typeof activity.value}>('/api/portal/resources',{query:{projectId:props.projectId}}); resources.value=data.resources; activity.value=data.activity }
 catch(e:any){error.value=e?.data?.statusMessage || 'Impossible de charger les ressources.'}
 finally{loading.value=false}
}
watch(()=>props.projectId, load, {immediate:true})
watch(kind,()=>{search.value='';editing.value=false;reading.value=null;reviewing.value=null;error.value='';success.value=''})
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
 if(!deleteTarget.value)return
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
const upload = async (event:Event) => {
 const input=event.target as HTMLInputElement, file=input.files?.[0];if(!file)return
 if(file.size>10*1024*1024){error.value='Le fichier dépasse la limite de 10 Mo.';input.value='';return}
 busy.value=true;error.value=''
 try{const body=new FormData();body.append('file',file);body.append('kind',kind.value);await $fetch('/api/portal/files',{method:'POST',query:{projectId:props.projectId},body});await load();success.value='Fichier déposé.';emit('changed')}
 catch(e:any){error.value=e?.data?.statusMessage || 'Le dépôt a échoué.'}finally{busy.value=false;input.value=''}
}
const review = async (state:'approved'|'changes') => {
 if(!reviewing.value)return
 busy.value=true;error.value=''
 try{await $fetch('/api/portal/client/review',{method:'POST',body:{projectId:props.projectId,resourceId:reviewing.value.id,state,feedback:feedback.value}});reviewing.value=null;feedback.value='';await load();success.value='Votre retour a été transmis à MC Studio.';emit('changed')}
 catch(e:any){error.value=e?.data?.statusMessage || 'Retour non enregistré.'}finally{busy.value=false}
}
const labels:Record<string,string>={due:'À régler',paid:'Réglé',cancelled:'Annulé',available:'Disponible',pending:'Votre avis est attendu',approved:'Validée',changes:'Modifications demandées'}
</script>
<template>
 <section class="pr">
  <nav v-if="admin" class="pr-tabs" aria-label="Ressources du client"><button v-for="(label,key) in resourceLabels" :key="key" :class="{active:kind===key}" @click="activeKind=key"><UIcon :name="resourceIcons[key]"/>{{label}}</button></nav>
  <PortalMockups v-if="kind==='mockup'" :project-id="projectId" :admin="admin" @changed="load();emit('changed')"/>
  <template v-if="kind!=='mockup' || items.length">
  <div class="pr-heading"><div><h2>{{resourceLabels[kind]}}</h2><p>{{kind==='payment'?'Vos échéances et liens de règlement.':kind==='file'?'Les fichiers partagés avec votre équipe MC Studio.':kind==='wiki'?'Les guides pour avancer sereinement avec MC Studio.':kind==='analytics'?'Les performances de votre site, au même endroit.':'Tout ce dont vous avez besoin pour votre projet.'}}</p></div><button v-if="admin" class="pr-primary" @click="edit()"><UIcon name="i-tabler-plus"/>Ajouter</button></div>
  <p v-if="error" class="pr-error" role="alert">{{error}}</p><p v-if="success" class="pr-success" role="status">{{success}}</p>
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
  <label v-if="kind==='file'" class="pr-upload"><UIcon name="i-tabler-cloud-upload"/><strong>{{busy?'Dépôt en cours…':'Déposer un fichier'}}</strong><span>10 Mo par fichier · espace privé du projet</span><input type="file" :disabled="busy" aria-label="Choisir un fichier à déposer" @change="upload"></label>
  <div v-if="kind==='payment' && items.length" class="pr-money"><div><span>À régler</span><strong>{{money(items.filter(r=>r.status==='due').reduce((s,r)=>s+r.amount,0))}}</strong></div><div><span>Déjà réglé</span><strong>{{money(items.filter(r=>r.status==='paid').reduce((s,r)=>s+r.amount,0))}}</strong></div><p>Le statut est confirmé par MC Studio après réception du règlement.</p></div>
  <div class="pr-toolbar"><span>{{items.length}} ressource{{items.length>1?'s':''}}</span><label class="pr-search-box"><UIcon name="i-tabler-search"/><input v-model="search" class="pr-search" aria-label="Rechercher une ressource" placeholder="Rechercher…"></label></div>
  <p v-if="loading" role="status">Chargement…</p>
  <div v-else-if="!filtered.length" class="pr-empty"><UIcon :name="resourceIcons[kind]"/><h3>{{search?'Aucun résultat':'Tout sera réuni ici.'}}</h3><p>{{search?'Essayez un autre mot-clé.':admin?'Ajoutez la première ressource de cette rubrique.':'MC Studio ajoutera les ressources au fil du projet.'}}</p></div>
  <div v-else class="pr-grid">
   <div class="pr-list-head"><span>Nom</span><span>Statut</span><span>{{kind==='payment'?'Montant / échéance':'Date d’ajout'}}</span><span>Actions</span></div>
   <article v-for="r in filtered" :key="r.id" class="pr-card">
    <div class="pr-resource-name"><UIcon :name="resourceIcons[r.kind]"/><div><h3>{{r.title}}</h3><p v-if="r.description" class="pr-description">{{r.description}}</p><p v-if="r.fileName" class="pr-meta">{{(r.fileSize/1024/1024).toFixed(2)}} Mo</p></div></div>
    <div><span class="pr-badge">{{r.projectId===null?'Guide commun':labels[r.status]}}</span></div>
    <div class="pr-date"><template v-if="r.kind==='payment'"><strong class="pr-amount">{{money(r.amount)}}</strong><small>{{portalDate(r.dueDate)}}</small></template><template v-else>{{portalDate(r.createdAt)}}</template></div>
    <div class="pr-actions">
     <a v-if="r.fileName" class="pr-secondary" :href="`/api/portal/files/${r.id}`" :aria-label="'Télécharger '+r.title"><UIcon name="i-tabler-download"/>Télécharger</a>
     <a v-if="r.url && !(r.kind==='payment' && r.status!=='due')" :class="r.kind==='payment'?'pr-primary':'pr-secondary'" :href="r.url" target="_blank" rel="noopener noreferrer">{{r.kind==='payment'?'Régler':'Ouvrir'}}<UIcon name="i-tabler-arrow-up-right"/></a>
     <button v-if="r.kind==='wiki' && r.content" class="pr-secondary" @click="reading=r">Lire<UIcon name="i-tabler-arrow-up-right"/></button>
     <button v-if="r.kind==='mockup' && !admin" class="pr-primary" @click="reviewing=r;feedback=''">Donner mon avis</button>
     <template v-if="admin"><button class="pr-icon-button" :aria-label="'Modifier '+r.title" @click="edit(r)"><UIcon name="i-tabler-pencil"/></button><button v-if="r.kind==='file'" class="pr-icon-button pr-delete-button" :aria-label="'Supprimer '+r.title" @click="deleteTarget=r"><UIcon name="i-tabler-trash"/></button><button v-else class="pr-icon-button pr-delete-button" :aria-label="'Supprimer '+r.title" @click="removeTarget=r"><UIcon name="i-tabler-trash"/></button></template>
     <button v-else-if="r.kind==='file'" class="pr-icon-button pr-delete-button" :aria-label="'Supprimer '+r.title" @click="deleteTarget=r"><UIcon name="i-tabler-trash"/></button>
    </div>
    <div v-if="r.kind==='analytics' && r.content" class="pr-analytics"><PortalAnalytics :resource-id="r.id"/></div>
   </article>
  </div>
  <section v-if="admin && activity.length" class="pr-journal"><h3>Journal du projet</h3><article v-for="event in activity.slice(0,12)" :key="event.id"><p>{{event.message}}</p><time>{{portalDate(event.createdAt)}}</time></article></section>
  <div v-if="reading || reviewing || archiveTarget || deleteTarget || removeTarget" class="pr-modal-backdrop" @click.self="reading=null;reviewing=null;archiveTarget=null;deleteTarget=null;removeTarget=null" @keydown.esc="reading=null;reviewing=null;archiveTarget=null;deleteTarget=null;removeTarget=null">
   <section ref="dialogPanel" class="pr-modal" @keydown="trapFocus" role="dialog" aria-modal="true" :aria-label="reading?.title || reviewing?.title || (deleteTarget ? 'Supprimer le fichier' : removeTarget ? 'Supprimer la ressource' : 'Archiver la ressource')" tabindex="-1">
    <button class="pr-close" aria-label="Fermer" @click="reading=null;reviewing=null;archiveTarget=null;deleteTarget=null;removeTarget=null">×</button>
    <template v-if="reading"><h2>{{reading.title}}</h2><p>{{reading.description}}</p><div class="pr-article">{{reading.content}}</div></template>
    <template v-if="reviewing"><h2>{{reviewing.title}}</h2><a v-if="reviewing.url" :href="reviewing.url" target="_blank" rel="noopener noreferrer" class="pr-secondary">Ouvrir la maquette ↗</a><label>Vos remarques<textarea v-model="feedback" rows="6" maxlength="3000" placeholder="Indiquez les éléments à ajuster…"/></label><p v-if="error" role="alert" class="pr-error">{{error}}</p><div class="pr-actions"><button class="pr-secondary" :disabled="busy || !feedback.trim()" @click="review('changes')">Demander des modifications</button><button class="pr-primary" :disabled="busy" @click="review('approved')">Valider la maquette</button></div></template>
    <template v-if="archiveTarget"><h2>Archiver « {{archiveTarget.title}} » ?</h2><p>Cette ressource sera masquée dans l’espace client. Son contenu est conservé.</p><div class="pr-actions"><button class="pr-secondary" @click="archiveTarget=null">Annuler</button><button class="pr-primary" :disabled="busy" @click="archive">Archiver</button></div></template>
    <template v-if="deleteTarget"><h2>Supprimer « {{deleteTarget.title}} » ?</h2><p>Le fichier et son contenu seront définitivement supprimés du projet. Cette action est irréversible.</p><div class="pr-actions"><button class="pr-secondary" :disabled="busy" @click="deleteTarget=null">Annuler</button><button class="pr-danger" :disabled="busy" @click="deleteFile"><UIcon name="i-tabler-trash"/>{{busy?'Suppression…':'Supprimer définitivement'}}</button></div></template>
    <template v-if="removeTarget"><h2>Supprimer « {{removeTarget.title}} » ?</h2><p>Cette ressource et son contenu seront définitivement supprimés{{removeTarget.kind==='mockup'?' avec ses versions, écrans et commentaires':''}}. Cette action est irréversible.</p><div class="pr-actions"><button class="pr-secondary" :disabled="busy" @click="removeTarget=null">Annuler</button><button class="pr-danger" :disabled="busy" @click="removeResource"><UIcon name="i-tabler-trash"/>{{busy?'Suppression…':'Supprimer définitivement'}}</button></div></template>
   </section>
  </div>
  </template>
 </section>
</template>
<style scoped>
.pr{color:var(--portal-text, #eee);font:14px/1.5 Inter,sans-serif}.pr *{box-sizing:border-box}.pr button,.pr input,.pr textarea,.pr select{font:inherit}.pr button,.pr a{cursor:pointer}.pr h2,.pr h3{font-family:'Host Grotesk',sans-serif;color:var(--portal-text, #f2f2f2);letter-spacing:-.4px}.pr h2{font-size:28px;margin:4px 0 10px}.pr h3{font-size:19px;margin:12px 0 8px}.pr p{color:var(--portal-muted, #a6a6a6)}.pr-tabs{display:flex;flex-wrap:wrap;gap:6px;border-bottom:1px solid var(--portal-line, #303030);padding-bottom:18px;margin-bottom:24px}.pr-tabs button{display:flex;gap:7px;align-items:center;padding:9px 12px;background:var(--portal-surface, #1b1b1b);border:1px solid var(--portal-line, #333);color:var(--portal-muted, #aaa);border-radius:8px}.pr-tabs button.active{color:var(--portal-text, #b4b4b4);border-color:var(--portal-line, #5b5b5b);background:var(--portal-raised, #232323)}.pr-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px}.pr-heading p{margin:0}.pr-kicker{font-size:10px!important;letter-spacing:1.7px;color:var(--portal-muted, #a1a1a1)!important}.pr-primary,.pr-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border-radius:9px;text-decoration:none;font-size:12px!important}.pr-primary{background:var(--portal-strong, #bfbfbf);border:1px solid var(--portal-line, #bfbfbf);color:var(--portal-muted, #131313)!important}.pr-secondary{background:var(--portal-raised, #222);border:1px solid var(--portal-line, #414141);color:var(--portal-text, #eee)!important}.pr button:disabled{opacity:.5;cursor:wait}.pr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.pr-card{background:var(--portal-surface, #191919);border:1px solid var(--portal-line, #303030);padding:24px;border-radius:12px;display:flex;flex-direction:column}.pr-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.pr-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;background:var(--portal-raised, #292929);color:var(--portal-text, #bfbfbf);font-size:21px}.pr-badge{font-size:10px;color:var(--portal-text, #bbb);padding:4px 8px;border-radius:99px;background:var(--portal-raised, #292929)}.pr-badge.paid,.pr-badge.approved{color:var(--portal-text, #b7b7b7);background:var(--portal-raised, #2c2c2c)}.pr-badge.due,.pr-badge.pending{color:var(--portal-text, #bebebe);background:var(--portal-raised, #2a2a2a)}.pr-description{white-space:pre-wrap;overflow-wrap:anywhere;flex:1}.pr-card h3{overflow-wrap:anywhere}.pr-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.pr-admin{display:flex;gap:16px;border-top:1px solid var(--portal-line, #333);padding-top:16px;margin-top:20px}.pr-admin button{background:none;border:0;padding:0;color:var(--portal-muted, #a2a2a2);font-size:12px}.pr-empty{padding:56px 20px;text-align:center;background:var(--portal-surface, #171717);border:1px dashed var(--portal-line, #3c3c3c);border-radius:12px}.pr-empty>.iconify{font-size:30px;color:var(--portal-muted, #aeaeae)}.pr-empty h3{margin-top:20px}.pr-meta{font-size:11px;overflow-wrap:anywhere}.pr-amount{font:500 32px 'Host Grotesk',sans-serif;margin-top:16px}.pr-money{display:flex;gap:40px;align-items:center;flex-wrap:wrap;padding:24px;border:1px solid var(--portal-line, #303030);border-radius:12px;background:var(--portal-surface, #1c1c1c);margin-bottom:24px}.pr-money span{display:block;font-size:12px;color:var(--portal-muted, #a6a6a6)}.pr-money strong{display:block;font-size:28px;margin-top:6px}.pr-money p{font-size:11px;max-width:210px;margin-left:auto}.pr-upload{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;padding:30px;border:1px dashed var(--portal-line, #535353);background:var(--portal-surface, #1c1c1c);border-radius:12px;margin-bottom:24px}.pr-upload>.iconify{font-size:24px;color:var(--portal-text, #bdbdbd)}.pr-upload span{font-size:11px;color:var(--portal-muted, #a4a4a4)}.pr-upload input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}.pr-upload:focus-within{outline:2px solid var(--portal-line, #b4b4b4)}.pr-search,.pr-editor input,.pr-editor textarea,.pr-editor select,.pr-modal textarea{width:100%;background:var(--portal-surface, #111);border:1px solid var(--portal-line, #414141);color:var(--portal-text, #eee);border-radius:7px;padding:11px;outline-offset:3px}.pr-search{margin-bottom:20px}.pr-editor{padding:24px;border:1px solid var(--portal-line, #464646);background:var(--portal-surface, #1a1a1a);border-radius:12px;margin-bottom:24px}.pr label:not(.pr-upload){display:grid;gap:7px;margin-top:15px;font-size:12px}.pr label small{color:var(--portal-muted, #aaa)}.pr-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pr-checkbox{display:flex!important;align-items:center}.pr-checkbox input{width:auto}.pr-error,.pr-success{padding:12px;border:1px solid var(--portal-line, #595959);background:var(--portal-raised, #222222);border-radius:8px;color:var(--portal-text, #c7c7c7)!important}.pr-success{border-color:var(--portal-line, #494949);background:var(--portal-surface, #202020);color:var(--portal-text, #c3c3c3)!important}.pr-modal-backdrop{position:fixed;inset:0;background:#000b;z-index:100;display:grid;place-items:center;padding:20px;backdrop-filter:blur(5px)}.pr-modal{position:relative;width:min(680px,100%);max-height:90vh;overflow-y:auto;background:var(--portal-surface, #1b1b1b);border:1px solid var(--portal-line, #444);border-radius:16px;padding:34px}.pr-close{position:absolute;right:15px;top:10px;background:none;border:0;color:var(--portal-text, #ccc);font-size:26px!important}.pr-article{white-space:pre-wrap;line-height:1.9;color:var(--portal-text, #d1d1d1);margin-top:24px;overflow-wrap:anywhere}.pr-journal{margin-top:32px}.pr-journal article{display:flex;gap:20px;justify-content:space-between;padding:14px 0;border-top:1px solid var(--portal-line, #333)}.pr-journal p{white-space:pre-wrap;margin:0;font-size:12px;overflow-wrap:anywhere}.pr-journal time{white-space:nowrap;font-size:10px;color:var(--portal-muted, #888)}.pr:focus-visible{outline:2px solid var(--portal-line, #bfbfbf);outline-offset:3px}@media(max-width:700px){.pr-grid{grid-template-columns:1fr}.pr-heading{align-items:flex-start}.pr-heading h2{font-size:24px}.pr-card{padding:20px}.pr-money{gap:24px}.pr-money p{margin:0;max-width:none}.pr-modal{padding:28px 20px}.pr-fields{grid-template-columns:1fr}}

/* Compact monochrome workspace, shared by client and administration. */
.pr-danger{display:inline-flex;align-items:center;gap:7px;border:1px solid #9b5146;border-radius:99px;padding:6px 12px;min-height:30px;background:linear-gradient(180deg,#98493e,#71332b);color:#fff;font-size:10px;white-space:nowrap}.pr-danger:hover{background:linear-gradient(180deg,#ad5749,#813b30)}.pr-delete-button{color:#d79a8c!important}.pr-delete-button:hover{border-color:#9b5146!important;color:#f1a18f!important}
@media(max-width:700px){.pr-heading h2{font-size:20px}.pr-grid{display:block}.pr-card{padding:14px}.pr-money{gap:28px}.pr-money p{margin:0;max-width:100%;width:100%}.pr-upload{flex-wrap:wrap;padding:16px}.pr-tabs{gap:18px}.pr-modal{padding:28px 18px}.pr-fields{grid-template-columns:1fr}}


@media(max-width:700px){.pr-grid{overflow:visible}.pr-list-head{display:none}.pr-card{min-width:0;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:18px 0}.pr-resource-name{grid-column:1/-1}.pr-card .pr-actions{grid-column:1/-1;justify-content:flex-start}.pr-date{text-align:right}.pr-analytics{min-width:0}}
</style>
