<script setup lang="ts">
import { resourceLabels,resourceIcons,money,portalDate,type PortalMember,type PortalTodo,type ResourceKind,type PortalResource } from '~/types/portal'
type View='home'|'roadmap'|'assets'|'satisfaction'|'account'|'notifications'|ResourceKind
const route=useRoute(), router=useRouter()
const view=computed<View>(()=>{
 const tab=String(route.query.tab)
 if (tab==='project' || tab==='milestones') return 'roadmap'
 return ['home','roadmap','assets','satisfaction','account','notifications',...Object.keys(resourceLabels)].includes(tab)?tab as View:'home'
})
const navigate=(tab:View,itemId?:string)=>router.replace({query:{...route.query,tab,requestId:undefined,stepId:tab==='roadmap'?itemId:undefined}})
const roadmapItem=computed(()=>typeof route.query.stepId==='string'?route.query.stepId:undefined)
const user=ref({id:'',name:'',email:'',role:'',memberRole:''}),organization=ref(''),ready=ref(false),loading=ref(false),error=ref('')
const emptyProject={id:'',name:'',description:'',status:'',progress:0,dueDate:'',currentPhase:'',decisionMakerId:null as string|null,decisionMakerName:''}
const project=ref({...emptyProject})
const projects=ref<{id:string;name:string}[]>([]), resources=ref<PortalResource[]>([]), activity=ref<{id:string;message:string;createdAt:string}[]>([])
const members=ref<PortalMember[]>([]), todos=ref<PortalTodo[]>([]), permissions=ref({canContribute:false,canReview:false})
const payments=computed(()=>resources.value.filter(r=>r.kind==='payment'&&r.status==='due'))
const pendingRoadmap=computed(()=>todos.value.find(item=>item.kind==='roadmap'))
const reviews=computed(()=>resources.value.filter(r=>r.kind==='mockup'&&r.status==='pending'))
const overviewTab=ref<'resources'|'activity'>('resources')
const resourceSearch=ref(''), resourceFilter=ref('all'), resourceSort=ref('recent')
const statusLabels:Record<string,string>={available:'Disponible',due:'À régler',paid:'Réglé',cancelled:'Annulé',pending:'À valider',approved:'Validée',changes:'À modifier'}
const visibleResources=computed(()=>resources.value.filter(r=>(resourceFilter.value==='all'||r.kind===resourceFilter.value)&&(r.title+' '+r.description).toLowerCase().includes(resourceSearch.value.toLowerCase())).slice().sort((a,b)=>resourceSort.value==='name'?a.title.localeCompare(b.title,'fr'):b.createdAt.localeCompare(a.createdAt)))
const navigation=[{id:'home' as View,label:'Vue d’ensemble',icon:'i-tabler-home'},{id:'roadmap' as View,label:'Roadmap',icon:'i-tabler-route'},{id:'assets' as View,label:'Assets',icon:'i-tabler-photo'},...Object.entries(resourceLabels).map(([id,label])=>({id:id as View,label,icon:resourceIcons[id as ResourceKind]})),{id:'satisfaction' as View,label:'Satisfaction',icon:'i-tabler-heart-handshake'},{id:'notifications' as View,label:'Notifications',icon:'i-tabler-bell'},{id:'account' as View,label:'Mon compte',icon:'i-tabler-user-circle'}]
const navigationGroups=[
 {id:'project',label:'Projet',icon:'i-tabler-layout-board',views:['roadmap','payment','analytics','satisfaction']},
 {id:'resources',label:'Ressources',icon:'i-tabler-folders',views:['assets','file','mockup','link','wiki']},
 {id:'personal',label:'Mon espace',icon:'i-tabler-user-circle',views:['notifications','account']},
].map(group=>({...group,items:group.views.map(id=>navigation.find(item=>item.id===id)!)}))
const expandedGroup=ref<string|null>(null)
watch(view,tab=>{expandedGroup.value=navigationGroups.find(group=>group.views.includes(tab))?.id ?? null},{immediate:true})
const navigationCount=(tab:View)=>tab==='payment'?payments.value.length:tab==='roadmap'?todos.value.filter(item=>item.kind==='roadmap').length:resources.value.filter(resource=>resource.kind===tab).length
const onboardingDescriptions:Record<string,string>={satisfaction:'Partagez votre retour d’expérience sur le projet et la collaboration avec MC Studio.',home:'Retrouvez ici les informations clés, les dernières ressources partagées et les actualités de votre projet.',roadmap:'Suivez le planning, les prochaines étapes et les validations du projet.',assets:'Consultez les visuels de votre marque et copiez le prompt IA propre à ce projet.',payment:'Retrouvez vos échéances et les coordonnées bancaires pour régler MC Studio par virement.',file:'Téléversez les fichiers demandés par MC Studio ou partagez un document utile au projet.',mockup:'Parcourez les maquettes, laissez vos commentaires directement sur les écrans et validez une version.',link:'Accédez rapidement aux sites et outils utiles à votre projet.',wiki:'Lisez les guides et les informations préparés par MC Studio.',notifications:'Retrouvez les nouveautés et choisissez vos notifications et la fréquence des relances.',account:'Modifiez votre mot de passe et retrouvez votre rôle dans l’équipe.',analytics:'Consultez les indicateurs de performance de votre site lorsqu’ils sont disponibles.'}
const onboardingSteps=computed(()=>navigation.map(item=>({...item,description:onboardingDescriptions[item.id]||'Retrouvez les informations et ressources liées à cette rubrique.'})))
const onboardingOpen=ref(false),onboardingIndex=ref(0),onboardingBusy=ref(false),onboardingError=ref(''),onboardingAvailable=ref(false)
const currentOnboardingStep=computed(()=>onboardingSteps.value[onboardingIndex.value]||onboardingSteps.value[0])
watch(onboardingIndex,index=>{const step=onboardingSteps.value[index];if(onboardingOpen.value&&step&&view.value!==step.id)navigate(step.id)})
watch(view,tab=>{if(onboardingOpen.value){const index=onboardingSteps.value.findIndex(step=>step.id===tab);if(index>=0)onboardingIndex.value=index}})
let projectSequence=0, refreshSequence=0
const refresh=async()=>{
 const projectId=project.value.id
 if(!projectId)return
 const sequence=++refreshSequence
 try {
  const data=await $fetch<{resources:PortalResource[];activity:typeof activity.value;todos:PortalTodo[]}>('/api/portal/resources',{query:{projectId}})
  if(project.value.id!==projectId || sequence!==refreshSequence)return
  resources.value=data.resources; activity.value=data.activity; todos.value=data.todos || []
 } catch(cause:any) {
  if(project.value.id===projectId && sequence===refreshSequence)error.value=cause?.data?.statusMessage || 'Impossible d’actualiser votre projet.'
 }
}
const loadProject=async(id?:string)=>{
 const sequence=++projectSequence
 refreshSequence++
 loading.value=true; error.value=''
 try {
  const data=await $fetch<{project:typeof project.value|null;projects:typeof projects.value;members:PortalMember[];permissions:typeof permissions.value}>('/api/portal/client/project',{query:id?{projectId:id}:{}})
  if(sequence!==projectSequence)return
  projects.value=data.projects
  members.value=data.members || []
  permissions.value=data.permissions || {canContribute:false,canReview:false}
  resources.value=[]; todos.value=[]; activity.value=[]
  project.value=data.project || {...emptyProject}
  if(data.project)await refresh()
 } catch(cause:any) {
  if(sequence===projectSequence){project.value={...emptyProject};error.value=cause?.data?.statusMessage || 'Impossible de charger votre espace.'}
 } finally {
  if(sequence===projectSequence)loading.value=false
 }
}
const updateRoadmap=async(summary:{progress:number;currentPhase:{title:string}|null},roadmapProject:{id:string})=>{
 if(project.value.id!==roadmapProject.id)return
 project.value.progress=summary.progress
 project.value.currentPhase=summary.currentPhase?.title || ''
 await refresh()
}
const openNotificationProject=async(projectId:string,tab:string)=>{
 await router.replace({query:{...route.query,projectId,requestId:undefined,stepId:undefined,tab:['file','mockup'].includes(tab)?tab:'roadmap'}})
}
watch(()=>route.query.projectId,id=>{
 if(ready.value && (loading.value || id!==project.value.id))loadProject(typeof id==='string'?id:undefined)
})
const chooseProject=async(id:string)=>{await router.replace({query:{...route.query,projectId:id,requestId:undefined,stepId:undefined}})}
const signOut=async()=>{await $fetch('/api/portal/auth/logout',{method:'POST'});await navigateTo('/portal/login')}
const openOnboarding=()=>{onboardingIndex.value=Math.max(0,onboardingSteps.value.findIndex(step=>step.id===view.value));onboardingError.value='';onboardingOpen.value=true}
const finishOnboarding=async()=>{onboardingOpen.value=false;if(!onboardingAvailable.value)return;onboardingBusy.value=true;onboardingError.value='';try{await $fetch('/api/portal/client/onboarding',{method:'POST'})}catch(e:any){onboardingError.value=e?.data?.statusMessage||'Impossible d’enregistrer la fin de la visite.'}finally{onboardingBusy.value=false}}
useHead({title:computed(()=>`${organization.value || 'Votre projet'} · MC Studio`),meta:[{name:'robots',content:'noindex,nofollow'}]})
onMounted(async()=>{
 try{const me=await $fetch<{user:typeof user.value|null;organization?:{name:string}}>('/api/portal/auth/me');if(!me.user){await navigateTo('/portal/login');return}if(me.user.role==='admin'){await navigateTo('/portal/admin');return}user.value=me.user;organization.value=me.organization?.name || 'Votre espace';await loadProject(typeof route.query.projectId==='string'?route.query.projectId:undefined);try{const onboarding=await $fetch<{completed:boolean}>('/api/portal/client/onboarding');onboardingAvailable.value=true;if(!onboarding.completed)onboardingOpen.value=true}catch{}}
 catch{error.value='Impossible de charger votre compte. Réessayez.'}finally{ready.value=true}
})
</script>
<template>
 <main class="portal">
  <aside class="sidebar"><div class="brand"><PortalBrand/></div><div class="identity"><span>{{organization.slice(0,1) || 'M'}}</span><div><strong>{{organization || 'MC Studio'}}</strong><small>ESPACE CLIENT</small></div><UIcon name="i-tabler-lock"/></div><p class="nav-label">ESPACE CLIENT</p><nav aria-label="Espace client">
   <button type="button" :class="{active:view==='home'}" :aria-current="view==='home'?'page':undefined" @click="navigate('home')"><UIcon name="i-tabler-home"/>Vue d’ensemble</button>
   <div v-for="group in navigationGroups" :key="group.id" class="nav-group">
    <button type="button" class="nav-group-toggle" :class="{'group-active':group.views.includes(view)}" :aria-expanded="expandedGroup===group.id" :aria-controls="'nav-group-'+group.id" @click="expandedGroup=expandedGroup===group.id?null:group.id">
     <UIcon :name="group.icon"/>{{group.label}}<UIcon name="i-tabler-chevron-down" class="nav-chevron" :class="{expanded:expandedGroup===group.id}"/>
    </button>
    <div v-show="expandedGroup===group.id" :id="'nav-group-'+group.id" class="nav-group-items">
     <button v-for="item in group.items" :key="item.id" type="button" :class="{active:view===item.id}" :aria-current="view===item.id?'page':undefined" @click="navigate(item.id)"><UIcon :name="item.icon"/>{{item.label}}<span v-if="navigationCount(item.id)>0" class="count">{{navigationCount(item.id)}}</span></button>
    </div>
   </div>
  </nav><div class="sidebar-bottom"><p class="nav-label">ASSISTANCE</p><a href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer">Contacter l’équipe<UIcon name="i-tabler-arrow-up-right"/></a><button @click="openOnboarding"><UIcon name="i-tabler-help-circle"/>Découvrir votre espace</button><button @click="signOut"><UIcon name="i-tabler-logout"/>Se déconnecter</button></div></aside>
  <div class="main"><header><div class="header-title">{{navigation.find(n=>n.id===view)?.label}} <span class="header-status"><i/>{{project.status || 'Espace privé'}}</span></div><div class="portal-header-actions"><PortalThemeToggle /><div class="user"><i>{{user.name.slice(0,1)}}</i><span>{{user.name}}</span><button class="account-shortcut" aria-label="Mon compte" @click="navigate('account')"><UIcon name="i-tabler-user-circle"/></button><button class="notification-shortcut" aria-label="Notifications" @click="navigate('notifications')"><UIcon name="i-tabler-bell"/></button><button class="mobile-exit" aria-label="Se déconnecter" @click="signOut"><UIcon name="i-tabler-logout"/></button></div></div></header>
   <div class="content">
    <p v-if="!ready || loading" class="loading" role="status">Ouverture de votre espace…</p>
    <p v-if="error && !['account','notifications'].includes(view)" class="error" role="alert">{{error}} <button @click="loadProject(typeof route.query.projectId==='string'?route.query.projectId:undefined)">Réessayer</button></p>
    <template v-if="ready && !loading">
     <label v-if="projects.length>1" class="project-picker">Votre projet<select :value="project.id" @change="chooseProject(($event.target as HTMLSelectElement).value)"><option v-for="p in projects" :key="p.id" :value="p.id">{{p.name}}</option></select></label>
     <PortalAccount v-if="view==='account'" :name="user.name" :email="user.email" :member-role="user.memberRole"/><PortalNotifications v-else-if="view==='notifications'" @open-project="openNotificationProject"/><p v-else-if="!project.id" class="loading">Votre équipe n’a pas encore de projet. Vous retrouverez ici les projets partagés par MC Studio.</p><template v-else-if="view==='home'">
      <div class="workspace-heading"><div><h1>{{project.name}}</h1><p>{{organization}} <span>·</span> Votre espace partagé avec MC Studio</p></div><button class="main-action" @click="navigate(pendingRoadmap?'roadmap':reviews.length?'mockup':'roadmap',pendingRoadmap?.stepId)"><UIcon :name="pendingRoadmap || reviews.length?'i-tabler-check':'i-tabler-arrow-up-right'"/>{{pendingRoadmap?'Examiner la validation':reviews.length?(permissions.canReview?'Valider les maquettes':'Consulter les maquettes'):'Voir la roadmap'}}</button></div>
      <div class="project-strip"><div><span>Phase actuelle</span><strong><UIcon name="i-tabler-layout-board"/>{{project.currentPhase || (project.progress===100 ? 'Terminé' : 'À définir')}}</strong></div><div><span>Avancement</span><strong><span class="mini-progress"><i :style="{width:project.progress+'%'}"/></span>{{project.progress}} %</strong></div><div><span>Livraison prévue</span><strong><UIcon name="i-tabler-calendar"/>{{portalDate(project.dueDate)}}</strong></div><button @click="navigate('payment')"><span>À régler</span><strong>{{money(payments.reduce((sum,p)=>sum+p.amount,0))}}<UIcon name="i-tabler-arrow-up-right"/></strong></button></div>
      <PortalTodos :items="todos" :user-id="user.id" :can-contribute="permissions.canContribute" :can-review="permissions.canReview" @navigate="navigate"/><nav class="workspace-tabs" aria-label="Vue d’ensemble"><button :class="{selected:overviewTab==='resources'}" @click="overviewTab='resources'">Ressources <span>{{resources.length}}</span></button><button :class="{selected:overviewTab==='activity'}" @click="overviewTab='activity'">Activité <span>{{activity.length}}</span></button></nav>
      <template v-if="overviewTab==='resources'">
       <div class="table-toolbar"><label class="filter-pill"><span>Type</span><select v-model="resourceFilter" aria-label="Filtrer les ressources par type"><option value="all">Toutes les ressources</option><option v-for="(label,key) in resourceLabels" :key="key" :value="key">{{label}}</option></select></label><label class="filter-pill"><span>Trier par</span><select v-model="resourceSort" aria-label="Trier les ressources"><option value="recent">Plus récent</option><option value="name">Nom</option></select></label><label class="table-search"><UIcon name="i-tabler-search"/><input v-model="resourceSearch" placeholder="Rechercher…" aria-label="Rechercher dans le projet"></label></div>
       <div class="resource-table-wrap"><table class="resource-table"><thead><tr><th>Nom de la ressource</th><th>Type</th><th>Statut</th><th>Date d’ajout</th><th class="action-col">Action</th></tr></thead><tbody><tr v-for="r in visibleResources" :key="r.id"><td><button class="resource-name" @click="navigate(r.kind)"><UIcon :name="resourceIcons[r.kind]"/><span>{{r.title}}<small v-if="r.fileName">{{(r.fileSize/1024/1024).toFixed(2)}} Mo</small></span></button></td><td><span class="type-tag">{{resourceLabels[r.kind]}}</span></td><td><span :class="['status-tag',r.status]"><i :class="{filled:['approved','paid','available'].includes(r.status)}"/>{{statusLabels[r.status] || r.status}}</span></td><td class="date-cell">{{portalDate(r.createdAt)}}</td><td class="action-col"><button class="open-row" :aria-label="'Ouvrir '+r.title" @click="navigate(r.kind)"><UIcon name="i-tabler-arrow-up-right"/></button></td></tr><tr v-if="!visibleResources.length"><td colspan="5" class="empty-table">{{resourceSearch?'Aucune ressource ne correspond à votre recherche.':'Les ressources partagées par MC Studio apparaîtront ici.'}}</td></tr></tbody></table></div>
       <div class="table-summary"><span>{{visibleResources.length}} ressource{{visibleResources.length>1?'s':''}} affichée{{visibleResources.length>1?'s':''}}</span><span><UIcon name="i-tabler-lock"/> Accessible uniquement à votre équipe</span></div>
      </template>
      <section v-else class="updates"><div v-if="!activity.length" class="empty-updates">Aucune activité pour le moment.</div><article v-for="item in activity" :key="item.id"><span class="activity-dot"/><p>{{item.message}}</p><time>{{portalDate(item.createdAt)}}</time></article></section>
     </template>
    <PortalRoadmap v-else-if="view==='roadmap'" :key="project.id" :project-id="project.id" :item-id="roadmapItem" @changed="updateRoadmap" @resource="navigate"/>
    <PortalAssets v-else-if="view==='assets'" :project-id="project.id" />
    <PortalSatisfaction v-else-if="view==='satisfaction'" :key="project.id" :project-id="project.id" @changed="refresh"/>
     <PortalResources v-else :key="project.id" :project-id="project.id" :kind="view as ResourceKind" :can-contribute="permissions.canContribute" :can-review="permissions.canReview" :members="members" @changed="refresh"/>
    </template>
   </div>
  </div>
  <div v-if="onboardingOpen" class="onboarding-backdrop" role="presentation" @keydown.esc="onboardingOpen=false">
   <section class="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
    <header><div><p class="onboarding-kicker">BIENVENUE DANS VOTRE ESPACE</p><span>{{organization}}</span></div><button type="button" @click="onboardingOpen=false" aria-label="Fermer la visite">×</button></header>
    <div class="onboarding-progress" role="progressbar" :aria-valuenow="onboardingIndex+1" :aria-valuemin="1" :aria-valuemax="onboardingSteps.length"><i :style="{width:((onboardingIndex+1)/onboardingSteps.length*100)+'%'}"/></div>
    <div class="onboarding-step-count">RUBRIQUE {{String(onboardingIndex+1).padStart(2,'0')}} / {{String(onboardingSteps.length).padStart(2,'0')}}</div>
    <div class="onboarding-feature"><span><UIcon :name="currentOnboardingStep.icon"/></span><div><h2 id="onboarding-title">{{currentOnboardingStep.label}}</h2><p>{{currentOnboardingStep.description}}</p></div></div>
    <p class="onboarding-note">Vous pourrez revenir à cette visite depuis le menu d’assistance.</p><p v-if="onboardingError" class="onboarding-error" role="alert">{{onboardingError}}</p>
    <footer><button class="onboarding-skip" @click="finishOnboarding">Passer la visite</button><div><button class="onboarding-secondary" :disabled="onboardingIndex===0" @click="onboardingIndex--">Précédent</button><button class="onboarding-primary" @click="onboardingIndex===onboardingSteps.length-1?finishOnboarding():onboardingIndex++">{{onboardingIndex===onboardingSteps.length-1?'Terminer':'Suivant'}}<UIcon :name="onboardingIndex===onboardingSteps.length-1?'i-tabler-check':'i-tabler-arrow-right'"/></button></div></footer>
   </section>
  </div>
 </main>
