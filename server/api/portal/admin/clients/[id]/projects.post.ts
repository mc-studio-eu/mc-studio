import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../../../utils/portal-auth'
import { workflowDate } from '../../../../../utils/portal-workflow'
import { portalDb } from '../../../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const organizationId = getRouterParam(event, 'id') || ''
  const body = await readBody<{ name?: unknown; description?: unknown; status?: unknown; dueDate?: unknown }>(event)
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 160) : ''
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 1500) : ''
  const status = typeof body.status === 'string' ? body.status.trim().slice(0, 50) : 'En cours'
  const progress = 0
  const dueDate = workflowDate(body.dueDate)
  const currentPhase = ''
  if (!organizationId || name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Le nom du projet est obligatoire.' })
  if (!['À cadrer', 'En cours', 'En validation', 'En attente client', 'Terminé'].includes(status)) throw createError({ statusCode: 400, statusMessage: 'Statut de projet invalide.' })

  const db = await portalDb()
  const organization = await db.prepare('SELECT id FROM organizations WHERE id=?').get(organizationId)
  if (!organization) throw createError({ statusCode: 404, statusMessage: 'Client introuvable.' })
  const id = randomUUID()
  await db.prepare(`INSERT INTO projects(id,organization_id,name,description,status,progress,due_date,current_phase)
    VALUES(?,?,?,?,?,?,?,?)`).run(id, organizationId, name, description, status, progress, dueDate, currentPhase)
  return { project: { id, organizationId, name, description, status, progress, dueDate, currentPhase } }
})
