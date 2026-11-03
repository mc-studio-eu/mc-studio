import type { PortalUser } from './portal-auth'
import { requireContributor, requirePortalUser } from './portal-auth'
import { portalDb } from './portal-db'
import { accessibleProject } from './portal-resources'
import { lockProject } from './portal-workflow'

export const requestColumns = `r.id,r.project_id AS projectId,r.title,r.body,r.status,
 r.created_by AS authorId,author.name AS authorName,r.created_at AS createdAt,r.updated_at AS updatedAt,
 r.resolved_at AS resolvedAt,r.resolved_by AS resolvedById,resolver.name AS resolvedByName,
 (SELECT COUNT(*) FROM portal_request_messages m WHERE m.request_id=r.id AND m.type='reply') AS messageCount`
const requestJoins = 'FROM portal_requests r JOIN users author ON author.id=r.created_by LEFT JOIN users resolver ON resolver.id=r.resolved_by'

export function requestBody(value: unknown, allowed: string[]) {
 if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !allowed.includes(key))) {
  throw createError({ statusCode: 400, statusMessage: 'Demande invalide.' })
 }
 return value as Record<string, unknown>
}
export function requestText(value: unknown, max: number, label: string) {
 const text = typeof value === 'string' ? value.trim() : ''
 if (!text || text.length > max) throw createError({ statusCode: 400, statusMessage: `${label} requis (${max.toLocaleString('fr-FR')} caractères maximum).` })
 return text
}
export const canContributeRequest = (user: PortalUser) => user.role === 'admin' || user.memberRole !== 'viewer'
export const canChangeRequestStatus = (user: PortalUser, request: { authorId: string }) => canContributeRequest(user) && (user.role === 'admin' || request.authorId === user.id)

export async function requestsForProject(db: Awaited<ReturnType<typeof portalDb>>, projectId: string) {
 const rows = await db.prepare(`SELECT ${requestColumns} ${requestJoins} WHERE r.project_id=? ORDER BY CASE WHEN r.status='open' THEN 0 ELSE 1 END,r.updated_at DESC,r.id DESC`).all(projectId)
 return rows.map(row => ({ ...row, messageCount: Number(row.messageCount) }))
}
export async function accessibleRequest(event: any, id: string) {
 await requirePortalUser(event)
 const db = await portalDb()
 const row = await db.prepare('SELECT project_id FROM portal_requests WHERE id=?').get(id)
 if (!row) throw createError({ statusCode: 404, statusMessage: 'Demande introuvable.' })
 const access = await accessibleProject(event, row.project_id)
 const request = await db.prepare(`SELECT ${requestColumns} ${requestJoins} WHERE r.id=?`).get(id)
 if (!request) throw createError({ statusCode: 404, statusMessage: 'Demande introuvable.' })
 return { ...access, request: { ...request, messageCount: Number(request.messageCount) } }
}

// Project locks also serialize against member-role changes and suspension. Recheck
// the current session and role after acquiring the lock, inside the transaction.
export async function lockedRequest(event: any, id: string) {
 const initial = await accessibleRequest(event, id)
 await lockProject(initial.db, initial.project.id)
 const access = await accessibleRequest(event, id)
 requireContributor(access.user)
 return access
}

export async function requestMessages(db: Awaited<ReturnType<typeof portalDb>>, id: string) {
 return db.prepare(`SELECT m.id,m.body,m.author_id AS authorId,u.name AS authorName,u.role AS authorRole,
  m.created_at AS createdAt,m.type,m.status FROM portal_request_messages m JOIN users u ON u.id=m.author_id
  WHERE m.request_id=? ORDER BY m.created_at,m.id`).all(id)
}
