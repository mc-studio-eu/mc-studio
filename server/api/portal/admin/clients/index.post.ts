import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const body = await readBody<{ name?: unknown; project?: unknown; description?: unknown; dueDate?: unknown }>(event)
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const project = typeof body.project === 'string' ? body.project.trim().slice(0, 160) : ''
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 1500) : ''
  const dueDate = typeof body.dueDate === 'string' ? body.dueDate.trim().slice(0, 40) : ''
  if (name.length < 2 || project.length < 2) throw createError({ statusCode: 400, statusMessage: 'Le nom du client et du projet sont obligatoires.' })
  const orgId = randomUUID(), projectId = randomUUID(), db = await portalDb()
  await db.transaction(async () => {
  await db.prepare('INSERT INTO organizations(id,name) VALUES(?,?)').run(orgId, name)
  await db.prepare('INSERT INTO projects(id,organization_id,name,description,due_date,current_phase) VALUES(?,?,?,?,?,?)')
    .run(projectId, orgId, project, description, dueDate, 'Cadrage')
  })
  return { client: { id: orgId, name, projectId, project, status: 'En cours', progress: 0, dueDate, contact: 'Invitation en attente' } }
})
