import { signPortalDownload } from '../../../utils/portal-object-store'
import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { portalFileRange } from '../../../utils/portal-file-range'
import { portalFilePreview } from '#shared/portal-file-preview'

export default defineEventHandler(async event => {
 const user = await requirePortalUser(event)
 const db = await portalDb()
 const row = await db.prepare(`SELECT r.kind,r.file_data,r.file_name,p.organization_id,o.object_key FROM resources r JOIN projects p ON p.id=r.project_id LEFT JOIN portal_objects o ON o.resource_id=r.id WHERE r.id=? AND r.archived=0 AND r.file_size>0`).get(getRouterParam(event,'id') || '')
 if (!row || (user.role !== 'admin' && user.organizationId !== row.organization_id)) throw createError({ statusCode:404,statusMessage:'Fichier introuvable.' })

 const inline = getQuery(event).preview === '1'
 const preview = inline && row.kind === 'file' ? portalFilePreview(row.file_name) : undefined
 if (inline && !preview) throw createError({ statusCode: 415, message: 'Ce format ne peut pas être prévisualisé.' })
 const mime = preview?.mime ?? 'application/octet-stream'
 setResponseHeaders(event, {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
 })
 if (row.object_key) return sendRedirect(event, await signPortalDownload(db, row.object_key, row.file_name, mime, inline), 302)

 const contents = Buffer.from(row.file_data, 'base64')
 if (preview?.kind === 'pdf' && !/^(?:\uFEFF)?[\t\n\r\f ]*%PDF-\d\.\d/.test(contents.subarray(0, 1024).toString('utf8'))) {
  throw createError({ statusCode: 415, message: 'Le fichier ne contient pas de document PDF lisible.' })
 }
 setResponseHeaders(event, {
  'Content-Type': mime,
  'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(row.file_name).replace(/'/g, '%27')}`,
 })
 if (!inline) return contents

 setResponseHeaders(event, {
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
  'Accept-Ranges': 'bytes',
 })
 const range = portalFileRange(getHeader(event, 'range'), contents.length)
 if (range === null) {
  setHeader(event, 'Content-Range', `bytes */${contents.length}`)
  setResponseStatus(event, 416)
  return Buffer.alloc(0)
 }
 if (range) {
  setHeader(event, 'Content-Range', `bytes ${range.start}-${range.end}/${contents.length}`)
  setResponseStatus(event, 206)
  return contents.subarray(range.start, range.end + 1)
 }
 return contents
})
