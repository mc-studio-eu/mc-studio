import { accessibleProject } from '../../../utils/portal-resources'
export default defineEventHandler(async event => {
  const { db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
  const row = await db.prepare('SELECT prompt,updated_at AS updatedAt FROM portal_project_prompts WHERE project_id=?').get(project.id)
  return { prompt: row?.prompt || '', updatedAt: row?.updatedAt || null }
})
