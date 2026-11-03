<script setup lang="ts">
type Asset = { id:string; title:string; description:string; category:string; fileName:string; mimeType:string; fileSize:number; createdAt:string }
const props = defineProps<{ projectId:string; admin?:boolean }>()
const categories = [
  { id:'marks', label:'Marques', hint:'Logos et symboles, prêts à utiliser sur vos supports.' },
  { id:'palette', label:'Palette', hint:'Les couleurs et associations recommandées pour votre identité.' },
  { id:'typography', label:'Typographie', hint:'Les caractères qui donnent sa voix à votre marque.' },
  { id:'applications', label:'Applications', hint:'Votre identité en situation, sur des supports concrets.' },
  { id:'exports', label:'Exports', hint:'Fichiers visuels finalisés et prêts à télécharger.' }
]
const assets = ref<Asset[]>([]), prompt = ref(''), selected = ref('marks'), search = ref(''), loading = ref(true), busy = ref(false), error = ref(''), success = ref('')
const addOpen = ref(false), title = ref(''), description = ref(''), category = ref('marks'), file = ref<File|null>(null)
const focusAsset = ref<Asset|null>(null), copied = ref(false)
const categoryAssets = computed(() => assets.value.filter(a => a.category === selected.value && `${a.title} ${a.description}`.toLocaleLowerCase('fr').includes(search.value.toLocaleLowerCase('fr'))))
const currentCategory = computed(() => categories.find(c => c.id === selected.value) || categories[0]!)
const load = async () => {
  loading.value = true; error.value = ''
  try { const result = await $fetch<{assets:Asset[];prompt:string}>('/api/portal/assets', { query:{projectId:props.projectId} }); assets.value = result.assets; prompt.value = result.prompt }
  catch (e:any) { error.value = e?.data?.statusMessage || 'Impossible de charger les assets.' }
  finally { loading.value = false }
}
watch(() => props.projectId, load, { immediate:true })
const selectFile = (event:Event) => { file.value = (event.target as HTMLInputElement).files?.[0] || null }
const upload = async () => {
  if (!file.value || !title.value.trim()) return
  busy.value = true; error.value = ''; success.value = ''
  try { const body = new FormData(); body.append('file', file.value); body.append('title', title.value); body.append('description', description.value); body.append('category', category.value); await $fetch('/api/portal/assets', { method:'POST', query:{projectId:props.projectId}, body }); title.value=''; description.value=''; file.value=null; addOpen.value=false; await load(); selected.value=category.value; success.value='L’image a été ajoutée à la médiathèque.' }
  catch (e:any) { error.value = e?.data?.statusMessage || 'Le dépôt a échoué.' }
  finally { busy.value = false }
}
const remove = async (asset:Asset) => {
  if (!window.confirm(`Supprimer « ${asset.title} » de la médiathèque ?`)) return
  busy.value=true; error.value=''
  try { await $fetch(`/api/portal/assets/${asset.id}`, {method:'DELETE'}); focusAsset.value=null; await load(); success.value='L’image a été supprimée.' }
  catch(e:any) { error.value=e?.data?.statusMessage || 'Suppression impossible.' }
  finally { busy.value=false }
}
const copyPrompt = async () => {
  try { await navigator.clipboard.writeText(prompt.value); copied.value=true; window.setTimeout(()=>copied.value=false,1800) }
  catch { error.value='La copie a échoué. Sélectionnez le texte pour le copier.' }
}
</script>

