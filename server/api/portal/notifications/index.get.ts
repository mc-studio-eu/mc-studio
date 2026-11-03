import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { notificationPreferences } from '../../../utils/portal-notifications'
export default defineEventHandler(async event=>{
 const user=await requirePortalUser(event),db=await portalDb()
 const notifications=await db.prepare(`SELECT id,project_id AS projectId,kind,title,body,created_at AS createdAt,read_at AS readAt FROM portal_notifications WHERE user_id=? AND visible=1 ORDER BY created_at DESC,id DESC LIMIT 100`).all(user.id)
 const count=await db.prepare('SELECT COUNT(*) AS total FROM portal_notifications WHERE user_id=? AND visible=1 AND read_at IS NULL').get(user.id)
 return {notifications,unreadCount:Number(count.total),preferences:await notificationPreferences(user.id)}
})
