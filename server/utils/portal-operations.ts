import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { createError } from 'h3'
import { portalDb, type PortalDatabase } from './portal-db'
import { notifyProject } from './portal-notifications'
import { portalObjectStoreConfigured } from './portal-object-store'
import { lockProject, projectTodos } from './portal-workflow'

const scenarioIds = ['reminders', 'weekly_report'] as const
type Scenario = typeof scenarioIds[number]
type Status = 'queued' | 'running' | 'draft' | 'approved' | 'succeeded' | 'failed'
type Source = 'scheduled' | 'manual' | 'replay'
export type OperationAction = {
 action?: unknown
 scope?: unknown
 projectId?: unknown
 scenario?: unknown
 paused?: unknown
 scheduled?: unknown
 key?: unknown
 runId?: unknown
}
type OperationRun = {
 id: string
 project_id: string
 scenario: Scenario
 status: Status
 source: Source
 replay_of: string | null
 attempts: number
 available_at: string
 claim_token: string | null
 lease_until: string | null
 period_start: string | null
 period_end: string | null
 report_title: string | null
 report_body: string | null
 notifications: number | null
 error_code: string | null
 created_at: string
 updated_at: string
}
type OperationProject = {
 id: string
 name: string
 organization_id: string
 status: string
 progress: number
 current_phase: string
 due_date: string
}

const attemptsLimit = 3
const leaseMs = 120_000
const retryDelayMs = [60_000, 300_000]
const dayMs = 86_400_000
const schedulerBatch = 10
const schedulePerScenario = 20
const schedulerSecret = () => process.env.PORTAL_OPERATIONS_SECRET || ''
const digest = (value: string) => createHash('sha256').update(value).digest()

export function authorizePortalOperationsTick(authorization?: string) {
 const secret = schedulerSecret()
 if (Buffer.byteLength(secret) < 32) {
  throw createError({statusCode:503, statusMessage:'Ordonnanceur non configuré.'})
 }
 if (!authorization?.startsWith('Bearer ') || !timingSafeEqual(digest(secret), digest(authorization.slice(7)))) {
  throw createError({statusCode:401, statusMessage:'Autorisation d’ordonnancement requise.'})
 }
}

function readScenario(value: unknown): Scenario {
 const scenario = scenarioIds.find(id => id === value)
 if (!scenario) throw createError({statusCode:400, statusMessage:'Scénario inconnu.'})
 return scenario
}

function readId(value: unknown) {
 if (typeof value !== 'string' || !value.trim() || value.length > 200) {
  throw createError({statusCode:400, statusMessage:'Identifiant invalide.'})
 }
 return value
}

async function readProject(db: PortalDatabase, projectId: string) {
 const project: OperationProject | undefined = await db.prepare(
  'SELECT id,name,organization_id,status,progress,current_phase,due_date FROM projects WHERE id=?'
 ).get(projectId)
 if (!project) throw createError({statusCode:404, statusMessage:'Projet introuvable.'})
 return project
}

const readRun = (db: PortalDatabase, id: string): Promise<OperationRun | undefined> =>
 db.prepare('SELECT * FROM portal_operation_runs WHERE id=?').get(id)

const control = (db: PortalDatabase, lock = false): Promise<{ paused: number; last_tick_at: string | null }> =>
 db.prepare('SELECT paused,last_tick_at FROM portal_operation_control WHERE id=1' +
  (lock && db.dialect === 'postgres' ? ' FOR UPDATE' : '')).get()

// All writes hold the control row while checking pauses and committing their local DB effects.
// SQLite's BEGIN IMMEDIATE provides the same exclusion. No network call runs under this lock.
async function isPaused(db: PortalDatabase, projectId: string, scenario: Scenario) {
 const state = await db.prepare(`
  SELECT c.paused AS globalPaused,s.paused AS scenarioPaused,COALESCE(p.paused,0) AS projectPaused
  FROM portal_operation_control c CROSS JOIN portal_operation_scenarios s
  LEFT JOIN portal_operation_projects p ON p.project_id=?
  WHERE c.id=1 AND s.id=?
 `).get(projectId, scenario)
 return Boolean(state.globalPaused || state.projectPaused || state.scenarioPaused)
}

