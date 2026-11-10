import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { roadmapDate, roadmapStatuses } from '../../shared/portal-roadmap'
import { assertSameOrigin, requirePortalUser, requireProjectDecider, type PortalUser } from './portal-auth'
import { portalDb, type PortalDatabase } from './portal-db'
import { deliverNotifications, notifyProject, notifyProjectAdmins } from './portal-notifications'
import { accessibleProject, recordActivity } from './portal-resources'
import { syncRoadmapProject } from './portal-roadmap'
import { lockProject, validateResponsible } from './portal-workflow'

type Input = Record<string, unknown>
type RoadmapTable = 'portal_roadmap_phases' | 'portal_roadmap_steps'

function invalid(statusMessage: string): never { throw createError({ statusCode: 400, statusMessage }) }
function conflict(statusMessage: string): never { throw createError({ statusCode: 409, statusMessage }) }
function missing(statusMessage: string): never { throw createError({ statusCode: 404, statusMessage }) }

async function roadmapBody(event: H3Event): Promise<Input> {
  const body = await readBody<unknown>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('Données de feuille de route invalides.')
  return body as Input
}

function inputText(value: unknown, max: number, label: string, fallback = '') {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || value.trim().length > max) invalid(`${label} invalide.`)
  return value.trim()
}

function inputDate(value: unknown, fallback: string | null = null) {
  if (value === undefined) return fallback
  if (value === null || value === '') return null
  return roadmapDate(value) || invalid('Date invalide.')
}

function inputIds(value: unknown, label: string, fallback: string[] = []) {
  if (value === undefined) return fallback
  if (!Array.isArray(value) || value.length > 100 || value.some(id => typeof id !== 'string' || !id || id.length > 160)) invalid(`${label} invalides.`)
  return [...new Set(value as string[])]
}

function itemFields(body: Input, previous?: any) {
  const title = inputText(body.title, 160, 'Titre', previous?.title)
  const description = inputText(body.description, 3000, 'Description', previous?.description)
  const startDate = inputDate(body.startDate, previous?.start_date)
  const endDate = inputDate(body.endDate, previous?.end_date)
  const status = body.status === undefined ? (previous?.status || 'planned') : body.status
  if (!title) invalid('Le titre est obligatoire.')
  if (startDate && endDate && startDate > endDate) invalid('La date de fin doit suivre la date de début.')
  if (!roadmapStatuses.some(value => value === status)) invalid('Statut invalide.')
  if (body.position !== undefined && (typeof body.position !== 'number' || !Number.isSafeInteger(body.position) || body.position < 0)) invalid('Position invalide.')
  return { title, description, startDate, endDate, status }
}

function checkPhaseBounds(phase: { start_date: string | null; end_date: string | null }, start: string | null, end: string | null) {
  for (const date of [start, end]) {
    if (date && ((phase.start_date && date < phase.start_date) || (phase.end_date && date > phase.end_date))) {
      invalid('Les dates d’une étape doivent être comprises dans la période de sa phase.')
    }
  }
}

async function moveItem(db: PortalDatabase, table: RoadmapTable, projectId: string, id: string, requested: number, phaseId?: string) {
  const condition = phaseId ? 'AND phase_id=?' : ''
  const args = phaseId ? [projectId, phaseId] : [projectId]
  const siblings = await db.prepare(`SELECT id,position FROM ${table} WHERE project_id=? ${condition} AND archived=0 ORDER BY position,id`).all(...args)
  const target = siblings.find(item => item.id === id)
  const sorted = siblings.filter(item => item.id !== id)
  if (target) sorted.splice(Math.min(requested, sorted.length), 0, target)
  for (const [position, item] of sorted.entries()) {
    if (item.position !== position) await db.prepare(`UPDATE ${table} SET position=? WHERE id=?`).run(position, item.id)
  }
}

async function appendPosition(db: PortalDatabase, table: RoadmapTable, projectId: string, phaseId?: string) {
  const condition = phaseId ? 'AND phase_id=?' : ''
  const args = phaseId ? [projectId, phaseId] : [projectId]
  const row = await db.prepare(`SELECT COALESCE(MAX(position)+1,0) AS position FROM ${table} WHERE project_id=? ${condition} AND archived=0`).get(...args)
  return Number(row.position)
}

async function lockRoadmapProject(db: PortalDatabase, id: string) {
  await lockProject(db, id)
  return await db.prepare('SELECT id,name,organization_id FROM projects WHERE id=?').get(id) || missing('Projet introuvable.')
}

