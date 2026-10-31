import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const body = await readBody(event)
  const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : ''
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Sélectionnez un projet.' })
  if (prompt.length > 12000) throw createError({ statusCode: 400, statusMessage: 'Le prompt ne peut pas dépasser 12 000 caractères.' })
  const db = await portalDb()
  const project = await db.prepare('SELECT id FROM projects WHERE id=?').get(projectId)
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable.' })
  await db.prepare('INSERT INTO portal_project_prompts(project_id,prompt,updated_by,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(project_id) DO UPDATE SET prompt=excluded.prompt,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP').run(projectId, prompt, user.id)
  return { ok: true }
})
