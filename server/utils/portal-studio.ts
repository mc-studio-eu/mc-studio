import { createHash, randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { roadmapDate } from '../../shared/portal-roadmap.ts'
import {
  studioCategories, studioClassifications, studioPriorities, studioTemplateIds,
  type StudioCategory, type StudioCockpit, type StudioItem, type StudioLaunchResult,
  type StudioOnboardingInput, type StudioOnboardingPlan, type StudioOnboardingProject, type StudioQualification,
  type StudioTemplate, type StudioTemplateDefinition, type StudioTemplateId, type StudioTemplateSummary
} from '../../shared/portal-studio.ts'
import type { PortalDatabase } from './portal-db.ts'

const parisDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
const oneDay = 86_400_000
const maxOffset = 730
const stepKinds = ['step', 'milestone', 'deliverable', 'checklist'] as const

export function studioDay(now = new Date()) {
  return parisDate.format(now)
}

function invalid(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function unavailable(statusMessage: string): never {
  throw createError({ statusCode: 404, statusMessage })
}

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

function fields(value: unknown, allowed: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    return invalid('Informations invalides.')
  }
  return value as Record<string, unknown>
}

function text(value: unknown, label: string, limit: number, required = true) {
  if (value === undefined && !required) return ''
  if (typeof value !== 'string') return invalid(`${label} invalide.`)
  const trimmed = value.trim()
  if (trimmed.length > limit || (required && !trimmed) || trimmed.includes('\u0000')) {
    return invalid(`${label} invalide (${limit} caractères maximum).`)
  }
  return trimmed
}

function choice<T extends string>(value: unknown, options: readonly T[], label: string): T {
  if (typeof value !== 'string' || !options.includes(value as T)) return invalid(`${label} invalide.`)
  return value as T
}

function integer(value: unknown, min: number, max: number, label: string) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) return invalid(`${label} invalide.`)
  return value
}

function offset(value: unknown) {
  return integer(value, 0, maxOffset, 'Jour relatif')
}

function day(value: unknown, label: string) {
  const date = roadmapDate(value)
  if (!date) return invalid(`${label} invalide.`)
  return date
}

function optionalDay(value: unknown, label: string) {
  return value === null || value === '' || value === undefined ? null : day(value, label)
}

function addDays(start: string, days: number) {
  return day(new Date(Date.parse(start + 'T00:00:00Z') + days * oneDay).toISOString().slice(0, 10), 'Échéance calculée')
}

function list(value: unknown, max: number, label: string, min = 0): unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) return invalid(`${label} invalides.`)
  return value
}

function datedItem(item: Record<string, unknown>) {
  const title = text(item.title, 'Titre', 160)
  const description = text(item.description, 'Description', 1000, false)
  const startDay = offset(item.startDay)
  const endDay = offset(item.endDay)
  if (startDay > endDay) return invalid(`La fin de « ${title} » précède son début.`)
  return { title, description, startDay, endDay }
}

export function validateStudioDefinition(value: unknown): StudioTemplateDefinition {
  const input = fields(value, ['title', 'phases', 'files'])
  const title = text(input.title, 'Nom du modèle', 100)
  const phases = list(input.phases, 12, 'Phases', 1).map(value => {
    const phase = fields(value, ['title', 'description', 'startDay', 'endDay', 'steps'])
    const dates = datedItem(phase)
    const steps = list(phase.steps, 24, 'Étapes').map(value => {
      const step = fields(value, ['title', 'description', 'startDay', 'endDay', 'kind', 'requiresValidation'])
      const stepDates = datedItem(step)
      if (stepDates.startDay < dates.startDay || stepDates.endDay > dates.endDay) {
        return invalid(`Les dates de « ${stepDates.title} » doivent rester dans sa phase.`)
      }
      const kind = choice(step.kind, stepKinds, 'Type d’étape')
      if (typeof step.requiresValidation !== 'boolean') return invalid('Indiquez si l’étape requiert une validation.')
      return { ...stepDates, kind, requiresValidation: step.requiresValidation }
    })
    return { ...dates, steps }
  })
  if (phases.reduce((total, phase) => total + phase.steps.length, 0) > 60) return invalid('Un modèle contient au maximum 60 étapes.')
  const files = list(input.files, 24, 'Demandes de fichiers').map(value => {
    const file = fields(value, ['title', 'description', 'dueDay'])
    return { title: text(file.title, 'Titre', 160), description: text(file.description, 'Consigne', 1000, false), dueDay: offset(file.dueDay) }
  })
  return { title, phases, files }
}