async function roadmapItem(db: PortalDatabase, table: RoadmapTable, id: string) {
  return await db.prepare(`SELECT * FROM ${table} WHERE id=? AND archived=0`).get(id) || missing('Élément de feuille de route introuvable.')
}

async function withAdminItem(event: H3Event, table: RoadmapTable, action: (db: PortalDatabase, project: any, item: any, user: PortalUser) => Promise<void>) {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const db = await portalDb()
  const id = getRouterParam(event, 'id') || ''
  const existing = await roadmapItem(db, table, id)
  await db.transaction(async () => {
    const project = await lockRoadmapProject(db, existing.project_id)
    await action(db, project, await roadmapItem(db, table, id), user)
    await syncRoadmapProject(db, project.id)
  })
  return { ok: true }
}

export async function createRoadmapPhase(event: H3Event) {
  assertSameOrigin(event)
  const body = await roadmapBody(event)
  const projectId = inputText(body.projectId, 160, 'Projet')
  if (!projectId) invalid('Projet obligatoire.')
  const { db, user } = await accessibleProject(event, projectId)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
  const fields = itemFields(body)
  const id = randomUUID()
  await db.transaction(async () => {
    await lockRoadmapProject(db, projectId)
    const position = await appendPosition(db, 'portal_roadmap_phases', projectId)
    await db.prepare('INSERT INTO portal_roadmap_phases(id,project_id,title,description,start_date,end_date,status,position) VALUES(?,?,?,?,?,?,?,?)')
      .run(id, projectId, fields.title, fields.description, fields.startDate, fields.endDate, fields.status, position)
    if (typeof body.position === 'number') await moveItem(db, 'portal_roadmap_phases', projectId, id, body.position)
    await syncRoadmapProject(db, projectId)
    await recordActivity(projectId, `Phase ajoutée : ${fields.title}.`)
  })
  return { id }
}

export function updateRoadmapPhase(event: H3Event) {
  return withAdminItem(event, 'portal_roadmap_phases', async (db, project, phase) => {
    const body = await roadmapBody(event)
    const fields = itemFields(body, phase)
    const steps = await db.prepare('SELECT start_date,end_date,status FROM portal_roadmap_steps WHERE phase_id=? AND archived=0').all(phase.id)
    if (fields.status === 'done' && steps.some(step => step.status !== 'done')) invalid('Terminez les étapes de la phase avant de la clôturer.')
    for (const step of steps) checkPhaseBounds({ start_date: fields.startDate, end_date: fields.endDate }, step.start_date, step.end_date)
    await db.prepare('UPDATE portal_roadmap_phases SET title=?,description=?,start_date=?,end_date=?,status=? WHERE id=?')
      .run(fields.title, fields.description, fields.startDate, fields.endDate, fields.status, phase.id)
    if (typeof body.position === 'number') await moveItem(db, 'portal_roadmap_phases', project.id, phase.id, body.position)
    await recordActivity(project.id, `Phase mise à jour : ${fields.title}.`)
  })
}

async function validateDependencies(db: PortalDatabase, projectId: string, stepId: string, ids: string[]) {
  if (!ids.length) return
  const rows = await db.prepare('SELECT id,dependency_ids FROM portal_roadmap_steps WHERE project_id=? AND archived=0').all(projectId)
  const links = new Map<string, string[]>(rows.map(row => [row.id, JSON.parse(row.dependency_ids)]))
  if (ids.some(id => id === stepId || !links.has(id))) invalid('Choisissez des étapes du même projet comme dépendances.')
  const visited = new Set<string>()
  const pending = [...ids]
  while (pending.length) {
    const id = pending.pop()!
    if (id === stepId) invalid('Cette dépendance créerait un cycle.')
    if (visited.has(id)) continue
    visited.add(id)
    for (const dependency of links.get(id) || []) pending.push(dependency)
  }
}

