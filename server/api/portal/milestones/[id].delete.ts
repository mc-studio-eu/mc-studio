import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { recordActivity } from '../../../utils/portal-resources'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);await requirePortalUser(event,'admin');const db=await portalDb(),id=getRouterParam(event,'id')||''
 await db.transaction(async()=>{
  const row=await db.prepare('SELECT * FROM portal_milestones WHERE id=?').get(id)
  if(!row)throw createError({statusCode:404,statusMessage:'Jalon introuvable.'})
  await db.prepare('DELETE FROM portal_milestones WHERE id=?').run(id)
  await recordActivity(row.project_id,`Suppression du jalon : ${row.title}.`)
 })
 return {ok:true}
})
