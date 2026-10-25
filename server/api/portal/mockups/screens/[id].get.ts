import { portalDb } from '../../../../utils/portal-db'
import { accessibleProject } from '../../../../utils/portal-resources'
import { requirePortalUser } from '../../../../utils/portal-auth'
export default defineEventHandler(async event=>{
 await requirePortalUser(event)
 const db=await portalDb()
 const screen=await db.prepare(`SELECT s.id,r.project_id AS projectId FROM mockup_screens s JOIN mockup_versions v ON v.id=s.version_id JOIN resources r ON r.id=v.resource_id WHERE s.id=? AND r.archived=0`).get(getRouterParam(event,'id')||'')
 if(!screen)throw createError({statusCode:404,statusMessage:'Écran introuvable.'})
 await accessibleProject(event,screen.projectId)
 const row=await db.prepare('SELECT image_data FROM mockup_screens WHERE id=?').get(screen.id)
 setResponseHeaders(event,{'Content-Type':'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'})
 return Buffer.from(row.image_data,'base64')
})