<template>
  <main class="assets-page">
    <header class="assets-intro"><div><p class="assets-eyebrow">VOTRE IDENTITÉ, À PORTÉE DE MAIN</p><h1>Assets</h1><p class="assets-lead">Retrouvez les éléments visuels de votre marque et les consignes pour créer des images cohérentes.</p></div><button v-if="admin" class="assets-add" @click="addOpen=!addOpen"><UIcon name="i-tabler-plus"/>Ajouter un asset</button></header>
    <p v-if="error" class="assets-message" role="alert">{{error}}</p><p v-if="success" class="assets-message success" role="status">{{success}}</p>
    <form v-if="admin && addOpen" class="asset-form" @submit.prevent="upload"><div class="asset-form-heading"><div><span class="assets-eyebrow">NOUVEL ÉLÉMENT</span><h2>Ajouter une image</h2></div><button type="button" class="asset-icon-button" aria-label="Fermer" @click="addOpen=false">×</button></div><div class="asset-fields"><label>Titre<input v-model="title" required maxlength="160" placeholder="Ex. Logo principal"></label><label>Catégorie<select v-model="category"><option v-for="item in categories" :key="item.id" :value="item.id">{{item.label}}</option></select></label><label class="wide">Description<textarea v-model="description" maxlength="1000" rows="2" placeholder="Conseils d’utilisation facultatifs"/></label><label class="wide asset-file">Image <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" required @change="selectFile"><small>{{file?.name || 'PNG, JPG, WEBP, GIF ou AVIF · 10 Mo max.'}}</small></label></div><button class="assets-add" :disabled="busy">{{busy?'Ajout en cours…':'Ajouter à la médiathèque'}}</button></form>
    <section class="asset-library">
      <aside class="asset-sidebar"><p class="assets-eyebrow">FONDATIONS</p><button v-for="item in categories" :key="item.id" :class="{active:selected===item.id}" @click="selected=item.id"><span>{{item.label}}</span><small>{{assets.filter(a=>a.category===item.id).length}}</small></button><div class="asset-sidebar-note"><UIcon name="i-tabler-sparkles"/><span>Une identité cohérente, dans chaque détail.</span></div></aside>
      <section class="asset-content"><div class="asset-content-heading"><div><p class="assets-eyebrow">GUIDE DE MARQUE</p><h2>{{currentCategory.label}}</h2><p>{{currentCategory.hint}}</p></div><label class="asset-search"><UIcon name="i-tabler-search"/><input v-model="search" aria-label="Rechercher dans les assets" placeholder="Rechercher"/></label></div>
        <p v-if="loading" class="asset-empty">Chargement des assets…</p>
        <div v-else-if="!categoryAssets.length" class="asset-empty"><UIcon name="i-tabler-photo"/><h3>{{search?'Aucun résultat':'Vos éléments arrivent bientôt'}}</h3><p>{{search?'Essayez un autre terme.':admin?'Ajoutez la première image de cette catégorie.':'MC Studio ajoutera ici les éléments de votre identité visuelle.'}}</p></div>
        <div v-else class="asset-grid"><article v-for="asset in categoryAssets" :key="asset.id" class="asset-card"><button class="asset-preview" :aria-label="`Prévisualiser ${asset.title}`" @click="focusAsset=asset"><img :src="`/api/portal/assets/${asset.id}`" :alt="asset.title" loading="lazy"/></button><div class="asset-caption"><div><h3>{{asset.title}}</h3><p v-if="asset.description">{{asset.description}}</p><small>{{(asset.fileSize/1024/1024).toFixed(2)}} Mo</small></div><a :href="`/api/portal/assets/${asset.id}`" :download="asset.fileName" :aria-label="`Télécharger ${asset.title}`"><UIcon name="i-tabler-download"/></a></div></article></div>
        <section class="prompt-card"><div class="prompt-heading"><div><p class="assets-eyebrow">POUR VOS CRÉATIONS</p><h2>Prompt IA du projet</h2><p>Utilisez cette base pour générer des visuels fidèles à l’identité de ce projet.</p></div><button class="copy-prompt" :disabled="!prompt" @click="copyPrompt"><UIcon :name="copied?'i-tabler-check':'i-tabler-copy'"/>{{copied?'Copié':'Copier le prompt'}}</button></div><pre v-if="prompt">{{prompt}}</pre><p v-else class="prompt-placeholder">{{admin?'Ajoutez le prompt de ce projet dans Administration → Prompt IA.':'Le prompt de ce projet sera bientôt disponible.'}}</p></section>
      </section>
    </section>
    <div v-if="focusAsset" class="asset-lightbox" role="dialog" aria-modal="true" :aria-label="focusAsset.title" @keydown.esc="focusAsset=null" @click.self="focusAsset=null"><button class="asset-close" aria-label="Fermer l’aperçu" @click="focusAsset=null">×</button><img :src="`/api/portal/assets/${focusAsset.id}`" :alt="focusAsset.title"/><div><h2>{{focusAsset.title}}</h2><p>{{focusAsset.description}}</p><button v-if="admin" class="remove-asset" :disabled="busy" @click="remove(focusAsset)"><UIcon name="i-tabler-trash"/>Supprimer</button><a :href="`/api/portal/assets/${focusAsset.id}`" :download="focusAsset.fileName">Télécharger l’original <UIcon name="i-tabler-download"/></a></div></div>
  </main>
