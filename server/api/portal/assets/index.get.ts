import { accessibleProject } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  const { db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
  const assets = await db.prepare(`SELECT id,project_id AS projectId,title,description,category,file_name AS fileName,mime_type AS mimeType,file_size AS fileSize,created_at AS createdAt FROM portal_assets WHERE project_id=? ORDER BY created_at DESC,id`).all(project.id)
  const setting = await db.prepare("SELECT value FROM portal_settings WHERE key='global_image_prompt'").get()
  return { assets, prompt: setting?.value || '' }
})
