import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { accessibleProject } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  const user = await requirePortalUser(event)
  const db = await portalDb()
  const row = await db.prepare('SELECT id,project_id AS projectId,mime_type AS mimeType,file_data AS fileData,file_name AS fileName FROM portal_assets WHERE id=?').get(getRouterParam(event, 'id') || '')
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Image introuvable.' })
  await accessibleProject(event, row.projectId)
  setResponseHeaders(event, { 'Content-Type': row.mimeType, 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(row.fileName).replace(/'/g, '%27')}`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' })
  return Buffer.from(row.fileData, 'base64')
})