</template>

<style scoped>
.assets-page{--ink:var(--portal-text,#ededed);--muted:var(--portal-muted,#999);--line:var(--portal-line,#303030);min-height:100%;color:var(--ink);font:13px/1.5 Inter,Arial,sans-serif}
.assets-page *{box-sizing:border-box}
.assets-page h1,.assets-page h2,.assets-page h3{color:var(--ink);font-family:Inter,Arial,sans-serif;font-weight:500;letter-spacing:-.035em}
.asset-library{display:grid;grid-template-columns:190px minmax(0,1fr);padding-top:24px}
.assets-intro{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:24px;border-bottom:1px solid var(--line)}
.assets-eyebrow{margin:0 0 8px;color:var(--muted)}
.assets-intro h1{margin:0;line-height:1.2}
.assets-lead{margin:8px 0 0;color:var(--muted)}
.assets-add,.copy-prompt{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--portal-line,#424242);background:var(--portal-raised,#292929);color:var(--ink);font:12px Inter,Arial,sans-serif;cursor:pointer}
.assets-add:disabled,.copy-prompt:disabled{opacity:.5;cursor:wait}
.asset-sidebar{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:2px}
.asset-sidebar>.assets-eyebrow{padding:0 10px;margin-bottom:8px}
.asset-sidebar>button{display:flex;justify-content:space-between;align-items:center;border:1px solid transparent;border-left:2px solid transparent;background:none;color:var(--muted);text-align:left;font:12px Inter,Arial,sans-serif;cursor:pointer}
.asset-sidebar>button small{color:var(--muted);font-size:12px}
.asset-sidebar-note{display:flex;gap:9px;align-items:flex-start;margin-top:24px;padding:16px 10px;border-top:1px solid var(--line);color:var(--muted)}
.asset-sidebar-note .iconify{font-size:15px;flex:none}
.asset-content{min-width:0}
.asset-content-heading{display:flex;justify-content:space-between;gap:24px;margin-bottom:24px}
.asset-content-heading h2{margin:0}
.asset-content-heading p:not(.assets-eyebrow){margin:8px 0 0;color:var(--muted)}
.asset-search{display:flex;align-items:center;gap:8px;width:185px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;color:var(--muted)}
.asset-search input{width:100%;border:0;outline:0;background:none;color:var(--ink);font:12px Inter,Arial,sans-serif}
.asset-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
.asset-card{min-width:0;border:1px solid var(--line);border-radius:8px;background:var(--portal-surface,#191919);overflow:hidden}
.asset-preview{display:grid;place-items:center;width:100%;aspect-ratio:1.25/1;padding:18px;border:0;border-bottom:1px solid var(--line);background:var(--portal-raised,#242424);cursor:zoom-in}
.asset-preview img{display:block;max-width:100%;max-height:100%;object-fit:contain}
.asset-caption{display:flex;justify-content:space-between;gap:12px}
.asset-caption h3{margin:0;letter-spacing:-.01em}
.asset-caption p{margin:4px 0;color:var(--muted);white-space:pre-wrap}
.asset-caption small{display:block;margin-top:5px;color:var(--muted)}
.asset-caption>a{display:grid;place-items:center;flex:none;border:1px solid var(--line);color:var(--ink);text-decoration:none}
.asset-empty{display:grid;justify-items:center;align-content:center;min-height:210px;padding:24px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:8px;background:var(--portal-surface,#181818)}
.asset-empty>.iconify{font-size:25px}
.asset-empty h3{margin:10px 0 3px;font-size:15px}
.asset-empty p{margin:0;font-size:12px}
.prompt-card{margin-top:24px;border:1px solid var(--line);border-radius:8px;background:var(--portal-surface,#191919)}
.prompt-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:15px}
.prompt-heading h2{margin:0}
.prompt-heading p:not(.assets-eyebrow){margin:8px 0 0;color:var(--muted)}
.copy-prompt{flex:none;padding:7px 10px;font-size:12px}
.prompt-card pre{margin:16px 0 0;padding:16px;max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:8px;background:var(--portal-raised,#242424);color:var(--ink);font:12px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap}
.prompt-placeholder{margin:16px 0 0;padding:16px;border:1px solid var(--line);border-radius:8px;background:var(--portal-raised,#242424);color:var(--muted)}
.assets-message{margin:12px 0 0;border:1px solid var(--line);border-radius:8px}
.asset-form{display:grid;gap:24px;max-width:780px;margin:24px 0;border:1px solid var(--line);border-radius:8px;background:var(--portal-surface,#191919)}
.asset-form-heading{display:flex;align-items:flex-start;justify-content:space-between}
.asset-form-heading h2{margin:0}
.asset-form-heading .assets-eyebrow{display:block}
.asset-form>.assets-add{justify-self:start}
.asset-icon-button{border:0;background:none;color:var(--ink);font-size:22px;cursor:pointer}
.asset-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.asset-fields label{display:grid;gap:8px;min-width:0;color:var(--muted)}
.asset-fields .wide{grid-column:1/-1}
.asset-fields input,.asset-fields textarea,.asset-fields select{width:100%;border:1px solid var(--line);background:var(--portal-raised,#222);color:var(--ink);font:12px Inter,Arial,sans-serif}
.asset-file small{color:var(--muted)}
.asset-lightbox{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;gap:35px;padding:50px;background:#000e;color:#fff}
.asset-lightbox>img{max-width:min(68vw,900px);max-height:82vh;object-fit:contain}
.asset-lightbox>div{width:min(250px,25vw)}
.asset-lightbox h2{color:#fff;margin:0 0 8px}
.asset-lightbox p{margin:0;color:#aaa;font-size:12px}
.asset-lightbox a,.remove-asset{display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:9px 12px;border:1px solid #ffffff55;background:transparent;color:#fff;text-decoration:none;font:12px Inter,Arial,sans-serif;cursor:pointer}
.asset-close{position:absolute;top:18px;right:24px;border:0;background:none;color:#fff;font-size:34px;cursor:pointer}
@media(max-width:850px){.asset-library{grid-template-columns:150px minmax(0,1fr);gap:25px}
.asset-grid{gap:17px 12px}}
@media(max-width:650px){.assets-intro{align-items:flex-start;flex-direction:column;padding-bottom:18px}
.asset-library{gap:18px;padding-top:18px}
.asset-sidebar{min-height:0;display:flex;flex-direction:row;overflow:auto;border-bottom:1px solid var(--line);gap:2px}
.asset-sidebar>.assets-eyebrow,.asset-sidebar-note{display:none}
.asset-sidebar>button{flex:none;padding:0 8px;border-left:0;border-bottom:2px solid transparent}
.asset-sidebar>button.active{border-bottom-color:var(--portal-accent)}
.asset-sidebar>button small{margin-left:6px}
.asset-content-heading{align-items:flex-start;flex-direction:column}
.asset-search{width:100%}
.asset-grid{gap:12px 9px}
.asset-preview{aspect-ratio:1/1;padding:10px}
.asset-caption{padding:9px}
.prompt-card{margin-top:20px;padding:14px}
.prompt-heading{flex-direction:column}
.asset-fields{grid-template-columns:1fr}
.asset-fields .wide{grid-column:auto}
.asset-lightbox{flex-direction:column;gap:15px}
.asset-lightbox>img{max-width:100%}
.asset-lightbox>div{text-align:center}}
.assets-page{padding:32px;font-size:14px}
.assets-intro h1{font-size:28px;font-weight:600}
.assets-lead{font-size:13px;max-width:620px;line-height:1.6}
.assets-eyebrow{font-size:11px;letter-spacing:.08em}
.asset-library{gap:28px}
.asset-sidebar>button{min-height:40px;border-radius:8px;font-size:13px;padding:0 12px}
.asset-sidebar>button.active{background:var(--portal-accent-soft);color:var(--portal-accent-text);border-left-color:transparent}
.asset-sidebar-note{font-size:12px;line-height:1.6}
.asset-content-heading{align-items:flex-start}
.asset-content-heading h2{font-size:23px;font-weight:600}
.asset-content-heading p:not(.assets-eyebrow){font-size:13px;line-height:1.6}
.asset-search{min-height:40px;min-width:180px;background:var(--portal-raised)}
.asset-search input{font-size:13px;min-width:0}
.asset-search:focus-within{outline:2px solid var(--portal-accent);outline-offset:2px}
.assets-add,.copy-prompt{min-height:44px;border-radius:8px;font-size:13px;padding:9px 14px}
.assets-add{background:var(--portal-accent);border-color:var(--portal-accent);color:var(--portal-accent-ink,#fff)}
.assets-add:hover{background:var(--portal-accent-hover)}
.asset-caption{padding:16px}
.asset-caption h3{font-size:14px;font-weight:500;overflow-wrap:anywhere}
.asset-caption p{font-size:12px;overflow-wrap:anywhere;line-height:1.5}
.asset-caption small{font-size:11px}
.asset-caption>a{width:36px;height:36px;border-radius:8px}
.asset-card:nth-child(even) .asset-preview{background:var(--portal-bg)}
.prompt-card{padding:24px}
.prompt-heading h2{font-size:18px;font-weight:600}
.prompt-heading p:not(.assets-eyebrow){font-size:13px;line-height:1.6}
.prompt-card pre{font-size:12px;overflow-wrap:anywhere}
.prompt-placeholder{font-size:13px}
.asset-form{padding:24px}
.asset-form-heading h2{font-size:20px}
.asset-fields{gap:24px;align-items:start}
.asset-fields label{font-size:13px}
.asset-fields input,.asset-fields textarea,.asset-fields select{min-height:44px;font-size:13px;border-radius:8px;padding:10px 12px}
.asset-fields textarea{resize:vertical;line-height:1.6}
.asset-fields input[type=file]{padding:8px;font-size:12px}
.asset-fields input[type=file]::file-selector-button{padding:6px 9px;border:1px solid var(--portal-line);border-radius:6px;background:var(--portal-surface);color:var(--portal-text);margin-right:10px}
.asset-file small{font-size:12px}
.assets-message{padding:14px 16px;border-color:var(--portal-danger);color:var(--portal-danger);background:var(--portal-danger-soft);font-size:13px}
.assets-message.success{border-color:var(--portal-success);color:var(--portal-success);background:var(--portal-success-soft)}
.asset-lightbox{overflow:auto}
.asset-lightbox>div{overflow-wrap:anywhere}
.asset-lightbox a,.remove-asset{min-height:40px;border-radius:8px;font-size:13px}
.remove-asset{color:var(--portal-danger);border-color:var(--portal-danger);background:var(--portal-danger-soft)}
@media(max-width:1000px){.asset-content-heading{flex-wrap:wrap}
.asset-search{width:100%}
.asset-library{grid-template-columns:150px minmax(0,1fr);gap:22px}
.asset-grid{grid-template-columns:1fr}}
@media(max-width:650px){.assets-page{padding:24px 16px}
.prompt-card,.asset-form{padding:20px 16px}
.asset-library{gap:24px}
.asset-caption{padding:16px}
.assets-intro h1{font-size:24px}
.asset-library{grid-template-columns:1fr}
.asset-grid{grid-template-columns:1fr}
.asset-sidebar>button{font-size:12px;min-height:40px}
.asset-content-heading h2{font-size:22px}
.asset-caption h3{font-size:14px}
.asset-caption p{font-size:12px}
.asset-lightbox{justify-content:flex-start;padding:64px 20px 28px}
.asset-lightbox>img{max-height:55dvh}
.asset-lightbox>div{max-width:100%;width:100%}}
</style>
