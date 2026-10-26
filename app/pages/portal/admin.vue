<script setup lang="ts">

type Client = { id: string; projectId: string; name: string; initials: string; contact: string; email: string; project: string; description?: string; currentPhase?: string; reviewState?: string | null; reviewFeedback?: string | null; status: string; progress: number; due: string; tone: string; invitedEmail?: string | null }

const ready = ref(false)

const section = ref<'clients' | 'projects' | 'growth'>(useRoute().query.tab==='growth'?'growth':'clients')

const search = ref('')

const selected = ref<Client | null>(null)

const showCreate = ref(false)

const notice = ref('')

const newName = ref('')

const newProject = ref('')

const newDescription = ref('')

const newDue = ref('')

const newEmail = ref('')

const clients = ref<Client[]>([])

const showInvite = ref(false)

const inviteClient = ref<Client | null>(null)

const inviteEmail = ref('')

const inviteUrl = ref('')

const inviteSent = ref(false)

const inviteBusy = ref(false)

const projectBusy = ref(false)

const deleteTarget = ref<Client | null>(null)

const deleteKind = ref<'client' | 'project'>('client')

const deleteBusy = ref(false)

const adminName = ref('Administration')

const projectForm = reactive({ name: '', description: '', status: '', progress: 0, dueDate: '', currentPhase: 'Cadrage' })

const visibleClients = computed(() => clients.value.filter(client => `${client.name} ${client.contact} ${client.project}`.toLowerCase().includes(search.value.toLowerCase())))

useHead({ title: 'Administration · MC Studio' })

const loadClients = async () => {

  const { clients: rows } = await $fetch<{ clients: any[] }>('/api/portal/admin/clients')

  clients.value = rows.map((row, index) => ({

    ...row,

    initials: String(row.name).split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(),

    contact: row.contact || 'Invitation en attente', email: row.email || '', project: row.project || 'Projet à créer',

    status: row.status || 'À cadrer', progress: row.progress ?? 0, due: row.dueDate || 'À définir',

    tone: ['gold', 'blue', 'green'][index % 3]

  }))

}

onMounted(async () => {

  try {

    const { user } = await $fetch<{ user: { role: string; name: string } | null }>('/api/portal/auth/me')

    if (!user || user.role !== 'admin') { await navigateTo('/portal/login'); return }

    adminName.value = user.name

    await loadClients()

    ready.value = true

  } catch { await navigateTo('/portal/login') }

})

const addClient = async () => {

  const name = newName.value.trim()

  if (!name || !newProject.value.trim()) return

  try {

  const { client } = await $fetch<{ client: any }>('/api/portal/admin/clients', { method: 'POST', body: { name, project: newProject.value, description: newDescription.value, dueDate: newDue.value } })

  await loadClients()

  const created = clients.value.find(row => row.id === client.id)

  if (created) openClient(created)

  showCreate.value = false

  section.value = 'clients'

  if (newEmail.value.trim() && created) { inviteClient.value = created; inviteEmail.value = newEmail.value.trim(); showInvite.value = true }

  newName.value = ''

  newProject.value = ''; newDescription.value = ''; newDue.value = ''; newEmail.value = ''

  } catch (error: any) { notice.value = error?.data?.statusMessage || 'Impossible de créer le client.' }

}

const startInvite = (client: Client) => { inviteClient.value = client; inviteEmail.value = client.invitedEmail || ''; inviteUrl.value = ''; inviteSent.value = false; showInvite.value = true }

const sendInvite = async () => {

  if (!inviteClient.value || !inviteEmail.value.trim()) return

  inviteBusy.value = true

  try {

    const result = await $fetch<{ inviteUrl: string; emailSent: boolean }>('/api/portal/admin/invitations', { method: 'POST', body: { organizationId: inviteClient.value.id, email: inviteEmail.value } })

    inviteUrl.value = result.inviteUrl; inviteSent.value = result.emailSent

    await loadClients()

  } catch (error: any) { notice.value = error?.data?.statusMessage || 'Impossible de créer cette invitation.' }

  finally { inviteBusy.value = false }

}

const copyInvite = async () => { await navigator.clipboard.writeText(inviteUrl.value); notice.value = 'Lien d’invitation copié.' }

const openClient = (client: Client) => {

  selected.value = client

  Object.assign(projectForm, { name: client.project, description: client.description || '', status: client.status, progress: client.progress, dueDate: client.due === 'À définir' ? '' : client.due, currentPhase: client.currentPhase || 'Cadrage' })

}

const saveProject = async () => {

  if (!selected.value) return

  projectBusy.value = true

  try {

    await $fetch(`/api/portal/admin/projects/${selected.value.projectId}`, { method: 'PATCH', body: projectForm })

    await loadClients(); selected.value = clients.value.find(row => row.id === selected.value?.id) || selected.value

    notice.value = 'Le projet a été mis à jour.'

  } catch (error: any) { notice.value = error?.data?.statusMessage || 'Impossible de mettre à jour le projet.' }

  finally { projectBusy.value = false }

}

