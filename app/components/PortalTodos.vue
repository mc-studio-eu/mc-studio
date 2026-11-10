<script setup lang="ts">
import { portalDate, type PortalTodo } from '~/types/portal'
const props = defineProps<{ items:PortalTodo[]; userId:string; canContribute:boolean; canReview:boolean }>()
const emit = defineEmits<{ navigate:[tab:'file'|'mockup'|'payment'|'roadmap',stepId?:string] }>()
const labels = { file:'Fichier attendu', mockup:'Maquette à valider', payment:'Échéance à régler', milestone:'Action du projet',roadmap:'Étape à valider',roadmap_step:'Action du projet' }
const actionable = (item:PortalTodo) => item.kind==='mockup' || item.kind==='roadmap' ? props.canReview : item.kind==='payment' ? true : props.canContribute && (!item.responsibleId || item.responsibleId===props.userId)
const open = (item:PortalTodo) => {
  if (item.kind==='file' || item.kind==='mockup' || item.kind==='payment') emit('navigate',item.kind)
  else emit('navigate','roadmap',item.stepId)
}
const overdue = (date:string) => Boolean(date && date.slice(0,10) < new Date().toLocaleDateString('en-CA'))
</script>
<template><section class="todos"><div class="todo-heading"><h2>À faire pour vous <span>{{ items.length }}</span></h2><p>Les prochaines actions pour faire avancer votre projet.</p></div><p v-if="!items.length" class="todo-empty">{{canContribute?'Tout est à jour. Aucune action en attente pour le moment.':'Votre accès est en lecture seule. Aucune action ne vous est demandée.'}}</p><div v-else class="todo-list"><article v-for="item in items" :key="item.id"><div><small>{{ labels[item.kind] }}</small><h3>{{ item.title }}</h3><p>{{ item.responsibleName || 'Votre équipe' }}<span :class="{overdue:overdue(item.dueDate)}"> · {{ item.dueDate ? 'Attendu le '+portalDate(item.dueDate) : 'Date à définir' }}</span></p><p v-if="(item.kind==='mockup' || item.kind==='roadmap') && !canReview" class="permission-note">La validation finale appartient au décideur du projet.</p><p v-else-if="!actionable(item)" class="permission-note">{{ !canContribute ? 'Votre accès est en lecture seule.' : 'Cette action est confiée à un autre membre.' }}</p></div><button @click="open(item)">{{ actionable(item) ? item.kind==='file'?'Envoyer le fichier':(item.kind==='mockup' || item.kind==='roadmap')?'Examiner et valider':item.kind==='payment'?'Voir l’échéance':'Voir mon action' : 'Consulter' }} <UIcon name="i-tabler-arrow-up-right"/></button></article></div></section></template>
<style scoped>
.todos{border:1px solid var(--portal-line,#333);border-radius:8px}
.todo-heading h2{margin:0}
.todo-heading h2 span{margin-left:6px}
.todo-heading p,.todo-empty{color:var(--portal-muted,#999);margin:7px 0 0}
.todo-list{margin-top:16px}
.todo-list article{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--portal-line,#333)}
.todo-list article>div{min-width:0}
h3{overflow-wrap:anywhere}
.todo-list p{color:var(--portal-muted,#999);margin:4px 0}
.todo-list .overdue{color:var(--portal-warning)}
button{display:inline-flex;align-items:center;gap:7px;flex-shrink:0;cursor:pointer;border:1px solid var(--portal-line,#444);background:var(--portal-raised,#252525);color:inherit;font:inherit}
@media(max-width:700px){.todo-list article{align-items:flex-start;flex-direction:column}}
.todos{margin:0 32px 28px;padding:24px;background:var(--portal-surface)}
.todo-heading h2{font-size:18px;font-weight:600}
.todo-heading h2 span{font-size:11px;border:0;background:var(--portal-accent-soft);color:var(--portal-accent-text);border-radius:6px;padding:3px 7px}
.todo-heading p,.todo-empty{font-size:13px;line-height:1.6}
.todo-empty{padding:16px 0 0}
.todo-list article{padding:20px 0}
.todo-list article:last-child{padding-bottom:0}
.todo-list small{font-size:11px;color:var(--portal-accent-text)}
h3{font-size:15px;font-weight:500;margin:6px 0}
.todo-list p{font-size:12px}
.todo-list .permission-note{font-size:12px;margin-top:8px}
button{min-height:40px;border-radius:8px;font-size:13px;padding:9px 14px}
button:hover{background:var(--portal-accent-soft);border-color:var(--portal-accent);color:var(--portal-accent-text)}
@media(max-width:700px){.todos{margin:0 16px 24px;padding:20px 16px}
.todo-list article{gap:12px}
button{font-size:12px}}
</style>
