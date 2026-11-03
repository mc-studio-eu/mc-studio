import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);const user=await requirePortalUser(event),body=await readBody(event),db=await portalDb()
 if(body.all===true)await db.prepare('UPDATE portal_notifications SET read_at=? WHERE user_id=? AND read_at IS NULL').run(new Date().toISOString(),user.id)
 else if(typeof body.id==='string')await db.prepare('UPDATE portal_notifications SET read_at=? WHERE id=? AND user_id=? AND read_at IS NULL').run(new Date().toISOString(),body.id,user.id)
 else throw createError({statusCode:400,statusMessage:'Notification requise.'})
 return {ok:true}
})