async function event(db: PortalDatabase, name: string, at: string, input: {
 projectId?: string | null; scenario?: Scenario | null; runId?: string | null; actorId?: string | null; attempt?: number | null
 }) {
 await db.prepare(`
  INSERT INTO portal_operation_events(id,project_id,scenario,run_id,actor_id,event,attempt,created_at)
  VALUES(?,?,?,?,?,?,?,?)
 `).run(randomUUID(), input.projectId ?? null, input.scenario ?? null, input.runId ?? null, input.actorId ?? null,
  name, input.attempt ?? null, at)
}

function formatRun(run: OperationRun) {
 return {
  id:run.id, projectId:run.project_id, scenario:run.scenario, status:run.status, source:run.source,
  replayOf:run.replay_of, attempts:run.attempts, availableAt:run.available_at, notifications:run.notifications,
  errorCode:run.error_code, createdAt:run.created_at, updatedAt:run.updated_at,
  report:run.report_title === null ? null : {title:run.report_title, body:run.report_body, start:run.period_start, end:run.period_end}
 }
}

function scenarioPeriod(scenario: Scenario, now: Date) {
 if (scenario === 'reminders') return {key: now.toISOString().slice(0, 10), start: null, end: null}
 const end = new Date(now)
 end.setUTCHours(0, 0, 0, 0)
 end.setUTCDate(end.getUTCDate() - (end.getUTCDay() + 2) % 7)
 const start = new Date(end.getTime() - 7 * dayMs).toISOString().slice(0, 10)
 return {key: start, start, end: end.toISOString().slice(0, 10)}
}

type OperationPeriod = Pick<ReturnType<typeof scenarioPeriod>, 'start' | 'end'>
async function enqueue(db: PortalDatabase, input: {
 projectId: string; scenario: Scenario; key: string; source: Source; period: OperationPeriod;
 now: string; actorId?: string; replayOf?: string
}) {
 const {projectId, scenario, key, source, period, now, actorId, replayOf} = input
 const id = randomUUID()
 const inserted = await db.prepare(`
  INSERT INTO portal_operation_runs(id,project_id,scenario,idempotency_key,source,replay_of,status,available_at,period_start,period_end,created_at,updated_at)
  VALUES(?,?,?,?,?,?,'queued',?,?,?,?,?)
  ON CONFLICT(project_id,scenario,idempotency_key) DO NOTHING
 `).run(id, projectId, scenario, key, source, replayOf ?? null, now, period.start, period.end, now, now)
 if (inserted.changes) {
  await event(db, 'queued', now, {projectId, scenario, runId:id, actorId})
  return {id, created:true}
 }
 const existing = await db.prepare('SELECT id FROM portal_operation_runs WHERE project_id=? AND scenario=? AND idempotency_key=?')
  .get(projectId, scenario, key)
 return {id:existing.id as string, created:false}
}

async function recordFailure(db: PortalDatabase, run: OperationRun, now: Date, errorCode: 'execution' | 'lease_expired') {
 const retry = run.attempts < attemptsLimit
 const at = now.toISOString()
 const availableAt = retry ? new Date(now.getTime() + (retryDelayMs[run.attempts - 1] ?? retryDelayMs[0]!)).toISOString() : at
 await db.prepare(`
  UPDATE portal_operation_runs SET status=?,available_at=?,claim_token=NULL,lease_until=NULL,error_code=?,updated_at=?
  WHERE id=? AND status='running' AND claim_token=?
 `).run(retry ? 'queued' : 'failed', availableAt, errorCode, at, run.id, run.claim_token)
 await event(db, retry ? (errorCode === 'lease_expired' ? 'lease_retry' : 'retry') : (errorCode === 'lease_expired' ? 'lease_failed' : 'failed'),
  at, {projectId:run.project_id, scenario:run.scenario, runId:run.id, attempt:run.attempts})
}

