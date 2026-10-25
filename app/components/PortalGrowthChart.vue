<script setup lang="ts">
const props=defineProps<{rows:{date:string;value:number}[];label:string;start:string;end:string}>()
const max=computed(()=>Math.max(1,...props.rows.map(r=>r.value)))
const x=(date:string)=>40+(Date.parse(date)-Date.parse(props.start))/Math.max(86400000,Date.parse(props.end)-Date.parse(props.start))*660
const y=(value:number)=>160-value/max.value*140
const date=(value:string)=>new Date(value+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})
const selected=ref<{date:string;value:number}|null>(null)
watch(()=>props.rows,()=>{selected.value=null})
</script>
<template><div class="growth-chart"><svg viewBox="0 0 730 200" role="img" :aria-label="label"><g v-for="tick in [0,.5,1]" :key="tick"><line x1="40" x2="700" :y1="y(tick*max)" :y2="y(tick*max)" stroke="#303030"/><text x="32" :y="y(tick*max)+4" text-anchor="end">{{Math.round(tick*max).toLocaleString('fr-FR')}}</text></g><g v-for="row in rows" :key="row.date"><rect :x="x(row.date)-Math.max(1,Math.min(7,250/rows.length))" :y="y(row.value)" :width="Math.max(2,Math.min(14,500/rows.length))" :height="Math.max(1,160-y(row.value))" rx="1" fill="#b9b9c4" tabindex="0" :aria-label="date(row.date)+': '+row.value+' '+label" @focus="selected=row" @mouseenter="selected=row"><title>{{date(row.date)}} · {{row.value}} {{label}}</title></rect></g><text x="40" y="188">{{date(start)}}</text><text x="700" y="188" text-anchor="end">{{date(end)}}</text></svg><p aria-live="polite">{{selected?`${date(selected.date)} · ${selected.value.toLocaleString('fr-FR')} ${label}`:'Survolez une barre ou sélectionnez-la au clavier.'}}</p></div></template>
<style scoped>.growth-chart svg{width:100%;display:block;min-height:160px}.growth-chart text{fill:var(--portal-muted, #888);font:10px Inter,Arial,sans-serif}.growth-chart rect:focus{outline:2px solid var(--portal-line, #fff);fill:#e3c574}.growth-chart p{font-size:10px;color:var(--portal-muted, #888);margin:0 12px 12px}.growth-chart rect:hover{fill:#e3c574}</style>