const requestDelete = (client: Client, kind: 'client' | 'project') => {
  deleteTarget.value = client
  deleteKind.value = kind
}

const deleteRecord = async () => {
  const target = deleteTarget.value
  if (!target || deleteBusy.value) return

  deleteBusy.value = true
  try {
    if (deleteKind.value === 'client') {
      await $fetch(`/api/portal/admin/clients/${target.id}`, { method: 'DELETE' })
      notice.value = `Le client ${target.name} et ses données associées ont été supprimés.`
      selected.value = null
    } else {
      await $fetch(`/api/portal/admin/projects/${target.projectId}`, { method: 'DELETE' })
      notice.value = `Le projet ${target.project} et ses données associées ont été supprimés.`
      selected.value = null
    }
    deleteTarget.value = null
    await loadClients()
  } catch (error: any) {
    notice.value = error?.data?.statusMessage || `Impossible de supprimer ce ${deleteKind.value === 'client' ? 'client' : 'projet'}.`
  } finally {
    deleteBusy.value = false
  }
}

const signOut = async () => {

  await $fetch('/api/portal/auth/logout', { method: 'POST' })

  await navigateTo('/portal/login')

}

</script>



<template>

  <main class="admin-space">

    <template v-if="ready">

      <aside class="admin-nav">

        <div class="admin-brand"><PortalBrand /></div>

        <div class="admin-identity"><span class="admin-mark">MC</span><span><strong>MC Studio</strong><small>Administration</small></span></div>



        <nav aria-label="Administration">

          <button :class="{ active: section === 'clients' && !selected }" @click="section = 'clients'; selected = null"><UIcon name="i-tabler-users" />Clients</button>

          <button :class="{ active: section === 'growth' }" @click="section = 'growth'; selected = null"><UIcon name="i-tabler-chart-line" />Croissance & performance</button>

        </nav>

        <div class="admin-nav-bottom">

          <a class="admin-contact" href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer"><UIcon name="i-tabler-brand-whatsapp" />Contacter WhatsApp<UIcon name="i-tabler-arrow-up-right" /></a>

          <NuxtLink class="client-space-link" to="/"><UIcon name="i-tabler-arrow-left" />Retour au site MC Studio</NuxtLink>

          <button class="admin-logout" @click="signOut"><UIcon name="i-tabler-logout" />Se déconnecter</button>

        </div>

      </aside>

      <section class="admin-main">

        <header class="admin-header"><span>MC Studio <span class="slash">/</span> Administration <template v-if="selected"><span class="slash">/</span>{{ selected.name }}</template></span><div class="portal-header-actions"><PortalThemeToggle /><span class="admin-user"><span class="admin-avatar">{{ adminName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() }}</span>{{ adminName }}</span></div></header>

        <div class="admin-content">

          <PortalGrowth v-if="section==='growth' && !selected"/>

          <template v-else-if="selected">

            <button class="back-to-clients" @click="selected = null"><UIcon name="i-tabler-arrow-left" /> Tous les clients</button>

            <div class="admin-title-row"><div class="client-heading"><span :class="['client-logo', selected.tone]">{{ selected.initials }}</span><div><h1>{{ selected.name }}</h1><p class="subheading">Espace client sécurisé</p></div></div><div class="detail-actions"><button class="quiet-button delete-button" @click="requestDelete(selected, 'project')"><UIcon name="i-tabler-trash" />Supprimer le projet</button><button class="wa-button" @click="startInvite(selected)"><UIcon name="i-tabler-mail-forward" />{{ selected.email ? 'Gérer l’accès' : 'Inviter le client' }}</button></div></div>

            <section class="client-detail-grid"><article class="admin-card"><h2>{{ selected.contact }}</h2><p v-if="selected.email">{{ selected.email }}</p><p v-else class="contact-note">Aucun compte client. Envoyez une invitation pour ouvrir l’accès.</p><button v-if="selected.invitedEmail" class="quiet-button" @click="startInvite(selected)">Invitation en attente · renvoyer</button><p class="contact-note">Le client ne verra que les projets de son organisation.</p><div class="client-review-note"><p>{{ selected.reviewFeedback || (selected.reviewState === 'approved' ? 'Dernière maquette validée.' : selected.reviewState === 'changes' ? 'Demande de modifications reçue.' : 'Aucun retour pour le moment.') }}</p></div></article><article class="admin-card"><span class="admin-status"><i></i>{{ selected.status }}</span><h2>{{ selected.project }}</h2><p class="project-type">Visible par le client après connexion</p><div class="admin-progress-meta"><span>Avancement</span><strong>{{ selected.progress }} %</strong></div><div class="admin-progress"><i :style="{ width: `${selected.progress}%` }" /></div><div class="due-row"><span>Livraison prévue</span><strong>{{ selected.due }}</strong></div></article></section>

            <section class="admin-card phases-card"><div class="card-heading"><div><h2>Modifier le projet</h2></div></div><form class="project-edit" @submit.prevent="saveProject"><label>Nom du projet<input v-model="projectForm.name" required></label><label>Étape actuelle<select v-model="projectForm.currentPhase"><option>Cadrage</option><option>Design</option><option>Développement</option><option>Mise en ligne</option></select></label><label>Statut<select v-model="projectForm.status"><option>À cadrer</option><option>En cours</option><option>En validation</option><option>En attente client</option><option>Terminé</option></select></label><label>Avancement (%)<input v-model.number="projectForm.progress" type="number" min="0" max="100" required></label><label>Date de livraison<input v-model="projectForm.dueDate" type="date"></label><label class="wide">Description visible par le client<textarea v-model="projectForm.description" rows="3" placeholder="Présentez brièvement le projet"></textarea></label><button class="create-button" :disabled="projectBusy">{{ projectBusy ? 'Enregistrement…' : 'Enregistrer le projet' }}</button></form></section>

          </template>

          <template v-else>

            <div class="admin-title-row"><div><h1>{{ section === 'clients' ? 'Clients' : 'Projets' }}</h1><p class="subheading">{{ section === 'clients' ? 'Retrouvez les clients et l’avancement de leurs projets.' : 'Suivez les projets en cours et leurs prochaines livraisons.' }}</p></div><button class="create-button" @click="showCreate = true"><UIcon name="i-tabler-plus" />Ajouter un client</button></div>

            <div class="admin-stats"><article><span>CLIENTS</span><strong>{{ clients.length }}</strong><small>dans votre espace</small></article><article><span>PROJETS EN COURS</span><strong>{{ clients.filter(c => c.status !== 'Terminé').length }}</strong><small>à suivre cette semaine</small></article><article><span>À VALIDER</span><strong>{{ clients.filter(c => c.status === 'En validation').length }}</strong><small>en attente d’un retour</small></article></div>

            <section class="admin-card client-list-card"><div class="list-heading"><div><h2>{{ section === 'clients' ? 'Tous les clients' : 'Tous les projets' }} <span>{{ visibleClients.length }}</span></h2></div><label class="admin-search"><UIcon name="i-tabler-search" /><input v-model="search" type="search" placeholder="Rechercher un client…" aria-label="Rechercher un client"></label></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>CLIENT</th><th>CONTACT</th><th>PROJET</th><th>STATUT</th><th>AVANCEMENT</th><th>LIVRAISON</th><th /></tr></thead><tbody><tr v-for="client in visibleClients" :key="client.id" class="client-row" @click="openClient(client)"><td><span :class="['client-logo small', client.tone]">{{ client.initials }}</span><strong>{{ client.name }}</strong></td><td>{{ client.contact }}</td><td>{{ client.project }}</td><td><span :class="['admin-status', { done: client.status === 'Terminé', waiting: client.status === 'En validation' }]"><i />{{ client.status }}</span></td><td><div class="table-progress"><span class="admin-progress"><i :style="{ width: `${client.progress}%` }" /></span><small>{{ client.progress }}%</small></div></td><td>{{ client.due }}</td><td><button class="row-open" :aria-label="`Ouvrir ${client.name}`" @click.stop="openClient(client)"><UIcon name="i-tabler-chevron-right" /></button><button class="row-open delete-row" :aria-label="`Supprimer ${section === 'clients' ? client.name : client.project}`" @click.stop="requestDelete(client, section === 'clients' ? 'client' : 'project')"><UIcon name="i-tabler-trash" /></button></td></tr><tr v-if="visibleClients.length === 0"><td colspan="7" class="empty-table">Aucun client ne correspond à cette recherche.</td></tr></tbody></table></div><p class="table-foot">{{ visibleClients.length }} client{{ visibleClients.length > 1 ? 's' : '' }} dans votre portefeuille.</p></section>

          </template>

          <p v-if="notice" class="admin-notice" role="status">{{ notice }}<button @click="notice = ''">×</button></p>

          <PortalResources v-if="selected?.projectId" :key="selected.projectId" :project-id="selected.projectId" admin />

        <footer class="admin-footer">MC Studio · Espace interne sécurisé</footer>

        </div>

      </section>

      <div v-if="showCreate" class="modal-backdrop" @click.self="showCreate = false"><form class="create-modal" @submit.prevent="addClient"><button type="button" class="modal-close" aria-label="Fermer" @click="showCreate = false">×</button><h2>Ajouter un client</h2><p class="subheading">Créez le projet puis envoyez une invitation à son contact.</p><label for="new-client-name">Nom du client / organisation</label><input id="new-client-name" v-model="newName" required placeholder="Ex. Maison Alba"><label for="new-client-project">Nom du projet</label><input id="new-client-project" v-model="newProject" required placeholder="Ex. Refonte du site"><label for="new-client-description">Description du projet</label><textarea id="new-client-description" v-model="newDescription" rows="3" placeholder="Visible par le client"></textarea><label for="new-client-due">Date de livraison</label><input id="new-client-due" v-model="newDue" type="date"><label for="new-client-email">E-mail du contact (facultatif)</label><input id="new-client-email" v-model="newEmail" type="email" placeholder="client@entreprise.fr"><div class="modal-actions"><button class="quiet-button" type="button" @click="showCreate = false">Annuler</button><button class="create-button" type="submit"><UIcon name="i-tabler-plus" />Créer la fiche</button></div></form></div>

      <div v-if="showInvite" class="modal-backdrop" @click.self="showInvite = false"><form class="create-modal" @submit.prevent="sendInvite"><button type="button" class="modal-close" aria-label="Fermer" @click="showInvite = false">×</button><h2>{{ inviteSent ? 'Invitation envoyée' : inviteUrl ? 'Lien prêt à partager' : 'Inviter un client' }}</h2><p class="subheading">{{ inviteClient?.name }} · le lien expire après 7 jours et ne peut être utilisé qu’une fois.</p><template v-if="!inviteUrl"><label for="invite-email">Adresse e-mail du client</label><input id="invite-email" v-model="inviteEmail" type="email" required placeholder="client@entreprise.fr"><div class="modal-actions"><button class="quiet-button" type="button" @click="showInvite = false">Annuler</button><button class="create-button" type="submit" :disabled="inviteBusy"><UIcon name="i-tabler-mail-forward" />{{ inviteBusy ? 'Envoi…' : 'Créer et envoyer le lien' }}</button></div></template><template v-else><p class="invite-result" role="status">{{ inviteSent ? 'E-mail envoyé. Vous pouvez aussi copier le lien pour le partager.' : 'E-mail non envoyé. Vérifiez la configuration Resend et partagez ce lien manuellement.' }}</p><input :value="inviteUrl" readonly aria-label="Lien d’invitation"><div class="modal-actions"><button class="quiet-button" type="button" @click="showInvite = false">Fermer</button><button class="create-button" type="button" @click="copyInvite"><UIcon name="i-tabler-copy" />Copier le lien</button></div></template></form></div>

      <div v-if="deleteTarget" class="modal-backdrop" @click.self="!deleteBusy && (deleteTarget = null)"><section class="create-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><button type="button" class="modal-close" aria-label="Fermer" :disabled="deleteBusy" @click="deleteTarget = null">×</button><h2 id="delete-title">Supprimer {{ deleteKind === 'client' ? 'le client' : 'le projet' }} ?</h2><p id="delete-description" class="subheading">{{ deleteKind === 'client' ? `${deleteTarget.name} et tous ses projets, comptes clients, invitations, fichiers et historiques seront définitivement supprimés.` : `Le projet « ${deleteTarget.project} » et ses fichiers, maquettes, retours et historiques seront définitivement supprimés. Le client conservera son compte.` }}</p><div class="modal-actions"><button class="quiet-button" type="button" :disabled="deleteBusy" @click="deleteTarget = null">Annuler</button><button class="create-button confirm-delete" type="button" :disabled="deleteBusy" @click="deleteRecord"><UIcon name="i-tabler-trash" />{{ deleteBusy ? 'Suppression…' : 'Supprimer définitivement' }}</button></div></section></div>

    </template>

    <p v-else class="loading-admin" role="status">Ouverture de l’administration…</p>

  </main>