const uninitialized = `NOT EXISTS (SELECT 1 FROM portal_studio_launches l WHERE l.project_id=p.id)
    AND NOT EXISTS (SELECT 1 FROM portal_roadmap_phases ph WHERE ph.project_id=p.id)
    AND NOT EXISTS (SELECT 1 FROM portal_milestones m WHERE m.project_id=p.id)
    AND NOT EXISTS (SELECT 1 FROM portal_requests r WHERE r.project_id=p.id)
    AND NOT EXISTS (SELECT 1 FROM portal_file_requests f WHERE f.project_id=p.id)
    AND NOT EXISTS (SELECT 1 FROM resources r WHERE r.project_id=p.id)
    AND NOT EXISTS (SELECT 1 FROM portal_assets a WHERE a.project_id=p.id)`

export async function studioTemplates(db: PortalDatabase): Promise<{
  templates: StudioTemplate[]; versions: StudioTemplateSummary[]; existingProjects: StudioOnboardingProject[]
}> {
  const [rows, existingProjects] = await Promise.all([
    db.prepare(`SELECT template_id AS id,version,definition FROM portal_studio_template_versions
      ORDER BY template_id,version DESC`).all() as Promise<{ id: StudioTemplateId; version: number; definition: string }[]>,
    db.prepare(`SELECT p.id,p.organization_id AS organizationId,p.name FROM projects p
      WHERE p.status IN ('À cadrer','En cours') AND ${uninitialized} ORDER BY p.name,p.id`).all()
  ])
  const newest = new Map<StudioTemplateId, StudioTemplate>()
  const versions = rows.map(row => {
    const definition = JSON.parse(row.definition) as StudioTemplateDefinition
    if (!newest.has(row.id)) newest.set(row.id, { id: row.id, version: row.version, definition })
    return { id: row.id, version: row.version, title: definition.title }
  })
  return { templates: studioTemplateIds.flatMap(id => newest.get(id) || []), versions, existingProjects }
}

export async function studioTemplate(db: PortalDatabase, id: unknown, version: number): Promise<StudioTemplate> {
  const templateId = choice(id, studioTemplateIds, 'Modèle')
  const row = await db.prepare('SELECT definition FROM portal_studio_template_versions WHERE template_id=? AND version=?')
    .get(templateId, version)
  if (!row) return unavailable('Version du modèle introuvable.')
  return { id: templateId, version, definition: JSON.parse(row.definition) }
}

export async function reviseStudioTemplate(db: PortalDatabase, actorId: string, id: unknown, value: unknown): Promise<StudioTemplate> {
  const templateId = choice(id, studioTemplateIds, 'Modèle')
  const body = fields(value, ['version', 'definition'])
  const previous = integer(body.version, 1, 2_147_483_646, 'Version')
  const definition = validateStudioDefinition(body.definition)
  return db.transaction(async () => {
    const latest = await db.prepare('SELECT MAX(version) AS version FROM portal_studio_template_versions WHERE template_id=?').get(templateId)
    if (latest?.version !== previous) return conflict('Ce modèle a été modifié. Actualisez-le avant de publier.')
    const version = previous + 1
    const write = await db.prepare(`INSERT INTO portal_studio_template_versions(template_id,version,definition,created_by,created_at)
      VALUES(?,?,?,?,?) ON CONFLICT(template_id,version) DO NOTHING`)
      .run(templateId, version, JSON.stringify(definition), actorId, new Date().toISOString())
    if (!write.changes) return conflict('Ce modèle a été modifié. Actualisez-le avant de publier.')
    return { id: templateId, version, definition }
  })
}

function onboardingInput(value: unknown, launching: boolean): StudioOnboardingInput & { idempotencyKey: string } {
  const keys = ['organizationId', 'existingProjectId', 'templateId', 'templateVersion', 'name', 'description', 'startDate']
  if (launching) keys.push('idempotencyKey')
  const input = fields(value, keys)
  const existingProjectId = text(input.existingProjectId, 'Projet', 200, false) || undefined
  const name = existingProjectId ? '' : text(input.name, 'Nom du projet', 160)
  if (!existingProjectId && name.length < 2) return invalid('Le nom du projet doit comporter au moins deux caractères.')
  const idempotencyKey = launching ? text(input.idempotencyKey, 'Identifiant du lancement', 100) : ''
  if (launching && !/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey)) return invalid('Identifiant du lancement invalide.')
  return {
    organizationId: text(input.organizationId, 'Client', 200),
    existingProjectId,
    templateId: choice(input.templateId, studioTemplateIds, 'Modèle'),
    templateVersion: integer(input.templateVersion, 1, 2_147_483_647, 'Version'),
    name,
    description: existingProjectId ? '' : text(input.description, 'Description', 1500, false),
    startDate: day(input.startDate, 'Date de démarrage'),
    idempotencyKey
  }
}

