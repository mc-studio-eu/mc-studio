import { randomUUID } from 'node:crypto'
import { assertSameOrigin,requirePortalUser } from '../../../../utils/portal-auth'
import { growthDb,growthInput } from '../../../../utils/portal-growth'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);await requirePortalUser(event,'admin')
 const body=await readBody(event),input=growthInput(body),db=await growthDb()
 const id=typeof body.id==='string'&&body.id?body.id:randomUUID()
 if(body.id&&!await db.prepare('SELECT id FROM growth_sites WHERE id=?').get(id))throw createError({statusCode:404,statusMessage:'Site introuvable.'})
 await db.prepare(`INSERT INTO growth_sites(id,name,origin,ga4_property,search_property,ahrefs_url,plausible_url,clarity_url,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,origin=excluded.origin,ga4_property=excluded.ga4_property,search_property=excluded.search_property,ahrefs_url=excluded.ahrefs_url,plausible_url=excluded.plausible_url,clarity_url=excluded.clarity_url,updated_at=excluded.updated_at`).run(id,input.name,input.origin,input.ga4,input.search,...input.urls,new Date().toISOString())
 return {id}
})
