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
const tabFor = (kind:string) => kind.includes('file') ? 'file' : kind.includes('mockup') || kind.includes('reply') || kind.includes('comment') ? 'mockup' : 'project'
onMounted(load)
</script>
<template><section class="notifications-panel"><header><div><h1>Notifications</h1><p>{{ unread }} notification{{ unread > 1 ? 's' : '' }} non lue{{ unread > 1 ? 's' : '' }}</p></div><button :disabled="busy || !unread" @click="markRead()">Tout marquer comme lu</button></header><p v-if="error" role="alert" class="error-message">{{ error }} <button @click="load">Réessayer</button></p><p v-if="loading" role="status">Chargement…</p><p v-else-if="!notifications.length" class="empty">Les nouvelles maquettes, réponses et demandes de fichiers apparaîtront ici.</p><div v-else class="notification-list"><article v-for="item in notifications" :key="item.id" :class="{unread:!item.readAt}"><div><span v-if="!item.readAt" class="unread-dot" aria-label="Non lue"/><h2>{{ item.title }}</h2><time>{{ portalDate(item.createdAt) }}</time></div><p>{{ item.body }}</p><footer><button v-if="item.projectId" @click="emit('openProject', item.projectId, tabFor(item.kind))">Voir le projet →</button><button v-if="!item.readAt" :disabled="busy" @click="markRead(item.id)">Marquer comme lue</button></footer></article></div><form class="preferences" @submit.prevent="save"><h2>Mes préférences</h2><label class="check"><input v-model="preferences.inApp" type="checkbox">Notifications dans mon espace</label><label class="check"><input v-model="preferences.email" type="checkbox">Notifications par e-mail</label><label class="reminder">Relance des actions en attente<select v-model.number="preferences.reminderDays"><option :value="0">Désactivée</option><option v-for="days in 30" :key="days" :value="days">Tous les {{ days }} jour{{ days > 1 ? 's' : '' }}</option></select></label><p>Les relances concernent les demandes et validations qui attendent encore votre action.</p><p v-if="success" role="status">{{ success }}</p><button class="primary" :disabled="busy || loading || !preferencesLoaded">{{ busy ? 'Enregistrement…' : 'Enregistrer mes préférences' }}</button></form></section></template>
<style scoped>
.notifications-panel{padding:24px;color:var(--portal-text,#eee);max-width:960px}header{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:24px}h1{font-size:22px;font-weight:500;margin:0 0 6px}h2{font-size:14px;font-weight:500;margin:0}p,time{font-size:12px;color:var(--portal-muted,#999);line-height:1.6}header p{margin:0}button,select{font:inherit;border:1px solid var(--portal-line,#444);border-radius:7px;background:var(--portal-raised,#252525);color:inherit;padding:9px 12px}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}.notification-list{border:1px solid var(--portal-line,#333);border-radius:9px;overflow:hidden}.notification-list article{padding:18px;border-bottom:1px solid var(--portal-line,#333)}.notification-list article:last-child{border:0}.notification-list article.unread{background:var(--portal-raised,#202020)}article>div{display:flex;gap:9px;align-items:center;flex-wrap:wrap}time{margin-left:auto}article footer{display:flex;gap:8px;flex-wrap:wrap}article footer button{padding:6px 9px;font-size:11px}.unread-dot{width:7px;height:7px;border-radius:50%;background:#d4ad5b}.preferences{padding:22px;margin-top:28px;border:1px solid var(--portal-line,#333);border-radius:9px}.preferences h2{font-size:17px;margin-bottom:18px}.check{display:flex;gap:9px;align-items:center;margin:15px 0;font-size:13px}.check input{accent-color:#d4ad5b}.reminder{display:grid;gap:8px;font-size:13px;max-width:300px}.primary{border-color:#d4ad5b;background:linear-gradient(#e5c46a,#c99b3d);color:#191919}.error-message{color:#ed9b8d}.empty{padding:24px;border:1px dashed var(--portal-line,#444);border-radius:9px}@media(max-width:700px){.notifications-panel{padding:20px 16px}header{align-items:flex-start;flex-wrap:wrap}time{width:100%;margin:0}}
</style>