async function claim(db: PortalDatabase, runId?: string) {
 return db.transaction(async () => {
  const state = await control(db, true)
  if (state.paused) return
  const now = new Date()
  const at = now.toISOString()
  const run: OperationRun | undefined = await db.prepare(`
   SELECT r.* FROM portal_operation_runs r JOIN portal_operation_scenarios s ON s.id=r.scenario
   LEFT JOIN portal_operation_projects p ON p.project_id=r.project_id
   WHERE r.status='queued' AND r.available_at<=? AND s.paused=0 AND COALESCE(p.paused,0)=0
   ${runId ? 'AND r.id=?' : ''}
   ORDER BY r.available_at,r.id LIMIT 1
  `).get(...(runId ? [at, runId] : [at]))
  if (!run) return
  const token = randomUUID()
  const result = await db.prepare(`
   UPDATE portal_operation_runs SET status='running',attempts=attempts+1,claim_token=?,lease_until=?,updated_at=?
   WHERE id=? AND status='queued'
  `).run(token, new Date(now.getTime() + leaseMs).toISOString(), at, run.id)
  if (!result.changes) return
  await event(db, 'claimed', at, {projectId:run.project_id, scenario:run.scenario, runId:run.id, attempt:run.attempts + 1})
  return {id:run.id, token}
 })
}

async function queueProjectReminders(db: PortalDatabase, project: OperationProject, now: number) {
 const todos = await projectTodos(db, project)
 const users = await db.prepare(`
  SELECT u.id,COALESCE(p.reminder_days,3) AS days,COALESCE(m.member_role,'contributor') AS role
  FROM users u LEFT JOIN portal_members m ON m.user_id=u.id
  LEFT JOIN portal_notification_preferences p ON p.user_id=u.id
  WHERE u.organization_id=? AND u.role='client' AND COALESCE(m.suspended,0)=0
  AND COALESCE(m.member_role,'contributor')<>'viewer' AND (COALESCE(p.in_app,1)=1 OR COALESCE(p.email,1)=1)
 `).all(project.organization_id)
 let notifications = 0
 for (const user of users) {
  if (!user.days) continue
  const interval = Number(user.days) * dayMs
  for (const todo of todos) {
   if ((todo.responsibleId && todo.responsibleId !== user.id) || now - Date.parse(todo.createdAt) < interval) continue
   if (['mockup','roadmap'].includes(todo.kind) && (!todo.responsibleId || user.role !== 'decision_maker')) continue
   if (todo.kind === 'roadmap_step' && todo.responsibleId !== user.id) continue
   const kind = ['roadmap','roadmap_step'].includes(todo.kind) ? 'roadmap_reminder' : 'reminder'
   const prefix = 'reminder:' + todo.kind + ':' + todo.id + ':'
   const last = await db.prepare(`
    SELECT created_at FROM portal_notifications WHERE user_id=? AND kind=? AND dedupe_key LIKE ?
    ORDER BY created_at DESC LIMIT 1
   `).get(user.id, kind, prefix + '%:' + user.id)
   if (last && now - Date.parse(last.created_at) < interval) continue
   notifications += await notifyProject(project.id, kind, 'Action attendue : ' + todo.title,
    'Une action vous attend dans le projet ' + project.name + (todo.dueDate ? ' pour le ' + todo.dueDate : '') + '.',
    undefined, prefix + Math.floor(now / interval), user.id)
  }
 }
 return notifications
}

