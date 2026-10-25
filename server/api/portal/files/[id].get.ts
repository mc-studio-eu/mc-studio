import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
export default defineEventHandler(async event => {
 const user = await requirePortalUser(event)
 const row = await (await portalDb()).prepare(`SELECT r.file_data,r.file_name,p.organization_id FROM resources r JOIN projects p ON p.id=r.project_id WHERE r.id=? AND r.archived=0 AND r.file_size>0`).get(getRouterParam(event,'id') || '')
 if (!row || (user.role !== 'admin' && user.organizationId !== row.organization_id)) throw createError({ statusCode:404,statusMessage:'Fichier introuvable.' })
 setHeader(event,'Content-Type','application/octet-stream')
 setHeader(event,'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(row.file_name).replace(/'/g,'%27')}`)
 setHeader(event,'X-Content-Type-Options','nosniff')
 setHeader(event,'Cache-Control','private, no-store')
 return Buffer.from(row.file_data,'base64')
})
