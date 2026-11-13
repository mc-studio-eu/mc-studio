<script setup lang="ts">
import { memberRoleLabels, portalDate, resourceLabels, type MemberRole, type PortalMember, type ResourceKind } from '~/types/portal'

type Project = { id: string; organizationId: string; name: string; description: string; currentPhase: string; reviewState?: string | null; reviewFeedback?: string | null; status: string; progress: number; dueDate: string; createdAt?: string; updatedAt?: string; decisionMakerId?:string|null;decisionMakerName?:string }
type TeamMember = PortalMember & { createdAt: string }
type TeamInvitation = { id: string; email: string; expiresAt: string; memberRole?:MemberRole }
type InviteResult = { email: string; inviteUrl?: string; emailSent?: boolean; error?: string }
type Client = { members: TeamMember[]; invitations: TeamInvitation[]; id: string; name: string; initials: string; contact: string; email: string; projects: Project[]; projectId: string; project: string; description?: string; currentPhase?: string; reviewState?: string | null; reviewFeedback?: string | null; status: string; progress: number; due: string; tone: string; invitedEmail?: string | null }

const ready = ref(false)
const loadError = ref('')
const route = useRoute(), router = useRouter(), localePath = useLocalePath()
type AdminSection = 'clients' | 'projects' | 'growth' | 'assets' | 'account' | 'notifications' | 'storage'
type ProjectTab = 'roadmap' | 'requests' | 'settings' | 'resources'
type AdminResource = ResourceKind | 'assets' | 'satisfaction'
const adminSections: readonly string[] = ['clients', 'projects', 'growth', 'assets', 'account', 'notifications', 'storage']
const isResourceTab = (value: unknown): value is AdminResource => typeof value === 'string' && (value === 'assets' || value === 'satisfaction' || Object.hasOwn(resourceLabels, value))
const projectTabs = [
  { id: 'roadmap', label: 'Roadmap', icon: 'i-tabler-route' },
  { id: 'requests', label: 'Demandes', icon: 'i-tabler-messages' },
  { id: 'settings', label: 'Paramètres', icon: 'i-tabler-settings' },
  { id: 'resources', label: 'Ressources', icon: 'i-tabler-folders' },
] as const
const requestedClientId = computed(() => typeof route.query.clientId === 'string' ? route.query.clientId : '')
const requestedProjectId = computed(() => typeof route.query.projectId === 'string' ? route.query.projectId : '')
const section = computed<AdminSection>(() => {
  const tab = route.query.tab
  return !requestedClientId.value && !requestedProjectId.value && typeof tab === 'string' && adminSections.includes(tab) ? tab as AdminSection : 'clients'
})
const projectTab = computed<ProjectTab>(() => route.query.tab === 'requests' ? 'requests' : route.query.tab === 'settings' ? 'settings' : route.query.tab === 'resources' || isResourceTab(route.query.tab) ? 'resources' : 'roadmap')
const resourceTab = computed<AdminResource>(() => isResourceTab(route.query.resource) ? route.query.resource : isResourceTab(route.query.tab) ? route.query.tab : 'payment')
const requestItem = computed(() => projectTab.value === 'requests' && typeof route.query.requestId === 'string' ? route.query.requestId : undefined)
const roadmapItem = computed(() => activeProject.value?.id === requestedProjectId.value && projectTab.value === 'roadmap' && typeof route.query.stepId === 'string' ? route.query.stepId : '')

const search = ref('')

const statusFilter = ref('all')

const sortBy = ref<'name' | 'contact' | 'project' | 'status' | 'progress' | 'due'>('name')

const sortDirection = ref<'asc' | 'desc'>('asc')

let filtersStorageKey = ''
const restoreClientFilters = (userId: string) => {
  const key = `mc-portal-client-filters:${userId}`
  if (filtersStorageKey === key) return
  filtersStorageKey = ''
  search.value = ''
  statusFilter.value = 'all'
  sortBy.value = 'name'
  sortDirection.value = 'asc'
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null')
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      if (typeof saved.search === 'string') search.value = saved.search
      if (typeof saved.status === 'string' && saved.status) statusFilter.value = saved.status
      if (['name', 'contact', 'project', 'status', 'progress', 'due'].includes(saved.sortBy)) sortBy.value = saved.sortBy
      if (saved.direction === 'asc' || saved.direction === 'desc') sortDirection.value = saved.direction
    }
  } catch {
    // Keep the list usable when browser storage is unavailable or malformed.
  }
  filtersStorageKey = key
}
watch([search, statusFilter, sortBy, sortDirection], () => {
  if (!filtersStorageKey) return
  try {
    localStorage.setItem(filtersStorageKey, JSON.stringify({ search: search.value, status: statusFilter.value, sortBy: sortBy.value, direction: sortDirection.value }))
  } catch {
    // Filtering still works when the browser cannot save preferences.
  }
}, { flush: 'sync' })

const showCreate = ref(false)
const createBusy = ref(false)
const modalError = ref('')

const notice = ref('')

const newName = ref('')

const newProject = ref('')

const newDescription = ref('')

const newDue = ref('')

const newEmail = ref('')

const clients = ref<Client[]>([])
const selected = computed(() => clients.value.find(client => requestedClientId.value ? client.id === requestedClientId.value : client.projects.some(project => project.id === requestedProjectId.value)) || null)

const showInvite = ref(false)

const inviteClient = ref<Client | null>(null)

const inviteEmail = ref('')
const inviteRole=ref<MemberRole>('contributor'),memberBusy=ref('')

const inviteResults = ref<InviteResult[]>([])
const inviteError = ref('')
const invitationActionBusy = ref('')
const inviteProgress = ref(0)

const inviteBusy = ref(false)

const projectBusy = ref(false)
const showAddProject = ref(false)
const newProjectForm = reactive({ name: '', description: '', status: 'En cours', dueDate: '' })
const projectRecords = computed(() => selected.value?.projects || [])
const activeProject = computed(() => projectRecords.value.find(project => project.id === requestedProjectId.value) || projectRecords.value[0] || null)

const deleteTarget = ref<Client | null>(null)

const deleteKind = ref<'client' | 'project'>('client')
const deleteProject = ref<Project | null>(null)

const deleteBusy = ref(false)

const adminName = ref('Administration'), adminEmail=ref('')

const projectForm = reactive({ name: '', description: '', status: '', dueDate: '',decisionMakerId:'' })
const globalPrompt = ref(''), promptBusy = ref(false), promptProjectId = ref(''), promptLoading = ref(false)
const promptProjects = computed(() => clients.value.flatMap(client => client.projects.map(project => ({...project, clientName:client.name}))))

const clientStatuses = computed(() => [...new Set(clients.value.flatMap(client => client.projects.map(project => project.status)))].sort((a, b) => a.localeCompare(b, 'fr')))
const projectCount = computed(() => clients.value.reduce((count, client) => count + client.projects.length, 0))
const inProgressCount = computed(() => clients.value.reduce((count, client) => count + client.projects.filter(project => project.status !== 'Terminé').length, 0))
const reviewCount = computed(() => clients.value.reduce((count, client) => count + client.projects.filter(project => project.status === 'En validation').length, 0))

const visibleClients = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('fr')
  const direction = sortDirection.value === 'asc' ? 1 : -1
  return clients.value
    .filter(client => statusFilter.value === 'all' || client.projects.some(project => project.status === statusFilter.value))
    .filter(client => !query || `${client.name} ${client.contact} ${client.projects.map(project => project.name).join(' ')} ${client.projects.map(project => project.status).join(' ')}`.toLocaleLowerCase('fr').includes(query))
    .sort((a, b) => {
      if (sortBy.value === 'progress') return ((a.projects[0]?.progress || 0) - (b.projects[0]?.progress || 0)) * direction
      const left = sortBy.value === 'project' ? a.projects.map(project => project.name).join(', ') : sortBy.value === 'status' ? a.projects[0]?.status || '' : sortBy.value === 'due' ? a.projects[0]?.dueDate || 'À définir' : a[sortBy.value]
      const right = sortBy.value === 'project' ? b.projects.map(project => project.name).join(', ') : sortBy.value === 'status' ? b.projects[0]?.status || '' : sortBy.value === 'due' ? b.projects[0]?.dueDate || 'À définir' : b[sortBy.value]
      if (sortBy.value === 'due' && (left === 'À définir' || right === 'À définir')) return left === right ? 0 : left === 'À définir' ? 1 : -1
      return String(left).localeCompare(String(right), 'fr', { numeric: true, sensitivity: 'base' }) * direction
    })
})

useHead({ title: 'Administration · MC Studio' })

const loadClients = async () => {

  const { clients: rows } = await $fetch<{ clients: any[] }>('/api/portal/admin/clients')

  clients.value = rows.map((row, index) => {
    const projects = (row.projects || []).map((project: any) => ({ ...project, status: project.status || 'À cadrer', progress: project.progress ?? 0, dueDate: project.dueDate || '' }))
    const latest = projects[0]
    return {
      ...row,
      projects, members: row.members || [], invitations: row.invitations || [],
      initials: String(row.name).split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(),
      contact: row.contact || 'Invitation en attente', email: row.email || '',
      projectId: latest?.id || '', project: latest?.name || 'Projet à créer', description: latest?.description || '', currentPhase: latest?.currentPhase || '', reviewState: latest?.reviewState, reviewFeedback: latest?.reviewFeedback,
      status: latest?.status || 'À cadrer', progress: latest?.progress ?? 0, due: latest?.dueDate || 'À définir',
      tone: ['gold', 'blue', 'green'][index % 3]
    }
  })
}