const reportDate = new Intl.DateTimeFormat('fr-FR', {dateStyle:'medium', timeZone:'UTC'})
async function projectReport(db: PortalDatabase, project: OperationProject, periodStart: string, periodEnd: string, now: Date) {
 const tasks = await db.prepare(`
  SELECT COUNT(*) AS total,SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS done,
   SUM(CASE WHEN status='blocked' THEN 1 ELSE 0 END) AS blocked
  FROM portal_roadmap_steps WHERE project_id=? AND archived=0
 `).get(project.id)
 const items = await db.prepare(`
  SELECT message,SUBSTR(created_at,1,10) AS day FROM activity WHERE project_id=?
  AND SUBSTR(created_at,1,10)>=? AND SUBSTR(created_at,1,10)<? ORDER BY created_at DESC,id DESC LIMIT 13
 `).all(project.id, periodStart, periodEnd)
 const todos = await projectTodos(db, project)
 const end = new Date(Date.parse(periodEnd) - dayMs)
 const title = 'Bilan hebdomadaire · ' + project.name
 const period = 'Période du ' + reportDate.format(new Date(periodStart)) + ' au ' + reportDate.format(end) + ' (UTC).'
 const activity = items.slice(0, 12).map(item =>
  '• ' + reportDate.format(new Date(item.day)) + ' — ' + item.message.replace(/\s+/g, ' ').trim().slice(0, 230))
 if (items.length > 12) activity.push('• Autres mises à jour consultables dans le journal du projet.')
 const overview = [
  'État du projet au ' + reportDate.format(now) + ' : ' + project.status + ' · ' + project.progress + ' % d’avancement.',
  ...(project.current_phase ? ['Phase en cours : ' + project.current_phase + '.'] : []),
  ...(project.due_date ? ['Livraison prévue : ' + project.due_date + '.'] : []),
  'Roadmap : ' + Number(tasks.done || 0) + '/' + Number(tasks.total) + ' étape(s) terminée(s), ' +
   Number(tasks.blocked || 0) + ' bloquée(s).',
  'Actions en attente : ' + todos.length + '.'
 ]
 const body = [period, overview.join('\n'), ['Journal du projet', ...(activity.length ? activity : ['Aucune activité enregistrée sur cette période.'])].join('\n')].join('\n\n')
 return {title, body}
}

async function executeClaim(db: PortalDatabase, claimInfo: {id: string; token: string}) {
 try {
  return await db.transaction(async () => {
   await control(db, true)
   const run = await readRun(db, claimInfo.id)
   if (!run || run.status !== 'running' || run.claim_token !== claimInfo.token) return
   const now = new Date()
   const at = now.toISOString()
   if (await isPaused(db, run.project_id, run.scenario)) {
    await db.prepare(`
     UPDATE portal_operation_runs SET status='queued',attempts=attempts-1,claim_token=NULL,lease_until=NULL,updated_at=? WHERE id=?
    `).run(at, run.id)
    await event(db, 'deferred', at, {projectId:run.project_id, scenario:run.scenario, runId:run.id})
    return
   }
   await lockProject(db, run.project_id)
   const project = await readProject(db, run.project_id)
   const report = run.scenario === 'weekly_report' && run.period_start && run.period_end
    ? await projectReport(db, project, run.period_start, run.period_end, now)
    : null
   const notifications = run.scenario === 'reminders' ? await queueProjectReminders(db, project, now.getTime()) : null
   const status = report ? 'draft' : 'succeeded'
   await db.prepare(`
    UPDATE portal_operation_runs SET status=?,report_title=?,report_body=?,notifications=?,claim_token=NULL,lease_until=NULL,error_code=NULL,updated_at=?
    WHERE id=?
   `).run(status, report?.title ?? null, report?.body ?? null, notifications, at, run.id)
   await event(db, status, at, {projectId:run.project_id, scenario:run.scenario, runId:run.id, attempt:run.attempts})
   return status
  })
 } catch {
  await db.transaction(async () => {
   await control(db, true)
   const run = await readRun(db, claimInfo.id)
   if (run?.status === 'running' && run.claim_token === claimInfo.token) {
    await recordFailure(db, run, new Date(), 'execution')
   }
  })
  return 'error'
 }
}

async function executeOne(db: PortalDatabase, runId?: string) {
 const task = await claim(db, runId)
 if (!task) return {claimed: false, outcome: undefined}
 return {claimed: true, outcome:await executeClaim(db, task)}
}