async function stepFields(db: PortalDatabase, project: any, stepId: string, body: Input, previous?: any) {
  const fields = itemFields(body, previous)
  const phaseId = inputText(body.phaseId, 160, 'Phase', previous?.phase_id)
  const phase = await db.prepare('SELECT id,start_date,end_date FROM portal_roadmap_phases WHERE id=? AND project_id=? AND archived=0').get(phaseId, project.id)
  if (!phase) invalid('Choisissez une phase de ce projet.')
  checkPhaseBounds(phase, fields.startDate, fields.endDate)
  const kind = body.kind === undefined ? (previous?.kind || 'step') : body.kind
  if (!['step', 'milestone', 'deliverable', 'checklist'].some(value => value === kind)) invalid('Type d’étape invalide.')
  const requiresValidation = body.requiresValidation === undefined ? Boolean(previous?.requires_validation) : body.requiresValidation
  if (typeof requiresValidation !== 'boolean') invalid('Indiquez si une validation est requise.')
  const blocker = inputText(body.blocker, 1000, 'Blocage', previous?.blocker)
  const responsibleId = body.responsibleId === undefined ? previous?.responsible_id || null : await validateResponsible(db, project.organization_id, body.responsibleId)
  const resourceIds = inputIds(body.resourceIds, 'Livrables', JSON.parse(previous?.resource_ids || '[]'))
  const dependencyIds = inputIds(body.dependencyIds, 'Dépendances', JSON.parse(previous?.dependency_ids || '[]'))
  if (body.resourceIds !== undefined && resourceIds.length) {
    const rows = await db.prepare('SELECT id FROM resources WHERE project_id=? AND archived=0').all(project.id)
    const allowed = new Set(rows.map(row => row.id))
    if (resourceIds.some(id => !allowed.has(id))) invalid('Choisissez des livrables de ce projet.')
  }
  if (body.dependencyIds !== undefined) await validateDependencies(db, project.id, stepId, dependencyIds)
  return { ...fields, phaseId, kind, requiresValidation, blocker, responsibleId, resourceIds, dependencyIds }
}