async function onboardingPlan(db: PortalDatabase, input: StudioOnboardingInput, template: StudioTemplate, locking = false): Promise<StudioOnboardingPlan> {
  const lock = locking && db.dialect === 'postgres' ? ' FOR KEY SHARE' : ''
  const organization = await db.prepare('SELECT name FROM organizations WHERE id=?' + lock).get(input.organizationId)
  if (!organization) return unavailable('Client introuvable.')
  let existing
  if (input.existingProjectId) {
    const projectLock = locking && db.dialect === 'postgres' ? ' FOR UPDATE' : ''
    existing = await db.prepare('SELECT name,description,due_date AS dueDate,status FROM projects WHERE id=? AND organization_id=?' + projectLock)
      .get(input.existingProjectId, input.organizationId)
    if (!existing) return unavailable('Projet introuvable pour ce client.')
    const empty = await db.prepare(`SELECT p.id FROM projects p WHERE p.id=? AND ${uninitialized}`).get(input.existingProjectId)
    if (!empty || !['À cadrer', 'En cours'].includes(existing.status)) return conflict('Ce projet contient déjà du travail ou n’est plus disponible pour l’onboarding.')
  }
  const { definition } = template
  const dates = ({ startDay, endDay }: { startDay: number; endDay: number }) => ({
    startDate: addDays(input.startDate, startDay), endDate: addDays(input.startDate, endDay)
  })
  const phases = definition.phases.map(phase => ({
    title: phase.title, description: phase.description, ...dates(phase),
    steps: phase.steps.map(step => ({
      title: step.title, description: step.description, ...dates(step),
      kind: step.kind, requiresValidation: step.requiresValidation
    }))
  }))
  const files = definition.files.map(file => ({
    title: file.title, description: file.description, dueDate: addDays(input.startDate, file.dueDay)
  }))
  const plannedEnd = [...phases.map(phase => phase.endDate), ...files.map(file => file.dueDate)].sort().at(-1) || input.startDate
  const existingDue = roadmapDate(existing?.dueDate)
  if (existingDue && existingDue < plannedEnd) return conflict('Le modèle se termine après l’échéance du projet. Avancez sa date de démarrage ou ajustez l’échéance dans les paramètres du projet.')
  return {
    organizationName: organization.name, templateTitle: definition.title, templateVersion: input.templateVersion,
    name: existing?.name ?? input.name, description: existing?.description ?? input.description,
    startDate: input.startDate, dueDate: existingDue || plannedEnd, phases, files
  }
}

export async function previewStudioOnboarding(db: PortalDatabase, value: unknown) {
  const input = onboardingInput(value, false)
  return onboardingPlan(db, input, await studioTemplate(db, input.templateId, input.templateVersion))
}

