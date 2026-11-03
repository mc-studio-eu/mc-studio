import { signPortalDownload } from '../../../utils/portal-object-store'
import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { accessibleProject } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  const user = await requirePortalUser(event)
  const db = await portalDb()
  const row = await db.prepare('SELECT a.id,a.project_id AS projectId,a.mime_type AS mimeType,a.file_data AS fileData,a.file_name AS fileName,o.object_key AS objectKey FROM portal_assets a LEFT JOIN portal_objects o ON o.asset_id=a.id WHERE a.id=?').get(getRouterParam(event, 'id') || '')
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Image introuvable.' })
  await accessibleProject(event, row.projectId)
  setHeader(event,'Cache-Control','private, no-store')
  setHeader(event,'Referrer-Policy','no-referrer')
  if (row.objectKey) return sendRedirect(event,await signPortalDownload(row.objectKey,row.fileName,row.mimeType,true),302)
  setResponseHeaders(event, { 'Content-Type': row.mimeType, 'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(row.fileName).replace(/'/g, '%27')}`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' })
  return Buffer.from(row.fileData, 'base64')
})
