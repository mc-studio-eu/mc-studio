import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { PortalClockifySnapshot } from '../../shared/portal-clockify.ts'
import type { PortalTimeSession } from '../../shared/portal-project-timer.ts'
import type { PortalDatabase } from './portal-db.ts'

const sessions = `SELECT t.id,t.project_id AS projectId,COALESCE(p.name,t.project_name) AS projectName,
  t.description,t.started_at AS startedAt,t.stopped_at AS stoppedAt,t.duration_seconds AS durationSeconds,u.name AS author
  FROM portal_finance_time_sessions t LEFT JOIN projects p ON p.id=t.project_id LEFT JOIN users u ON u.id=t.actor_id`

function fail(statusCode: number, message: string): never {
  throw createError({ statusCode, message, data: { message } })
}

function field(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if ((value != null && typeof value !== 'string') || result.length > max || result.includes('\0') || (required && !result)) {
    fail(400, `Champ invalide · ${label}.`)
  }
  return result
}

export async function readProjectTimeHistory(db: PortalDatabase): Promise<PortalTimeSession[]> {
  return db.prepare(`${sessions} WHERE t.stopped_at IS NOT NULL ORDER BY t.stopped_at DESC,t.id`).all()
}

export async function projectTimeHistoryRevision(db: PortalDatabase): Promise<string> {
  const row = await db.prepare("SELECT value FROM portal_settings WHERE key='time-session-history-revision'").get()
  return row?.value ?? ''
}