const openAdministration = async () => {
  loadError.value = ''

  try {

    const { user } = await $fetch<{ user: { id: string; role: string; name: string; email:string } | null }>('/api/portal/auth/me')

    if (!user || user.role !== 'admin') { await navigateTo(localePath(user ? '/portal' : '/portal/login'), { replace: true }); return }

    adminName.value = user.name; adminEmail.value=user.email
    restoreClientFilters(user.id)

    await loadClients()
    ready.value = true

  } catch { loadError.value = 'Impossible de charger l’administration.' }

}
onMounted(openAdministration)

const addClient = async () => {

  const name = newName.value.trim()

  if (!name || !newProject.value.trim() || createBusy.value) return

  createBusy.value = true
  modalError.value = ''
  try {

  const { client } = await $fetch<{ client: any }>('/api/portal/admin/clients', { method: 'POST', body: { name, project: newProject.value, description: newDescription.value, dueDate: newDue.value } })

  await loadClients()

  const created = clients.value.find(row => row.id === client.id)

  if (created) await openClient(created)

  showCreate.value = false

  if (newEmail.value.trim() && created) startInvite(created, newEmail.value.trim())

  newName.value = ''

  newProject.value = ''; newDescription.value = ''; newDue.value = ''; newEmail.value = ''

  } catch (error: any) { modalError.value = error?.data?.statusMessage || 'Impossible de créer le client.' }
  finally { createBusy.value = false }

}

const startInvite = (client: Client, email = '', role:MemberRole='contributor') => {
  inviteClient.value = client; inviteEmail.value = email; inviteRole.value=role; inviteResults.value = []; inviteError.value = ''; inviteProgress.value = 0; showInvite.value = true
}
const sendInvite = async () => {
  if (!inviteClient.value || inviteBusy.value) return
  const emails = [...new Set(inviteEmail.value.split(/[\s,;]+/).map(email => email.trim().toLowerCase()).filter(Boolean))]
  inviteError.value = ''
  if (!emails.length || emails.length > 20 || emails.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
    inviteError.value = 'Saisissez de 1 à 20 adresses e-mail valides, séparées par une virgule ou un retour à la ligne.'; return
  }
  inviteBusy.value = true; inviteResults.value = []; inviteProgress.value = 0
  const clientId = inviteClient.value.id
  try {
    for (const email of emails) {
      try {
        const result = await $fetch<{ inviteUrl: string; emailSent: boolean }>('/api/portal/admin/invitations', { method: 'POST', body: { organizationId: clientId, email,memberRole:inviteRole.value } })
        inviteResults.value.push({ email, ...result })
      } catch (error: any) { inviteResults.value.push({ email, error: error?.data?.statusMessage || 'Invitation impossible. Réessayez.' }) }
      inviteProgress.value++
    }
    await loadClients()
  } catch { inviteError.value = 'La liste des accès n’a pas pu être actualisée. Les résultats ci-dessous indiquent les invitations créées.' }
  finally { inviteBusy.value = false }
}
const copyInvite = async (url: string) => {
  try { await navigator.clipboard.writeText(url); notice.value = 'Lien d’invitation copié.' }
  catch { inviteError.value = 'Copie impossible. Sélectionnez le lien pour le copier manuellement.' }
}
const revokeInvitation = async (invitation: TeamInvitation) => {
  if (!selected.value || invitationActionBusy.value) return
  invitationActionBusy.value = invitation.id
  try {
    await $fetch(`/api/portal/admin/invitations/${invitation.id}`, { method: 'DELETE', query: { organizationId: selected.value.id } })
    await loadClients(); notice.value = 'Invitation annulée : le lien ne peut plus être utilisé.'
  } catch (error: any) { notice.value = error?.data?.statusMessage || 'Impossible d’annuler cette invitation.' }
  finally { invitationActionBusy.value = '' }
}
const invitationExpired = (expiresAt: string) => expiresAt <= new Date().toISOString()
const retryInvites = () => { inviteEmail.value = inviteResults.value.filter(result => result.error).map(result => result.email).join('\n'); inviteResults.value = []; inviteError.value = '' }

const goToSection = (tab: AdminSection, replace = false) => {
  const location = { query: { ...route.query, tab: tab === 'clients' ? undefined : tab, clientId: undefined, projectId: undefined, stepId: undefined, resource: undefined, requestId: undefined } }
  return replace ? router.replace(location) : router.push(location)
}
const goToProject = (clientId: string, projectId?: string, tab: ProjectTab = 'roadmap', resource?: AdminResource, replace = false) => {
  const location = { query: { ...route.query, tab: projectId ? tab : undefined, clientId, projectId, stepId: undefined, resource: tab === 'resources' && resource !== 'payment' ? resource : undefined, requestId: undefined } }
  return replace ? router.replace(location) : router.push(location)
}
const selectRequest = (id: string) => {
  if (!selected.value || !activeProject.value) return
  return router.push({ query: { ...route.query, clientId: selected.value.id, projectId: activeProject.value.id, tab: 'requests', requestId: id || undefined, stepId: undefined, resource: undefined } })
}
const openClient = (client: Client) => goToProject(client.id, client.projects[0]?.id)
const openProjectTab = (tab: ProjectTab, resource = resourceTab.value) => {
  if (selected.value && activeProject.value && (tab !== projectTab.value || roadmapItem.value || requestItem.value || (tab === 'resources' && resource !== resourceTab.value))) {
    return goToProject(selected.value.id, activeProject.value.id, tab, resource)
  }
}
const chooseProject = (projectId: string) => {
  if (selected.value && projectId !== activeProject.value?.id) return goToProject(selected.value.id, projectId, projectTab.value, resourceTab.value)
}

const syncProjectForm = () => {
  const project = activeProject.value
  Object.assign(projectForm, { name: project?.name || '', description: project?.description || '', status: project?.status || 'À cadrer', dueDate: project?.dueDate || '',decisionMakerId:project?.decisionMakerId || '' })
}
watch(() => activeProject.value?.id, syncProjectForm)
watch(() => selected.value?.id, () => { if (!projectBusy.value) showAddProject.value = false })

const addProject = async () => {
  if (!selected.value || projectBusy.value) return
  const clientId = selected.value.id
  modalError.value = ''
  projectBusy.value = true
  try {
    const { project } = await $fetch<{ project: Project }>(`/api/portal/admin/clients/${clientId}/projects`, { method: 'POST', body: newProjectForm })
    await loadClients()
    if (selected.value?.id === clientId) await goToProject(clientId, project.id)
    Object.assign(newProjectForm, { name: '', description: '', status: 'En cours', dueDate: '' })
    showAddProject.value = false
    notice.value = 'Le projet a été créé.'
  } catch (error: any) { modalError.value = error?.data?.statusMessage || 'Impossible de créer le projet.' }
  finally { projectBusy.value = false }
}

const saveProject = async () => {

  if (!activeProject.value) return

  projectBusy.value = true

  try {

    await $fetch(`/api/portal/admin/projects/${activeProject.value.id}`, { method: 'PATCH', body: {...projectForm,decisionMakerId:projectForm.decisionMakerId || null} })
    await loadClients()
    syncProjectForm()

    notice.value = 'Le projet a été mis à jour.'

  } catch (error: any) { notice.value = error?.data?.statusMessage || 'Impossible de mettre à jour le projet.' }

  finally { projectBusy.value = false }

}

const requestDelete = (client: Client, kind: 'client' | 'project') => {
  deleteTarget.value = client
  deleteKind.value = kind
  deleteProject.value = kind === 'project' ? activeProject.value : null
}

const deleteRecord = async () => {
  const target = deleteTarget.value
  if (!target || deleteBusy.value) return
  const project = deleteProject.value
  const sectionUrl = route.fullPath

  modalError.value = ''
  deleteBusy.value = true
  try {
    if (deleteKind.value === 'client') {
      await $fetch(`/api/portal/admin/clients/${target.id}`, { method: 'DELETE' })
      notice.value = `Le client ${target.name} et ses données associées ont été supprimés.`
    } else if (project) {
      await $fetch(`/api/portal/admin/projects/${project.id}`, { method: 'DELETE' })
      notice.value = `Le projet ${project.name} et ses données associées ont été supprimés.`
    }
    deleteTarget.value = null
    await loadClients()
    if (route.fullPath === sectionUrl) {
      if (project && selected.value?.id === target.id && requestedProjectId.value === project.id) await goToProject(target.id, selected.value.projects[0]?.id, 'roadmap', undefined, true)
      else if (!project && (requestedClientId.value === target.id || target.projects.some(item => item.id === requestedProjectId.value))) await goToSection('clients', true)
    }
  } catch (error: any) {
    modalError.value = error?.data?.statusMessage || `Impossible de supprimer ce ${deleteKind.value === 'client' ? 'client' : 'projet'}.`
  } finally {
    deleteBusy.value = false
  }
}

