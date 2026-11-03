<script setup lang="ts">
import { portalDate } from '~/types/portal'
const emit = defineEmits<{ openProject: [projectId: string, tab: string] }>()
type Notification = { id:string; projectId:string; kind:string; title:string; body:string; createdAt:string; readAt:string|null }
const notifications = ref<Notification[]>([]), loading = ref(true), busy = ref(false), error = ref(''), success = ref('')
const preferences = reactive({ inApp:true, email:false, reminderDays:7 })
const unread = ref(0), preferencesLoaded=ref(false)
async function load() {
  loading.value = true; preferencesLoaded.value=false; error.value = ''
  try {
    const data = await $fetch<{ notifications:Notification[]; preferences:typeof preferences; unreadCount:number }>('/api/portal/notifications')
    notifications.value = data.notifications; unread.value=data.unreadCount; Object.assign(preferences, data.preferences);preferencesLoaded.value=true
  } catch (cause:any) { error.value = cause?.data?.statusMessage || 'Impossible de charger les notifications.' }
  finally { loading.value = false }
}
async function markRead(id?:string) {
  busy.value = true; error.value = ''
  try { await $fetch('/api/portal/notifications', { method:'PATCH', body:id ? { id } : { all:true } }); await load() }
  catch (cause:any) { error.value = cause?.data?.statusMessage || 'Impossible de mettre à jour les notifications.' }
  finally { busy.value = false }
}
async function save() {
  if(!preferencesLoaded.value)return
  busy.value = true; error.value = ''; success.value = ''
  try { await $fetch('/api/portal/notifications/preferences', { method:'PUT', body:preferences }); success.value = 'Vos préférences sont enregistrées.' }
  catch (cause:any) { error.value = cause?.data?.statusMessage || 'Impossible d’enregistrer vos préférences.' }
  finally { busy.value = false }
}
const tabFor = (kind:string) => kind.startsWith('request_') ? 'requests' : kind.includes('file') ? 'file' : kind.includes('mockup') || kind.includes('reply') || kind.includes('comment') ? 'mockup' : 'project'
onMounted(load)
</script>
<template><section class="notifications-panel"><header><div><h1>Notifications</h1><p>{{ unread }} notification{{ unread > 1 ? 's' : '' }} non lue{{ unread > 1 ? 's' : '' }}</p></div><button :disabled="busy || !unread" @click="markRead()">Tout marquer comme lu</button></header><p v-if="error" role="alert" class="error-message">{{ error }} <button @click="load">Réessayer</button></p><p v-if="loading" role="status">Chargement…</p><p v-else-if="!notifications.length" class="empty">Les nouvelles maquettes, réponses, demandes et fichiers apparaîtront ici.</p><div v-else class="notification-list"><article v-for="item in notifications" :key="item.id" :class="{unread:!item.readAt}"><div><span v-if="!item.readAt" class="unread-dot" aria-label="Non lue"/><h2>{{ item.title }}</h2><time>{{ portalDate(item.createdAt) }}</time></div><p>{{ item.body }}</p><footer><button v-if="item.projectId" @click="emit('openProject', item.projectId, tabFor(item.kind))">Voir le projet →</button><button v-if="!item.readAt" :disabled="busy" @click="markRead(item.id)">Marquer comme lue</button></footer></article></div><form class="preferences" @submit.prevent="save"><h2>Mes préférences</h2><label class="check"><input v-model="preferences.inApp" type="checkbox">Notifications dans mon espace</label><label class="check"><input v-model="preferences.email" type="checkbox">Notifications par e-mail</label><label class="reminder">Relance des actions en attente<select v-model.number="preferences.reminderDays"><option :value="0">Désactivée</option><option v-for="days in 30" :key="days" :value="days">{{ days === 1 ? 'Chaque jour' : 'Tous les '+days+' jours' }}</option></select></label><p>Les relances concernent les demandes et validations qui attendent encore votre action.</p><p v-if="success" role="status" class="success-message">{{ success }}</p><button class="primary" :disabled="busy || loading || !preferencesLoaded">{{ busy ? 'Enregistrement…' : 'Enregistrer mes préférences' }}</button></form></section></template>
<style scoped>
.notifications-panel{color:var(--portal-text,#eee)}
header{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:24px}
h1{margin:0 0 6px}
h2{margin:0}
p,time{font-size:12px;color:var(--portal-muted,#999);line-height:1.6}
header p{margin:0}
button,select{font:inherit;border:1px solid var(--portal-line,#444);background:var(--portal-raised,#252525);color:inherit;padding:9px 12px}
button{cursor:pointer}
button:disabled{opacity:.5;cursor:default}
.notification-list{border:1px solid var(--portal-line,#333);border-radius:8px;overflow:hidden}
.notification-list article{border-bottom:1px solid var(--portal-line,#333)}
.notification-list article:last-child{border:0}
article>div{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
time{margin-left:auto}
article footer{display:flex;gap:8px;flex-wrap:wrap}
.unread-dot{width:7px;height:7px;border-radius:50%;background:var(--portal-accent)}
.preferences{margin-top:28px;border:1px solid var(--portal-line,#333);border-radius:8px}
.preferences h2{margin-bottom:18px}
.check{display:flex;gap:9px;align-items:center;margin:15px 0;font-size:13px}
.check input{accent-color:var(--portal-accent)}
.reminder{display:grid;gap:8px;font-size:13px}
.primary{border-color:var(--portal-accent);background:var(--portal-accent);color:var(--portal-accent-ink,#fff)}
.error-message{color:var(--portal-danger)}
.empty{border:1px dashed var(--portal-line,#444);border-radius:8px}
@media(max-width:700px){header{align-items:flex-start;flex-wrap:wrap}
time{width:100%;margin:0}}
.notifications-panel{padding:32px;max-width:1040px;font-size:14px}
h1{font-size:28px;font-weight:600}
h2{font-size:15px;font-weight:500}
p{font-size:13px}
.notification-list{background:var(--portal-surface)}
.notification-list article{padding:22px}
.notification-list article.unread{background:var(--portal-accent-soft)}
.notification-list article p{margin:8px 0 16px;white-space:pre-wrap;overflow-wrap:anywhere}
.notification-list h2{overflow-wrap:anywhere}
.notification-list time{font-size:12px}
button,select{min-height:40px;border-radius:8px;font-size:13px}
article footer button{min-height:36px;padding:7px 12px;font-size:12px}
.preferences{padding:26px;background:var(--portal-surface)}
.preferences>p{margin:8px 0 0}
.preferences h2{font-size:18px;font-weight:600}
.check{min-height:28px}
.check input{width:16px;height:16px;margin:0;flex:none}
.reminder{margin-top:24px;max-width:360px}
.primary{margin-top:12px;font-weight:500}
.error-message,.success-message{padding:12px 16px;border:1px solid var(--portal-danger);border-radius:8px;background:var(--portal-danger-soft);color:var(--portal-danger)}
.success-message{border-color:var(--portal-success);background:var(--portal-success-soft);color:var(--portal-success)}
.empty{padding:32px;background:var(--portal-surface)}
@media(max-width:700px){.notifications-panel{padding:24px 16px}
h1{font-size:24px}
.notification-list article,.preferences{padding:20px 16px}}
</style>