export async function runPortalOperationsTick(db: PortalDatabase) {
 const started = Date.now()
 const scheduled = await db.transaction(async () => {
  const state = await control(db, true)
  const now = new Date()
  const at = now.toISOString()
  await db.prepare('UPDATE portal_operation_control SET last_tick_at=? WHERE id=1').run(at)
  const expired: OperationRun[] = await db.prepare(`
   SELECT * FROM portal_operation_runs WHERE status='running' AND lease_until<=? ORDER BY lease_until,id LIMIT ?
  `).all(at, schedulerBatch * 2)
  for (const run of expired) await recordFailure(db, run, now, 'lease_expired')
  let queued = 0
  if (!state.paused) {
   const scenarios: {id:Scenario}[] = await db.prepare('SELECT id FROM portal_operation_scenarios WHERE paused=0 AND scheduled=1 ORDER BY id').all()
   for (const {id:scenario} of scenarios) {
    const period = scenarioPeriod(scenario, now)
    const key = 'period:' + period.key
    const projects: {id:string}[] = await db.prepare(`
     SELECT p.id FROM projects p LEFT JOIN portal_operation_projects pause ON pause.project_id=p.id
     WHERE COALESCE(pause.paused,0)=0 AND NOT EXISTS (
      SELECT 1 FROM portal_operation_runs r WHERE r.project_id=p.id AND r.scenario=? AND r.idempotency_key=?
     ) ORDER BY p.id LIMIT ?
    `).all(scenario, key, schedulePerScenario)
    for (const project of projects) {
     const result = await enqueue(db, {projectId:project.id, scenario, key, source:'scheduled', period, now:at})
     if (result.created) queued++
    }
   }
  }
  return {queued, recovered:expired.length, paused:Boolean(state.paused)}
 })
 let processed = 0
 let errors = 0
 // Leave time for the hosting platform to complete the response between claimed jobs.
 while (processed < schedulerBatch && Date.now() - started < 7_000) {
  const result = await executeOne(db)
  if (!result.claimed) break
  processed++
  if (result.outcome === 'error') errors++
 }
 return {...scheduled, processed, errors}
}

async function launch(db: PortalDatabase, projectId: string, scenario: Scenario, key: string, actorId?: string, skipPaused = false) {
 const result = await db.transaction(async () => {
  await control(db, true)
  await readProject(db, projectId)
  if (await isPaused(db, projectId, scenario)) {
   if (skipPaused) return null
   throw createError({statusCode:409, statusMessage:'Cette automatisation est en pause.'})
  }
  const now = new Date()
  const period = scenarioPeriod(scenario, now)
  return await enqueue(db, {projectId, scenario, key:scenario === 'weekly_report' ? 'period:' + period.key : 'manual:' + key,
   source:'manual', period, now:now.toISOString(), actorId})
 })
 if (!result) return null
 await executeOne(db, result.id)
 const run = await readRun(db, result.id)
 return run ? formatRun(run) : null
}

// Preserve the existing trigger for deployments that still use PORTAL_REMINDER_SECRET.
export async function runPortalReminderTrigger(projectId: string | undefined, actorId?: string) {
 const db = await portalDb()
 const projects = projectId
  ? await db.prepare('SELECT id FROM projects WHERE id=?').all(projectId)
  : await db.prepare('SELECT id FROM projects ORDER BY id').all()
 let queued = 0
 let deferred = 0
 let skipped = 0
 for (const project of projects) {
  const run = await launch(db, project.id, 'reminders', randomUUID(), actorId, true)
  if (!run) skipped++
  else if (run.status === 'succeeded') queued += run.notifications ?? 0
  else deferred++
 }
 return {queued, deferred, skipped}
}

