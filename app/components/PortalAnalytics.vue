<script setup lang="ts">
const props=defineProps<{resourceId:string}>()
const {data,status,error}=await useFetch<{connected:boolean;message?:string;metrics?:{label:string;value:number}[]}>('/api/portal/analytics',{query:{resourceId:props.resourceId},server:false,key:`analytics-${props.resourceId}`})
</script>
<template><div class="ga"><p v-if="status==='pending'">Chargement des statistiques…</p><p v-else-if="error">Les statistiques sont temporairement indisponibles.</p><template v-else-if="data?.connected"><p>Les 30 derniers jours · Google Analytics</p><div class="ga-metrics"><div v-for="metric in data.metrics" :key="metric.label"><strong>{{metric.value.toLocaleString('fr-FR')}}</strong><span>{{metric.label}}</span></div></div></template><p v-else>{{data?.message || 'Connexion Google Analytics à configurer.'}}</p></div></template>
<style scoped>
.ga p{color:var(--portal-muted, #999)}
.ga-metrics{display:grid;margin-top:16px}
.ga strong{display:block;color:var(--portal-text, #bcbcbc)}
.ga span{display:block;color:var(--portal-muted, #aaa)}
.ga{margin:12px 0 0;padding:20px;border:1px solid var(--portal-line);background:var(--portal-bg);border-radius:8px}
.ga p{font-size:12px;margin:0}
.ga-metrics{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.ga strong{font-size:28px;letter-spacing:-.03em;font-weight:600;font-variant-numeric:tabular-nums}
.ga span{font-size:12px;margin-top:5px}
@media(max-width:500px){.ga-metrics{grid-template-columns:1fr;gap:16px}
.ga-metrics>div+div{border-top:1px solid var(--portal-line);padding-top:16px}
.ga strong{font-size:24px}}
</style>