const updateMember=async(member:TeamMember,patch:{memberRole?:MemberRole;suspended?:boolean})=>{
 if(memberBusy.value)return
 memberBusy.value=member.id
 try{await $fetch(`/api/portal/admin/members/${member.id}`,{method:'PATCH',body:patch});await loadClients();syncProjectForm();notice.value=patch.suspended===true?'Accès suspendu et sessions révoquées.':patch.suspended===false?'Le membre peut à nouveau se connecter.':'Le rôle a été mis à jour.'}
 catch(error:any){notice.value=error?.data?.statusMessage || 'Impossible de mettre à jour cet accès.';await loadClients()}
 finally{memberBusy.value=''}
}
const openProjectResource = (kind:AdminResource) => openProjectTab('resources', kind)
const openNotificationProject = (projectId:string,tab:string) => {
  const client = clients.value.find(client => client.projects.some(project => project.id === projectId))
  if (client) return goToProject(client.id, projectId, tab === 'requests' ? 'requests' : isResourceTab(tab) ? 'resources' : 'roadmap', isResourceTab(tab) ? tab : undefined)
  notice.value = 'Ce projet n’est plus disponible.'
}
const updateRoadmap = (summary:{progress:number;currentPhase:{title:string}|null},project:{id:string}) => {
  const row = clients.value.flatMap(client => client.projects).find(item => item.id === project.id)
  if (row) {
    row.progress = summary.progress
    row.currentPhase = summary.currentPhase?.title || ''
  }
}

const signOut = async () => {

  await $fetch('/api/portal/auth/logout', { method: 'POST' })

  await navigateTo(localePath('/portal/login'), { replace: true })

}

watch(promptProjectId, async projectId => {
  globalPrompt.value = ''
  if (!projectId) return
  promptLoading.value = true
  try {
    const data = await $fetch<{prompt:string}>('/api/portal/admin/assets/prompt', { query:{projectId} })
    globalPrompt.value = data.prompt
  } catch (error:any) {
    notice.value = error?.data?.statusMessage || 'Impossible de charger le prompt.'
  } finally { promptLoading.value = false }
})

const saveProjectPrompt = async () => {
  if (!promptProjectId.value) return
  promptBusy.value = true
  try { await $fetch('/api/portal/admin/assets/prompt', { method:'PUT', body:{projectId:promptProjectId.value,prompt:globalPrompt.value} }); notice.value='Le prompt IA de ce projet a été enregistré.' }
  catch (error:any) { notice.value=error?.data?.statusMessage || 'Impossible d’enregistrer le prompt.' }
  finally { promptBusy.value=false }
}

const activeModal = computed(() => deleteTarget.value ? 'delete' : showInvite.value ? 'invite' : showAddProject.value ? 'project' : showCreate.value ? 'client' : '')
let modalTrigger: HTMLElement | null = null
let previousBodyOverflow = ''
const closeModal = () => {
  if (activeModal.value === 'delete' && !deleteBusy.value) deleteTarget.value = null
  else if (activeModal.value === 'invite' && !inviteBusy.value) showInvite.value = false
  else if (activeModal.value === 'project' && !projectBusy.value) showAddProject.value = false
  else if (activeModal.value === 'client' && !createBusy.value) showCreate.value = false
}
const handleModalKey = (event: KeyboardEvent) => {
  if (!activeModal.value) return
  if (event.key === 'Escape') { event.preventDefault(); closeModal(); return }
  if (event.key !== 'Tab') return
  const dialog = document.querySelector<HTMLElement>('[data-admin-dialog]')
  if (!dialog) return
  const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')].filter(element => element.getClientRects().length)
  const first = controls[0], last = controls[controls.length - 1]
  if (!first || !last) { event.preventDefault(); dialog.focus(); return }
  if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus() }
}
watch(activeModal, async (current, previous) => {
  if (!import.meta.client) return
  modalError.value = ''
  if (current && !previous) {
    modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleModalKey)
  }
  await nextTick()
  if (current) {
    const dialog = document.querySelector<HTMLElement>('[data-admin-dialog]')
    ;(dialog?.querySelector<HTMLElement>('[data-modal-autofocus], input:not(:disabled), textarea:not(:disabled), select:not(:disabled)') || dialog)?.focus()
  } else {
    document.body.style.overflow = previousBodyOverflow
    document.removeEventListener('keydown', handleModalKey)
    if (modalTrigger?.isConnected) modalTrigger.focus()
    modalTrigger = null
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleModalKey)
  if (activeModal.value) document.body.style.overflow = previousBodyOverflow
})

</script>