type OperationMutationResult = {ok?: boolean; run?: ReturnType<typeof formatRun> | null; dispatch?: boolean}
export async function updatePortalOperations(db: PortalDatabase, action: OperationAction, actorId: string): Promise<OperationMutationResult> {
 if (action.action === 'launch') {
  const projectId = readId(action.projectId)
  const scenario = readScenario(action.scenario)
  if (typeof action.key !== 'string' || !/^[A-Za-z0-9_-]{8,100}$/.test(action.key)) {
   throw createError({statusCode:400, statusMessage:'Clé de lancement invalide.'})
  }
  return {run:await launch(db, projectId, scenario, action.key, actorId)}
 }
 if (action.action === 'pause' || action.action === 'schedule') {
  await db.transaction(async () => {
   const current = await control(db, true)
   const now = new Date().toISOString()
   if (action.action === 'schedule') {
    const scenario = readScenario(action.scenario)
    if (typeof action.scheduled !== 'boolean') {
     throw createError({statusCode:400, statusMessage:'État de planification invalide.'})
    }
    const updated = await db.prepare('UPDATE portal_operation_scenarios SET scheduled=? WHERE id=? AND scheduled<>?')
     .run(Number(action.scheduled), scenario, Number(action.scheduled))
    if (updated.changes) await event(db, action.scheduled ? 'schedule_enabled' : 'schedule_disabled', now, {scenario, actorId})
    return
   }
   if (typeof action.paused !== 'boolean') throw createError({statusCode:400, statusMessage:'État de pause invalide.'})
   const paused = Number(action.paused)
   const operation = action.paused ? 'paused' : 'resumed'
   if (action.scope === 'global') {
    if (current.paused !== paused) {
     await db.prepare('UPDATE portal_operation_control SET paused=? WHERE id=1').run(paused)
     await event(db, operation, now, {actorId})
    }
   } else if (action.scope === 'project') {
    const projectId = readId(action.projectId)
    await readProject(db, projectId)
    const setting = await db.prepare('SELECT paused FROM portal_operation_projects WHERE project_id=?').get(projectId)
    if ((setting?.paused ?? 0) !== paused) {
     await db.prepare(`
      INSERT INTO portal_operation_projects(project_id,paused) VALUES(?,?)
      ON CONFLICT(project_id) DO UPDATE SET paused=excluded.paused
     `).run(projectId, paused)
     await event(db, operation, now, {projectId, actorId})
    }
   } else if (action.scope === 'scenario') {
    const scenario = readScenario(action.scenario)
    const updated = await db.prepare('UPDATE portal_operation_scenarios SET paused=? WHERE id=? AND paused<>?').run(paused, scenario, paused)
    if (updated.changes) await event(db, operation, now, {scenario, actorId})
   } else {
    throw createError({statusCode:400, statusMessage:'Portée de pause invalide.'})
   }
  })
  return {ok:true}
 }
 if (action.action === 'execute') {
  const runId = readId(action.runId)
  await db.transaction(async () => {
   await control(db, true)
   const run = await readRun(db, runId)
   if (!run) throw createError({statusCode:404, statusMessage:'Exécution introuvable.'})
   if (await isPaused(db, run.project_id, run.scenario)) {
    throw createError({statusCode:409, statusMessage:'Cette automatisation est en pause.'})
   }
   const now = new Date()
   if (run.status === 'running' && run.lease_until && run.lease_until <= now.toISOString()) {
    await recordFailure(db, run, now, 'lease_expired')
   }
  })
  await executeOne(db, runId)
  const run = await readRun(db, runId)
  return {run:run ? formatRun(run) : null}
 }
 if (action.action !== 'approve' && action.action !== 'replay') {
  throw createError({statusCode:400, statusMessage:'Action inconnue.'})
 }
 const runId = readId(action.runId)
 const result = await db.transaction(async () => {
  await control(db, true)
  const run = await readRun(db, runId)
  if (!run) throw createError({statusCode:404, statusMessage:'Exécution introuvable.'})
  if (action.action === 'approve' && run.status === 'approved') return {id:run.id, dispatch:false}
  if (await isPaused(db, run.project_id, run.scenario)) {
   throw createError({statusCode:409, statusMessage:'Cette automatisation est en pause.'})
  }
  const now = new Date().toISOString()
  if (action.action === 'replay') {
   if (run.status !== 'failed') throw createError({statusCode:409, statusMessage:'Seule une exécution en échec peut être rejouée.'})
   const replay = await enqueue(db, {projectId:run.project_id, scenario:run.scenario, key:'replay:' + run.id,
    source:'replay', replayOf:run.id, period:{start:run.period_start, end:run.period_end}, now, actorId})
   return {id:replay.id, dispatch:false}
  }
  if (run.scenario !== 'weekly_report' || run.status !== 'draft' || !run.report_title || !run.report_body || !run.period_start) {
   throw createError({statusCode:409, statusMessage:'Ce bilan n’est pas en attente de validation.'})
  }
  await lockProject(db, run.project_id)
  const notifications = await notifyProject(run.project_id, 'weekly_report', run.report_title, run.report_body, undefined,
   'operations:weekly_report:' + run.project_id + ':' + run.period_start)
  await db.prepare('UPDATE portal_operation_runs SET status=?,notifications=?,updated_at=? WHERE id=?')
   .run('approved', notifications, now, run.id)
  await event(db, 'approved', now, {projectId:run.project_id, scenario:run.scenario, runId:run.id, actorId})
  return {id:run.id, dispatch:true}
 })
 if (action.action === 'replay') await executeOne(db, result.id)
 const run = await readRun(db, result.id)
 return {run:run ? formatRun(run) : null, dispatch:result.dispatch}
}