</template>



<style scoped>

.admin-space{--line:var(--portal-line, #2b2b2b);--muted:var(--portal-muted, #a1a1a1);min-height:100vh;background:var(--portal-surface, #0f0f0f);color:var(--portal-text, #f3f3f3);font:14px/1.5 Inter,sans-serif}.admin-space *{box-sizing:border-box}.admin-space button,.admin-space a{color:inherit}.admin-space button{font:inherit;cursor:pointer}.admin-space a{text-decoration:none}.admin-space button:focus-visible,.admin-space a:focus-visible,.admin-space input:focus-visible{outline:2px solid var(--portal-line, #b4b4b4);outline-offset:3px}.admin-nav{position:fixed;inset:0 auto 0 0;width:254px;display:flex;flex-direction:column;padding:20px 12px;background:var(--portal-surface, #151515);border-right:1px solid var(--line)}.admin-brand{padding:0 12px 24px;border-bottom:1px solid var(--line)}.admin-identity{display:flex;align-items:center;gap:10px;padding:16px 12px 20px}.admin-mark{width:34px;height:34px;display:grid;place-items:center;background:var(--portal-raised, #222222);border:1px solid var(--portal-line, #414141);color:var(--portal-text, #b4b4b4);border-radius:7px;font:600 12px 'Host Grotesk'}.admin-identity strong{display:block;font-size:14px;font-weight:500}.admin-identity small{display:block;color:var(--muted);font-size:12px}.nav-caption,.card-label{font-size:11px;letter-spacing:.8px;color:var(--portal-muted, #a1a1a1)}.nav-caption{padding:0 12px;margin:8px 0}.admin-nav nav{display:grid;gap:5px}.admin-nav nav button,.client-space-link,.admin-contact,.admin-logout{display:flex;align-items:center;gap:10px;min-height:40px;padding:8px 12px;background:transparent;border:1px solid transparent;border-radius:7px;text-align:left;color:var(--portal-muted, #acacac)}.admin-nav nav button.active,.admin-nav nav button:hover{background:var(--portal-raised, #222222);border-color:var(--portal-line, #404040);color:white}.admin-nav .iconify{width:18px;height:18px}.admin-nav-bottom{margin-top:auto;display:grid;gap:6px}.admin-contact{color:var(--portal-text, #c8c8c8)!important}.client-space-link,.admin-logout{font-size:13px}.admin-logout{border-top:1px solid var(--line);border-radius:0;margin-top:6px;padding-top:16px;color:var(--muted)}.admin-main{margin-left:254px}.admin-header{height:64px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 28px;font-size:13px;color:var(--portal-muted, #acacac)}.slash{margin:0 12px;color:var(--portal-muted, #666)}.admin-user{display:flex;align-items:center;gap:8px;color:var(--portal-text, #dfdfdf)}.admin-avatar{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--portal-raised, #2f2f2f);color:var(--portal-text, #c8c8c8);font-size:10px}.admin-content{max-width:1180px;margin:auto;padding:38px 32px 24px}.admin-title-row{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:28px}.admin-title-row h1{font:500 32px/1.2 'Host Grotesk';letter-spacing:-.5px;margin:4px 0 6px;background:none;-webkit-text-fill-color:currentColor;color:var(--portal-text, #f3f3f3)}.subheading{margin:0;color:var(--muted)}.create-button,.wa-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;border:1px solid var(--portal-line, #bdbdbd);border-radius:14px;padding:8px 16px;background:linear-gradient(100deg,#fff 25%,#b4b4b4);color:var(--portal-muted, #0f0f0f)!important;font-size:13px;font-weight:500;white-space:nowrap}.create-button:hover,.wa-button:hover{background:linear-gradient(100deg,#fff 40%,#c4c4c4)}.admin-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px}.admin-stats article,.admin-card{background:var(--portal-surface, #171717);border:1px solid var(--line);border-radius:9px}.admin-stats article{padding:17px 19px;display:flex;flex-direction:column;gap:4px}.admin-stats article>span{font-size:10px;letter-spacing:.7px;color:var(--portal-muted, #a1a1a1)}.admin-stats article strong{font:500 26px 'Host Grotesk'}.admin-stats article small{font-size:12px;color:var(--muted)}.client-list-card{padding:21px 0 0;overflow:hidden}.list-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:0 21px 19px}.card-label{margin:0 0 4px}.list-heading h2,.admin-card h2,.create-modal h2{font:500 19px 'Host Grotesk';margin:0}.list-heading h2 span{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 5px;border-radius:99px;background:var(--portal-raised, #252525);color:var(--portal-text, #c3c3c3);font:12px Inter,sans-serif;vertical-align:2px;margin-left:5px}.admin-search{height:38px;width:min(290px,45%);display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid var(--portal-line, #393939);border-radius:99px;background:var(--portal-surface, #1c1c1c);color:var(--portal-muted, #aaa)}.admin-search .iconify{width:17px;height:17px}.admin-search input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--portal-text, #eee);font:13px Inter,sans-serif}.admin-search input::placeholder{color:var(--portal-muted, #888)}.admin-table-wrap{overflow-x:auto}.admin-table{width:100%;border-collapse:collapse;min-width:760px;text-align:left}.admin-table th{height:40px;background:var(--portal-surface, #141414);color:var(--portal-muted, #929292);font-size:10px;letter-spacing:.5px;font-weight:500;padding:0 10px;white-space:nowrap;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.admin-table th:first-child,.admin-table td:first-child{padding-left:20px}.admin-table td{height:66px;border-bottom:1px solid var(--portal-line, #292929);padding:0 10px;color:var(--portal-text, #c2c2c2);font-size:12px;white-space:nowrap}.admin-table tbody tr:last-child td{border-bottom:0}.client-row{cursor:pointer}.client-row:hover{background:var(--portal-surface, #202020)}.admin-table td:first-child{display:table-cell}.client-logo{width:38px;height:38px;display:inline-grid;place-items:center;border-radius:8px;margin-right:10px;vertical-align:middle;font:600 14px 'Host Grotesk'}.client-logo.small{width:30px;height:30px;font-size:12px}.client-logo.gold{background:var(--portal-raised, #2a2a2a);color:var(--portal-text, #c9c9c9)}.client-logo.blue{background:var(--portal-raised, #303030);color:var(--portal-text, #d1d1d1)}.client-logo.green{background:var(--portal-raised, #2c2c2c);color:var(--portal-text, #c4c4c4)}.admin-table td strong{font-weight:500;color:var(--portal-text, #eee)}.admin-status{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:99px;background:var(--portal-raised, #2a2a2a);color:var(--portal-text, #c8c8c8);font-size:11px}.admin-status i{width:6px;height:6px;border-radius:50%;background:currentColor}.admin-status.done{background:var(--portal-raised, #2b2b2b);color:var(--portal-text, #bababa)}.admin-status.waiting{background:var(--portal-raised, #2a2a2a);color:var(--portal-text, #c8c8c8)}.table-progress{display:flex;align-items:center;gap:8px}.admin-progress{display:block;width:75px;height:5px;background:var(--portal-raised, #363636);border-radius:9px;overflow:hidden}.admin-progress i{display:block;height:100%;background:var(--portal-strong, #acacac);border-radius:9px}.table-progress small{font-size:11px;color:var(--portal-text, #ddd)}.row-open{border:0;background:none;color:var(--portal-muted, #999);padding:7px}.table-foot{border-top:1px solid var(--line);padding:11px 20px;margin:0;color:var(--portal-muted, #858585);font-size:11px}.admin-footer{margin-top:24px;color:var(--portal-muted, #818181);font-size:11px}.detail-actions{display:flex;align-items:center;gap:9px}.delete-button{display:inline-flex;align-items:center;gap:7px;min-height:34px;color:#d79a8c!important}.delete-row{color:#d79a8c!important;opacity:.72}.delete-row:hover,.delete-button:hover{color:#f1a18f!important;opacity:1}.confirm-delete{background:linear-gradient(180deg,#a65042,#7d3027);border-color:#ae6255;color:#fff!important}.confirm-delete:hover{background:linear-gradient(180deg,#ba5d4e,#8b382d)}.admin-table td .row-open{margin-right:3px}.client-heading{display:flex;align-items:center;gap:14px}.client-heading .client-logo{margin:0;width:54px;height:54px;font-size:20px}.client-detail-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:14px;margin-bottom:16px}.admin-card{padding:22px}.admin-card>a:not(.admin-contact){color:var(--portal-text, #bdbdbd);font-size:13px}.admin-card .contact-note{font-size:11px;color:var(--portal-muted, #828282);margin:20px 0 0}.admin-card h2{margin:10px 0 7px}.project-type{font-size:12px;color:var(--muted);margin:0 0 20px}.admin-progress-meta,.due-row{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted);margin:10px 0 7px}.admin-progress-meta strong,.due-row strong{color:var(--portal-text, #eee);font-weight:500}.admin-progress{width:100%;height:7px}.due-row{border-top:1px solid var(--line);padding-top:14px;margin-top:17px}.phases-card{padding:22px}.card-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.quiet-button{border:1px solid var(--portal-line, #414141);border-radius:99px;background:var(--portal-raised, #232323);padding:8px 13px;font-size:12px}.admin-phase{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid var(--line);font-size:13px}.phase-marker{width:26px;height:26px;display:grid;place-items:center;border:1px solid var(--portal-line, #444);border-radius:50%;color:var(--portal-muted, #aaa);font-size:11px}.phase-marker.complete{border-color:var(--portal-line, #535353);color:var(--portal-muted, #acacac)}.phase-marker.current{border-color:var(--portal-line, #606060);background:var(--portal-raised, #2a2a2a);color:var(--portal-text, #c8c8c8)}.phase-tag{margin-left:auto;color:var(--muted);font-size:11px}.back-to-clients{display:flex;align-items:center;gap:6px;border:0;background:none;color:var(--portal-muted, #a5a5a5)!important;padding:0;margin-bottom:20px}.empty-table{text-align:center;color:var(--portal-muted, #999)!important}.admin-notice{position:fixed;right:20px;bottom:20px;max-width:350px;padding:12px 15px;border:1px solid var(--portal-line, #454545);background:var(--portal-surface, #1c1c1c);border-radius:8px;box-shadow:0 8px 30px #0008}.admin-notice button{margin-left:12px;border:0;background:none;color:var(--portal-text, #b4b4b4)}.modal-backdrop{position:fixed;inset:0;z-index:10;background:#000a;display:grid;place-items:center;padding:20px}.create-modal{position:relative;width:min(440px,100%);padding:28px;background:var(--portal-surface, #181818);border:1px solid var(--portal-line, #373737);border-radius:12px;box-shadow:0 20px 80px #000a}.create-modal h2{font-size:23px;margin:5px 0}.create-modal .subheading{font-size:13px;margin-bottom:22px}.create-modal label{display:block;margin:14px 0 6px;font-size:12px;color:var(--portal-text, #ddd)}.create-modal input{width:100%;height:40px;padding:0 11px;border:1px solid var(--portal-line, #414141);border-radius:6px;background:var(--portal-surface, #111);color:white;font:13px Inter,sans-serif}.create-modal input:focus{outline:2px solid var(--portal-line, #b0b0b0)}.modal-close{position:absolute;right:14px;top:12px;border:0;background:none;color:var(--portal-muted, #aaa);font-size:22px}.modal-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:24px}.loading-admin{padding:40px;color:var(--portal-muted, #aaa)}.client-review-note{border-top:1px solid var(--line);margin-top:16px;padding-top:14px}.client-review-note p{margin:5px 0 0;color:var(--portal-text, #ddd);font-size:12px;white-space:pre-wrap}.project-edit{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:15px}.project-edit label{display:grid;gap:6px;color:var(--portal-text, #c5c5c5);font-size:12px}.project-edit input,.project-edit select,.project-edit textarea,.create-modal textarea{width:100%;padding:10px;border:1px solid var(--portal-line, #414141);border-radius:6px;background:var(--portal-surface, #111);color:var(--portal-text, #eee);font:13px Inter,sans-serif}.project-edit .wide{grid-column:1/-1}.project-edit .create-button{justify-self:start}.create-modal textarea{resize:vertical}.invite-result{padding:11px;border:1px solid var(--portal-line, #333333);border-radius:6px;background:var(--portal-surface, #1c1c1c);color:var(--portal-text, #c4c4c4);font-size:12px}.project-edit{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:15px}.project-edit label{display:grid;gap:6px;color:var(--portal-text, #c5c5c5);font-size:12px}.project-edit input,.project-edit select,.project-edit textarea,.create-modal textarea{width:100%;padding:10px;border:1px solid var(--portal-line, #414141);border-radius:6px;background:var(--portal-surface, #111);color:var(--portal-text, #eee);font:13px Inter,sans-serif}.project-edit .wide{grid-column:1/-1}.project-edit .create-button{justify-self:start}.create-modal textarea{resize:vertical}.invite-result{padding:11px;border:1px solid var(--portal-line, #333333);border-radius:6px;background:var(--portal-surface, #1c1c1c);color:var(--portal-text, #c4c4c4);font-size:12px}

@media(max-width:900px){.admin-nav{width:220px}.admin-main{margin-left:220px}.admin-content{padding:28px 20px}.admin-table{min-width:740px}}

@media(max-width:680px){.project-edit{grid-template-columns:1fr}.project-edit .wide{grid-column:auto}.admin-nav{position:static;width:100%;padding:12px 16px 0;border:0;border-bottom:1px solid var(--line)}.admin-brand{padding:0 0 13px}.admin-identity{display:none}.nav-caption{margin:10px 0 4px;padding:0}.admin-nav nav{display:flex;overflow:auto}.admin-nav nav button{white-space:nowrap}.admin-nav-bottom{display:flex;flex-wrap:wrap;margin-top:7px;padding-bottom:10px}.admin-contact,.client-space-link,.admin-logout{font-size:11px;padding:6px;min-height:32px}.admin-logout{margin:0;border:0}.admin-main{margin:0}.admin-header{height:50px;padding:0 16px;font-size:11px}.admin-content{padding:24px 15px}.admin-title-row{align-items:flex-start;flex-direction:column}.admin-title-row h1{font-size:27px}.admin-stats{gap:8px}.admin-stats article{padding:12px}.admin-stats article>span{font-size:9px}.admin-stats article strong{font-size:22px}.admin-stats article small{font-size:10px}.list-heading{padding:0 14px 15px;align-items:flex-start;flex-direction:column}.admin-search{width:100%}.client-detail-grid{grid-template-columns:1fr}.admin-table{min-width:740px}.admin-user{font-size:0}.admin-avatar{font-size:10px}}



.admin-space{background:var(--portal-surface, #151515);color:var(--portal-text, #eee);font:12px/1.5 Inter,Arial,sans-serif}.admin-nav{background:var(--portal-surface, #181818);width:236px;padding:20px 12px;border-color:var(--portal-line, #292929)}.admin-main{margin-left:236px}.admin-brand{padding:0 8px 22px}.admin-brand:deep(img){width:127px}.admin-identity{padding:16px 8px}.admin-mark{background:var(--portal-raised, #292929);border-color:var(--portal-line, #444);color:var(--portal-text, #ddd)}.admin-identity strong{font-size:12px}.admin-identity small{font-size:10px}.admin-nav nav button{font-size:12px;color:var(--portal-muted, #999);padding:9px 10px;min-height:37px;border-radius:6px}.admin-nav nav button.active{background:var(--portal-raised, #2b2b2b);border-color:var(--portal-line, #414141);color:var(--portal-text, #eee)}.admin-nav nav button:hover{background:var(--portal-raised, #252525)}.admin-header{height:64px;padding:0 24px;font-size:11px}.admin-avatar{background:var(--portal-raised, #383838);color:var(--portal-text, #ddd)}.admin-content{max-width:none;padding:24px}.admin-title-row{margin-bottom:24px}.admin-title-row h1{font:500 22px/1.3 Inter,Arial,sans-serif}.subheading{font-size:11px;color:var(--portal-muted, #888)}.create-button,.wa-button{border:1px solid #d8b45b;background:linear-gradient(180deg,#d7b45c,#a77b24);box-shadow:inset 0 1px 1px #ffffff55;color:var(--portal-text, #fff)!important;border-radius:99px;padding:7px 13px;min-height:33px;font-size:11px}.create-button:hover,.wa-button:hover{background:linear-gradient(180deg,#e3c574,#bb9136)}.create-button:disabled,.wa-button:disabled{opacity:.55;cursor:wait}.admin-stats{gap:0;border:1px solid var(--portal-line, #303030);border-radius:6px;overflow:hidden;background:var(--portal-surface, #181818)}.admin-stats article{border:0;border-right:1px solid var(--portal-line, #303030);border-radius:0;background:none;padding:14px 20px}.admin-stats article:last-child{border:0}.admin-stats article strong{font:500 23px Inter,Arial,sans-serif}.admin-stats article small{font-size:10px;color:var(--portal-muted, #777)}.admin-stats article>span{font-size:9px;color:var(--portal-muted, #888)}.admin-card{border-color:var(--portal-line, #303030);background:var(--portal-surface, #181818);border-radius:6px}.admin-card h2,.list-heading h2,.create-modal h2{font-family:Inter,Arial,sans-serif;font-size:16px}.client-list-card{border-radius:0;border-left:0;border-right:0;padding:16px 0 0;background:none;margin:0 -24px}.list-heading{padding:0 24px 16px;align-items:center}.list-heading .card-label{display:none}.list-heading h2{font-size:13px}.list-heading h2 span{background:var(--portal-raised, #262626);color:var(--portal-muted, #aaa);border:1px solid var(--portal-line, #3c3c3c);font-size:10px;height:19px;min-width:19px}.admin-search{height:32px;width:240px;background:var(--portal-surface, #202020);border-color:var(--portal-line, #3b3b3b);font-size:11px}.admin-search input{font-size:11px}.admin-table th{background:var(--portal-surface, #151515);font-size:10px;font-weight:400;height:40px;color:var(--portal-muted, #777)}.admin-table td{height:56px;font-size:11px;border-color:var(--portal-line, #292929)}.admin-table th:first-child,.admin-table td:first-child{padding-left:24px}.client-logo,.client-logo.gold,.client-logo.blue,.client-logo.green{background:var(--portal-raised, #292929);color:var(--portal-text, #ccc);border:1px solid var(--portal-line, #404040)}.client-logo.small{height:27px;width:27px;font-size:10px}.admin-status,.admin-status.done,.admin-status.waiting{background:var(--portal-raised, #272727);border:1px solid var(--portal-line, #3b3b3b);color:var(--portal-text, #bbb);font-size:10px;padding:2px 7px}.admin-progress{background:var(--portal-raised, #383838);border-radius:2px;height:4px}.admin-progress i{background:var(--portal-strong, #bcbcbc);border-radius:2px}.admin-table .admin-progress{width:66px}.quiet-button{font-size:11px;background:var(--portal-raised, #232323);border-color:var(--portal-line, #444)}.back-to-clients{color:var(--portal-muted, #aaa)!important}.admin-contact,.admin-card>a:not(.admin-contact){color:var(--portal-text, #ccc)!important}.admin-phase{font-size:12px}.phase-marker.complete,.phase-marker.current{color:var(--portal-text, #ddd);border-color:var(--portal-line, #777);background:var(--portal-raised, #303030)}.admin-notice{background:var(--portal-raised, #222);border-color:var(--portal-line, #555)}.admin-notice button{color:var(--portal-text, #ddd)}.invite-result{color:var(--portal-text, #ddd);background:var(--portal-raised, #242424);border-color:var(--portal-line, #444)}.admin-space:focus-visible{outline:2px solid #d8b45b;outline-offset:3px}.client-detail-grid{margin-bottom:18px}.phases-card{margin-bottom:30px}.admin-footer{border-top:1px solid var(--portal-line, #292929);padding-top:16px;color:var(--portal-muted, #777)}

@media(max-width:900px){.admin-nav{width:210px}.admin-main{margin-left:210px}}

@media(max-width:680px){.detail-actions{align-items:stretch;flex-direction:column-reverse}.admin-title-row:has(.detail-actions){align-items:flex-start}.admin-nav{width:100%;position:static;padding:16px 12px 0}.admin-main{margin:0}.admin-content{padding:20px 16px}.admin-title-row h1{font-size:21px}.client-list-card{margin:0 -16px}.list-heading{padding:0 16px 14px}.admin-stats article{padding:12px}.admin-stats article strong{font-size:20px}.admin-header{padding:0 16px}.admin-brand{padding:0 4px 14px}}

</style>
