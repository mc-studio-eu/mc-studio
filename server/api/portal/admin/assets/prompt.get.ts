import { requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async event => {
  await requirePortalUser(event, 'admin')
  const projectId = String(getQuery(event).projectId || '').trim()
  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Sélectionnez un projet.' })
  const row = await (await portalDb()).prepare('SELECT prompt,updated_at AS updatedAt FROM portal_project_prompts WHERE project_id=?').get(projectId)
  return { prompt: row?.prompt || '', updatedAt: row?.updatedAt || null }
})