</template>
<style scoped>
.portal{min-height:100vh;background:var(--portal-bg,#151515);color:var(--portal-text,#eee);font:14px/1.5 Inter,Arial,sans-serif;color-scheme:var(--portal-scheme,dark)}
.portal *{box-sizing:border-box}
.portal h1,.portal h2,.portal h3{font-family:inherit;background:none;color:var(--portal-text);-webkit-text-fill-color:currentColor;font-weight:600;letter-spacing:-.025em}
.portal button,.portal input,.portal select{font:inherit}
.portal button{cursor:pointer;color:inherit}
.portal a{color:inherit;text-decoration:none}
.portal :focus-visible{outline:2px solid var(--portal-accent);outline-offset:3px}
.portal button:disabled{opacity:.5;cursor:default}
.sidebar{position:fixed;inset:0 auto 0 0;width:248px;background:var(--portal-surface);border-right:1px solid var(--portal-line);display:flex;flex-direction:column;z-index:5;overflow-y:auto}
.brand{height:72px;display:flex;align-items:center;padding:22px 24px;border-bottom:1px solid var(--portal-line)}
.brand:deep(img){width:128px}
.identity{display:flex;align-items:center;gap:10px;margin:20px 16px 4px;padding:11px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised)}
.identity>span:not(.iconify){display:grid;place-items:center;width:32px;height:32px;border:1px solid var(--portal-line);background:var(--portal-accent-soft);color:var(--portal-accent-text);border-radius:8px;font-size:14px;font-weight:600;flex:none}
.identity>div{flex:1;min-width:0}
.identity strong{font-size:13px;font-weight:500;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.identity small{display:none}
.identity>.iconify{color:var(--portal-muted);font-size:16px}
.nav-label{margin:24px 24px 10px;font-size:11px;font-weight:500;letter-spacing:.08em;color:var(--portal-muted)}
.sidebar nav{display:grid;gap:5px;padding:0 14px 20px}
.sidebar nav button{display:flex;align-items:center;gap:10px;border:1px solid transparent;border-radius:8px;background:none;padding:9px 12px;color:var(--portal-muted);font-size:13px;text-align:left;min-height:40px}
.sidebar nav button>.iconify{font-size:19px;flex-shrink:0}
.sidebar nav button.active{background:var(--portal-accent-soft);border-color:transparent;color:var(--portal-text)}
.sidebar nav button.active>.iconify{color:var(--portal-accent-text)}
.sidebar nav button:hover{color:var(--portal-text);background:var(--portal-raised)}
.sidebar nav button{width:100%}
.sidebar nav .nav-group-toggle.group-active{color:var(--portal-text)}
.sidebar nav .nav-group-toggle.group-active>.iconify:first-child{color:var(--portal-accent-text)}
.sidebar nav .nav-chevron{margin-left:auto;font-size:15px;transition:transform .2s}
.sidebar nav .nav-chevron.expanded{transform:rotate(180deg)}
.nav-group-items{display:grid;gap:3px;margin:4px 0 6px 21px;padding-left:8px;border-left:1px solid var(--portal-line)}
.sidebar nav .nav-group-items button{padding:8px;font-size:12px;gap:8px;min-height:36px}
.sidebar nav .nav-group-items button>.iconify{font-size:17px}
.count{margin-left:auto;padding:1px 7px;background:var(--portal-raised);border-radius:6px;color:var(--portal-muted);font-size:11px;font-variant-numeric:tabular-nums}
.sidebar-bottom{margin-top:auto;padding:20px 16px;border-top:1px solid var(--portal-line)}
.sidebar-bottom .nav-label{margin:0 10px 10px}
.sidebar-bottom>a,.sidebar-bottom>button{display:flex;align-items:center;gap:9px;min-height:40px;padding:8px 10px;color:var(--portal-muted);font-size:12px;background:none;border:0;border-radius:8px;width:100%;text-align:left}
.sidebar-bottom>a:hover,.sidebar-bottom>button:hover{background:var(--portal-raised);color:var(--portal-text)}
.sidebar-bottom>a>.iconify{margin-left:auto}
.main{margin-left:248px;min-height:100vh;display:flex;flex-direction:column;min-width:0}
.main>header{min-height:72px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--portal-line);padding:14px 32px;gap:16px;background:var(--portal-surface)}
.header-title{display:flex;align-items:center;gap:12px;font-size:16px;font-weight:500;min-width:0}
.header-status{display:inline-flex;align-items:center;gap:6px;background:var(--portal-success-soft);border-radius:6px;padding:4px 8px;color:var(--portal-success);font-size:11px;font-weight:500;white-space:nowrap}
.header-status i{height:5px;width:5px;border-radius:50%;background:currentColor}
.user{display:flex;align-items:center;gap:10px;color:var(--portal-text);font-size:13px}
.user i{font-style:normal;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:var(--portal-accent-soft);color:var(--portal-accent-text);font-size:13px;font-weight:600}
.account-shortcut,.notification-shortcut,.mobile-exit{display:grid;place-items:center;background:transparent;border:1px solid var(--portal-line);border-radius:8px;width:36px;height:36px;padding:0;font-size:18px!important}
.account-shortcut:hover,.notification-shortcut:hover{background:var(--portal-raised)}
.mobile-exit{display:none}
.content{display:flex;flex-direction:column;flex:1;min-width:0}
.workspace-heading{display:flex;align-items:center;justify-content:space-between;padding:32px;gap:24px}
.workspace-heading h1{font-size:28px;margin:0 0 8px;line-height:1.2}
.workspace-heading p{font-size:13px;color:var(--portal-muted);margin:0}
.workspace-heading p>span{margin:0 8px}
.main-action{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;border:1px solid var(--portal-accent);border-radius:8px;padding:9px 16px;background:var(--portal-accent);color:var(--portal-accent-ink,#fff)!important;font-size:13px!important;font-weight:500;white-space:nowrap}
.main-action:hover{background:var(--portal-accent-hover)}
.project-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:0 32px 24px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface);overflow:hidden}
.project-strip>div,.project-strip>button{padding:20px;border:0;border-right:1px solid var(--portal-line);background:none;text-align:left;min-width:0}
.project-strip>*:last-child{border:0}
.project-strip>button:hover{background:var(--portal-raised)}
.project-strip span:not(.mini-progress,.iconify){display:block;font-size:12px;color:var(--portal-muted);margin-bottom:10px}
.project-strip strong{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;flex-wrap:wrap;overflow-wrap:anywhere}
.project-strip .iconify{font-size:18px;color:var(--portal-muted)}
.mini-progress{display:block;width:64px;height:5px;background:var(--portal-raised);border-radius:4px;overflow:hidden}
.mini-progress i{display:block;height:100%;background:var(--portal-accent);border-radius:4px}
.workspace-tabs{display:flex;gap:28px;overflow-x:auto;padding:0 32px;border-bottom:1px solid var(--portal-line)}
.workspace-tabs button{white-space:nowrap;flex:none;display:flex;align-items:center;gap:8px;min-height:48px;padding:0 0 13px;background:none;border:0;border-bottom:2px solid transparent;color:var(--portal-muted);font-size:13px}
.workspace-tabs button.selected{color:var(--portal-text);border-bottom-color:var(--portal-accent)}
.workspace-tabs button>span{background:var(--portal-raised);padding:1px 6px;border-radius:5px;font-size:11px;color:var(--portal-muted)}
.table-toolbar{display:flex;align-items:center;gap:12px;padding:20px 32px;border-bottom:1px solid var(--portal-line)}
.filter-pill{display:flex;align-items:center;min-height:40px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);overflow:hidden;white-space:nowrap;font-size:12px}
.filter-pill>span{color:var(--portal-muted);padding:8px 12px;border-right:1px solid var(--portal-line)}
.filter-pill select{min-height:38px;padding:8px 12px;color:var(--portal-text);border:0;background:transparent;outline-offset:-3px;max-width:210px}
.filter-pill option{background:var(--portal-raised)}
.table-search{display:flex;align-items:center;gap:9px;min-height:40px;margin-left:auto;padding:0 12px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);color:var(--portal-muted)}
.table-search input{width:160px;background:transparent;border:0;color:var(--portal-text);outline-offset:3px;font-size:13px;min-width:0}
.table-search:focus-within{outline:2px solid var(--portal-accent);outline-offset:2px}
.resource-table-wrap{width:100%;overflow-x:auto}
.resource-table{width:100%;border-collapse:collapse;white-space:nowrap;text-align:left}
.resource-table th{padding:14px 24px;font-size:12px;font-weight:500;color:var(--portal-muted);border-bottom:1px solid var(--portal-line);background:var(--portal-surface)}
.resource-table th:first-child{padding-left:32px;width:40%}
.resource-table td{height:76px;padding:14px 24px;border-bottom:1px solid var(--portal-line);font-size:13px}
.resource-table td:first-child{padding-left:32px}
.resource-table tbody tr:hover{background:var(--portal-surface)}
.resource-name{display:flex;align-items:center;gap:12px;border:0;background:none;text-align:left;padding:0;font-size:14px!important;max-width:400px}
.resource-name>.iconify{font-size:20px;color:var(--portal-muted);flex-shrink:0}
.resource-name span:not(.iconify){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.resource-name small{display:block;font-size:12px;color:var(--portal-muted);margin-top:4px;max-width:300px;overflow:hidden;text-overflow:ellipsis}
.type-tag{display:inline-flex;padding:4px 8px;border-radius:6px;background:var(--portal-raised);color:var(--portal-muted);font-size:11px}
.status-tag{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;color:var(--portal-info);background:var(--portal-info-soft);font-size:11px;font-weight:500}
.status-tag.paid,.status-tag.approved{color:var(--portal-success);background:var(--portal-success-soft)}
.status-tag.due,.status-tag.pending{color:var(--portal-warning);background:var(--portal-warning-soft)}
.status-tag.changes,.status-tag.cancelled{color:var(--portal-danger);background:var(--portal-danger-soft)}
.status-tag i{display:block;width:5px;height:5px;background:currentColor;border-radius:50%}
.date-cell{color:var(--portal-muted)}
.action-col{text-align:right}
.open-row{display:inline-grid;place-items:center;background:none;border:1px solid var(--portal-line);border-radius:8px;width:36px;height:36px;color:var(--portal-muted)!important;font-size:18px!important}
.open-row:hover{background:var(--portal-raised);color:var(--portal-text)!important}
.table-summary{display:flex;justify-content:space-between;gap:16px;padding:16px 32px;border-bottom:1px solid var(--portal-line);color:var(--portal-muted);font-size:12px}
.table-summary>span:last-child{display:flex;align-items:center;gap:6px}
.empty-table{padding:60px 24px!important;color:var(--portal-muted);text-align:center;font-size:13px!important}
.eyebrow{font-size:11px!important;letter-spacing:.08em;color:var(--portal-muted)!important}
.updates{padding:0 32px 32px}
.updates h2{font-size:18px;margin:0 0 8px}
.updates>p{margin:0;color:var(--portal-muted);font-size:13px;line-height:1.6}
.updates article{display:flex;gap:12px;padding:20px 0;border-bottom:1px solid var(--portal-line)}
.updates p{flex:1;margin:0;font-size:13px;color:var(--portal-text);white-space:pre-wrap;overflow-wrap:anywhere}
.updates time{font-size:12px;color:var(--portal-muted);white-space:nowrap}
.activity-dot{margin-top:7px;width:6px;height:6px;background:var(--portal-accent);border-radius:50%;flex-shrink:0}
.empty-updates{padding:48px;color:var(--portal-muted);text-align:center}
.content>:deep(.pr){padding:32px}
.project-picker{display:flex;align-items:center;gap:12px;padding:16px 32px;color:var(--portal-muted);font-size:13px}
.project-picker select{min-height:40px;max-width:100%;background:var(--portal-raised);border:1px solid var(--portal-line);color:var(--portal-text);border-radius:8px;padding:8px 12px}
.error,.loading{margin:20px 32px;padding:18px 20px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface);color:var(--portal-muted)}
.error{color:var(--portal-danger);background:var(--portal-danger-soft);border-color:var(--portal-danger)}
.error button{margin-left:8px;background:transparent;border:1px solid currentColor;border-radius:8px;padding:6px 10px;font-size:12px}
.onboarding-backdrop{position:fixed;inset:72px 0 0 248px;z-index:6;display:flex;align-items:flex-end;justify-content:flex-end;padding:24px;pointer-events:none}
.onboarding-card{pointer-events:auto;width:min(440px,100%);max-height:calc(100dvh - 120px);overflow:auto;padding:24px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-surface);color:var(--portal-text);box-shadow:0 16px 54px #0006}
.onboarding-card>header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}
.onboarding-card>header>div{display:grid;gap:6px}
.onboarding-kicker,.onboarding-step-count{margin:0;color:var(--portal-muted);font-size:11px;letter-spacing:.06em}
.onboarding-card>header span{font-size:13px}
.onboarding-card>header button{border:0;background:transparent;color:var(--portal-muted);font-size:24px;width:28px;height:28px;line-height:1}
.onboarding-progress{height:4px;margin:20px 0;background:var(--portal-raised);border-radius:4px;overflow:hidden}
.onboarding-progress i{display:block;height:100%;background:var(--portal-accent);transition:width .2s}
.onboarding-feature{display:flex;gap:14px;align-items:flex-start;margin-top:18px}
.onboarding-feature>span{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:8px;background:var(--portal-accent-soft);color:var(--portal-accent-text);font-size:22px}
.onboarding-feature h2{margin:0 0 8px;font-size:21px}
.onboarding-feature p{margin:0;color:var(--portal-muted);font-size:13px;line-height:1.65}
.onboarding-note{margin:20px 0 0;padding-top:16px;border-top:1px solid var(--portal-line);color:var(--portal-muted);font-size:12px}
.onboarding-error{margin-top:12px;color:var(--portal-danger);font-size:12px}
.onboarding-card>footer{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:20px;flex-wrap:wrap}
.onboarding-card>footer>div{display:flex;gap:8px}
.onboarding-card>footer button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:8px 12px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);color:var(--portal-text);font-size:12px}
.onboarding-card>footer .onboarding-skip{border-color:transparent;background:transparent;color:var(--portal-muted);padding-left:0}
.onboarding-card>footer .onboarding-primary{border-color:var(--portal-accent);background:var(--portal-accent);color:var(--portal-accent-ink,#fff)}
@media(min-width:1600px){.content{width:100%;max-width:1600px;margin:auto}
.workspace-heading{padding-top:40px}}
@media(max-width:1100px){.sidebar{width:224px}
.main{margin-left:224px}
.main>header{padding:16px 24px}
.workspace-heading,.content>:deep(.pr){padding:24px}
.project-strip{margin:0 24px 24px;grid-template-columns:repeat(2,minmax(0,1fr))}
.project-strip>*:nth-child(2){border-right:0}
.project-strip>*:nth-child(-n+2){border-bottom:1px solid var(--portal-line)}
.table-toolbar{flex-wrap:wrap;padding:20px 24px}
.table-search{margin-left:0;flex:1}
.resource-name{max-width:260px}
.user>span{display:none}
.onboarding-backdrop{left:224px}
.resource-table th,.resource-table td{padding-left:18px;padding-right:18px}}
@media(max-width:700px){.sidebar{position:static;width:100%;border-right:0;border-bottom:1px solid var(--portal-line)}
.brand{height:auto;padding:18px 20px}
.identity,.nav-label,.sidebar-bottom{display:none}
.brand:deep(img){width:112px}
.sidebar nav{display:grid;gap:3px;padding:0 12px 12px}
.sidebar nav button{white-space:nowrap;font-size:12px;min-height:40px}
.nav-group-items{grid-template-columns:repeat(2,minmax(0,1fr));margin-left:20px}
.sidebar nav .nav-group-items button{white-space:normal}
.main{margin:0}
.main>header{min-height:64px;padding:12px 16px}
.header-title{font-size:14px;gap:8px;flex-wrap:wrap}
.header-status{font-size:10px}
.user{gap:6px}
.user i,.account-shortcut{display:none}
.mobile-exit{display:grid}
.notification-shortcut,.mobile-exit{width:32px;height:32px}
.workspace-heading{padding:24px 16px;align-items:flex-start;flex-wrap:wrap;gap:16px}
.workspace-heading h1{font-size:24px}
.workspace-heading p{font-size:12px}
.project-strip{margin:0 16px 20px}
.project-strip>div,.project-strip>button{padding:16px 12px}
.project-strip strong{font-size:12px}
.project-strip span:not(.mini-progress,.iconify){font-size:11px}
.mini-progress{width:40px}
.workspace-tabs{padding:0 16px}
.table-toolbar{padding:16px;gap:10px}
.filter-pill{flex:1}
.filter-pill>span{display:none}
.filter-pill select{width:100%;max-width:none;padding:8px}
.table-search{flex-basis:100%;margin:0}
.table-search input{width:100%}
.resource-table{table-layout:fixed}
.resource-table th:first-child{width:auto}
.resource-table th:nth-child(2),.resource-table td:nth-child(2),.resource-table th:nth-child(4),.resource-table td:nth-child(4){display:none}
.resource-table th:nth-child(3){width:104px}
.resource-table th:last-child{width:50px}
.resource-table th,.resource-table td{padding:14px 6px}
.resource-table th:first-child,.resource-table td:first-child{padding-left:16px}
.resource-name{max-width:none;gap:8px;font-size:12px!important}
.resource-name span:not(.iconify){white-space:normal;overflow-wrap:anywhere}
.resource-name small{font-size:11px;max-height:34px}
.resource-name>.iconify{font-size:18px}
.status-tag{font-size:10px;gap:4px;padding:4px 6px}
.resource-table .action-col{padding-right:12px}
.open-row{width:30px;height:32px}
.table-summary{padding:16px;font-size:11px}
.table-summary>span:last-child{display:none}
.content>:deep(.pr){padding:24px 16px}
.updates{padding:0 16px 24px}
.updates article{flex-wrap:wrap}
.updates time{margin-left:18px}
.project-picker{padding:16px;flex-wrap:wrap}
.error,.loading{margin:16px}
.onboarding-backdrop{inset:0;align-items:flex-end;justify-content:center;padding:12px;background:#0004}
.onboarding-card{width:min(520px,100%);max-height:calc(100dvh - 24px);padding:20px}
.onboarding-feature h2{font-size:20px}}
@media(prefers-reduced-motion:reduce){.onboarding-progress i,.sidebar nav .nav-chevron{transition:none}}
</style>
