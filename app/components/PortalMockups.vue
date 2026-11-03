<script setup lang="ts">
const props=defineProps<{projectId:string;admin?:boolean;canContribute?:boolean;canReview?:boolean}>()
const canWrite=computed(()=>Boolean(props.admin || props.canContribute))
const canValidate=computed(()=>Boolean(props.admin || props.canReview))
const emit=defineEmits<{changed:[]}>()
type Version={id:string;resourceId:string;number:number;fileKey:string;title:string;state:string;createdAt:string;reviewer?:string;reviewedAt?:string;coverId?:string;screenCount:number}
type Screen={id:string;nodeId:string;name:string;width:number;height:number}
type Annotation={id:string;screenId:string;x:number;y:number;body:string;author:string;authorRole:string;resolved:number;createdAt:string}
type Reply={id:string;annotationId:string;body:string;author:string;authorRole:string;createdAt:string}
const versions=ref<Version[]>([]),screens=ref<Screen[]>([]),annotations=ref<Annotation[]>([]),replies=ref<Reply[]>([])
const error=ref(''),pageNotice=ref(''),busy=ref(false),loading=ref(false),importing=ref(false),viewer=ref(false)
const deleteTarget=ref<Version|null>(null)
const deleteDialog=ref<HTMLElement|null>(null)
let deleteFocusBefore:HTMLElement|null=null
watch(deleteTarget,async value=>{
 if(value){deleteFocusBefore=document.activeElement as HTMLElement;await nextTick();deleteDialog.value?.querySelector<HTMLButtonElement>('button')?.focus()}
 else{await nextTick();if(deleteFocusBefore?.isConnected)deleteFocusBefore.focus()}
})
function trapDelete(event:KeyboardEvent){
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(!busy.value)deleteTarget.value=null;return}
 if(event.key!=='Tab')return
 const buttons=deleteDialog.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
 if(!buttons?.length){event.preventDefault();deleteDialog.value?.focus();return}
 const first=buttons[0]!,last=buttons[buttons.length-1]!
 if(event.shiftKey&&(document.activeElement===first||document.activeElement===deleteDialog.value)){event.preventDefault();last.focus()}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
}
const renameTarget=ref<Version|null>(null),renameTitle=ref('')
const url=ref(''),target=ref(''),selected=ref<string[]>([])
const source=ref<{name:string;version:string;fileKey:string;screens:{id:string;name:string;page:string;width:number;height:number}[]}|null>(null)
const addingPages=ref(false),pageUrl=ref(''),pageSource=ref<{name:string;version:string;fileKey:string;screens:{id:string;name:string;page:string;width:number;height:number}[]}|null>(null),pageSelected=ref<string[]>([])
const versionId=ref(''),screenId=ref(''),zoom=ref(.65),annotating=ref(false),imageReady=ref(false),imageFailed=ref(false)
const imageRevision=ref(0)
const active=ref(''),draft=ref<{x:number;y:number}|null>(null),message=ref(''),reply=ref(''),showResolved=ref(false)
const version=computed(()=>versions.value.find(v=>v.id===versionId.value))
const screen=computed(()=>screens.value.find(s=>s.id===screenId.value))
const screenIndex=computed(()=>screens.value.findIndex(s=>s.id===screenId.value))
function moveScreen(direction:number){
 if(loading.value || busy.value)return
 const next=screens.value[screenIndex.value+direction]
 if(next)screenId.value=next.id
}
const latest=computed(()=>versions.value.filter((v,i,arr)=>arr.findIndex(x=>x.resourceId===v.resourceId)===i))
const history=computed(()=>versions.value.filter(v=>v.resourceId===version.value?.resourceId))
const pins=computed(()=>annotations.value.filter(a=>a.screenId===screenId.value))
const visiblePins=computed(()=>pins.value.filter(a=>showResolved.value||!a.resolved))
const commentsOpen=ref(false),mobilePagesOpen=ref(false)
const copiedClientComments=ref(false)
const clientCommentCount=computed(()=>annotations.value.filter(a=>a.authorRole==='client').length+replies.value.filter(r=>r.authorRole==='client').length)
const displayName=(name:string)=>name.replace(/^(Page|Mobile)\s*\/\s*/, '').replace(/\s*\(modèle[^)]*\)/,'')
function chooseScreen(id:string){if(busy.value||loading.value)return;screenId.value=id;mobilePagesOpen.value=false}
function toggleAnnotations(){if(!canWrite.value)return;annotating.value=!annotating.value;draft.value=null;if(annotating.value)commentsOpen.value=true}
watch(commentsOpen,async()=>{await nextTick();fit()})
const isLatest=computed(()=>latest.value.some(v=>v.id===versionId.value))
const states:Record<string,string>={pending:'Avis attendu',approved:'Validée',changes:'Modifications demandées'}
const date=(value:string)=>new Date(value).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})
const fail=(e:any)=>{error.value=e?.data?.statusMessage||'Action impossible. Réessayez.'}
let request=0
async function load(detail=false){
 const id=++request;loading.value=true
 try{const data=await $fetch<{versions:Version[];screens?:Screen[];annotations?:Annotation[];replies?:Reply[]}>('/api/portal/mockups',{query:{projectId:props.projectId,...(detail?{versionId:versionId.value}:{})}})
 if(id!==request)return
 versions.value=data.versions
 if(detail){screens.value=data.screens||[];annotations.value=data.annotations||[];replies.value=data.replies||[];if(!screens.value.some(s=>s.id===screenId.value))screenId.value=screens.value[0]?.id||''}
 }catch(e){if(id===request)fail(e)}finally{if(id===request)loading.value=false}
}
watch(()=>props.projectId,()=>{viewer.value=false;importing.value=false;versionId.value='';source.value=null;load()},{immediate:true})
watch(screenId,async()=>{draft.value=null;active.value='';message.value='';reply.value='';imageReady.value=false;imageFailed.value=false;await nextTick();fit();canvas.value?.scrollTo({top:0,left:0,behavior:'instant'})})
watch(url,()=>{source.value=null;selected.value=[]})
function startImport(v?:Version){target.value=v?.resourceId||'';url.value=v?`https://www.figma.com/design/${v.fileKey}`:'';source.value=null;selected.value=[];importing.value=true;error.value=''}
async function inspect(){busy.value=true;error.value='';try{source.value=await $fetch('/api/portal/mockups/inspect',{method:'POST',body:{url:url.value}});selected.value=[]}catch(e){fail(e)}finally{busy.value=false}}
async function publish(){if(!source.value)return;busy.value=true;error.value='';try{const result=await $fetch<{versionId:string}>('/api/portal/mockups/publish',{method:'POST',body:{projectId:props.projectId,url:url.value,resourceId:target.value,sourceVersion:source.value.version,nodeIds:selected.value}});importing.value=false;await load();emit('changed');await open(result.versionId)}catch(e){fail(e)}finally{busy.value=false}}
function startAddPages(){if(!version.value)return;pageUrl.value=`https://www.figma.com/design/${version.value.fileKey}`;pageSource.value=null;pageSelected.value=[];addingPages.value=true;error.value='';pageNotice.value=''}
async function inspectPages(){busy.value=true;error.value='';try{pageSource.value=await $fetch('/api/portal/mockups/inspect',{method:'POST',body:{url:pageUrl.value}});pageSelected.value=[]}catch(e){fail(e)}finally{busy.value=false}}
async function addPages(){if(!pageSource.value||!pageSelected.value.length)return;busy.value=true;error.value='';try{const result=await $fetch<{screenIds:string[];addedCount:number;replacedCount:number}>('/api/portal/mockups/pages',{method:'POST',body:{projectId:props.projectId,versionId:versionId.value,sourceVersion:pageSource.value.version,nodeIds:pageSelected.value}});addingPages.value=false;imageRevision.value++;imageReady.value=false;imageFailed.value=false;await load(true);if(result.screenIds.length)screenId.value=result.screenIds[result.screenIds.length-1]!;pageNotice.value=`${result.addedCount} page(s) ajoutée(s), ${result.replacedCount} remplacée(s). Les commentaires des pages remplacées sont conservés.`;pageSelected.value=[];emit('changed');await nextTick();fit()}catch(e){fail(e)}finally{busy.value=false}}
async function movePage(index:number,direction:number){const destination=index+direction;if(destination<0||destination>=screens.value.length||busy.value)return;const reordered=[...screens.value];[reordered[index],reordered[destination]]=[reordered[destination]!,reordered[index]!];screens.value=reordered;busy.value=true;error.value='';try{await $fetch('/api/portal/mockups/pages',{method:'PATCH',body:{projectId:props.projectId,versionId:versionId.value,screenIds:reordered.map(s=>s.id)}});await load(true);emit('changed')}catch(e){await load(true);fail(e)}finally{busy.value=false}}
async function removeMockup(){if(!deleteTarget.value)return;busy.value=true;error.value='';try{await $fetch(`/api/portal/mockups/${deleteTarget.value.resourceId}`,{method:'DELETE'});deleteTarget.value=null;viewer.value=false;await load();emit('changed')}catch(e){fail(e)}finally{busy.value=false}}
async function renameMockup(){if(!renameTarget.value)return;busy.value=true;error.value='';try{await $fetch(`/api/portal/mockups/${renameTarget.value.resourceId}`,{method:'PATCH',body:{projectId:props.projectId,title:renameTitle.value}});renameTarget.value=null;await load();emit('changed')}catch(e){fail(e)}finally{busy.value=false}}
async function open(id:string){confirmReview.value=false;annotating.value=false;commentsOpen.value=false;mobilePagesOpen.value=false;versionId.value=id;screenId.value='';screens.value=[];annotations.value=[];replies.value=[];active.value='';draft.value=null;viewer.value=true;error.value='';await load(true);await nextTick();fit()}
const canvas=ref<HTMLElement|null>(null),dialog=ref<HTMLElement|null>(null)
let focusBefore:HTMLElement|null=null
watch(viewer,async value=>{if(value){focusBefore=document.activeElement as HTMLElement;await nextTick();dialog.value?.focus()}else focusBefore?.focus()})
function trap(event:KeyboardEvent){if(event.key==='Escape'){viewer.value=false;return}if(event.key!=='Tab')return;const elements=dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled),textarea,select,a[href],input');if(!elements?.length)return;const first=elements[0]!,last=elements[elements.length-1]!;if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.value)){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
function fit(){
 if(!screen.value || !canvas.value)return
 const style=getComputedStyle(canvas.value)
 const padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight)
 zoom.value=Math.max(.05,Math.min(1,(canvas.value.clientWidth-padding)/screen.value.width))
}
function place(event:MouseEvent){if(!annotating.value||!imageReady.value)return;const bounds=(event.currentTarget as HTMLElement).getBoundingClientRect();draft.value={x:Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width)),y:Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height))};active.value='';message.value=''}
function selectPin(a:Annotation){commentsOpen.value=true;active.value=a.id;draft.value=null;reply.value=''}
async function comment(action:'create'|'reply'|'resolve',resolved?:boolean){if(!canWrite.value)return;busy.value=true;error.value='';try{await $fetch('/api/portal/mockups/comment',{method:'POST',body:{action,projectId:props.projectId,versionId:versionId.value,screenId:screenId.value,annotationId:active.value,...draft.value,body:action==='create'?message.value:reply.value,resolved}});draft.value=null;message.value='';reply.value='';await load(true);emit('changed')}catch(e){fail(e)}finally{busy.value=false}}
async function copyClientComments(){
 const lines=[`${version.value?.title||'Maquette'} · version ${version.value?.number||''}`.trim(), 'Commentaires du client']
 for(const s of screens.value){
  const screenAnnotations=annotations.value.filter(a=>a.screenId===s.id)
  const clientAnnotations=screenAnnotations.filter(a=>a.authorRole==='client')
  const clientReplies=replies.value.filter(r=>r.authorRole==='client'&&screenAnnotations.some(a=>a.id===r.annotationId))
  if(!clientAnnotations.length&&!clientReplies.length)continue
  lines.push('', displayName(s.name))
  for(const a of screenAnnotations){
   const threadReplies=replies.value.filter(r=>r.annotationId===a.id&&r.authorRole==='client')
   if(a.authorRole==='client')lines.push(`• ${a.author} · ${new Date(a.createdAt).toLocaleString('fr-FR')}${a.resolved?' · Résolu':''}\n  ${a.body}`)
   else if(threadReplies.length)lines.push(`• Réponse à ${a.author} · « ${a.body} »`)
   for(const r of threadReplies)lines.push(`  ↳ ${r.author} · ${new Date(r.createdAt).toLocaleString('fr-FR')}\n    ${r.body}`)
  }
 }
 try{await navigator.clipboard.writeText(lines.join('\n'));copiedClientComments.value=true;window.setTimeout(()=>copiedClientComments.value=false,1800)}catch{error.value='La copie a échoué. Vérifiez les autorisations du navigateur.'}
}
const confirmReview=ref(false)
async function review(state:string){if(!canValidate.value)return;busy.value=true;error.value='';try{await $fetch('/api/portal/mockups/review',{method:'POST',body:{projectId:props.projectId,versionId:versionId.value,state}});confirmReview.value=false;await load(true);emit('changed')}catch(e){fail(e)}finally{busy.value=false}}
</script>
<template>
 <section class="mk">
  <header class="mk-heading"><div><h2>Maquettes</h2><p>Vos écrans, vos retours et chaque version au même endroit.</p></div><button v-if="admin" class="primary" @click="startImport()">+ Importer depuis Figma</button></header>
  <p v-if="error && !viewer" role="alert" class="notice">{{error}}</p>
  <form v-if="importing" class="importer" @submit.prevent="inspect">
   <header><h3>{{target?'Publier une nouvelle version':'Importer un fichier Figma'}}</h3><button type="button" :disabled="busy" @click="importing=false">Fermer</button></header>
   <label>Lien du fichier Figma<input v-model="url" type="url" required placeholder="https://www.figma.com/design/…" :disabled="busy || !!target"></label>
   <button :disabled="busy" type="submit">{{busy?'Chargement…':'Charger les écrans'}}</button>
   <template v-if="source"><div class="selection-head"><strong>{{source.name}}</strong><span>{{selected.length}} écran(s) sélectionné(s) sur {{source.screens.length}}</span></div><div class="screen-picker"><label v-for="s in source.screens" :key="s.id"><input v-model="selected" type="checkbox" :value="s.id" :disabled="busy"><span>{{s.name}}<small>{{s.page}} · {{Math.round(s.width)}} × {{Math.round(s.height)}}</small></span></label></div><p v-if="!source.screens.length">Aucun cadre exportable trouvé. Placez les écrans dans une page ou une section Figma.</p><p>Une copie de ces écrans sera publiée dans l’espace client. Les anciennes versions et leurs commentaires seront conservés.</p><button type="button" class="primary" :disabled="busy || !selected.length" @click="publish">{{busy?'Export et publication en cours…':'Publier '+selected.length+' écran(s)'}}</button></template>
  </form>
  <p v-if="loading && !viewer" role="status">Chargement des maquettes…</p>
  <div v-else-if="!latest.length" class="empty"><UIcon name="i-tabler-layout"/><h3>Les maquettes arrivent ici.</h3><p>{{admin?'Importez un fichier Figma et choisissez les écrans à partager.':'Vous pourrez parcourir les écrans et cliquer dessus pour laisser vos retours.'}}</p></div>
  <div v-else class="collection-grid"><article v-for="v in latest" :key="v.id" class="collection-card"><button class="collection-cover" :aria-label="'Ouvrir les maquettes '+v.title" @click="open(v.id)"><img v-if="v.coverId" :src="`/api/portal/mockups/screens/${v.coverId}?revision=${imageRevision}`" :alt="'Aperçu de '+v.title" loading="lazy"><span v-else class="cover-placeholder"><UIcon name="i-tabler-layout"/></span><span class="cover-open"><UIcon name="i-tabler-arrow-up-right"/></span></button><div class="collection-info"><div><h3>{{v.title}}</h3><p>{{v.screenCount}} pages · Version {{v.number}} · {{date(v.createdAt)}}</p></div><span :class="['badge',v.state]">{{states[v.state]}}</span></div><form v-if="admin && renameTarget?.id===v.id" class="rename-form" @submit.prevent="renameMockup"><label class="sr-only" :for="'rename-mockup-'+v.id">Nom de la maquette</label><input :id="'rename-mockup-'+v.id" v-model="renameTitle" required maxlength="160" :disabled="busy" autofocus><button class="primary" :disabled="busy || !renameTitle.trim()">{{busy?'Enregistrement…':'Enregistrer'}}</button><button type="button" :disabled="busy" @click="renameTarget=null">Annuler</button></form><div class="collection-actions"><button v-if="admin" @click="startImport(v)">Nouvelle version</button><button v-if="admin" @click="renameTarget=v;renameTitle=v.title">Renommer</button><button class="primary" @click="open(v.id)">Explorer les maquettes <UIcon name="i-tabler-arrow-right"/></button><button v-if="admin" class="delete-mockup" :disabled="busy" :aria-label="'Supprimer '+v.title" @click="deleteTarget=v">Supprimer</button></div></article></div>
  <div v-if="deleteTarget" class="delete-backdrop" @click.self="!busy && (deleteTarget=null)"><section ref="deleteDialog" class="delete-dialog" role="alertdialog" aria-modal="true" :aria-label="'Supprimer '+deleteTarget.title" tabindex="-1" @keydown="trapDelete"><h2>Supprimer « {{deleteTarget.title}} » ?</h2><p>Cette maquette, toutes ses versions, tous ses écrans et commentaires seront définitivement supprimés.</p><p v-if="error" class="notice" role="alert">{{error}}</p><div><button :disabled="busy" @click="deleteTarget=null">Annuler</button><button class="delete-mockup" :disabled="busy" @click="removeMockup">{{busy?'Suppression…':'Supprimer définitivement'}}</button></div></section></div>
  <Teleport to="body"><section v-if="viewer" ref="dialog" class="mk mk-viewer" :class="{'has-comments':commentsOpen}" role="dialog" aria-modal="true" aria-label="Visionneuse des maquettes" tabindex="-1" @keydown="trap">
   <header class="viewer-header"><div><button class="back-to-portal" aria-label="Fermer la visionneuse" @click="viewer=false"><UIcon name="i-tabler-arrow-left"/>Retour au portail</button><span class="header-divider">/</span><strong>{{version?.title}}</strong></div><div class="actions"><PortalThemeToggle /><span :class="['badge',version?.state]">{{states[version?.state||'pending']}}</span><label class="sr-only" for="mockup-version">Version</label><select id="mockup-version" :value="versionId" :disabled="busy||loading" @change="confirmReview=false;open(($event.target as HTMLSelectElement).value)"><option v-for="v in history" :key="v.id" :value="v.id">Version {{v.number}} · {{date(v.createdAt)}}</option></select></div></header>
   <div class="viewer-toolbar"><div class="screen-navigation" role="group" aria-label="Navigation entre les maquettes"><button class="mobile-page-toggle" :aria-expanded="mobilePagesOpen" aria-controls="mockup-page-nav" @click="mobilePagesOpen=!mobilePagesOpen"><UIcon name="i-tabler-menu-2"/>Pages</button><button type="button" class="screen-arrow" aria-label="Page précédente" title="Page précédente" :disabled="loading || busy || screenIndex<=0" @click="moveScreen(-1)"><UIcon name="i-tabler-chevron-left"/></button><span class="screen-count" aria-live="polite">{{screenIndex+1}} / {{screens.length}}</span><button type="button" class="screen-arrow" aria-label="Page suivante" title="Page suivante" :disabled="loading || busy || screenIndex<0 || screenIndex>=screens.length-1" @click="moveScreen(1)"><UIcon name="i-tabler-chevron-right"/></button></div><div class="actions"><div class="zoom-controls"><button aria-label="Réduire" @click="zoom=Math.max(.05,zoom/1.25)">−</button><span>{{Math.round(zoom*100)}}%</span><button aria-label="Agrandir" @click="zoom=Math.min(3,zoom*1.25)">+</button><button @click="fit">Ajuster</button></div><button v-if="canWrite" :class="{primary:annotating}" :disabled="!imageReady" :aria-pressed="annotating" @click="toggleAnnotations"><UIcon name="i-tabler-message-plus"/>{{annotating?'Annotation activée':'Annoter'}}</button><button :aria-expanded="commentsOpen" aria-controls="mockup-discussion" @click="commentsOpen=!commentsOpen;annotating=false"><UIcon name="i-tabler-messages"/>Commentaires <span>{{annotations.length}}</span></button></div></div>
   <p v-if="error" class="notice" role="alert">{{error}}</p><p v-if="pageNotice" class="notice" role="status">{{pageNotice}}</p>
   <div class="viewer-body"><aside id="mockup-page-nav" class="page-sidebar" :class="{'mobile-open':mobilePagesOpen}"><div class="page-sidebar-title"><strong>{{version?.title}}</strong><p>{{screens.length}} pages à découvrir</p><button v-if="admin" class="add-page-button" :disabled="busy || loading" @click="startAddPages"><UIcon name="i-tabler-plus"/>Ajouter une page</button></div><nav aria-label="Pages de la maquette"><div v-for="(s,i) in screens" :key="s.id" class="page-nav-row"><button :class="{active:screenId===s.id}" :aria-current="screenId===s.id?'page':undefined" :disabled="busy || loading" @click="chooseScreen(s.id)"><span>{{String(i+1).padStart(2,'0')}}</span>{{displayName(s.name)}}</button><div v-if="admin" class="page-order-actions"><button type="button" :aria-label="'Monter '+displayName(s.name)" :disabled="busy || i===0" @click="movePage(i,-1)"><UIcon name="i-tabler-chevron-up"/></button><button type="button" :aria-label="'Descendre '+displayName(s.name)" :disabled="busy || i===screens.length-1" @click="movePage(i,1)"><UIcon name="i-tabler-chevron-down"/></button></div></div></nav><div class="page-sidebar-footer"><span>MC Studio</span><p>Design & développement</p><button v-if="!admin && canValidate && isLatest" class="primary" :disabled="busy || version?.state==='approved'" @click="commentsOpen=true;confirmReview=true">{{version?.state==='approved'?'Version validée':'Valider cette version'}}<UIcon name="i-tabler-check"/></button></div></aside><div ref="canvas" class="canvas"><p v-if="loading" role="status">Chargement…</p><p v-if="imageFailed" role="alert">Impossible de charger cet écran. Fermez et rouvrez la maquette.</p><header v-if="screen" class="page-intro"><div><h2>{{displayName(screen.name)}}</h2><p>Explorez la maquette et partagez vos retours avec MC Studio.</p></div><a :href="`/api/portal/mockups/screens/${screen.id}`" :download="displayName(screen.name)+'.png'" aria-label="Télécharger cette maquette en PNG" title="Télécharger en PNG"><UIcon name="i-tabler-download"/></a></header><div v-if="screen" class="artboard" :class="{annotating}" :style="{width:screen.width*zoom+'px',height:screen.height*zoom+'px'}" @click="place"><img :key="screen.id+'-'+imageRevision" :src="`/api/portal/mockups/screens/${screen.id}?revision=${imageRevision}`" :alt="screen.name" draggable="false" @load="imageReady=true" @error="imageFailed=true"><button v-for="a in visiblePins" :key="a.id" class="pin" :class="{selected:active===a.id,resolved:a.resolved}" :style="{left:a.x*100+'%',top:a.y*100+'%'}" :aria-label="'Annotation '+(pins.indexOf(a)+1)+' : '+a.body" @click.stop="selectPin(a)">{{pins.indexOf(a)+1}}</button><span v-if="draft" class="pin draft" :style="{left:draft.x*100+'%',top:draft.y*100+'%'}">+</span></div></div>
   <aside v-if="commentsOpen" id="mockup-discussion" class="discussion"><header><button class="discussion-close" aria-label="Fermer les commentaires" @click="commentsOpen=false;annotating=false">×</button><h3>Commentaires <span>{{pins.length}}</span></h3><button v-if="admin" class="export-comments" :disabled="!clientCommentCount" :title="`${clientCommentCount} commentaire(s) client sur cette version`" @click="copyClientComments"><UIcon :name="copiedClientComments?'i-tabler-check':'i-tabler-copy'"/>{{copiedClientComments?'Copié':'Copier les commentaires client'}}</button><label class="check"><input v-model="showResolved" type="checkbox">Afficher les résolus</label></header><p v-if="!isLatest" class="notice">Version précédente : les retours restent attachés à ces écrans.</p><p v-if="annotating && !draft" class="hint">Cliquez sur un élément de la maquette pour y déposer un commentaire.</p><button v-if="annotating && !draft" :disabled="!imageReady" @click="draft={x:.5,y:.5};active=''">Annoter au centre de l’écran</button>
    <form v-if="draft" class="comment-form" @submit.prevent="comment('create')"><h3>Nouvelle annotation</h3><label>Votre commentaire<textarea v-model="message" autofocus required maxlength="3000" rows="4" placeholder="Que souhaitez-vous ajuster ici ?"/></label><div class="actions"><button type="button" @click="draft=null">Annuler</button><button class="primary" :disabled="busy || !message.trim()">Publier</button></div></form>
    <p v-if="!visiblePins.length && !draft" class="hint">Aucun commentaire {{showResolved?'':'ouvert'}} sur cet écran.</p>
    <article v-for="a in visiblePins" :key="a.id" class="comment" :class="{active:active===a.id}"><button class="comment-title" @click="selectPin(a)"><span class="number">{{pins.indexOf(a)+1}}</span><strong>{{a.author}}</strong><small>{{date(a.createdAt)}}{{a.resolved?' · Résolu':''}}</small></button><p>{{a.body}}</p><template v-if="active===a.id"><div v-for="r in replies.filter(r=>r.annotationId===a.id)" :key="r.id" class="reply"><strong>{{r.author}}</strong><small>{{date(r.createdAt)}}</small><p>{{r.body}}</p></div><form v-if="canWrite" @submit.prevent="comment('reply')"><label class="sr-only" :for="'reply-'+a.id">Répondre</label><textarea :id="'reply-'+a.id" v-model="reply" required maxlength="3000" rows="2" placeholder="Répondre…"/><div class="actions"><button type="button" :disabled="busy" @click="comment('resolve',!a.resolved)">{{a.resolved?'Rouvrir':'Marquer résolu'}}</button><button :disabled="busy || !reply.trim()">Répondre</button></div></form></template><button v-else class="text-button" @click="selectPin(a)">Ouvrir la discussion · {{replies.filter(r=>r.annotationId===a.id).length}} réponse(s)</button></article>
    <footer><p v-if="!admin && !canValidate" class="notice">{{canWrite?'Partagez vos commentaires. La validation finale appartient au décideur désigné pour ce projet.':'Votre accès est en lecture seule. Le décideur du projet peut valider cette version.'}}</p><p v-if="version?.reviewer">{{states[version.state]}} par {{version.reviewer}} · {{date(version.reviewedAt!)}}</p><template v-if="!admin && canValidate && isLatest"><template v-if="confirmReview"><p>Confirmer la validation de la version {{version?.number}} ? {{annotations.filter(a=>!a.resolved).length}} annotation(s) encore ouverte(s).</p><div class="actions"><button @click="confirmReview=false">Annuler</button><button class="primary" :disabled="busy" @click="review('approved')">Confirmer la validation</button></div></template><div v-else class="review-actions"><button :disabled="busy" @click="review('changes')">Demander des modifications</button><button class="primary" :disabled="busy || version?.state==='approved'" @click="confirmReview=true">Valider cette version</button></div></template></footer>
   </aside></div><div v-if="addingPages" class="add-pages-backdrop" @click.self="!busy && (addingPages=false)"><form class="add-pages-dialog" @submit.prevent="pageSource ? addPages() : inspectPages()"><header><div><p class="assets-eyebrow">VERSION {{version?.number}}</p><h2>Ajouter ou remplacer des pages</h2><p>Les écrans déjà présents remplaceront leur image en gardant leur position et leurs commentaires.</p></div><button type="button" :disabled="busy" aria-label="Fermer" @click="addingPages=false">×</button></header><label>Fichier Figma<input v-model="pageUrl" type="url" readonly></label><button v-if="!pageSource" class="primary" type="button" :disabled="busy" @click="inspectPages">{{busy?'Chargement…':'Charger les pages Figma'}}</button><template v-if="pageSource"><div class="selection-head"><strong>{{pageSource.name}}</strong><span>{{pageSelected.length}} sélectionnée(s)</span></div><div class="screen-picker"><label v-for="s in pageSource.screens" :key="s.id"><input v-model="pageSelected" type="checkbox" :value="s.id" :disabled="busy"><span>{{s.name}}<small>{{s.page}} · {{Math.round(s.width)}} × {{Math.round(s.height)}}<template v-if="screens.some(existing=>existing.nodeId===s.id)"> · Déjà ajoutée, sera remplacée</template></small></span></label></div><div class="modal-actions"><button type="button" :disabled="busy" @click="addingPages=false">Annuler</button><button class="primary" :disabled="busy || !pageSelected.length">{{busy?'Mise à jour…':`Appliquer ${pageSelected.length} page(s)`}}</button></div></template><p v-if="error" class="notice" role="alert">{{error}}</p></form></div>
  </section></Teleport>
 </section>
