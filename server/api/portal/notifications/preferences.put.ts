import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);const user=await requirePortalUser(event),body=await readBody(event),db=await portalDb()
 if(typeof body.inApp!=='boolean'||typeof body.email!=='boolean'||!Number.isInteger(body.reminderDays)||body.reminderDays<0||body.reminderDays>30)throw createError({statusCode:400,statusMessage:'Préférences invalides.'})
 await db.prepare('INSERT INTO portal_notification_preferences(user_id,in_app,email,reminder_days) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET in_app=excluded.in_app,email=excluded.email,reminder_days=excluded.reminder_days').run(user.id,body.inApp?1:0,body.email?1:0,body.reminderDays)
 if(!body.email)await db.prepare("UPDATE portal_notifications SET email_status='disabled' WHERE user_id=? AND email_status='pending'").run(user.id)
 return {ok:true}
})
