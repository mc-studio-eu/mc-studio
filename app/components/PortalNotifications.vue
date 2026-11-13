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
const tabFor = (kind:string) => kind.startsWith('request_') ? 'requests' : kind.startsWith('roadmap_') ? 'roadmap' : kind.includes('file') ? 'file' : kind.includes('mockup') || kind.includes('reply') || kind.includes('comment') ? 'mockup' : 'roadmap'
onMounted(load)
</script>
<template><section class="notifications-panel"><header><div><h1>Notifications</h1><p>{{ unread }} notification{{ unread > 1 ? 's' : '' }} non lue{{ unread > 1 ? 's' : '' }}</p></div><button :disabled="busy || !unread" @click="markRead()">Tout marquer comme lu</button></header><p v-if="error" role="alert" class="error-message">{{ error }} <button @click="load">Réessayer</button></p><p v-if="loading" role="status">Chargement…</p><p v-else-if="!notifications.length" class="empty">Les nouvelles maquettes, réponses, demandes et fichiers apparaîtront ici.</p><div v-else class="notification-list"><article v-for="item in notifications" :key="item.id" :class="{unread:!item.readAt}"><div><span v-if="!item.readAt" class="unread-dot" aria-label="Non lue"/><h2>{{ item.title }}</h2><time>{{ portalDate(item.createdAt) }}</time></div><p>{{ item.body }}</p><footer><button v-if="item.projectId" @click="emit('openProject', item.projectId, tabFor(item.kind))">Voir le projet →</button><button v-if="!item.readAt" :disabled="busy" @click="markRead(item.id)">Marquer comme lue</button></footer></article></div><form class="preferences" @submit.prevent="save"><h2>Mes préférences</h2><div class="preference-options"><label class="check"><input v-model="preferences.inApp" type="checkbox">Notifications dans mon espace</label><label class="check"><input v-model="preferences.email" type="checkbox">Notifications par e-mail</label></div><label class="reminder">Relance des actions en attente<select v-model.number="preferences.reminderDays"><option :value="0">Désactivée</option><option v-for="days in 30" :key="days" :value="days">{{ days === 1 ? 'Chaque jour' : 'Tous les '+days+' jours' }}</option></select><small>Les relances concernent les demandes et validations qui attendent encore votre action.</small></label><p v-if="success" role="status" class="success-message">{{ success }}</p><button class="primary" :disabled="busy || loading || !preferencesLoaded">{{ busy ? 'Enregistrement…' : 'Enregistrer mes préférences' }}</button></form></section></template>
<style scoped>
.notifications-panel{padding:32px;max-width:1040px;color:var(--portal-text,#eee);font-size:14px;min-width:0}
header{display:flex;justify-content:space-between;gap:24px;align-items:center;margin-bottom:24px}
h1{margin:0 0 8px;font-size:28px;font-weight:600}
h2{margin:0;font-size:15px;font-weight:500}
p,time,small{color:var(--portal-muted,#999);line-height:1.6}
p{margin:0;font-size:13px}
time,small{font-size:12px}
button,select{font:inherit;border:1px solid var(--portal-line,#444);background:var(--portal-raised,#252525);color:inherit;padding:9px 12px;min-height:44px;border-radius:8px;font-size:13px}
button{cursor:pointer}
button:disabled{opacity:.5;cursor:default}
.notification-list{border:1px solid var(--portal-line,#333);border-radius:8px;overflow:hidden;background:var(--portal-surface)}
.notification-list article{padding:24px;border-bottom:1px solid var(--portal-line,#333)}
.notification-list article:last-child{border:0}
.notification-list article.unread{background:var(--portal-accent-soft)}
article>div{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.notification-list h2{overflow-wrap:anywhere}
time{margin-left:auto}
.notification-list article p{margin:8px 0 16px;white-space:pre-wrap;overflow-wrap:anywhere}
article footer{display:flex;gap:8px;flex-wrap:wrap}
article footer button{min-height:36px;padding:7px 12px;font-size:12px}
.unread-dot{width:7px;height:7px;flex:none;border-radius:50%;background:var(--portal-accent)}
.preferences{display:grid;gap:24px;margin-top:28px;border:1px solid var(--portal-line,#333);border-radius:8px;padding:24px;background:var(--portal-surface)}
.preferences h2{font-size:18px;font-weight:600}
.preference-options{display:grid;gap:16px}
.check{display:flex;gap:8px;align-items:center;min-height:24px;font-size:13px}
.check input{accent-color:var(--portal-accent);width:16px;height:16px;margin:0;flex:none}
.reminder{display:grid;gap:8px;font-size:13px;max-width:360px}
.reminder select{width:100%;min-width:0}
.primary{justify-self:start;border-color:var(--portal-accent);background:var(--portal-accent);color:var(--portal-accent-ink,#fff);font-weight:500}
.error-message,.success-message{padding:12px 16px;border:1px solid var(--portal-danger);border-radius:8px;background:var(--portal-danger-soft);color:var(--portal-danger)}
.notifications-panel>.error-message{margin-bottom:24px}
.success-message{border-color:var(--portal-success);background:var(--portal-success-soft);color:var(--portal-success)}
.empty{padding:32px;border:1px dashed var(--portal-line,#444);border-radius:8px;background:var(--portal-surface)}
@media(max-width:700px){.notifications-panel{padding:24px 16px}header{align-items:flex-start;flex-wrap:wrap}h1{font-size:24px}.notification-list article,.preferences{padding:20px 16px}time{width:100%;margin:0}}
</style>
