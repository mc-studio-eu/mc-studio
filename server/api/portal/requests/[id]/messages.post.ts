import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser, requireContributor } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
import { lockedRequest, requestBody, requestText } from '../../../../utils/portal-requests'
import { recordActivity } from '../../../../utils/portal-resources'
import { notifyProject, notifyProjectAdmins, deliverNotifications } from '../../../../utils/portal-notifications'

export default defineEventHandler(async event => {
 assertSameOrigin(event)
 requireContributor(await requirePortalUser(event))
 const body = requestBody(await readBody(event), ['body'])
 const text = requestText(body.body, 10000, 'Réponse'), id = randomUUID(), db = await portalDb()
 await db.transaction(async () => {
  const { request, project, user } = await lockedRequest(event, getRouterParam(event, 'id') || '')
  const now = new Date().toISOString()
  await db.prepare('INSERT INTO portal_request_messages(id,request_id,body,author_id,created_at,type) VALUES(?,?,?,?,?,?)').run(id, request.id, text, user.id, now, 'reply')
  await db.prepare('UPDATE portal_requests SET updated_at=? WHERE id=?').run(now, request.id)
  await recordActivity(project.id, `${user.name} a répondu à la demande « ${request.title} ».`)
  if (user.role === 'admin') await notifyProject(project.id, 'request_reply', `Réponse à votre demande : ${request.title}`, `${user.name} a ajouté une réponse.`, user.id, `request_reply:${id}`)
  else await notifyProjectAdmins(project.id, 'request_reply', `Réponse à la demande : ${request.title}`, `${user.name} a ajouté une réponse.`, user.id, `request_reply:${id}`)
 })
 await deliverNotifications(event)
 return { id }
})