export async function portalOperationsOverview(db: PortalDatabase, projectId: string | undefined, email: 'configured' | 'disabled' | 'unconfigured') {
 if (projectId !== undefined) await readProject(db, readId(projectId))
 const state = await control(db)
 const scenarios: {id:Scenario; paused:number; scheduled:number}[] = await db.prepare(
  'SELECT id,paused,scheduled FROM portal_operation_scenarios ORDER BY id'
 ).all()
 const projects = await db.prepare(`
  SELECT p.id,p.name,COALESCE(s.paused,0) AS paused FROM projects p LEFT JOIN portal_operation_projects s ON s.project_id=p.id
  ${projectId ? 'WHERE p.id=?' : ''}
  ORDER BY p.name,p.id
 `).all(...(projectId ? [projectId] : []))
 const runs: (OperationRun & {projectName:string; hasReplay:number})[] = await db.prepare(`
  SELECT r.*,p.name AS projectName,CASE WHEN EXISTS (
   SELECT 1 FROM portal_operation_runs replay WHERE replay.replay_of=r.id
  ) THEN 1 ELSE 0 END AS hasReplay
  FROM portal_operation_runs r JOIN projects p ON p.id=r.project_id
  ${projectId ? 'WHERE r.project_id=?' : ''}
  ORDER BY r.created_at DESC,r.id DESC LIMIT 40
 `).all(...(projectId ? [projectId] : []))
 const events = await db.prepare(`
  SELECT e.id,e.event,e.attempt,e.scenario,e.created_at AS createdAt,e.run_id AS runId,
   p.name AS projectName,u.name AS actor
  FROM portal_operation_events e LEFT JOIN projects p ON p.id=e.project_id LEFT JOIN users u ON u.id=e.actor_id
  ${projectId ? 'WHERE e.project_id=? OR e.project_id IS NULL' : ''}
  ORDER BY e.created_at DESC,e.id DESC LIMIT 60
 `).all(...(projectId ? [projectId] : []))
 const transport = await db.prepare(`
  SELECT COALESCE(SUM(CASE WHEN email_status='sent' THEN 1 ELSE 0 END),0) AS sent,
   COALESCE(SUM(CASE WHEN email_status LIKE 'failed%' THEN 1 ELSE 0 END),0) AS failed,
   COALESCE(SUM(CASE WHEN email_status='delivery_unknown' THEN 1 ELSE 0 END),0) AS uncertain,
   COALESCE(SUM(CASE WHEN email_status='cancelled' THEN 1 ELSE 0 END),0) AS cancelled,
   COALESCE(SUM(CASE WHEN email_status='pending' OR email_status LIKE 'sending:%' THEN 1 ELSE 0 END),0) AS pending
  FROM portal_notifications WHERE kind IN ('reminder','roadmap_reminder','weekly_report')
  ${projectId ? 'AND project_id=?' : ''}
 `).get(...(projectId ? [projectId] : []))
 return {
  paused:Boolean(state.paused),
  scenarios:scenarios.map(scenario => ({id:scenario.id, paused:Boolean(scenario.paused), scheduled:Boolean(scenario.scheduled)})),
  projects:projects.map(project => ({...project, paused:Boolean(project.paused)})),
  runs:runs.map(run => ({...formatRun(run), projectName:run.projectName, hasReplay:Boolean(run.hasReplay)})),
  events,
  connections:{
   database:db.dialect,
   scheduler:Buffer.byteLength(schedulerSecret()) >= 32,
   lastTickAt:state.last_tick_at,
   email,
   transport:{sent:Number(transport.sent), failed:Number(transport.failed), pending:Number(transport.pending),
    uncertain:Number(transport.uncertain), cancelled:Number(transport.cancelled)},
   figma:Boolean(process.env.FIGMA_ACCESS_TOKEN || process.env.NUXT_FIGMA_ACCESS_TOKEN),
   analytics:Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
   storage:portalObjectStoreConfigured(),
   mcp:Buffer.byteLength(process.env.PORTAL_MCP_TOKEN || '') >= 32
  }
 }
}
