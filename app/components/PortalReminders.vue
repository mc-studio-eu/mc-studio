<script setup lang="ts">
const props = defineProps<{projectId:string}>()
const busy=ref(false), error=ref(''), result=ref('')
async function remind() {
  busy.value=true; error.value=''; result.value=''
  try { const response=await $fetch<{queued?:number;message?:string}>('/api/portal/notifications/remind',{method:'POST',body:{projectId:props.projectId}});result.value=response.message || `${response.queued ?? 0} relance(s) créée(s). Les actions en attente ont été vérifiées. Les membres concernés recevront une relance selon leurs préférences.` }
  catch(cause:any) { error.value=cause?.data?.statusMessage || 'Impossible de créer les relances.' }
  finally { busy.value=false }
}
watch(()=>props.projectId,()=>{error.value='';result.value=''})
</script>
<template><section class="reminders"><div><h2>Relances des actions attendues</h2><p>Relancez les demandes de fichiers, validations, paiements et étapes en attente. La fréquence et les canaux choisis par chaque membre sont respectés.</p></div><button :disabled="busy" @click="remind">{{busy?'Vérification…':'Déclencher les relances'}}</button><p v-if="error" role="alert" class="error-message">{{error}}</p><p v-if="result" role="status">{{result}}</p></section></template>
<style scoped>.reminders{display:flex;align-items:center;gap:18px;flex-wrap:wrap;border:1px solid var(--portal-line,#333);border-radius:8px;padding:20px;margin:20px 0;color:var(--portal-text,#eee)}.reminders>div{flex:1;min-width:220px}h2{font-size:16px;font-weight:500;margin:0 0 8px}p{font-size:12px;line-height:1.6;color:var(--portal-muted,#999);margin:0}.reminders>p{width:100%}button{border:1px solid var(--portal-line,#444);border-radius:99px;padding:10px 14px;background:var(--portal-raised,#252525);color:inherit;font:inherit;cursor:pointer;font-size:12px}button:disabled{opacity:.5;cursor:wait}.error-message{color:#ed9b8d}</style>
