import { randomUUID } from 'node:crypto'
import { portalDb } from './portal-db'

export function portalBaseUrl(event:any) {
 const configured=String(useRuntimeConfig(event).public.siteUrl||'')
 if(process.env.NODE_ENV==='production' && !configured)throw createError({statusCode:503,statusMessage:'URL du portail non configurée.'})
 const url=new URL(configured||getRequestURL(event).origin)
 if(process.env.NODE_ENV==='production' && url.protocol!=='https:')throw createError({statusCode:503,statusMessage:'URL HTTPS requise.'})
 return url.origin
}
export async function sendPortalEmail(event:any,to:string,subject:string,text:string,idempotencyKey?:string) {
 if(['1','true'].includes(process.env.PORTAL_EMAIL_DISABLED||''))return 'disabled'
 const config=useRuntimeConfig(event),apiKey=String(config.resendApiKey||'')
 if(!apiKey)return 'disabled'
 try {
  await $fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,...(idempotencyKey?{'Idempotency-Key':idempotencyKey}:{})},body:{from:String(config.contactFrom||'MC Studio <contact@mc-studio.eu>'),to:[to],subject,text}})
  return 'sent'
 }catch{console.error('Portal email delivery failed');return 'failed'}
}
export async function notificationPreferences(userId:string) {
 const row=await (await portalDb()).prepare('SELECT in_app AS inApp,email,reminder_days AS reminderDays FROM portal_notification_preferences WHERE user_id=?').get(userId)
 return {inApp:row?Boolean(row.inApp):true,email:row?Boolean(row.email):true,reminderDays:row?Number(row.reminderDays):3}
}
// Persistent queue commits with the originating mutation. Network delivery happens separately.
export async function notifyProject(projectId:string,kind:string,title:string,body='',excludeUserId?:string,dedupePrefix?:string,onlyUserId?:string) {
 const db=await portalDb()
 const users=await db.prepare(`SELECT u.id,COALESCE(p.in_app,1) AS inApp,COALESCE(p.email,1) AS email FROM users u JOIN projects project ON project.organization_id=u.organization_id LEFT JOIN portal_members m ON m.user_id=u.id LEFT JOIN portal_notification_preferences p ON p.user_id=u.id WHERE project.id=? AND u.role='client' AND COALESCE(m.suspended,0)=0`).all(projectId)
 for(const user of users) {
  if(user.id===excludeUserId || (onlyUserId && user.id!==onlyUserId))continue
  if(!user.inApp && !user.email)continue
  await db.prepare('INSERT INTO portal_notifications(id,user_id,project_id,kind,title,body,created_at,visible,email_status,dedupe_key) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(dedupe_key) DO NOTHING').run(randomUUID(),user.id,projectId,kind,title,body,new Date().toISOString(),user.inApp?1:0,user.email?'pending':'disabled',dedupePrefix?`${dedupePrefix}:${user.id}`:null)
 }
}
export async function flushNotificationEmails(event:any) {
 const db=await portalDb()
 const baseUrl=portalBaseUrl(event), stale=`sending:${Date.now()-10*60000}`, failed=`failed:${Date.now()-5*60000}`
 const queued=await db.prepare(`SELECT n.id,n.title,n.body,u.email,n.project_id,n.email_status FROM portal_notifications n JOIN users u ON u.id=n.user_id LEFT JOIN portal_members m ON m.user_id=u.id LEFT JOIN portal_notification_preferences p ON p.user_id=u.id WHERE (n.email_status IN ('pending','failed') OR (n.email_status LIKE 'sending:%' AND n.email_status<?) OR (n.email_status LIKE 'failed:%' AND n.email_status<?)) AND COALESCE(m.suspended,0)=0 AND COALESCE(p.email,1)=1 ORDER BY n.created_at LIMIT 100`).all(stale,failed)
 let sent=0
 for(const notification of queued) {
  // Claim before external I/O: concurrent workers never send the same notification twice.
  const claim=`sending:${Date.now()}`
  const claimed=await db.prepare('UPDATE portal_notifications SET email_status=? WHERE id=? AND email_status=?').run(claim,notification.id,notification.email_status)
  if(!claimed.changes)continue
  const state=await sendPortalEmail(event,notification.email,`${notification.title} · MC Studio`,`${notification.body}\n\n${baseUrl}/portal?projectId=${encodeURIComponent(notification.project_id)}`,`portal-notification-${notification.id}`)
  await db.prepare('UPDATE portal_notifications SET email_status=? WHERE id=?').run(state==='failed'?`failed:${Date.now()}`:state,notification.id)
  if(state==='sent')sent++
 }
 return {processed:queued.length,sent}
}

export async function deliverNotifications(event:any) {
 try { return await flushNotificationEmails(event) }
 catch { console.error('Portal notification dispatch deferred'); return {processed:0,sent:0} }
}