</template>
<style scoped>
.mk{color:var(--portal-text, #ddd)}
.mk *{box-sizing:border-box}
.mk h2,.mk h3,.mk p{margin:0}
.mk p{color:var(--portal-muted, #999)}
.mk button,.mk input,.mk select,.mk textarea{font:inherit;color:inherit}
.mk button,.mk select{background:var(--portal-raised, #232323);border:1px solid var(--portal-line, #3b3b3b);cursor:pointer}
.mk button:hover{background:var(--portal-raised, #333)}
.mk button:disabled{opacity:.45;cursor:default}
.mk .primary{background:var(--portal-accent);border-color:var(--portal-accent-hover);color:var(--portal-text, #fff)}
.mk:focus-visible{outline:2px solid var(--portal-line, #ddd);outline-offset:3px}
.mk input:not([type=checkbox]),.mk textarea{border:1px solid var(--portal-line, #444);width:100%}
.mk textarea{resize:vertical}
.mk-heading,.importer header,.selection-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}
.mk-heading p{margin-top:6px}
.actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.importer{background:var(--portal-surface, #1a1a1a);border:1px solid var(--portal-line, #333);border-radius:8px;margin-bottom:24px}
.importer>label{display:block;margin-bottom:12px}
.importer>label input{display:block;margin-top:8px}
.selection-head{margin:20px 0 10px}
.screen-picker{max-height:320px;overflow:auto;border:1px solid var(--portal-line, #333);border-radius:8px}
.screen-picker label{display:flex;gap:12px;align-items:center;padding:12px;border-bottom:1px solid var(--portal-line, #303030);cursor:pointer}
.screen-picker small{display:block;color:var(--portal-muted, #888);margin-top:3px}
.importer p{margin:15px 0}
.empty{text-align:center;padding:55px 20px;border-block:1px solid var(--portal-line, #333)}
.empty>.iconify{font-size:30px;color:var(--portal-muted, #777)}
.empty h3{margin:14px 0 8px}
.list-head,.list article{display:grid;grid-template-columns:minmax(160px,1fr) 140px 160px auto;gap:16px;align-items:center;padding:16px 10px;border-bottom:1px solid var(--portal-line, #303030)}
.list-head{font-size:12px;color:var(--portal-muted, #777);border-top:1px solid var(--portal-line, #303030)}
.list article>span{font-size:12px;color:var(--portal-muted, #999)}
.name{display:flex;gap:12px;align-items:center}
.name strong{font-weight:500}
.badge{display:inline-flex;width:fit-content;border:1px solid var(--portal-line, #3c3c3c);background:var(--portal-raised, #252525);border-radius:99px;padding:2px 8px;font-size:12px;white-space:nowrap}
.notice{padding:12px;background:var(--portal-raised, #252525);border:1px solid var(--portal-line, #555);border-radius:8px;margin-bottom:12px!important}
.mk-viewer{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;outline:0}
.viewer-header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--portal-line, #333);gap:12px}
.viewer-header>div:first-child{display:flex;align-items:center;gap:14px}
.viewer-header strong{font-weight:500}
.viewer-toolbar{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--portal-line, #333);gap:12px}
.screen-navigation{display:flex;align-items:center;min-width:0;max-width:650px}
.screen-navigation select{min-width:0;flex:1;text-overflow:ellipsis}
.mk .screen-arrow{display:grid;place-items:center;width:34px;height:34px;padding:0;flex-shrink:0;font-size:18px}
.screen-count{white-space:nowrap;font-variant-numeric:tabular-nums}
.viewer-body{flex:1}
.canvas{flex:1;min-width:0;overflow:auto;background-color:var(--portal-surface, #101010);background-image:radial-gradient(#303030 1px,transparent 1px);background-size:16px 16px}
.artboard{position:relative;flex-shrink:0;margin:0 auto}
.artboard.annotating{cursor:crosshair}
.artboard img{display:block;width:100%;height:100%;max-width:none;user-select:none}
.mk .pin{position:absolute;transform:translate(-50%,-50%);border:2px solid var(--portal-line, #fff);background:var(--portal-surface, #202020);color:var(--portal-text, #fff);border-radius:50%;width:28px;height:28px;padding:0;display:grid;place-items:center;font-size:12px;box-shadow:0 2px 8px #0009;z-index:1}
.mk .pin.selected,.mk .pin.draft{background:var(--portal-accent);z-index:2}
.pin.resolved{opacity:.6}
.discussion{flex-shrink:0;border-left:1px solid var(--portal-line, #333);overflow-y:auto;display:flex;flex-direction:column}
.discussion>header{border-bottom:1px solid var(--portal-line, #303030)}
.discussion h3 span{color:var(--portal-muted, #777);margin-left:5px}
.check{display:flex;color:var(--portal-muted, #888);margin-top:10px}
.hint{padding:18px}
.discussion>.notice{margin:12px}
.discussion>button{margin:0 18px 18px}
.comment-form{padding:18px;border-bottom:1px solid var(--portal-line, #444)}
.comment-form label{display:block;margin:12px 0}
.comment-form textarea{display:block;margin-top:6px}
.comment{padding:18px;border-bottom:1px solid var(--portal-line, #303030)}
.mk .comment-title{display:flex;align-items:center;gap:7px;width:100%;border:0;border-radius:0;background:none;padding:0;text-align:left}
.comment-title small{margin-left:auto;color:var(--portal-muted, #888)}
.number{display:grid;place-items:center;border:1px solid var(--portal-line, #666);border-radius:50%;width:22px;height:22px;flex-shrink:0}
.comment p{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0 14px}
.mk .text-button{padding:0;background:none;border:0;color:var(--portal-muted, #999)}
.reply{border-left:1px solid var(--portal-line, #555);padding-left:10px;margin:15px 0}
.reply small{margin-left:8px;color:var(--portal-muted, #777)}
.comment .actions{justify-content:space-between;margin-top:8px}
.discussion footer{margin-top:auto;padding:18px;border-top:1px solid var(--portal-line, #333)}
.discussion footer p{margin-bottom:12px}
.review-actions{display:grid;gap:8px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:850px){.list-head{display:none}
.list article{grid-template-columns:1fr auto}
.list .actions{grid-column:1/-1}
.discussion{width:290px}
.viewer-toolbar{flex-wrap:wrap}
.screen-navigation{max-width:100%;width:100%;flex-basis:100%}}
@media(max-width:600px){.mk-heading{align-items:flex-start;flex-direction:column}
.viewer-header{padding:12px;flex-wrap:wrap}
.viewer-toolbar{padding:10px 12px}
.viewer-toolbar button{padding:5px 9px}
.viewer-body{grid-template-rows:minmax(180px,55%) minmax(120px,45%)}
.discussion>header{padding:12px 18px}
.comment{padding:14px 18px}}

/* Editorial client presentation: quiet navigation and full-page artwork. */
.collection-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));max-width:1200px}
.collection-card{border:1px solid var(--portal-line, #ddd);border-radius:8px;overflow:hidden;background:var(--portal-surface, #1b1b1b)}
.mk .collection-cover{display:block;position:relative;width:100%;height:290px;border:0;border-radius:0;padding:22px 22px 0;overflow:hidden;background:var(--portal-raised, #222);text-align:left}
.collection-cover img{display:block;width:100%;height:auto;min-height:100%;object-position:top;box-shadow:0 8px 30px #0002;transition:transform .3s}
.collection-cover:hover img{transform:translateY(-8px)}
.cover-open{position:absolute;right:18px;bottom:18px;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--portal-surface, #171717);color:var(--portal-text, #dedede);box-shadow:0 3px 12px #0002;font-size:20px}
.cover-placeholder{display:grid;place-items:center;height:100%;font-size:50px;color:var(--portal-muted, #888)}
.collection-info{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.collection-info p{margin-top:6px}
.collection-actions{display:flex;gap:8px}
.collection-actions button{display:flex;align-items:center;gap:8px}
.mk-viewer{color:var(--portal-text, #e6e6e6);color-scheme:var(--portal-scheme, dark)}
.mk-viewer h2,.mk-viewer h3{color:var(--portal-text, #eeeeee);background:none;-webkit-text-fill-color:currentColor}
.mk-viewer p{color:var(--portal-muted, #858585)}
.mk-viewer button,.mk-viewer select{background:var(--portal-surface, #171717);border-color:var(--portal-line, #393939);color:var(--portal-text, #c4c4c4);border-radius:8px}
.mk-viewer button:hover{background:var(--portal-raised, #292929)}
.mk-viewer .primary{color:var(--portal-text, #fff);background:var(--portal-accent);border-color:var(--portal-accent-hover)}
.mk-viewer .primary:hover{background:var(--portal-accent-hover)}
.mk-viewer:focus-visible{outline-color:var(--portal-line, #ddd)}
.mk-viewer .badge{background:var(--portal-raised, #252525);color:var(--portal-muted, #aaa);border-color:var(--portal-line, #343434)}
.viewer-header{border-color:var(--portal-line, #303030)}
.viewer-header strong{max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mk-viewer .back-to-portal{border:0;padding:0;display:flex;align-items:center;gap:8px;color:var(--portal-muted, #777)}
.header-divider{color:var(--portal-muted, #555)}
.viewer-toolbar{border-color:var(--portal-line, #303030)}
.screen-navigation{flex:initial;width:auto;gap:8px}
.screen-count{color:var(--portal-muted, #888);min-width:46px;text-align:center}
.mk-viewer .screen-arrow{width:29px;height:29px;border:0;font-size:16px}
.viewer-toolbar .actions>button{display:flex;align-items:center;gap:7px}
.viewer-toolbar .actions>button>span:not(.iconify){color:var(--portal-muted, #888);background:var(--portal-raised, #303030);padding:0 5px;border-radius:3px}
.zoom-controls{display:flex;gap:4px;align-items:center;color:var(--portal-muted, #888)}
.zoom-controls button{border:0;padding:5px 9px}
.mk-viewer .mobile-page-toggle{display:none}
.viewer-body{position:relative;display:flex;min-height:0}
.page-sidebar{flex-shrink:0;border-right:1px solid var(--portal-line, #303030);display:flex;flex-direction:column;overflow:auto}
.page-sidebar-title strong{font-weight:500;display:block}
.page-sidebar-title p{margin-top:5px}
.page-sidebar nav{display:flex;flex-direction:column;gap:4px}
.mk-viewer .page-sidebar nav button{display:flex;align-items:baseline;gap:10px;text-align:left;border:0;background:none;padding:9px 12px;font-size:12px;line-height:1.5;color:var(--portal-muted, #888)}
.page-sidebar nav button span{color:var(--portal-muted, #999);min-width:16px;font-variant-numeric:tabular-nums}
.mk-viewer .page-sidebar nav button.active{color:var(--portal-text, #dedede);background:var(--portal-raised, #292929)}
.mk-viewer .page-sidebar nav button:hover{color:var(--portal-text, #dedede);background:var(--portal-raised, #252525)}
.page-sidebar-footer{margin-top:auto}
.page-sidebar-footer>span{font-size:13px;letter-spacing:-.5px;font-weight:600}
.page-sidebar-footer p{margin-top:3px}
.page-sidebar-footer>button{display:flex;align-items:center;gap:7px;margin-top:18px;width:100%;justify-content:center}
.canvas{scrollbar-color:#444 transparent}
.page-intro{max-width:1440px;margin:0 auto 28px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.page-intro h2{font-weight:500;letter-spacing:-.8px;line-height:1.2}
.page-intro p{margin-top:10px}
.page-intro a{display:grid;place-items:center;border:1px solid var(--portal-line, #393939);color:var(--portal-muted, #777);font-size:16px;flex-shrink:0}
.page-intro a:hover{background:var(--portal-raised, #252525)}
.artboard{box-shadow:0 0 0 1px #ffffff12;background:var(--portal-surface, #191919);margin-left:auto;margin-right:auto}
.mk-viewer .pin{background:var(--portal-raised, #222);border-color:var(--portal-line, #fff);color:var(--portal-text, #fff);border-radius:50%}
.mk-viewer .pin.selected,.mk-viewer .pin.draft{background:var(--portal-accent)}
.discussion{border-color:var(--portal-line, #333)}
.discussion>header{border-color:var(--portal-line, #343434);position:relative;padding-right:36px}
.mk-viewer .discussion-close{position:absolute;right:12px;top:12px;border:0;background:none;font-size:20px;padding:0 4px}
.mk-viewer textarea{background:var(--portal-surface, #171717);color:var(--portal-text, #dedede);border-color:var(--portal-line, #444)}
.comment,.comment-form,.discussion footer{border-color:var(--portal-line, #343434)}
.comment.active{background:var(--portal-raised, #292929)}
.comment p{color:var(--portal-text, #c0c0c0)}
.mk-viewer .comment-title{color:var(--portal-text, #ddd)}
.number{border-color:var(--portal-line, #555)}
.reply{border-color:var(--portal-line, #444)}
.mk-viewer .notice{background:var(--portal-raised, #262626);border-color:var(--portal-line, #444);color:var(--portal-muted, #aaa)}
.mk-viewer .text-button{color:var(--portal-muted, #777)}
.has-comments .canvas{padding-left:32px;padding-right:32px}
@media(min-width:1450px){.canvas{padding-left:80px;padding-right:80px}
.page-sidebar{width:254px}}
@media(max-width:1100px){.page-sidebar{padding-left:10px;padding-right:10px}
.page-intro h2{font-size:24px}
.viewer-toolbar{flex-wrap:wrap}
.screen-navigation{width:auto;flex-basis:auto;max-width:none}}
@media(max-width:760px){.page-sidebar{display:none}
.page-sidebar.mobile-open{display:flex;position:absolute;left:0;top:0;bottom:0;z-index:5}
.mk-viewer .mobile-page-toggle{display:flex;align-items:center;gap:7px}
.viewer-header strong{max-width:200px}
.has-comments .page-intro h2{font-size:21px}}
@media(max-width:600px){.viewer-body{display:flex;flex:1;min-height:0}
.viewer-header{gap:10px}
.viewer-header>div:first-child{gap:10px}
.viewer-toolbar .actions{gap:8px;flex-wrap:wrap}
.zoom-controls{display:none}
.page-intro{margin-bottom:22px;gap:10px}
.discussion{position:absolute;right:0;top:0;bottom:0;border-top:0;border-left:1px solid var(--portal-line, #444);z-index:6}
.collection-cover{height:220px!important}
.collection-info{flex-direction:column;gap:10px}
.collection-actions{justify-content:flex-start;flex-wrap:wrap}}
@media(prefers-reduced-motion:reduce){.collection-cover img{transition:none}}
.export-comments{display:inline-flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;padding:7px 9px;border:1px solid var(--portal-line,#444);border-radius:8px;background:var(--portal-raised,#252525);color:var(--portal-text,#ddd);cursor:pointer}
.export-comments:disabled{opacity:.5;cursor:not-allowed}
.rename-form{display:flex;align-items:center;gap:8px;padding:0 22px 12px}
.rename-form input{min-width:0;flex:1;padding:8px 10px;border:1px solid var(--portal-line,#444);border-radius:8px;background:var(--portal-surface,#171717);color:var(--portal-text,#eee);font:inherit;font-size:12px}
.rename-form button{padding:7px 10px;border:1px solid var(--portal-line,#444);border-radius:8px;background:var(--portal-raised,#252525);font-size:12px}
.rename-form button.primary{background:var(--portal-accent);color:var(--portal-accent-ink,#fff)}
.add-page-button{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:6px 9px!important;border-radius:8px!important;font-size:12px!important}
.page-nav-row{display:flex;align-items:center;gap:3px}
.mk .page-nav-row>button:first-child{flex:1;min-width:0;display:flex;align-items:baseline;gap:10px;text-align:left;border:0;background:none;padding:9px 12px;border-radius:8px;font-size:12px;line-height:1.5;color:var(--portal-muted,#888)}
.page-order-actions{display:flex;flex-direction:column;opacity:.55}
.page-nav-row:hover .page-order-actions,.page-order-actions:focus-within{opacity:1}
.mk .page-order-actions button{display:grid;place-items:center;border:0;border-radius:8px;background:transparent;color:var(--portal-muted,#aaa)}
.mk .page-order-actions button:disabled{opacity:.2}
.add-pages-backdrop{position:absolute;inset:0;z-index:20;display:grid;place-items:center;padding:24px;background:#000b}
.add-pages-dialog{display:flex;flex-direction:column;gap:14px;width:min(680px,100%);border:1px solid var(--portal-line,#444);background:var(--portal-surface,#171717);box-shadow:0 20px 80px #0008;overflow:auto}
.add-pages-dialog>header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
.add-pages-dialog>header h2{margin:0;font-size:20px}
.add-pages-dialog>header p:not(.assets-eyebrow){margin-top:6px}
.add-pages-dialog>header>button{border:0;background:transparent;font-size:24px}
.add-pages-dialog>label{display:grid;gap:6px;color:var(--portal-muted,#aaa)}
.add-pages-dialog .selection-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
.add-pages-dialog .screen-picker{max-height:42vh;overflow:auto;border:1px solid var(--portal-line,#333);border-radius:8px}
.add-pages-dialog .screen-picker label{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--portal-line,#2e2e2e)}
.add-pages-dialog .screen-picker label:last-child{border-bottom:0}
.add-pages-dialog .screen-picker input{width:auto}
.add-pages-dialog .screen-picker span{display:grid;gap:3px}
.add-pages-dialog .screen-picker small{color:var(--portal-muted,#888)}
.add-pages-dialog .modal-actions{display:flex;justify-content:flex-end;gap:8px}
.add-pages-dialog>.primary{align-self:flex-start}
.mk{font:14px/1.5 Inter,Arial,sans-serif}
.mk h2{font-size:26px;font-weight:600}
.mk h3{font-size:15px;font-weight:500}
.mk-heading p{font-size:13px;line-height:1.6}
.mk button,.mk select{min-height:40px;border-radius:8px;padding:9px 12px;font-size:13px}
.mk input:not([type=checkbox]),.mk textarea{min-height:40px;font-size:13px;background:var(--portal-raised);border-radius:8px;padding:10px 12px;line-height:1.6}
.mk input[type=checkbox]{width:16px;height:16px;accent-color:var(--portal-accent);flex:none}
.mk .primary,.mk-viewer .primary,.rename-form button.primary{background:var(--portal-accent);border-color:var(--portal-accent);color:var(--portal-accent-ink,#fff)}
.mk .primary:hover:not(:disabled),.mk-viewer .primary:hover:not(:disabled){background:var(--portal-accent-hover)}
.mk :focus-visible{outline:2px solid var(--portal-accent);outline-offset:3px}
.mk .badge,.mk-viewer .badge{font-size:11px;font-weight:500;border:0;border-radius:6px;padding:5px 8px;background:var(--portal-warning-soft);color:var(--portal-warning)}
.mk .badge.approved{background:var(--portal-success-soft);color:var(--portal-success)}
.mk .badge.changes{background:var(--portal-danger-soft);color:var(--portal-danger)}
.mk .badge.available{background:var(--portal-info-soft);color:var(--portal-info)}
.collection-grid{gap:24px}
.collection-info{padding:22px 22px 18px}
.collection-info h3{font-size:17px;font-weight:600;overflow-wrap:anywhere}
.collection-info p{font-size:12px;line-height:1.6}
.collection-info>div{min-width:0}
.collection-actions{justify-content:flex-start;flex-wrap:wrap;padding:0 22px 22px}
.collection-actions button{font-size:12px}
.collection-actions .primary{margin-right:auto}
.collection-cover img{object-fit:cover}
.importer{padding:24px}
.importer header{flex-wrap:wrap}
.importer>label{font-size:13px}
.selection-head{font-size:13px;flex-wrap:wrap}
.screen-picker label>span{min-width:0;overflow-wrap:anywhere}
.screen-picker small{font-size:12px}
.mk .notice,.mk-viewer .notice{border:1px solid var(--portal-line);background:var(--portal-raised);color:var(--portal-muted);border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.6}
.mk .notice[role=alert],.mk-viewer .notice[role=alert]{border-color:var(--portal-danger);background:var(--portal-danger-soft);color:var(--portal-danger)}
.mk-viewer{font-size:13px;background:var(--portal-bg)}
.viewer-header{padding:16px 24px;min-height:72px;flex-shrink:0}
.viewer-header>div:first-child{min-width:0}
.viewer-header strong{font-size:14px}
.mk-viewer .back-to-portal{font-size:13px;min-height:40px;flex-shrink:0}
.viewer-header>.actions{justify-content:flex-end;min-width:0}
.viewer-header select{max-width:240px;min-width:0;font-size:12px}
.viewer-toolbar{padding:12px 24px;min-height:64px;flex-shrink:0}
.viewer-toolbar .actions{flex-wrap:wrap;gap:10px}
.viewer-toolbar .actions>button{font-size:12px}
.screen-count{font-size:12px}
.mk .screen-arrow,.mk-viewer .screen-arrow{width:36px;height:40px;min-height:40px;padding:0;border:1px solid var(--portal-line);border-radius:8px}
.zoom-controls{font-size:12px}
.zoom-controls button{min-height:36px;font-size:12px}
.page-sidebar{width:232px;padding:24px 16px;background:var(--portal-surface)}
.page-sidebar-title{padding:0 10px 22px}
.page-sidebar-title strong{font-size:14px}
.page-sidebar-title p{font-size:12px}
.mk .page-nav-row>button:first-child,.mk-viewer .page-sidebar nav button{min-height:40px;padding:10px;font-size:13px;align-items:flex-start;overflow-wrap:anywhere}
.mk .page-nav-row>button:first-child.active{background:var(--portal-accent-soft);color:var(--portal-accent-text)}
.page-sidebar nav button span{font-size:11px;padding-top:2px}
.mk .page-order-actions button{width:24px;height:22px;min-height:22px;padding:0;font-size:12px}
.page-sidebar-footer{padding:28px 10px 0}
.page-sidebar-footer p{font-size:12px}
.page-sidebar-footer>button{font-size:12px}
.page-intro h2{font-size:28px}
.page-intro p{font-size:13px;line-height:1.6}
.page-intro a{width:40px;height:40px;border-radius:8px}
.canvas{background:var(--portal-bg);padding:32px 40px 56px}
.discussion{width:340px;background:var(--portal-surface)}
.discussion>header{padding:20px 40px 20px 20px}
.discussion h3{font-size:15px}
.check{font-size:12px;align-items:center;line-height:1.5;gap:9px}
.comment-title{align-items:flex-start!important;flex-wrap:wrap;min-height:0!important}
.comment-title strong{font-size:13px}
.comment-title small{font-size:11px}
.comment p{font-size:13px;line-height:1.7}
.reply strong{font-size:12px}
.reply small{font-size:11px}
.comment .actions{gap:8px}
.comment .actions button{font-size:12px;padding:8px 10px}
.discussion footer p{font-size:13px;line-height:1.6}
.mk .text-button{min-height:32px;font-size:12px;line-height:1.5;text-align:left}
.mk .pin,.mk-viewer .pin{width:28px;height:28px;min-height:28px;padding:0;font-size:12px;border-radius:50%;color:#fff;background:#292929;border:2px solid #fff}
.mk .pin.selected,.mk .pin.draft,.mk-viewer .pin.selected,.mk-viewer .pin.draft{background:var(--portal-accent);color:var(--portal-accent-ink,#fff);border-color:#fff}
.mk .discussion-close{width:28px;height:28px;min-height:28px;padding:0;line-height:1}
.export-comments{min-height:40px!important;font-size:12px!important;text-align:left}
.rename-form{flex-wrap:wrap}
.rename-form input{flex-basis:100%}
.mk .delete-mockup{color:var(--portal-danger);background:var(--portal-danger-soft);border-color:var(--portal-danger)}
.mk .delete-mockup:hover{color:var(--portal-danger);background:var(--portal-danger-soft)}
.delete-backdrop{position:fixed;inset:0;z-index:230;display:grid;place-items:center;padding:24px;background:#0009;backdrop-filter:blur(4px)}
.delete-dialog{width:min(520px,100%);max-height:calc(100dvh - 48px);overflow:auto;overflow-wrap:anywhere;padding:28px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface);box-shadow:0 24px 80px #0006}
.delete-dialog h2{font-size:22px;line-height:1.4;margin:0 0 16px}
.delete-dialog p{font-size:13px;line-height:1.6}
.delete-dialog>div{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:24px}
.add-pages-dialog{border-radius:8px;max-height:calc(100dvh - 48px);padding:24px}
.add-pages-dialog>header p:not(.assets-eyebrow){font-size:13px}
.add-pages-dialog>label{font-size:13px}
.add-pages-dialog .selection-head{font-size:13px}
.add-pages-dialog .screen-picker small{font-size:12px}
.add-pages-dialog .modal-actions{flex-wrap:wrap}
.add-pages-dialog>header>button{width:32px;height:32px;min-height:32px;padding:0}
.mk .add-page-button{min-height:36px;font-size:12px!important}
@media(max-width:1100px){.viewer-header{flex-wrap:wrap}
.viewer-header>.actions{flex-wrap:wrap}
.page-sidebar{width:200px;padding:20px 10px}
.canvas{padding:28px}
.discussion{width:310px}
.has-comments .canvas{padding:24px}}
@media(max-width:760px){.mk h2{font-size:24px}
.mk-viewer .mobile-page-toggle{font-size:12px}
.viewer-header{padding:12px 16px}
.viewer-toolbar{padding:12px 16px}
.viewer-toolbar .actions{gap:8px}
.viewer-toolbar .actions>button{font-size:12px}
.page-sidebar.mobile-open{width:250px;box-shadow:12px 0 32px #0004;background:var(--portal-surface)}
.has-comments .canvas{padding:24px 16px}
.page-intro h2{font-size:24px}}
@media(max-width:600px){.viewer-header>div:first-child{width:100%}
.viewer-header>.actions{width:100%;justify-content:flex-start}
.viewer-header strong{max-width:50%;font-size:13px}
.mk-viewer .back-to-portal{font-size:12px}
.viewer-header select{max-width:210px;flex:1}
.viewer-header .badge{flex:none}
.viewer-toolbar{gap:10px}
.viewer-toolbar .actions{width:100%}
.viewer-toolbar .actions>button{flex:1;justify-content:center;white-space:nowrap;font-size:11px}
.screen-navigation{width:100%;justify-content:space-between}
.mk .screen-arrow{width:36px;height:36px;min-height:36px}
.screen-count{font-size:12px}
.canvas{padding:24px 16px 40px}
.page-intro h2{font-size:23px}
.page-intro p{font-size:12px;max-width:none}
.discussion{width:min(360px,100%);box-shadow:-12px 0 32px #0005}
.comment-title small{margin-left:0}
.collection-info{padding:20px}
.collection-actions{padding:0 20px 20px}
.collection-actions button{font-size:12px;flex-grow:1;justify-content:center}
.mk .collection-cover{height:240px;padding:20px 20px 0}
.importer{padding:20px 16px}
.rename-form{padding-left:20px;padding-right:20px}
.add-pages-backdrop,.delete-backdrop{padding:12px}
.add-pages-dialog,.delete-dialog{padding:24px 20px;max-height:calc(100dvh - 24px)}
.add-pages-dialog .modal-actions>*{flex:1;text-align:center;justify-content:center}
.add-pages-dialog>header{gap:12px}
.add-pages-dialog>header h2{font-size:21px}}
</style>
