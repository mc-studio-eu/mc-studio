import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser, requireContributor } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
import { requestBody, requestText } from '../../../utils/portal-requests'
import { lockProject } from '../../../utils/portal-workflow'
import { notifyProject, notifyProjectAdmins, deliverNotifications } from '../../../utils/portal-notifications'

export default defineEventHandler(async event => {
 assertSameOrigin(event)
 requireContributor(await requirePortalUser(event))
 const body = requestBody(await readBody(event), ['projectId', 'title', 'body'])
 const projectId = requestText(body.projectId, 200, 'Projet'), title = requestText(body.title, 160, 'Titre'), description = requestText(body.body, 10000, 'Description')
 const { db } = await accessibleProject(event, projectId)
 const id = randomUUID()
 await db.transaction(async () => {
  await lockProject(db, projectId)
  const { project, user } = await accessibleProject(event, projectId)
  requireContributor(user)
  const now = new Date().toISOString()
  await db.prepare('INSERT INTO portal_requests(id,project_id,title,body,status,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run(id, project.id, title, description, 'open', user.id, now, now)
  await recordActivity(project.id, `${user.name} a créé la demande « ${title} ».`)
  if (user.role === 'admin') await notifyProject(project.id, 'request_created', `Nouvelle demande : ${title}`, `${user.name} a créé une demande.`, user.id, `request_created:${id}`)
  else await notifyProjectAdmins(project.id, 'request_created', `Nouvelle demande : ${title}`, `${user.name} a créé une demande.`, user.id, `request_created:${id}`)
 })
 await deliverNotifications(event)
 return { id }
})