<template>

  <main class="admin-space">

    <template v-if="ready">

      <aside class="admin-nav" :inert="!!activeModal">

        <div class="admin-brand"><PortalBrand /></div>

        <div class="admin-identity"><span class="admin-mark">MC</span><span><strong>MC Studio</strong><small>Administration</small></span></div>



        <nav aria-label="Administration">

          <button :class="{ active: section === 'clients' && !selected }" :aria-current="section === 'clients' && !selected ? 'page' : undefined" @click="goToSection('clients')"><UIcon name="i-tabler-users" />Clients</button>

          <button :class="{ active: section === 'growth' }" :aria-current="section === 'growth' ? 'page' : undefined" @click="goToSection('growth')"><UIcon name="i-tabler-chart-line" />Croissance & performance</button>

          <button :class="{ active: section === 'storage' }" :aria-current="section === 'storage' ? 'page' : undefined" @click="goToSection('storage')"><UIcon name="i-tabler-database" />Stockage</button>

          <button :class="{active:section==='notifications'}" :aria-current="section === 'notifications' ? 'page' : undefined" @click="goToSection('notifications')"><UIcon name="i-tabler-bell"/>Notifications</button><button :class="{active:section==='account'}" :aria-current="section === 'account' ? 'page' : undefined" @click="goToSection('account')"><UIcon name="i-tabler-user"/>Mon compte</button><button :class="{ active: section === 'assets' }" :aria-current="section === 'assets' ? 'page' : undefined" @click="goToSection('assets')"><UIcon name="i-tabler-photo" />Prompt IA</button>

        </nav>

        <div class="admin-nav-bottom">

          <a class="admin-contact" href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer"><UIcon name="i-tabler-brand-whatsapp" />Contacter WhatsApp<UIcon name="i-tabler-arrow-up-right" /></a>

          <NuxtLink class="client-space-link" to="/"><UIcon name="i-tabler-arrow-left" />Retour au site MC Studio</NuxtLink>

          <button class="admin-logout" @click="signOut"><UIcon name="i-tabler-logout" />Se déconnecter</button>

        </div>

      </aside>

      <section class="admin-main" :inert="!!activeModal">

        <header class="admin-header"><span>MC Studio <span class="slash">/</span> Administration <template v-if="selected"><span class="slash">/</span>{{ selected.name }}</template></span><div class="portal-header-actions"><PortalThemeToggle /><span class="admin-user"><span class="admin-avatar">{{ adminName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() }}</span>{{ adminName }}</span></div></header>

        <div class="admin-content">

          <PortalAccount v-if="section==='account' && !selected" :name="adminName" :email="adminEmail"/><PortalNotifications v-else-if="section==='notifications' && !selected" @open-project="openNotificationProject"/><PortalGrowth v-else-if="section==='growth' && !selected"/>

          <PortalAdminStorage v-else-if="section==='storage' && !selected" />

          <section v-else-if="section==='assets' && !selected" class="admin-card prompt-settings"><p class="subheading">PROMPT DE GÉNÉRATION</p><h1>Un prompt par projet</h1><p class="subheading">Choisissez un client et un projet pour modifier le prompt visible dans sa médiathèque Assets.</p><form @submit.prevent="saveProjectPrompt"><label for="prompt-project">Projet client</label><select id="prompt-project" v-model="promptProjectId" required><option value="" disabled>Sélectionner un projet…</option><option v-for="project in promptProjects" :key="project.id" :value="project.id">{{project.clientName}} · {{project.name}}</option></select><template v-if="promptProjectId"><label for="project-ai-prompt">Prompt de génération d’image</label><textarea id="project-ai-prompt" v-model="globalPrompt" rows="14" maxlength="12000" :disabled="promptLoading" placeholder="Décrivez le style visuel, la palette, la lumière, la composition et les éléments à éviter…"/><div class="prompt-settings-footer"><small>{{globalPrompt.length}} / 12 000 caractères · propre à ce projet</small><button class="create-button" :disabled="promptBusy || promptLoading">{{promptBusy?'Enregistrement…':'Enregistrer le prompt'}}</button></div></template></form><p v-if="!promptProjects.length" class="subheading">Créez d’abord un projet dans la rubrique Clients.</p></section>

          <template v-else-if="selected">

            <button class="back-to-clients" @click="goToSection('clients')"><UIcon name="i-tabler-arrow-left" /> Tous les clients</button>

            <div class="admin-title-row"><div class="client-heading"><span :class="['client-logo', selected.tone]">{{ selected.initials }}</span><div><h1>{{ selected.name }}</h1><p class="subheading">Espace client sécurisé · {{ selected.projects.length }} projet{{ selected.projects.length > 1 ? 's' : '' }}</p></div></div><div class="detail-actions"><button class="create-button" @click="showAddProject = true"><UIcon name="i-tabler-plus" />Ajouter un projet</button><button class="wa-button" @click="startInvite(selected)"><UIcon name="i-tabler-mail-forward" />Inviter des personnes</button></div></div>

            <section class="admin-card project-list-card"><div class="card-heading"><h2>Projets du client</h2></div><div v-if="selected.projects.length" class="client-project-list"><button v-for="project in selected.projects" :key="project.id" :class="['client-project-item', { selected: activeProject?.id === project.id }]" @click="chooseProject(project.id)"><span><strong>{{ project.name }}</strong><small>{{ project.status }} · {{ project.progress }} % · {{ project.dueDate ? portalDate(project.dueDate) : 'Livraison à définir' }}</small></span><UIcon name="i-tabler-chevron-right" /></button></div><p v-else class="empty-projects">Ce client n’a pas encore de projet.</p></section>

            <nav v-if="activeProject" class="admin-project-tabs" aria-label="Rubriques du projet">
              <button v-for="tab in projectTabs" :key="tab.id" type="button" :aria-current="projectTab===tab.id?'page':undefined" @click="openProjectTab(tab.id)"><UIcon :name="tab.icon"/> {{ tab.label }}</button>
            </nav>
            <template v-if="activeProject && projectTab==='roadmap'">
              <PortalRoadmap :key="`${activeProject.id}:${roadmapItem}`" :project-id="activeProject.id" :item-id="roadmapItem" embedded @resource="openProjectResource" @changed="updateRoadmap"/>
              <PortalReminders :key="activeProject.id" :project-id="activeProject.id"/>
            </template>
            <PortalRequests v-else-if="activeProject && projectTab==='requests'" :key="activeProject.id" :project-id="activeProject.id" :request-id="requestItem" admin @select="selectRequest"/>
            <PortalResources v-else-if="activeProject && projectTab==='resources'" :key="activeProject.id" :kind="resourceTab" :project-id="activeProject.id" :members="selected.members" admin @update:kind="openProjectResource"/>
            <template v-else>
            <section class="client-detail-grid"><article class="admin-card team-card"><div class="card-heading"><h2>Équipe du client <span class="team-count">{{ selected.members.length }}</span></h2><button class="quiet-button" @click="startInvite(selected)"><UIcon name="i-tabler-user-plus" />Inviter</button></div><p class="contact-note">Chaque personne dispose de son compte et accède aux projets de {{ selected.name }}. Un lecteur consulte sans contribuer. La suspension coupe immédiatement l’accès et les sessions, tout en conservant les contributions.</p><div v-if="!selected.members.length" class="contact-note">Aucun compte activé pour le moment.</div><ul class="team-list"><li v-for="member in selected.members" :key="member.id"><span class="team-avatar">{{ member.name.slice(0,1).toUpperCase() }}</span><div><strong>{{ member.name }}</strong><small>{{ member.email }}</small></div><div class="team-member-controls"><label :for="'role-'+member.id" class="sr-only">Rôle de {{member.name}}</label><select :id="'role-'+member.id" :value="member.memberRole" :disabled="!!memberBusy" @change="updateMember(member,{memberRole:($event.target as HTMLSelectElement).value as MemberRole})"><option v-for="(label,role) in memberRoleLabels" :key="role" :value="role">{{label}}</option></select><span class="team-badge">{{member.suspended?'Suspendu':'Actif'}}</span><button class="quiet-button" :disabled="!!memberBusy" @click="updateMember(member,{suspended:!member.suspended})">{{memberBusy===member.id?'…':member.suspended?'Réactiver':'Suspendre'}}</button></div></li></ul><template v-if="selected.invitations.length"><h3 class="team-pending-title">Invitations · {{ selected.invitations.length }}</h3><ul class="team-list"><li v-for="invitation in selected.invitations" :key="invitation.id"><div><strong>{{ invitation.email }}</strong><small>{{memberRoleLabels[invitation.memberRole || 'contributor']}} · {{ invitationExpired(invitation.expiresAt) ? 'Expirée' : 'En attente · expire le '+new Date(invitation.expiresAt).toLocaleDateString('fr-FR') }}</small></div><div class="team-actions"><button class="quiet-button" :disabled="!!invitationActionBusy" @click="startInvite(selected,invitation.email,invitation.memberRole || 'contributor')">Renvoyer</button><button class="quiet-button" :disabled="!!invitationActionBusy" @click="revokeInvitation(invitation)">{{ invitationActionBusy===invitation.id?'…':'Annuler' }}</button></div></li></ul></template><div v-if="activeProject" class="client-review-note"><p>{{ activeProject.reviewFeedback || (activeProject.reviewState === 'approved' ? 'Dernière maquette validée.' : activeProject.reviewState === 'changes' ? 'Demande de modifications reçue.' : 'Aucun retour pour le moment.') }}</p></div></article><article v-if="activeProject" class="admin-card"><span class="admin-status"><i></i>{{ activeProject.status }}</span><h2>{{ activeProject.name }}</h2><p class="project-type">Visible par le client après connexion</p><div class="admin-progress-meta"><span>Avancement</span><strong>{{ activeProject.progress }} %</strong></div><div class="admin-progress"><i :style="{ width: `${activeProject.progress}%` }" /></div><div class="due-row"><span>Livraison prévue</span><strong>{{ activeProject.dueDate ? portalDate(activeProject.dueDate) : 'À définir' }}</strong></div></article></section>

            <section v-if="activeProject" class="admin-card phases-card">
              <div class="card-heading"><div><h2>Paramètres du projet</h2><p class="subheading">Les informations partagées dans l’espace client.</p></div><button class="quiet-button delete-button" @click="requestDelete(selected, 'project')"><UIcon name="i-tabler-trash" />Supprimer</button></div>
              <form class="project-edit" @submit.prevent="saveProject">
                <fieldset class="project-fieldset"><legend>Informations générales</legend><div class="field-grid">
                  <label class="wide">Nom du projet<input v-model="projectForm.name" required></label>
                  <label class="wide">Description visible par le client<textarea v-model="projectForm.description" rows="3" placeholder="Présentez brièvement le projet"></textarea></label>
                </div></fieldset>
                <fieldset class="project-fieldset"><legend>Suivi & livraison</legend><div class="field-grid">
                  <label>Statut<select v-model="projectForm.status"><option>À cadrer</option><option>En cours</option><option>En validation</option><option>En attente client</option><option>Terminé</option></select></label>
                  <label>Date de livraison<input v-model="projectForm.dueDate" type="date"></label>
                  <label class="wide">Décideur du projet<select v-model="projectForm.decisionMakerId"><option value="">Aucun décideur désigné</option><option v-for="member in selected.members.filter(member=>!member.suspended && member.memberRole==='decision_maker')" :key="member.id" :value="member.id">{{member.name}}</option></select><small>Attribuez le rôle Décideur dans l’équipe, puis désignez la personne qui répondra aux demandes de validation.</small></label>
                </div></fieldset>
                <div class="project-form-footer"><span>Les modifications sont visibles par le client.</span><button class="create-button" :disabled="projectBusy"><UIcon name="i-tabler-device-floppy" />{{ projectBusy ? 'Enregistrement…' : 'Enregistrer les modifications' }}</button></div>
              </form>
            </section>
            </template>

          </template>

          <template v-else>

            <div class="admin-title-row"><div><h1>{{ section === 'clients' ? 'Clients' : 'Projets' }}</h1><p class="subheading">{{ section === 'clients' ? 'Retrouvez les clients et l’avancement de leurs projets.' : 'Suivez les projets en cours et leurs prochaines livraisons.' }}</p></div><button class="create-button" @click="showCreate = true"><UIcon name="i-tabler-plus" />Ajouter un client</button></div>

            <div class="admin-stats"><article><span>CLIENTS</span><strong>{{ clients.length }}</strong><small>dans votre espace</small></article><article><span>PROJETS</span><strong>{{ projectCount }}</strong><small>{{ inProgressCount }} en cours</small></article><article><span>À VALIDER</span><strong>{{ reviewCount }}</strong><small>projets en attente d’un retour</small></article></div>

            <section class="admin-card client-list-card">
              <div class="list-heading">
                <div><h2>{{ section === 'clients' ? 'Tous les clients' : 'Tous les projets' }} <span>{{ visibleClients.length }}</span></h2></div>
                <div class="table-tools">
                  <label class="admin-search"><UIcon name="i-tabler-search" /><input v-model="search" type="search" placeholder="Rechercher un client…" aria-label="Rechercher un client ou projet"></label>
                  <label class="table-select"><span>Filtrer le statut</span><select v-model="statusFilter" aria-label="Filtrer par statut"><option value="all">Tous les statuts</option><option v-for="status in clientStatuses" :key="status" :value="status">{{ status }}</option></select></label>
                  <label class="table-select"><span>Trier par</span><select v-model="sortBy" aria-label="Trier le tableau par"><option value="name">Client</option><option value="contact">Contact</option><option value="project">Projet</option><option value="status">Statut</option><option value="progress">Avancement</option><option value="due">Livraison</option></select></label>
                  <button class="sort-direction" type="button" :aria-label="sortDirection === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'" :title="sortDirection === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'" @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</button>
                </div>
              </div>
              <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>CLIENT</th><th>CONTACT</th><th>PROJETS</th><th>PROGRESSION</th><th>LIVRAISON LA PLUS PROCHE</th><th /></tr></thead><tbody><tr v-for="client in visibleClients" :key="client.id" class="client-row" @click="openClient(client)"><td><span :class="['client-logo small', client.tone]">{{ client.initials }}</span><strong>{{ client.name }}</strong></td><td>{{ client.contact }}</td><td><span class="project-count">{{ client.projects.length }} projet{{ client.projects.length > 1 ? 's' : '' }}</span><small class="project-names">{{ client.projects.map(project => project.name).join(' · ') || 'Aucun projet' }}</small></td><td><div v-if="client.projects.length" class="table-progress"><span class="admin-progress"><i :style="{ width: `${Math.round(client.projects.reduce((sum, project) => sum + project.progress, 0) / client.projects.length)}%` }" /></span><small>{{ Math.round(client.projects.reduce((sum, project) => sum + project.progress, 0) / client.projects.length) }}%</small></div><span v-else>—</span></td><td>{{ client.projects.some(project => project.dueDate) ? portalDate(client.projects.map(project => project.dueDate).filter(Boolean).sort()[0] || '') : 'À définir' }}</td><td><button class="row-open" :aria-label="`Ouvrir ${client.name}`" @click.stop="openClient(client)"><UIcon name="i-tabler-chevron-right" /></button><button class="row-open delete-row" :aria-label="`Supprimer ${client.name}`" @click.stop="requestDelete(client, 'client')"><UIcon name="i-tabler-trash" /></button></td></tr><tr v-if="visibleClients.length === 0"><td colspan="6" class="empty-table">Aucun résultat pour ces filtres.</td></tr></tbody></table></div>
              <p class="table-foot">{{ visibleClients.length }} client{{ visibleClients.length > 1 ? 's' : '' }} dans votre portefeuille.</p>
            </section>

          </template>

          <p v-if="notice" class="admin-notice" role="status"><UIcon name="i-tabler-info-circle" />{{ notice }}<button aria-label="Fermer la notification" @click="notice = ''">×</button></p>


        <footer class="admin-footer">MC Studio · Espace interne sécurisé</footer>

        </div>

      </section>

      <div v-if="showCreate" class="modal-backdrop" @click.self="closeModal">
        <form class="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-client-title" aria-describedby="create-client-description" data-admin-dialog tabindex="-1" :aria-busy="createBusy" @submit.prevent="addClient">
          <header class="modal-heading"><span class="modal-heading-icon"><UIcon name="i-tabler-building-community" /></span><div><h2 id="create-client-title">Ajouter un client</h2><p id="create-client-description">Créez son espace et un premier projet.</p></div><button type="button" class="modal-close" aria-label="Fermer" :disabled="createBusy" @click="closeModal"><UIcon name="i-tabler-x" /></button></header>
          <div class="modal-body"><p v-if="modalError" class="team-error" role="alert">{{ modalError }}</p>
            <fieldset class="modal-fieldset"><legend>Organisation</legend><div class="modal-fields"><div class="form-field"><label for="new-client-name">Nom du client <span class="required-mark">*</span></label><input id="new-client-name" v-model="newName" required placeholder="Ex. Maison Alba" autocomplete="organization"></div><div class="form-field"><label for="new-client-email">E-mail du contact <span class="optional-label">Facultatif</span></label><input id="new-client-email" v-model="newEmail" type="email" placeholder="contact@entreprise.fr" autocomplete="email"><p class="field-help">Vous pourrez lui envoyer une invitation après la création.</p></div></div></fieldset>
            <fieldset class="modal-fieldset"><legend>Premier projet</legend><div class="modal-fields"><div class="form-field"><label for="new-client-project">Nom du projet <span class="required-mark">*</span></label><input id="new-client-project" v-model="newProject" required placeholder="Ex. Refonte du site"></div><div class="form-field"><label for="new-client-description">Description <span class="optional-label">Facultatif</span></label><textarea id="new-client-description" v-model="newDescription" rows="3" placeholder="Présentez le projet à votre client"></textarea></div><div class="form-field"><label for="new-client-due">Date de livraison <span class="optional-label">Facultatif</span></label><input id="new-client-due" v-model="newDue" type="date"></div></div></fieldset>
          </div><footer class="modal-actions"><button class="quiet-button" type="button" :disabled="createBusy" @click="closeModal">Annuler</button><button class="create-button" type="submit" :disabled="createBusy"><UIcon name="i-tabler-plus" />{{createBusy ? 'Création…' : 'Créer le client'}}</button></footer>
        </form>
      </div>

      <div v-if="showAddProject" class="modal-backdrop" @click.self="closeModal">
        <form class="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-project-title" aria-describedby="create-project-description" data-admin-dialog tabindex="-1" :aria-busy="projectBusy" @submit.prevent="addProject">
          <header class="modal-heading"><span class="modal-heading-icon"><UIcon name="i-tabler-folder-plus" /></span><div><h2 id="create-project-title">Ajouter un projet</h2><p id="create-project-description">Un nouveau projet pour {{ selected?.name }}.</p></div><button type="button" class="modal-close" aria-label="Fermer" :disabled="projectBusy" @click="closeModal"><UIcon name="i-tabler-x" /></button></header>
          <div class="modal-body"><p v-if="modalError" class="team-error" role="alert">{{ modalError }}</p>
            <fieldset class="modal-fieldset"><legend>Informations générales</legend><div class="modal-fields"><div class="form-field"><label for="new-project-name">Nom du projet <span class="required-mark">*</span></label><input id="new-project-name" v-model="newProjectForm.name" required minlength="2" maxlength="160" placeholder="Ex. Identité visuelle"></div><div class="form-field"><label for="new-project-description">Description <span class="optional-label">Facultatif</span></label><textarea id="new-project-description" v-model="newProjectForm.description" rows="3" maxlength="1500" placeholder="Présentez brièvement le projet"></textarea><p class="field-help">Ces informations seront visibles dans l’espace client.</p></div></div></fieldset>
            <fieldset class="modal-fieldset"><legend>Suivi & livraison</legend><div class="field-grid"><label for="new-project-status">Statut<select id="new-project-status" v-model="newProjectForm.status"><option>À cadrer</option><option>En cours</option><option>En validation</option><option>En attente client</option><option>Terminé</option></select></label><label for="new-project-due">Date de livraison<input id="new-project-due" v-model="newProjectForm.dueDate" type="date"></label></div></fieldset>
          </div><footer class="modal-actions"><button class="quiet-button" type="button" :disabled="projectBusy" @click="closeModal">Annuler</button><button class="create-button" type="submit" :disabled="projectBusy"><UIcon name="i-tabler-plus" />{{ projectBusy ? 'Création…' : 'Créer le projet' }}</button></footer>
        </form>
      </div>

      <div v-if="showInvite" class="modal-backdrop" @click.self="closeModal">
        <form class="create-modal team-invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title" aria-describedby="invite-description" data-admin-dialog tabindex="-1" :aria-busy="inviteBusy" @submit.prevent="sendInvite">
          <header class="modal-heading"><span class="modal-heading-icon"><UIcon name="i-tabler-user-plus" /></span><div><h2 id="invite-title">Inviter des personnes</h2><p id="invite-description">Partagez l’espace de {{ inviteClient?.name }}.</p></div><button type="button" class="modal-close" aria-label="Fermer" :disabled="inviteBusy" @click="closeModal"><UIcon name="i-tabler-x" /></button></header>
          <div class="modal-body"><p v-if="inviteError" class="team-error" role="alert">{{ inviteError }}</p>
            <template v-if="!inviteResults.length && !inviteBusy"><fieldset class="modal-fieldset"><legend>Destinataires</legend><div class="modal-fields">
              <div class="form-field"><label for="invite-emails">Adresses e-mail <span class="required-mark">*</span></label><textarea id="invite-emails" v-model="inviteEmail" rows="4" required placeholder="paul@entreprise.fr&#10;marie@entreprise.fr" aria-describedby="invite-help"/><p id="invite-help" class="field-help">Jusqu’à 20 adresses, séparées par une virgule, un espace ou un retour à la ligne.</p></div>
            </div></fieldset><fieldset class="modal-fieldset"><legend>Accès & permissions</legend><div class="modal-fields">
              <div class="form-field"><label for="invite-role">Rôle des personnes invitées</label><select id="invite-role" v-model="inviteRole" aria-describedby="invite-role-help"><option v-for="(label,role) in memberRoleLabels" :key="role" :value="role">{{label}}</option></select><p id="invite-role-help" class="field-help">Pour valider les maquettes, le décideur doit aussi être désigné dans les paramètres du projet.</p></div>
            </div><div class="invitation-info"><UIcon name="i-tabler-shield-lock" /><p>Chaque personne reçoit un accès personnel aux projets du client. Les liens d’invitation sont valables 7 jours et utilisables une seule fois.</p></div></fieldset></template>
            <template v-else><p v-if="inviteBusy" class="field-help" role="status" aria-live="polite">Création des invitations… {{ inviteProgress }} traitée(s).</p><div class="invite-results" aria-live="polite"><article v-for="result in inviteResults" :key="result.email"><strong>{{ result.email }}</strong><p :class="{'team-error':!!result.error}">{{ result.error || (result.emailSent ? 'E-mail envoyé.' : 'Lien créé. E-mail non envoyé : partagez le lien manuellement.') }}</p><template v-if="result.inviteUrl"><input :value="result.inviteUrl" readonly :aria-label="'Lien d’invitation pour '+result.email"><button class="quiet-button" type="button" @click="copyInvite(result.inviteUrl!)"><UIcon name="i-tabler-copy" />Copier le lien</button></template></article></div></template>
          </div><footer class="modal-actions"><template v-if="!inviteResults.length && !inviteBusy"><button class="quiet-button" type="button" @click="closeModal">Annuler</button><button class="create-button" type="submit"><UIcon name="i-tabler-mail-forward" />Envoyer les invitations</button></template><template v-else><button class="quiet-button" type="button" :disabled="inviteBusy" @click="closeModal">Fermer</button><button v-if="!inviteBusy && inviteResults.some(result=>result.error)" class="quiet-button" type="button" @click="retryInvites">Réessayer les erreurs</button><button v-if="!inviteBusy" class="create-button" type="button" @click="startInvite(inviteClient!)">Inviter d’autres personnes</button><button v-else class="create-button" type="button" disabled>Envoi en cours…</button></template></footer>
        </form>
      </div>

      <div v-if="deleteTarget" class="modal-backdrop" @click.self="closeModal">
        <section class="create-modal delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" data-admin-dialog tabindex="-1" :aria-busy="deleteBusy">
          <header class="modal-heading"><span class="modal-heading-icon danger-icon"><UIcon name="i-tabler-trash" /></span><div><h2 id="delete-title">Supprimer {{ deleteKind === 'client' ? 'le client' : 'le projet' }} ?</h2><p>Cette action est définitive.</p></div><button type="button" class="modal-close" aria-label="Fermer" :disabled="deleteBusy" @click="closeModal"><UIcon name="i-tabler-x" /></button></header>
          <div class="modal-body"><p v-if="modalError" class="team-error" role="alert">{{ modalError }}</p><p id="delete-description" class="delete-description">{{ deleteKind === 'client' ? `${deleteTarget.name} et tous ses projets, comptes clients, invitations, fichiers et historiques seront définitivement supprimés.` : `Le projet « ${deleteProject?.name || deleteTarget.project} » et ses fichiers, maquettes, retours et historiques seront définitivement supprimés. Le client conservera ses autres projets et son compte.` }}</p></div>
          <footer class="modal-actions"><button class="quiet-button" type="button" data-modal-autofocus :disabled="deleteBusy" @click="closeModal">Annuler</button><button class="create-button confirm-delete" type="button" :disabled="deleteBusy" @click="deleteRecord"><UIcon name="i-tabler-trash" />{{ deleteBusy ? 'Suppression…' : 'Supprimer définitivement' }}</button></footer>
        </section>
      </div>

    </template>

    <p v-else-if="loadError" class="loading-admin" role="alert">{{ loadError }} <button type="button" class="quiet-button" @click="openAdministration">Réessayer</button></p>
    <p v-else class="loading-admin" role="status">Ouverture de l’administration…</p>

  </main>