export async function launchStudioOnboarding(db: PortalDatabase, actorId: string, value: unknown): Promise<StudioLaunchResult> {
  const { idempotencyKey, ...input } = onboardingInput(value, true)
  const digest = createHash('sha256').update(JSON.stringify(input)).digest('hex')
  return db.transaction(async () => {
    const template = await studioTemplate(db, input.templateId, input.templateVersion)
    const now = new Date().toISOString()
    const write = await db.prepare(`INSERT INTO portal_studio_launches(idempotency_key,input_hash,organization_id,template_id,template_version,created_at)
      VALUES(?,?,?,?,?,?) ON CONFLICT(idempotency_key) DO NOTHING`)
      .run(idempotencyKey, digest, input.organizationId, input.templateId, input.templateVersion, now)
    if (!write.changes) {
      const existing = await db.prepare(`SELECT l.input_hash AS inputHash,l.organization_id AS organizationId,p.id AS projectId
        FROM portal_studio_launches l LEFT JOIN projects p ON p.id=l.project_id AND p.organization_id=l.organization_id
        WHERE l.idempotency_key=?`).get(idempotencyKey)
      if (existing?.inputHash !== digest) return conflict('Ce lancement a déjà été utilisé avec d’autres paramètres.')
      if (!existing.projectId) return conflict('Le projet créé par ce lancement a été supprimé.')
      return { projectId: existing.projectId, organizationId: existing.organizationId, replayed: true }
    }

    const plan = await onboardingPlan(db, input, template, true)
    const projectId = input.existingProjectId || randomUUID()
    if (input.existingProjectId) {
      await db.prepare('UPDATE projects SET due_date=?,updated_at=? WHERE id=? AND organization_id=?')
        .run(plan.dueDate, now, projectId, input.organizationId)
    } else {
      await db.prepare(`INSERT INTO projects(id,organization_id,name,description,status,due_date,created_at,updated_at)
        VALUES(?,?,?,?,'À cadrer',?,?,?)`).run(projectId, input.organizationId, plan.name, plan.description, plan.dueDate, now, now)
    }
    const insertPhase = db.prepare(`INSERT INTO portal_roadmap_phases(id,project_id,title,description,start_date,end_date,status,position)
      VALUES(?,?,?,?,?,?,'planned',?)`)
    const insertStep = db.prepare(`INSERT INTO portal_roadmap_steps(id,project_id,phase_id,title,description,start_date,end_date,kind,status,
      position,requires_validation,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,'planned',?,?,?,?,?)`)
    for (const [position, phase] of plan.phases.entries()) {
      const phaseId = randomUUID()
      await insertPhase.run(phaseId, projectId, phase.title, phase.description, phase.startDate, phase.endDate, position)
      for (const [stepPosition, step] of phase.steps.entries()) {
        await insertStep.run(randomUUID(), projectId, phaseId, step.title, step.description, step.startDate, step.endDate,
          step.kind, stepPosition, Number(step.requiresValidation), actorId, now, now)
      }
    }
    const insertFile = db.prepare('INSERT INTO portal_file_requests(id,project_id,title,description,created_by,created_at) VALUES(?,?,?,?,?,?)')
    const insertAssignment = db.prepare('INSERT INTO portal_file_request_assignments(request_id,due_date) VALUES(?,?)')
    for (const file of plan.files) {
      const fileId = randomUUID()
      await insertFile.run(fileId, projectId, file.title, file.description, actorId, now)
      await insertAssignment.run(fileId, file.dueDate)
    }
    await db.prepare('INSERT INTO activity(id,project_id,message,created_at) VALUES(?,?,?,?)')
      .run(randomUUID(), projectId, `Projet préparé depuis le modèle « ${plan.templateTitle} » (v${plan.templateVersion}).`, now)
    await db.prepare('UPDATE portal_studio_launches SET project_id=? WHERE idempotency_key=?').run(projectId, idempotencyKey)
    return { projectId, organizationId: input.organizationId, replayed: false }
  })
}

