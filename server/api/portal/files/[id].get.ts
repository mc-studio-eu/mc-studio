import { signPortalDownload } from '../../../utils/portal-object-store'
import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
export default defineEventHandler(async event => {
 const user = await requirePortalUser(event)
 const db = await portalDb()
 const row = await db.prepare(`SELECT r.file_data,r.file_name,p.organization_id,o.object_key FROM resources r JOIN projects p ON p.id=r.project_id LEFT JOIN portal_objects o ON o.resource_id=r.id WHERE r.id=? AND r.archived=0 AND r.file_size>0`).get(getRouterParam(event,'id') || '')
 if (!row || (user.role !== 'admin' && user.organizationId !== row.organization_id)) throw createError({ statusCode:404,statusMessage:'Fichier introuvable.' })
 setHeader(event,'Cache-Control','private, no-store')
 setHeader(event,'Referrer-Policy','no-referrer')
 if (row.object_key) return sendRedirect(event,await signPortalDownload(db,row.object_key,row.file_name,'application/octet-stream'),302)
 setHeader(event,'Content-Type','application/octet-stream')
 setHeader(event,'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(row.file_name).replace(/'/g,'%27')}`)
 setHeader(event,'X-Content-Type-Options','nosniff')
 setHeader(event,'Cache-Control','private, no-store')
 return Buffer.from(row.file_data,'base64')
})
