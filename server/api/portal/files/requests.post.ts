import { validateResponsible, workflowDate } from '../../../utils/portal-workflow'
import { notifyProject, deliverNotifications } from '../../../utils/portal-notifications'
import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const body = await readBody(event)
  const projectId = typeof body.projectId === 'string' ? body.projectId : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Projet requis.' })
  if (!title || title.length > 160) throw createError({ statusCode: 400, statusMessage: 'Indiquez ce que le client doit envoyer (160 caractères maximum).' })
  if (description.length > 1000) throw createError({ statusCode: 400, statusMessage: 'La consigne ne peut pas dépasser 1 000 caractères.' })
  const { db, project } = await accessibleProject(event, projectId)
  const id = randomUUID()
  const responsibleId=await validateResponsible(db,project.organization_id,body.responsibleId),dueDate=workflowDate(body.dueDate)
  await db.transaction(async()=>{
  await db.prepare('INSERT INTO portal_file_requests(id,project_id,title,description,created_by) VALUES(?,?,?,?,?)').run(id, project.id, title, description, user.id)
  await recordActivity(project.id, `MC Studio a demandé au client : ${title}`)
  await db.prepare('INSERT INTO portal_file_request_assignments(request_id,responsible_id,due_date) VALUES(?,?,?)').run(id,responsibleId,dueDate)
  await notifyProject(project.id,'file_request',`Fichier attendu : ${title}`,description,user.id,`file_request:${id}`,responsibleId||undefined)
  })
  await deliverNotifications(event)
  return { id }
})