export async function qualifyStudioRequest(db: PortalDatabase, actorId: string, requestId: string, value: unknown) {
  const body = fields(value, ['organizationId', 'projectId', 'classification', 'priority', 'responsibleId', 'dueDate', 'snoozedUntil'])
  const organizationId = text(body.organizationId, 'Client', 200)
  const projectId = text(body.projectId, 'Projet', 200)
  const qualification: StudioQualification = {
    classification: body.classification === null || body.classification === '' ? null : choice(body.classification, studioClassifications, 'Catégorie'),
    priority: choice(body.priority, studioPriorities, 'Priorité'),
    responsibleId: body.responsibleId === null || body.responsibleId === '' ? null : text(body.responsibleId, 'Responsable', 200),
    dueDate: optionalDay(body.dueDate, 'Échéance'),
    snoozedUntil: optionalDay(body.snoozedUntil, 'Date de reprise')
  }
  return db.transaction(async () => {
    const lock = db.dialect === 'postgres' ? ' FOR UPDATE OF r' : ''
    const request = await db.prepare(`SELECT r.status,q.snoozed_until AS snoozedUntil FROM portal_requests r
      JOIN projects p ON p.id=r.project_id
      LEFT JOIN portal_studio_request_qualification q ON q.request_id=r.id
      WHERE r.id=? AND p.id=? AND p.organization_id=?` + lock).get(requestId, projectId, organizationId)
    if (!request) return unavailable('Demande introuvable dans ce projet.')
    if (request.status !== 'open') return conflict('Cette demande a été résolue.')
    if (qualification.snoozedUntil && qualification.snoozedUntil <= studioDay() && qualification.snoozedUntil !== request.snoozedUntil) {
      return invalid('La date de reprise doit être postérieure à aujourd’hui.')
    }
    if (qualification.responsibleId) {
      const responsible = await db.prepare(`SELECT u.id FROM users u LEFT JOIN portal_members m ON m.user_id=u.id
        WHERE u.id=? AND u.role='admin' AND COALESCE(m.suspended,0)=0`).get(qualification.responsibleId)
      if (!responsible) return invalid('Choisissez un administrateur actif.')
    }
    await db.prepare(`INSERT INTO portal_studio_request_qualification(request_id,classification,priority,responsible_id,due_date,snoozed_until,updated_by,updated_at)
      VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO UPDATE SET classification=excluded.classification,
      priority=excluded.priority,responsible_id=excluded.responsible_id,due_date=excluded.due_date,
      snoozed_until=excluded.snoozed_until,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(
      requestId, qualification.classification, qualification.priority, qualification.responsibleId,
      qualification.dueDate, qualification.snoozedUntil, actorId, new Date().toISOString()
    )
    return { qualification }
  })
}

interface ActivityRow {
  id: string
  title: string
  organizationId: string
  organizationName: string
  projectId: string
  projectName: string
  responsibleName: string | null
  dueDate: string | null
  openedAt: string
}

interface CommercialPayment {
  id: string
  invoiceId: string
  projectId: string | null
  projectName: string
  organizationId: string | null
  organizationName: string
  title: string
  reference: string
  dueDate: string
  remainingCents: number
}

const qualificationDefaults: StudioQualification = {
  classification: null, priority: 'normal', responsibleId: null, dueDate: null, snoozedUntil: null
}
const scopeFields = 'p.id AS projectId,p.name AS projectName,o.id AS organizationId,o.name AS organizationName'
const projectScope = (alias: string) => `JOIN projects p ON p.id=${alias}.project_id JOIN organizations o ON o.id=p.organization_id`
const deciderScope = 'LEFT JOIN portal_project_deciders d ON d.project_id=p.id LEFT JOIN users u ON u.id=d.user_id'
const categoryReasons: Record<StudioCategory, string> = {
  request: 'Demande ouverte',
  validation: 'Retour du client attendu',
  document: 'Fichier attendu du client',
  deliverable: 'Livrable à préparer',
  payment: 'Règlement attendu'
}

function amountLabel(cents: number, currency = 'EUR') {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
  }
}

function itemLink(row: ActivityRow, query: Record<string, string>) {
  return { clientId: row.organizationId, projectId: row.projectId, ...query }
}

function item(row: ActivityRow, category: StudioCategory, detail: string, link: Record<string, string>): StudioItem {
  const { id, title, organizationId, organizationName, projectId, projectName, responsibleName, dueDate } = row
  return {
    id, title, organizationId, organizationName, projectId, projectName, responsibleName,
    dueDate: roadmapDate(dueDate), category, detail, snoozed: false, link, reason: ''
  }
}

function rankStudioItem(entry: StudioItem, openedAt: string, today: string, blocked = false) {
  const days = entry.dueDate ? (Date.parse(entry.dueDate) - Date.parse(today)) / oneDay : null
  const age = Math.max(0, (Date.parse(today) - Date.parse(openedAt.slice(0, 10))) / oneDay) || 0
  const priority = entry.qualification?.priority
  const weight = { request: 40, validation: 35, document: 25, deliverable: 20, payment: 30 }
  const score = weight[entry.category]
    + (blocked ? 54 : 0)
    + (priority === 'urgent' ? 80 : priority === 'high' ? 26 : priority === 'low' ? -12 : 0)
    + (days === null ? 0 : days < 0 ? 58 + Math.min(-days, 30) : days === 0 ? 50 : days <= 7 ? 20 - days : 0)
    + Math.min(age, 14)
  const timing = days === null ? ''
    : days < 0 ? `En retard de ${-days} j`
    : days === 0 ? 'Échéance aujourd’hui'
    : days <= 7 ? `Échéance dans ${days} j`
    : ''
  const urgency = priority === 'urgent' ? 'Priorité urgente' : blocked ? 'Livrable bloqué' : priority === 'high' ? 'Priorité haute' : ''
  const pending = age >= 7 && entry.category !== 'deliverable' ? `En attente depuis ${age} j` : ''
  entry.reason = [urgency, timing, urgency || timing ? '' : pending || categoryReasons[entry.category]].filter(Boolean).join(' · ')
  return { entry, score, age }
}

export async function studioCockpit(db: PortalDatabase, commercial: CommercialPayment[] = [], today = studioDay()): Promise<StudioCockpit> {
  const soon = addDays(today, 7)
  const [requests, files, validations, mockups, deliverables, legacyPayments, admins, opportunities, failures] = await Promise.all([
    db.prepare(`SELECT r.id,r.title,r.created_at AS openedAt,${scopeFields},
      q.classification,q.priority,q.responsible_id AS responsibleId,u.name AS responsibleName,q.due_date AS dueDate,q.snoozed_until AS snoozedUntil
      FROM portal_requests r ${projectScope('r')} LEFT JOIN portal_studio_request_qualification q ON q.request_id=r.id
      LEFT JOIN users u ON u.id=q.responsible_id WHERE r.status='open'`)
      .all() as Promise<(ActivityRow & StudioQualification)[]>,
    db.prepare(`SELECT f.id,f.title,f.created_at AS openedAt,${scopeFields},u.name AS responsibleName,a.due_date AS dueDate
      FROM portal_file_requests f ${projectScope('f')} LEFT JOIN portal_file_request_assignments a ON a.request_id=f.id
      LEFT JOIN users u ON u.id=a.responsible_id WHERE f.status='open'`).all() as Promise<ActivityRow[]>,
    db.prepare(`SELECT v.id,v.title,v.step_id AS stepId,v.requested_at AS openedAt,${scopeFields},u.name AS responsibleName,v.due_date AS dueDate
      FROM portal_roadmap_validations v ${projectScope('v')} ${deciderScope}
      JOIN portal_roadmap_steps s ON s.project_id=v.project_id AND s.id=v.step_id
      JOIN portal_roadmap_phases ph ON ph.project_id=s.project_id AND ph.id=s.phase_id
      LEFT JOIN portal_roadmap_decisions decision ON decision.validation_id=v.id
      WHERE s.archived=0 AND ph.archived=0 AND decision.validation_id IS NULL`).all() as Promise<(ActivityRow & { stepId: string })[]>,
    db.prepare(`SELECT r.id,r.title,r.updated_at AS openedAt,${scopeFields},u.name AS responsibleName,r.due_date AS dueDate
      FROM resources r ${projectScope('r')} ${deciderScope}
      WHERE r.kind='mockup' AND r.archived=0 AND r.status IN ('pending','available')`).all() as Promise<ActivityRow[]>,
    db.prepare(`SELECT s.id,s.title,s.created_at AS openedAt,${scopeFields},u.name AS responsibleName,
      s.end_date AS dueDate,s.start_date AS startDate,s.status,s.blocker
      FROM portal_roadmap_steps s ${projectScope('s')} LEFT JOIN users u ON u.id=s.responsible_id
      JOIN portal_roadmap_phases ph ON ph.project_id=s.project_id AND ph.id=s.phase_id
      WHERE s.kind='deliverable' AND s.archived=0 AND ph.archived=0 AND s.status IN ('planned','in_progress','blocked')`)
      .all() as Promise<(ActivityRow & { status: string; blocker: string; startDate: string | null })[]>,
    db.prepare(`SELECT r.id,r.title,r.created_at AS openedAt,${scopeFields},NULL AS responsibleName,r.due_date AS dueDate,r.amount,r.currency
      FROM resources r ${projectScope('r')} WHERE r.kind='payment' AND r.archived=0 AND r.status='due'`)
      .all() as Promise<(ActivityRow & { amount: number; currency: string })[]>,
    db.prepare(`SELECT u.id,u.name FROM users u LEFT JOIN portal_members m ON m.user_id=u.id
      WHERE u.role='admin' AND COALESCE(m.suspended,0)=0 ORDER BY u.name,u.id`).all(),
    db.prepare(`SELECT id,title,stage,next_action AS action,next_action_date AS dueDate
      FROM portal_crm_opportunities WHERE stage='new' OR (stage NOT IN ('won','lost') AND next_action_date<>'' AND next_action_date<=?)
      ORDER BY CASE WHEN next_action_date='' THEN 1 ELSE 0 END,next_action_date,created_at,id LIMIT 12`).all(soon),
    db.prepare(`SELECT r.id,r.scenario,p.name AS projectName
      FROM portal_operation_runs r JOIN projects p ON p.id=r.project_id
      WHERE r.status='failed' AND NOT EXISTS (
        SELECT 1 FROM portal_operation_runs newer WHERE newer.project_id=r.project_id AND newer.scenario=r.scenario
        AND (newer.created_at>r.created_at OR (newer.created_at=r.created_at AND newer.id>r.id))
      )
      ORDER BY r.created_at DESC,r.id DESC LIMIT 12`).all()
  ])

  const work = [
    ...requests.map(row => {
      const entry = item(row, 'request', row.classification ? 'Demande ouverte' : 'À qualifier', itemLink(row, { tab: 'requests', requestId: row.id }))
      entry.qualification = {
        classification: row.classification,
        priority: row.priority || qualificationDefaults.priority,
        responsibleId: row.responsibleId,
        dueDate: entry.dueDate,
        snoozedUntil: roadmapDate(row.snoozedUntil)
      }
      entry.snoozed = Boolean(entry.qualification.snoozedUntil && entry.qualification.snoozedUntil > today)
      return rankStudioItem(entry, row.openedAt, today)
    }),
    ...files.map(row => rankStudioItem(item(row, 'document', 'Dépôt attendu', itemLink(row, { tab: 'resources', resource: 'file' })), row.openedAt, today)),
    ...validations.map(row => rankStudioItem(item(row, 'validation', 'Validation d’étape', itemLink(row, { tab: 'roadmap', stepId: row.stepId })), row.openedAt, today)),
    ...mockups.map(row => rankStudioItem(item(row, 'validation', 'Validation de maquette', itemLink(row, { tab: 'resources', resource: 'mockup' })), row.openedAt, today)),
    ...deliverables.map(row => {
      const label = row.status === 'planned' ? 'Planifié' : row.status === 'blocked' ? row.blocker || 'Bloqué' : 'En cours'
      const entry = item(row, 'deliverable', label, itemLink(row, { tab: 'roadmap', stepId: row.id }))
      const ranked = rankStudioItem(entry, row.openedAt, today, row.status === 'blocked')
      return { ...ranked, upcoming: row.status === 'planned' && Boolean(row.startDate && row.startDate > today && (!entry.dueDate || entry.dueDate > soon)) }
    }),
    ...legacyPayments.map(row => rankStudioItem(item(row, 'payment', `${amountLabel(row.amount, row.currency)} à régler`, itemLink(row, { tab: 'resources', resource: 'payment' })), row.openedAt, today)),
    ...commercial.map(payment => rankStudioItem({
      id: `invoice:${payment.id}`, category: 'payment', title: payment.title,
      detail: `${payment.reference} · ${amountLabel(payment.remainingCents)} à régler`,
      organizationId: payment.organizationId, projectId: payment.projectId,
      organizationName: payment.organizationName, projectName: payment.projectName,
      responsibleName: null, dueDate: roadmapDate(payment.dueDate), snoozed: false, reason: '',
      link: { tab: 'commercial', invoiceId: payment.invoiceId }
    }, today, today))
  ]
  work.sort((a, b) => b.score - a.score
    || (a.entry.dueDate || '9999-12-31').localeCompare(b.entry.dueDate || '9999-12-31')
    || b.age - a.age
    || studioCategories.indexOf(a.entry.category) - studioCategories.indexOf(b.entry.category)
    || a.entry.id.localeCompare(b.entry.id))
  return {
    today,
    items: work.map(({ entry }) => entry),
    priorities: work.filter(result => !result.entry.snoozed && !('upcoming' in result && result.upcoming)).slice(0, 3).map(({ entry }) => entry),
    admins,
    decisions: [
      ...failures.map(row => ({
        id: `run:${row.id}`, title: row.scenario === 'reminders' ? 'Relances en échec' : 'Rapport hebdomadaire en échec',
        detail: row.projectName, dueDate: null, link: { tab: 'operations' }
      })),
      ...opportunities.map(row => ({
        id: `opportunity:${row.id}`, title: row.title,
        detail: row.action || (row.stage === 'new' ? 'Nouvelle opportunité à qualifier' : 'Prochaine action'),
        dueDate: roadmapDate(row.dueDate), link: { tab: 'commercial', opportunityId: row.id }
      }))
    ]
  }
}