export async function createRoadmapStep(event: H3Event) {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const body = await roadmapBody(event)
  const db = await portalDb()
  const phase = await roadmapItem(db, 'portal_roadmap_phases', inputText(body.phaseId, 160, 'Phase'))
  if (body.projectId !== undefined && body.projectId !== phase.project_id) invalid('Choisissez une phase de ce projet.')
  const id = randomUUID()
  await db.transaction(async () => {
    const project = await lockRoadmapProject(db, phase.project_id)
    const fields = await stepFields(db, project, id, body)
    if (fields.status === 'awaiting_validation' || (fields.requiresValidation && fields.status === 'done')) invalid('Soumettez cette étape à validation.')
    const position = await appendPosition(db, 'portal_roadmap_steps', project.id, phase.id)
    const now = new Date().toISOString()
    await db.prepare(`INSERT INTO portal_roadmap_steps(id,project_id,phase_id,title,description,start_date,end_date,kind,status,position,
      requires_validation,resource_ids,dependency_ids,responsible_id,blocker,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, project.id, phase.id, fields.title, fields.description, fields.startDate, fields.endDate, fields.kind, fields.status, position,
        Number(fields.requiresValidation), JSON.stringify(fields.resourceIds), JSON.stringify(fields.dependencyIds), fields.responsibleId, fields.blocker, user.id, now, now)
    if (typeof body.position === 'number') await moveItem(db, 'portal_roadmap_steps', project.id, id, body.position, phase.id)
    await syncRoadmapProject(db, project.id)
    await recordActivity(project.id, `Étape ajoutée : ${fields.title}.`)
  })
  return { id }
}

async function latestValidation(db: PortalDatabase, stepId: string) {
  return db.prepare(`SELECT v.id,v.attempt,COALESCE(d.status,'pending') AS status
    FROM portal_roadmap_validations v LEFT JOIN portal_roadmap_decisions d ON d.validation_id=v.id
    WHERE v.step_id=? ORDER BY v.attempt DESC LIMIT 1`).get(stepId)
}

async function saveDecision(db: PortalDatabase, id: string, status: 'approved' | 'changes' | 'cancelled', comment: string, user: PortalUser) {
  const changed = await db.prepare(`INSERT INTO portal_roadmap_decisions(validation_id,status,comment,decided_at,decided_by,decided_by_name)
    VALUES(?,?,?,?,?,?) ON CONFLICT(validation_id) DO NOTHING`).run(id, status, comment, new Date().toISOString(), user.id, user.name)
  if (!changed.changes) conflict('Cette demande a déjà reçu une décision.')
}

export function updateRoadmapStep(event: H3Event) {
  return withAdminItem(event, 'portal_roadmap_steps', async (db, project, step, user) => {
    const body = await roadmapBody(event)
    const fields = await stepFields(db, project, step.id, body, step)
    const validation = await latestValidation(db, step.id)
    const contentChanged = fields.title !== step.title || fields.description !== step.description || fields.kind !== step.kind
      || JSON.stringify(fields.resourceIds) !== step.resource_ids
    if (validation && !fields.requiresValidation) conflict('Cette étape doit conserver la validation de ses livrables.')
    if (fields.status === 'awaiting_validation' && validation?.status !== 'pending') invalid('Soumettez cette étape à validation.')
    if (fields.status === 'awaiting_validation' && contentChanged) conflict('Rouvrez l’étape avant de modifier le livrable soumis.')
    if (fields.status === 'done' && fields.requiresValidation && (validation?.status !== 'approved' || step.status !== 'done' || contentChanged)) {
      invalid('Seul le décideur peut terminer une étape nécessitant une validation. Rouvrez l’étape pour modifier le livrable.')
    }
    if (validation?.status === 'pending' && fields.status !== 'awaiting_validation') {
      await saveDecision(db, validation.id, 'cancelled', 'Demande retirée par MC Studio.', user)
    }
    const moved = fields.phaseId !== step.phase_id
    const position = moved ? await appendPosition(db, 'portal_roadmap_steps', project.id, fields.phaseId) : step.position
    await db.prepare(`UPDATE portal_roadmap_steps SET phase_id=?,title=?,description=?,start_date=?,end_date=?,kind=?,status=?,
      position=?,requires_validation=?,resource_ids=?,dependency_ids=?,responsible_id=?,blocker=?,updated_at=? WHERE id=?`)
      .run(fields.phaseId, fields.title, fields.description, fields.startDate, fields.endDate, fields.kind, fields.status, position,
        Number(fields.requiresValidation), JSON.stringify(fields.resourceIds), JSON.stringify(fields.dependencyIds), fields.responsibleId, fields.blocker, new Date().toISOString(), step.id)
    if (moved) await moveItem(db, 'portal_roadmap_steps', project.id, '', 0, step.phase_id)
    if (typeof body.position === 'number') await moveItem(db, 'portal_roadmap_steps', project.id, step.id, body.position, fields.phaseId)
    await recordActivity(project.id, `Étape mise à jour : ${fields.title}.`)
  })
}

async function archiveSteps(db: PortalDatabase, projectId: string, steps: { id: string }[], user: PortalUser) {
  if (!steps.length) return
  const ids = new Set(steps.map(step => step.id))
  for (const step of steps) {
    const validation = await latestValidation(db, step.id)
    if (validation?.status === 'pending') await saveDecision(db, validation.id, 'cancelled', 'Étape archivée par MC Studio.', user)
    await db.prepare('UPDATE portal_roadmap_steps SET archived=1,updated_at=? WHERE id=?').run(new Date().toISOString(), step.id)
  }
  const active = await db.prepare('SELECT id,dependency_ids FROM portal_roadmap_steps WHERE project_id=? AND archived=0').all(projectId)
  for (const step of active) {
    const dependencies = JSON.parse(step.dependency_ids) as string[]
    const remaining = dependencies.filter(id => !ids.has(id))
    if (remaining.length !== dependencies.length) await db.prepare('UPDATE portal_roadmap_steps SET dependency_ids=? WHERE id=?').run(JSON.stringify(remaining), step.id)
  }
}

export function deleteRoadmapPhase(event: H3Event) {
  return withAdminItem(event, 'portal_roadmap_phases', async (db, project, phase, user) => {
    const steps = await db.prepare('SELECT id FROM portal_roadmap_steps WHERE phase_id=? AND archived=0').all(phase.id)
    await archiveSteps(db, project.id, steps, user)
    await db.prepare('UPDATE portal_roadmap_phases SET archived=1 WHERE id=?').run(phase.id)
    await moveItem(db, 'portal_roadmap_phases', project.id, '', 0)
    await recordActivity(project.id, `Phase archivée : ${phase.title}.`)
  })
}

export function deleteRoadmapStep(event: H3Event) {
  return withAdminItem(event, 'portal_roadmap_steps', async (db, project, step, user) => {
    await archiveSteps(db, project.id, [step], user)
    await moveItem(db, 'portal_roadmap_steps', project.id, '', 0, step.phase_id)
    await recordActivity(project.id, `Étape archivée : ${step.title}.`)
  })
}

export async function requestRoadmapValidation(event: H3Event) {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const body = await roadmapBody(event)
  const description = inputText(body.description, 3000, 'Description')
  const url = inputText(body.url, 2000, 'Lien')
  const resourceId = body.resourceId === null ? '' : inputText(body.resourceId, 160, 'Livrable')
  const dueDate = inputDate(body.dueDate)
  if (!description) invalid('Décrivez le contenu à valider.')
  if (url) {
    const link = URL.canParse(url) ? new URL(url) : null
    if (!link || link.protocol !== 'https:' || link.username || link.password) invalid('Le lien doit être une adresse HTTPS valide.')
  }
  const id = randomUUID()
  const db = await portalDb()
  const existing = await roadmapItem(db, 'portal_roadmap_steps', getRouterParam(event, 'id') || '')
  await db.transaction(async () => {
    const project = await lockRoadmapProject(db, existing.project_id)
    const step = await roadmapItem(db, 'portal_roadmap_steps', existing.id)
    if (dueDate && step.start_date && dueDate < step.start_date) invalid('La date limite doit suivre le début prévu de l’étape.')
    const previous = await latestValidation(db, step.id)
    if (previous?.status === 'pending') conflict('Une validation est déjà en attente pour cette étape.')
    if (step.status === 'done') conflict('Rouvrez cette étape avant de demander une nouvelle validation.')
    const decider = await db.prepare(`SELECT d.user_id AS id FROM portal_project_deciders d JOIN users u ON u.id=d.user_id
      JOIN portal_members m ON m.user_id=u.id WHERE d.project_id=? AND u.organization_id=? AND u.role='client' AND m.member_role='decision_maker' AND m.suspended=0`)
      .get(project.id, project.organization_id)
    if (!decider) conflict('Désignez un décideur actif pour demander une validation.')
    const resource = resourceId ? await db.prepare('SELECT id,title,url FROM resources WHERE id=? AND project_id=? AND archived=0').get(resourceId, project.id) : null
    if (resourceId && !resource) invalid('Choisissez un livrable de ce projet.')
    const now = new Date().toISOString()
    await db.prepare(`INSERT INTO portal_roadmap_validations(id,project_id,step_id,attempt,title,description,url,resource_id,resource_title,resource_url,due_date,requested_at,requested_by,requested_by_name)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, project.id, step.id, (previous?.attempt || 0) + 1, step.title, description, url,
        resource?.id || null, resource?.title || '', resource?.url || '', dueDate, now, user.id, user.name)
    await db.prepare("UPDATE portal_roadmap_steps SET status='awaiting_validation',requires_validation=1,updated_at=? WHERE id=?").run(now, step.id)
    await syncRoadmapProject(db, project.id)
    await recordActivity(project.id, `Validation demandée : ${step.title}.`)
    await notifyProject(project.id, 'roadmap_validation', `À valider : ${step.title}`, description, undefined, `roadmap-validation:${id}`, decider.id)
  })
  await deliverNotifications(event)
  return { id }
}