</template>



<style scoped>
.admin-space{--line:var(--portal-line,#333);--muted:var(--portal-muted,#96969f);min-height:100vh;background:var(--portal-bg,#151515);color:var(--portal-text,#f1f1f3);font:13px/1.5 Inter,Arial,sans-serif}
.admin-space *{box-sizing:border-box}.admin-space button,.admin-space a{color:inherit}.admin-space button{font:inherit;cursor:pointer}.admin-space button:disabled{cursor:wait;opacity:.55}.admin-space a{text-decoration:none}.admin-space :is(button,a,input,select,textarea):focus-visible{outline:2px solid var(--portal-accent,#d4ad5b);outline-offset:3px}.admin-space .iconify{flex-shrink:0;width:18px;height:18px}
.admin-nav{position:fixed;inset:0 auto 0 0;z-index:2;width:236px;display:flex;flex-direction:column;gap:20px;padding:24px 12px 16px;background:var(--portal-surface,#191919);border-right:1px solid var(--line)}.admin-brand{padding:0 12px 22px;border-bottom:1px solid var(--line)}.admin-brand:deep(img){width:130px}.admin-identity{display:flex;align-items:center;gap:10px;padding:0 10px}.admin-mark,.admin-avatar{display:grid;place-items:center;flex:none;background:var(--portal-raised,#252525);border:1px solid var(--line);color:var(--portal-text,#f1f1f3);font-weight:600}.admin-mark{width:36px;height:36px;border-radius:8px;font-size:12px}.admin-identity strong,.admin-identity small{display:block}.admin-identity strong{font-size:13px;font-weight:500}.admin-identity small{color:var(--muted);font-size:11px}.admin-nav nav{display:grid;gap:4px}.admin-nav nav button,.client-space-link,.admin-contact,.admin-logout{display:flex;align-items:center;gap:10px;min-height:40px;padding:9px 12px;border:1px solid transparent;border-radius:8px;background:transparent;text-align:left;font-size:12px;color:var(--muted)}.admin-nav nav button:hover,.admin-nav-bottom>a:hover,.admin-logout:hover{background:var(--portal-raised,#252525);color:var(--portal-text,#f1f1f3)}.admin-nav nav button.active{background:var(--portal-accent-soft,#d4ad5b1f);color:var(--portal-accent,#987fff)}.admin-nav nav button.active .iconify{color:var(--portal-accent,#987fff)}.admin-nav-bottom{margin-top:auto;display:grid;gap:4px}.admin-contact{font-size:11px}.admin-contact .iconify:last-child{width:14px;height:14px;margin-left:auto}.admin-logout{border-top-color:var(--line);border-radius:0;margin-top:6px;padding-top:15px}.admin-main{margin-left:236px;min-width:0}.admin-header{height:68px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 32px;font-size:12px;color:var(--muted)}.slash{margin:0 10px;color:var(--muted)}.admin-user{display:flex;align-items:center;gap:9px;color:var(--portal-text,#f1f1f3);font-size:12px}.admin-avatar{width:30px;height:30px;border-radius:50%;font-size:10px}.admin-content{max-width:1520px;margin:auto;padding:32px}.admin-title-row{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:26px}.admin-title-row h1{margin:0 0 6px;font:600 25px/1.25 Inter,Arial,sans-serif;letter-spacing:-.6px;background:none;-webkit-text-fill-color:currentColor;color:var(--portal-text,#f1f1f3)}.subheading{margin:0;color:var(--muted);font-size:12px}.create-button,.wa-button,.quiet-button,.sort-direction{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border:1px solid var(--line);border-radius:8px;padding:8px 14px;font-size:12px;font-weight:500;white-space:nowrap;background:var(--portal-control,#202020);color:var(--portal-text,#eee)}.create-button{background:var(--portal-accent,#d4ad5b);border-color:var(--portal-accent,#d4ad5b);color:#fff!important}.create-button:hover{background:var(--portal-accent-hover,#e3c574);border-color:var(--portal-accent-hover,#e3c574)}.admin-space .wa-button{background:var(--portal-control,#202020);border-color:var(--line);color:var(--portal-text,#eee)!important;-webkit-text-fill-color:var(--portal-text,#eee);box-shadow:none}.admin-space .wa-button:hover,.quiet-button:hover,.sort-direction:hover{background:var(--portal-raised,#292929)}.detail-actions{display:flex;align-items:center;gap:10px}.admin-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:28px;padding:22px 0}.admin-stats article{display:flex;flex-direction:column;gap:3px;padding:0 24px;border-right:1px solid var(--line)}.admin-stats article:first-child{padding-left:0}.admin-stats article:last-child{border:0}.admin-stats article>span{font-size:10px;font-weight:500;letter-spacing:.7px;color:var(--muted)}.admin-stats article strong{font-size:29px;line-height:1.4;font-weight:500;letter-spacing:-1px}.admin-stats article small{font-size:11px;color:var(--muted)}
.admin-card{padding:22px;border:1px solid var(--line);border-radius:10px;background:var(--portal-surface,#191919)}.admin-card h2,.list-heading h2{font-size:15px;font-weight:500;line-height:1.5;margin:0}.card-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px}.card-heading .subheading{margin-top:4px}.client-list-card{padding:0;overflow:hidden}.list-heading{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 20px}.list-heading h2{white-space:nowrap}.list-heading h2 span,.team-count{display:inline-grid;place-items:center;min-width:23px;height:23px;padding:0 6px;margin-left:6px;border:1px solid var(--line);border-radius:6px;background:var(--portal-raised,#252525);font-size:11px;color:var(--muted);vertical-align:middle}.table-tools{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.admin-search{height:40px;width:220px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:8px;padding:0 12px;background:var(--portal-control,#202020);color:var(--muted)}.admin-search input{min-width:0;flex:1;width:100%;border:0;background:transparent;color:var(--portal-text,#eee);font:12px Inter,sans-serif;outline:none}.admin-search:focus-within{outline:2px solid var(--portal-accent,#d4ad5b);outline-offset:2px}.admin-search input:focus-visible{outline:none}.table-select{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)}.table-select>span{display:none}.sort-direction{min-width:40px;padding:0 10px}.admin-table-wrap{overflow-x:auto}.admin-table{width:100%;border-collapse:collapse;min-width:830px;text-align:left}.admin-table th{height:40px;background:var(--portal-control,#202020);color:var(--muted);font-size:9px;letter-spacing:.6px;font-weight:500;padding:0 14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);white-space:nowrap}.admin-table td{height:64px;padding:8px 14px;font-size:12px;white-space:nowrap;border-bottom:1px solid var(--line)}.admin-table th:first-child,.admin-table td:first-child{padding-left:20px}.admin-table td:last-child{white-space:nowrap;text-align:right}.admin-table tbody tr:last-child td{border-bottom:0}.admin-table td strong{font-weight:500}.client-row{cursor:pointer}.client-row:hover{background:var(--portal-raised,#252525)}.client-logo{width:38px;height:38px;display:inline-grid;place-items:center;flex:none;border-radius:9px;margin-right:10px;vertical-align:middle;font-weight:500;background:var(--portal-accent-soft,#d4ad5b1f);color:var(--portal-accent,#a28bff);border:1px solid color-mix(in srgb,var(--portal-accent,#d4ad5b) 25%,transparent)}.client-logo.small{width:31px;height:31px;font-size:11px}.client-logo.blue{background:var(--portal-info-soft,#3b82f61c);color:var(--portal-info,#83b5ff);border-color:color-mix(in srgb,var(--portal-info,#83b5ff) 20%,transparent)}.client-logo.green{background:var(--portal-success-soft,#36bc841c);color:var(--portal-success,#76cda6);border-color:color-mix(in srgb,var(--portal-success,#76cda6) 20%,transparent)}.project-count,.project-names{display:block}.project-names{font-size:10px;color:var(--muted);max-width:240px;margin-top:3px;overflow:hidden;text-overflow:ellipsis}.table-progress{display:flex;align-items:center;gap:10px}.admin-progress{display:block;width:100%;height:5px;overflow:hidden;background:var(--portal-raised,#303030);border-radius:8px}.admin-progress i{display:block;height:100%;border-radius:inherit;background:var(--portal-accent,#d4ad5b)}.admin-table .admin-progress{width:70px}.table-progress small{font-size:10px;color:var(--muted)}.row-open{display:inline-grid;place-items:center;min-height:32px;min-width:30px;padding:5px;border:0;border-radius:6px;background:none;color:var(--muted)}.row-open:hover{background:var(--portal-control,#202020);color:var(--portal-text,#eee)}.row-open .iconify{width:16px;height:16px}.delete-row,.delete-button{color:var(--portal-danger,#ed9393)!important}.delete-row:hover,.delete-button:hover{background:var(--portal-danger-soft,#ef44441a)}.table-foot{margin:0;padding:12px 20px;border-top:1px solid var(--line);font-size:11px;color:var(--muted)}.empty-table{text-align:center!important;color:var(--muted);height:110px!important}.admin-footer{margin-top:28px;padding-top:18px;border-top:1px solid var(--line);font-size:10px;color:var(--muted)}
.back-to-clients{display:flex;align-items:center;gap:7px;margin:0 0 22px;padding:0;border:0;background:none;font-size:12px;color:var(--muted)!important}.client-heading{display:flex;align-items:center;gap:14px}.client-heading .client-logo{width:48px;height:48px;margin:0;font-size:18px}.project-list-card{margin-bottom:18px}.client-project-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.client-project-item{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;padding:13px 14px;border:1px solid var(--line);border-radius:8px;background:var(--portal-control,#202020);text-align:left}.client-project-item.selected{border-color:var(--portal-accent,#d4ad5b);background:var(--portal-accent-soft,#d4ad5b1c)}.client-project-item:hover{border-color:var(--portal-accent,#d4ad5b)}.client-project-item>span{min-width:0}.client-project-item strong,.client-project-item small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.client-project-item strong{font-size:12px;font-weight:500}.client-project-item small{margin-top:5px;color:var(--muted);font-size:10px}.empty-projects{margin:0;color:var(--muted)}.client-detail-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,.8fr);gap:18px;margin-bottom:18px;align-items:start}.admin-status{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:6px;background:var(--portal-info-soft,#3b82f61a);color:var(--portal-info,#9ebfff);padding:4px 8px;font-size:10px;margin-bottom:14px}.admin-status i{width:5px;height:5px;border-radius:50%;background:currentColor}.project-type{font-size:11px;color:var(--muted);margin:7px 0 24px}.admin-progress-meta,.due-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:var(--muted);margin:12px 0 8px}.admin-progress-meta strong,.due-row strong{font-weight:500;color:var(--portal-text,#eee)}.due-row{padding-top:16px;margin-top:20px;border-top:1px solid var(--line)}.contact-note{font-size:11px;line-height:1.7;color:var(--muted);margin:0 0 14px}.team-list{list-style:none;margin:8px 0 0;padding:0}.team-list li{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:15px 0;border-bottom:1px solid var(--line)}.team-list li>div:first-of-type{flex:1;min-width:0}.team-list strong,.team-list small{display:block;overflow-wrap:anywhere}.team-list strong{font-size:12px;font-weight:500}.team-list small{font-size:10px;color:var(--muted);margin-top:3px}.team-avatar{display:grid;place-items:center;width:32px;height:32px;border:1px solid var(--line);border-radius:50%;background:var(--portal-raised,#292929);font-size:11px;flex:none}.team-member-controls{flex-basis:100%;margin-left:42px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.team-member-controls select{flex:1;min-width:130px}.team-member-controls .quiet-button{min-height:44px;font-size:13px;padding:10px 12px}.team-badge{font-size:10px;color:var(--muted)}.team-pending-title{font-size:12px;font-weight:500;margin:22px 0 0}.team-actions{display:flex;gap:7px;flex-wrap:wrap}.team-actions .quiet-button{min-height:44px;font-size:13px;padding:10px 12px}.client-review-note{margin-top:18px;padding:14px;border:1px solid var(--line);border-radius:8px;background:var(--portal-control,#202020)}.client-review-note p{margin:0;font-size:11px;color:var(--muted);white-space:pre-wrap}.phases-card{margin-bottom:24px}/* Form rhythm is explicit so Tailwind's reset cannot collapse labels or sections. */
.project-edit { display: grid; gap: var(--portal-section-gap, 24px); margin-top: 24px; }
.project-fieldset, .modal-fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
.project-fieldset legend, .modal-fieldset legend { width: 100%; margin: 0 0 16px; padding: 0; color: var(--muted); font-size: 13px; font-weight: 600; line-height: 1.5; }
.project-fieldset + .project-fieldset { padding-top: 24px; border-top: 1px solid var(--line); }
.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 20px; row-gap: var(--portal-section-gap, 24px); }
.field-grid label, .form-field { display: flex; flex-direction: column; gap: var(--portal-field-gap, 8px); min-width: 0; font-size: 13px; line-height: 1.5; }
.field-grid .wide { grid-column: 1 / -1; }
.field-grid label small { color: var(--muted); font-size: 13px; line-height: 1.6; }
.project-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 24px; border-top: 1px solid var(--line); }
.project-form-footer > span { color: var(--muted); font-size: 13px; line-height: 1.6; }
.admin-project-tabs{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:18px 0;border-bottom:1px solid var(--line)}
.admin-project-tabs button{display:flex;align-items:center;gap:8px;min-height:44px;padding:8px 12px;border-bottom:2px solid transparent;color:var(--muted);font-size:13px}
.admin-project-tabs button[aria-current=page]{border-color:var(--portal-accent);color:var(--portal-accent-text)}
.admin-project-tabs button:hover{color:var(--portal-text)}
@media(max-width:400px){.admin-project-tabs{gap:2px}.admin-project-tabs button{padding:8px;font-size:12px}}
.prompt-settings{max-width:940px}.prompt-settings h1{font-size:24px;margin:10px 0}.prompt-settings form{display:grid;gap:8px;margin-top:24px}.prompt-settings form>label:not(:first-child){margin-top:16px}.prompt-settings label{font-size:13px}.prompt-settings-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:8px}.prompt-settings-footer small{font-size:13px;color:var(--muted)}
.admin-space :is(input,select,textarea){max-width:100%;min-width:0;font:14px/1.5 Inter,Arial,sans-serif;color:var(--portal-text,#eee)}.project-edit input,.project-edit select,.project-edit textarea,.create-modal input,.create-modal select,.create-modal textarea,.team-member-controls select,.table-select select,.prompt-settings input,.prompt-settings select,.prompt-settings textarea{display:block;width:100%;min-height:44px;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--portal-control,#202020)}.admin-space select{appearance:none;padding-right:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='m5 6 3 3 3-3' fill='none' stroke='%2394949f' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;background-size:16px}.admin-space textarea{resize:vertical;min-height:90px}.admin-space input::placeholder,.admin-space textarea::placeholder{color:var(--muted);opacity:.75}.admin-notice{position:fixed;z-index:60;right:24px;bottom:24px;display:flex;align-items:center;gap:10px;max-width:min(440px,calc(100vw - 32px));margin:0;padding:14px 16px;border:1px solid var(--line);border-radius:10px;background:var(--portal-raised,#242424);box-shadow:var(--portal-shadow,0 12px 35px #0005);font-size:12px}.admin-notice>.iconify{color:var(--portal-info,#83b5ff)}.admin-notice button{margin-left:auto;border:0;background:none;font-size:20px;line-height:1;color:var(--muted)}
/* Only the body scrolls; the heading and actions keep their own padded rows. */
.modal-backdrop { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: var(--portal-dialog-gutter, 24px); background: #0009; backdrop-filter: blur(6px); }
.create-modal { position: relative; display: flex; flex-direction: column; width: min(560px, 100%); max-height: calc(100dvh - var(--portal-dialog-gutter, 24px) * 2); min-width: 0; margin: 0; padding: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 12px; background: var(--portal-surface, #191919); box-shadow: var(--portal-shadow, 0 24px 80px #0007); }
.modal-heading { display: flex; flex: 0 0 auto; align-items: flex-start; gap: 12px; padding: 24px; border-bottom: 1px solid var(--line); }
.modal-heading > div { flex: 1; min-width: 0; }
.modal-heading h2 { margin: 0; font: 600 16px/1.5 Inter, Arial, sans-serif; letter-spacing: -.2px; overflow-wrap: anywhere; }
.modal-heading p { margin: 4px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.modal-heading-icon { display: none; }
.modal-close { display: grid; place-items: center; flex: none; width: 44px; height: 44px; margin: 0; padding: 12px; border: 0; border-radius: 8px; background: none; color: var(--muted); }
.modal-close:hover { background: var(--portal-raised, #292929); color: var(--portal-text, #eee); }
.modal-close .iconify { width: 18px; height: 18px; }
.modal-body { --modal-body-inset: 24px; flex: 1 1 auto; min-height: 0; padding: 24px; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.modal-body label { display: block; margin: 24px 0 8px; font-size: 13px; font-weight: 500; line-height: 1.5; }
.modal-body > label:first-of-type { margin-top: 0; }
.modal-fieldset legend { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; font-weight: 500; }
.modal-fieldset + .modal-fieldset { margin-top: 24px; }
.modal-fieldset + .modal-fieldset legend::before { content: ""; display: block; height: 1px; margin: 0 calc(-1 * var(--modal-body-inset, 24px)) 24px; background: var(--line); }
.modal-fields { display: grid; gap: var(--portal-section-gap, 24px); }
.modal-body .form-field > label, .modal-fieldset .field-grid label { margin: 0; font-weight: 500; }
.modal-fieldset .field-grid label { display: flex; }
.required-mark { margin-left: 2px; color: var(--portal-accent, #e3c574); }
.optional-label { float: right; margin-left: 8px; color: var(--muted); font-size: 13px; font-weight: 400; }
.field-help { margin: 8px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
.form-field > .field-help { margin: 0; }
.modal-actions { display: flex; flex: 0 0 auto; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; padding: 20px 24px; border-top: 1px solid var(--line); background: var(--portal-surface, #191919); }
.modal-actions > button { min-height: 44px; font-size: 13px; }
.invitation-info { display: flex; align-items: flex-start; gap: 12px; margin-top: 24px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--portal-control, #202020); color: var(--muted); }
.invitation-info .iconify { flex: none; width: 18px; height: 18px; margin-top: 2px; }
.invitation-info p { margin: 0; font-size: 13px; line-height: 1.7; }
.team-error { margin: 0 0 24px; padding: 12px 16px; border: 1px solid color-mix(in srgb, var(--portal-danger, #ed9393) 25%, transparent); border-radius: 8px; background: var(--portal-danger-soft, #ef44441a); color: var(--portal-danger, #ed9393) !important; font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.invite-results { display: grid; gap: 16px; }
.invite-results article { min-width: 0; padding: 16px; border: 1px solid var(--line); border-radius: 8px; }
.invite-results strong { overflow-wrap: anywhere; font-size: 14px; font-weight: 500; }
.invite-results p { margin: 8px 0 16px; color: var(--muted); font-size: 13px; line-height: 1.6; }
.invite-results input { margin-bottom: 12px; }
.invite-results .quiet-button { min-height: 44px; font-size: 13px; }
.danger-icon { border-color: color-mix(in srgb, var(--portal-danger, #ed9393) 25%, transparent); background: var(--portal-danger-soft, #ef44441a); color: var(--portal-danger, #ed9393); }
.admin-space .confirm-delete { border-color: var(--portal-danger-fill, #b83c50); background: var(--portal-danger-fill, #b83c50); color: var(--portal-danger-ink, #fff) !important; }
.admin-space .confirm-delete:hover { filter: brightness(1.1); border-color: var(--portal-danger-fill, #b83c50); background: var(--portal-danger-fill, #b83c50); }
.delete-description { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.8; overflow-wrap: anywhere; }
.loading-admin { margin: 0; padding: 40px; color: var(--muted); }
@media(max-width:1200px){.list-heading{align-items:flex-start;flex-direction:column}.table-tools{width:100%;justify-content:flex-start}.admin-search{flex:1;min-width:180px}.client-detail-grid{grid-template-columns:minmax(0,1fr) minmax(230px,.7fr)}}
@media(max-width:960px){.admin-nav{width:210px}.admin-main{margin-left:210px}.admin-content{padding:24px}.admin-header{padding:0 24px}.client-detail-grid{grid-template-columns:1fr}.detail-actions{flex-wrap:wrap;justify-content:flex-end}.project-form-footer>span{max-width:220px}}
@media(max-width:700px){.admin-nav{position:static;width:100%;padding:16px 12px 10px;gap:12px;border-right:0;border-bottom:1px solid var(--line)}.admin-brand{padding:0 4px 10px;border:0}.admin-brand:deep(img){width:112px}.admin-identity{display:none}.admin-nav nav{display:flex;overflow-x:auto;padding-bottom:3px}.admin-nav nav button{white-space:nowrap;min-height:38px}.admin-nav-bottom{display:flex;gap:2px;flex-wrap:wrap;margin:0;padding-top:8px;border-top:1px solid var(--line)}.admin-nav-bottom :is(a,button){font-size:10px;min-height:32px;padding:6px 8px}.admin-nav-bottom .iconify{width:14px;height:14px}.admin-logout{border:0;margin:0}.admin-main{margin:0}.admin-header{height:58px;padding:0 18px;font-size:10px}.slash{margin:0 6px}.admin-user{font-size:0;gap:0}.admin-avatar{font-size:10px}.admin-content{padding:24px 18px}.admin-title-row{align-items:flex-start;flex-direction:column;gap:16px;margin-bottom:22px}.admin-title-row h1{font-size:24px}.admin-title-row>.create-button{width:100%}.subheading{font-size:11px}.admin-stats{padding:18px 0;margin-bottom:22px}.admin-stats article{padding:0 12px}.admin-stats article>span{font-size:9px;letter-spacing:.4px}.admin-stats article strong{font-size:25px}.admin-stats article small{font-size:9px;line-height:1.5}.list-heading{padding:16px}.admin-search{width:100%;flex-basis:100%}.table-select{flex:1;min-width:0}.table-select select{min-width:0;font-size:11px!important}.admin-card{padding:18px}.client-list-card{padding:0}.card-heading{gap:10px}.card-heading h2{font-size:14px}.card-heading .quiet-button{padding:8px 10px}.client-project-list{grid-template-columns:1fr}.detail-actions{width:100%;justify-content:flex-start}.detail-actions>button{flex:1;font-size:11px;padding:8px 10px}.client-heading .client-logo{width:42px;height:42px;font-size:16px}.field-grid{grid-template-columns:1fr;gap:24px}.field-grid .wide{grid-column:auto}.project-form-footer{align-items:stretch;flex-direction:column}.project-form-footer>span{max-width:none}.project-form-footer .create-button{width:100%}.team-member-controls{margin-left:0}.team-actions{width:100%;justify-content:flex-end}.team-card .contact-note{font-size:10px}.modal-heading{padding:20px 18px;gap:10px}.modal-heading-icon{display:none}.modal-heading h2{font-size:18px}.modal-body{--modal-body-inset:18px;padding:24px 18px}.modal-actions{padding:16px 18px;gap:12px}.modal-actions>button{flex:1 1 100%;font-size:13px;padding:10px 12px}.create-modal input,.create-modal select,.create-modal textarea,.project-edit input,.project-edit select,.project-edit textarea{font-size:16px}.modal-actions .create-button{white-space:normal}.delete-modal .modal-actions{flex-direction:column-reverse;align-items:stretch}.delete-modal .modal-actions>button{width:100%}.prompt-settings-footer{flex-direction:column;align-items:stretch;gap:12px}.admin-notice{bottom:16px;right:16px}}
@media (max-height: 480px) {
  .create-modal { overflow-y: auto; }
  .modal-body { flex: 0 0 auto; overflow-y: visible; }
}
</style>
