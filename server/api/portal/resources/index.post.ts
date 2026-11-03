import { notifyProject, deliverNotifications } from '../../../utils/portal-notifications'
import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject, resourceInput, recordActivity } from '../../../utils/portal-resources'
export default defineEventHandler(async event => {
 assertSameOrigin(event)
 const user = await requirePortalUser(event, 'admin')
 const body = await readBody(event)
 const { db, project } = await accessibleProject(event, String(body.projectId || ''))
 const r = resourceInput(body), id = randomUUID()
 await db.transaction(async () => {
  await db.prepare('INSERT INTO resources(id,project_id,kind,title,description,url,content,amount,status,due_date,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
   .run(id, body.global === true && r.kind === 'wiki' ? null : project.id, r.kind, r.title, r.description, r.url, r.content, r.amount, r.status, r.dueDate, user.id)
  if(r.kind==='mockup')await notifyProject(project.id,'mockup',`Nouvelle maquette : ${r.title}`,r.description,user.id,`mockup:${id}`)
  await recordActivity(project.id, `MC Studio a partagé : ${r.title}`)
 })
 await deliverNotifications(event)
 return { id }
})
