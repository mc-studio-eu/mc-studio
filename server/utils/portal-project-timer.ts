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

export async function readClockifySnapshot(db: PortalDatabase): Promise<PortalClockifySnapshot> {
  return db.transaction(async tx => {
    if (tx.dialect === 'postgres') await tx.prepare('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY').run()
    const clients = await tx.prepare('SELECT id,name FROM organizations ORDER BY name,id').all()
    const projects = await tx.prepare('SELECT id,name,organization_id AS organizationId FROM projects ORDER BY name,id').all()
    const timeSessions = await readProjectTimeHistory(tx)
    return { clients, projects, timeSessions }
  })
}

export async function projectTimerStatus(db: PortalDatabase, actor: string) {
  const status = await db.prepare(`SELECT t.*, (SELECT id FROM portal_finance_time_sessions WHERE stopped_at IS NOT NULL
    ORDER BY stopped_at DESC,id LIMIT 1) AS lastStoppedSessionId
    FROM (SELECT 1 AS anchor) seed LEFT JOIN (${sessions} WHERE t.actor_id=? AND t.stopped_at IS NULL) t ON 1=1`).get(actor)
  const { lastStoppedSessionId, ...session } = status
  return { active: session.id ? session as PortalTimeSession : null, lastStoppedSessionId, serverNow: new Date().toISOString() }
}

export async function projectTimerMutation(db: PortalDatabase, value: unknown, actor: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Données du chronomètre invalides.')
  const { action, projectId: projectValue, description: descriptionValue, id: idValue } = value as Record<string, unknown>

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
      }
      return tx.prepare(`${sessions} WHERE t.id=?`).get(id)
    })
    return { session, serverNow: new Date().toISOString() }
  }

  return fail(400, 'Action du chronomètre inconnue.')
}
