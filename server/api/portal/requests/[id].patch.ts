import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser, requireContributor } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { lockedRequest, requestBody, canChangeRequestStatus } from '../../../utils/portal-requests'
import { recordActivity } from '../../../utils/portal-resources'
import { notifyProject, notifyProjectAdmins, deliverNotifications } from '../../../utils/portal-notifications'

export default defineEventHandler(async event => {
 assertSameOrigin(event)
 requireContributor(await requirePortalUser(event))
 const body = requestBody(await readBody(event), ['status']), status = body.status
 if (status !== 'open' && status !== 'resolved') throw createError({ statusCode: 400, statusMessage: 'Statut invalide.' })
 const db = await portalDb()
 await db.transaction(async () => {
  const { request, project, user } = await lockedRequest(event, getRouterParam(event, 'id') || '')
  if (!canChangeRequestStatus(user, request)) throw createError({ statusCode: 403, statusMessage: 'Seuls l’auteur de la demande et MC Studio peuvent modifier son statut.' })
  if (request.status === status) return
  const id = randomUUID(), now = new Date().toISOString(), action = status === 'resolved' ? 'résolu' : 'rouvert'
  await db.prepare('UPDATE portal_requests SET status=?,updated_at=?,resolved_by=?,resolved_at=? WHERE id=?').run(status, now, status === 'resolved' ? user.id : null, status === 'resolved' ? now : null, request.id)
  await db.prepare('INSERT INTO portal_request_messages(id,request_id,body,author_id,created_at,type,status) VALUES(?,?,?,?,?,?,?)').run(id, request.id, `${user.name} a ${action} la demande.`, user.id, now, 'status', status)
  await recordActivity(project.id, `${user.name} a ${action} la demande « ${request.title} ».`)
  await notifyProject(project.id, 'request_status', `Demande ${status === 'resolved' ? 'résolue' : 'rouverte'} : ${request.title}`, `${user.name} a ${action} la demande.`, user.id, `request_status:${id}`)
  if (user.role !== 'admin') await notifyProjectAdmins(project.id, 'request_status', `Demande ${status === 'resolved' ? 'résolue' : 'rouverte'} : ${request.title}`, `${user.name} a ${action} la demande.`, user.id, `request_status:${id}`)
 })
 await deliverNotifications(event)
 return { ok: true }
})