async function changeHistoryRevision(db: PortalDatabase) {
  await db.prepare(`INSERT INTO portal_settings(key,value) VALUES('time-session-history-revision',?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(randomUUID())
}

export async function readClockifySnapshot(db: PortalDatabase): Promise<PortalClockifySnapshot> {
  return db.transaction(async tx => {
    if (tx.dialect === 'postgres') await tx.prepare('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY').run()
    const clients = await tx.prepare('SELECT id,name FROM organizations ORDER BY name,id').all()
    const projects = await tx.prepare('SELECT id,name,organization_id AS organizationId FROM projects ORDER BY name,id').all()
    const timeSessions = await readProjectTimeHistory(tx)
    const historyRevision = await projectTimeHistoryRevision(tx)
    return { clients, projects, timeSessions, historyRevision }
  })
}

export async function projectTimerStatus(db: PortalDatabase, actor: string) {
  const status = await db.prepare(`SELECT t.*, (SELECT id FROM portal_finance_time_sessions WHERE stopped_at IS NOT NULL
    ORDER BY stopped_at DESC,id LIMIT 1) AS lastStoppedSessionId
    FROM (SELECT 1 AS anchor) seed LEFT JOIN (${sessions} WHERE t.actor_id=? AND t.stopped_at IS NULL) t ON 1=1`).get(actor)
  const { lastStoppedSessionId, ...session } = status
  return { active: session.id ? session as PortalTimeSession : null, lastStoppedSessionId,
    historyRevision: await projectTimeHistoryRevision(db), serverNow: new Date().toISOString() }
}

function timestamp(value: unknown, label: string) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    fail(400, `Date invalide · ${label}.`)
  }
  const milliseconds = Date.parse(value)
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== value) fail(400, `Date invalide · ${label}.`)
  return value
}

async function saveTimeSession(db: PortalDatabase, input: Record<string, unknown>, actor: string) {
  const id = input.id == null ? null : field(input.id, 'session', 100, true)
  const projectId = input.projectId === null && id ? null : field(input.projectId, 'projet', 100, true)
  const description = field(input.description, 'description', 160)
  const startedAt = timestamp(input.startedAt, 'début')
  const stoppedAt = timestamp(input.stoppedAt, 'fin')
  if (stoppedAt < startedAt) fail(400, 'La fin doit être postérieure ou égale au début.')
  if (Date.parse(stoppedAt) > Date.now()) fail(400, 'La session doit se terminer dans le passé.')
  const durationSeconds = Math.floor((Date.parse(stoppedAt) - Date.parse(startedAt)) / 1000)
  if (durationSeconds > 2_147_483_647) fail(400, 'La durée de la session est trop longue.')
  const sessionId = id ?? `manual:${field(input.requestId, 'clé de saisie', 80, true)}`
  return db.transaction(async tx => {
    const project = projectId ? await tx.prepare(`SELECT name FROM projects WHERE id=?${tx.dialect === 'postgres' ? ' FOR KEY SHARE' : ''}`).get(projectId) : null
    if (projectId && !project) fail(404, 'Projet introuvable.')
    if (id) {
      const current = await tx.prepare(`SELECT project_id AS projectId,description,started_at AS startedAt,stopped_at AS stoppedAt,
        duration_seconds AS durationSeconds FROM portal_finance_time_sessions WHERE id=?${tx.dialect === 'postgres' ? ' FOR UPDATE' : ''}`).get(id)
      if (!current) fail(404, 'Session introuvable.')
      if (!current.stoppedAt) fail(409, 'Arrêtez le chronomètre avant de modifier la session.')
      const expected = input.expected as Record<string, unknown> | undefined
      if (!expected || typeof expected !== 'object' || Array.isArray(expected)) fail(400, 'La version initiale de la session est requise.')
      if (Object.keys(current).some(key => current[key] !== expected[key])) {
        fail(409, 'Cette session a été modifiée. Fermez le formulaire et actualisez la liste avant de réessayer.')
      }
      if (!projectId && current.projectId !== null) fail(400, 'Sélectionnez un projet.')
      await tx.prepare(`UPDATE portal_finance_time_sessions SET project_id=?,project_name=COALESCE(?,project_name),
        description=?,started_at=?,stopped_at=?,duration_seconds=? WHERE id=?`)
        .run(projectId, project?.name ?? null, description, startedAt, stoppedAt, durationSeconds, id)
    } else {
      const inserted = await tx.prepare(`INSERT INTO portal_finance_time_sessions
        (id,project_id,project_name,actor_id,description,started_at,stopped_at,duration_seconds) VALUES(?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO NOTHING`).run(sessionId, projectId, project.name, actor, description, startedAt, stoppedAt, durationSeconds)
      if (!inserted.changes) {
        const existing = await tx.prepare(`SELECT actor_id AS actorId,project_id AS projectId,description,started_at AS startedAt,
          stopped_at AS stoppedAt FROM portal_finance_time_sessions WHERE id=?`).get(sessionId)
        if (existing.actorId !== actor || existing.projectId !== projectId || existing.description !== description
          || existing.startedAt !== startedAt || existing.stoppedAt !== stoppedAt) fail(409, 'Cette clé de saisie est déjà utilisée.')
        return { session: await tx.prepare(`${sessions} WHERE t.id=?`).get(sessionId), serverNow: new Date().toISOString() }
      }
    }
    await changeHistoryRevision(tx)
    return { session: await tx.prepare(`${sessions} WHERE t.id=?`).get(sessionId), serverNow: new Date().toISOString() }
  })
}

export async function projectTimerMutation(db: PortalDatabase, value: unknown, actor: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Données du chronomètre invalides.')
  const { action, projectId: projectValue, description: descriptionValue, id: idValue } = value as Record<string, unknown>

  if (action === 'saveSession') return saveTimeSession(db, value as Record<string, unknown>, actor)

  if (action === 'start') {
    const projectId = field(projectValue, 'projet', 100, true)
    const description = field(descriptionValue, 'description', 160)
    const id = randomUUID()
    const session = await db.transaction<PortalTimeSession>(async tx => {
      const project = await tx.prepare(`SELECT name FROM projects WHERE id=?${tx.dialect === 'postgres' ? ' FOR KEY SHARE' : ''}`).get(projectId)
      if (!project) fail(404, 'Projet introuvable.')
      const startedAt = new Date().toISOString()
      const result = await tx.prepare(`INSERT INTO portal_finance_time_sessions (id,project_id,project_name,actor_id,description,started_at)
        VALUES (?,?,?,?,?,?) ON CONFLICT (actor_id) WHERE stopped_at IS NULL DO NOTHING`)
        .run(id, projectId, project.name, actor, description, startedAt)
      if (!result.changes) fail(409, 'Un chronomètre est déjà en cours.')
      return tx.prepare(`${sessions} WHERE t.id=?`).get(id)
    })
    return { session, serverNow: new Date().toISOString() }
  }

  if (action === 'stop') {
    const id = field(idValue, 'chronomètre', 100, true)
    const session = await db.transaction<PortalTimeSession>(async tx => {
      const current = await tx.prepare(`SELECT started_at AS startedAt,stopped_at AS stoppedAt
        FROM portal_finance_time_sessions WHERE id=? AND actor_id=?${tx.dialect === 'postgres' ? ' FOR UPDATE' : ''}`).get(id, actor)
      if (!current) fail(404, 'Chronomètre introuvable.')
      if (!current.stoppedAt) {
        const start = Date.parse(current.startedAt)
        const stop = Math.max(Date.now(), start)
        await tx.prepare('UPDATE portal_finance_time_sessions SET stopped_at=?,duration_seconds=? WHERE id=?')
          .run(new Date(stop).toISOString(), Math.floor((stop - start) / 1000), id)
        await changeHistoryRevision(tx)
      }
      return tx.prepare(`${sessions} WHERE t.id=?`).get(id)
    })
    return { session, serverNow: new Date().toISOString() }
  }

  return fail(400, 'Action du chronomètre inconnue.')
}