export async function decideRoadmapValidation(event: H3Event) {
  assertSameOrigin(event)
  await requirePortalUser(event, 'client')
  const body = await roadmapBody(event)
  const decision = body.decision
  if (decision !== 'approved' && decision !== 'changes') invalid('Décision invalide.')
  const comment = inputText(body.comment, 3000, 'Commentaire')
  if (decision === 'changes' && !comment) invalid('Décrivez les modifications attendues.')
  const id = getRouterParam(event, 'id') || ''
  const db = await portalDb()
  const validation = await db.prepare('SELECT project_id,step_id,title FROM portal_roadmap_validations WHERE id=?').get(id)
  if (!validation) missing('Demande de validation introuvable.')
  const { user } = await accessibleProject(event, validation.project_id)
  await db.transaction(async () => {
    await lockRoadmapProject(db, validation.project_id)
    await requireProjectDecider(db, user, validation.project_id)
    const step = await db.prepare('SELECT id,status,archived FROM portal_roadmap_steps WHERE id=?').get(validation.step_id)
    const latest = await latestValidation(db, validation.step_id)
    if (!step || step.archived || step.status !== 'awaiting_validation' || latest?.id !== id || latest.status !== 'pending') conflict('Cette demande n’est plus en attente.')
    await saveDecision(db, id, decision, comment, user)
    await db.prepare('UPDATE portal_roadmap_steps SET status=?,updated_at=? WHERE id=?')
      .run(decision === 'approved' ? 'done' : 'in_progress', new Date().toISOString(), step.id)
    await syncRoadmapProject(db, validation.project_id)
    const title = decision === 'approved' ? `Validation approuvée : ${validation.title}` : `Modifications demandées : ${validation.title}`
    await recordActivity(validation.project_id, `${title} · ${user.name}.`)
    await notifyProjectAdmins(validation.project_id, 'roadmap_decision', title, comment, undefined, `roadmap-decision:${id}`)
  })
  await deliverNotifications(event)
  return { ok: true }
}
