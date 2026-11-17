import { createHash, randomUUID } from 'node:crypto'
import type { PortalUser } from './portal-auth'
import { portalDb, type PortalDatabase } from './portal-db'
import { lockProject, projectTodos } from './portal-workflow'

export function portalBaseUrl(event:any) {
 const configured=String(useRuntimeConfig(event).public.siteUrl||'')
 if(process.env.NODE_ENV==='production' && !configured)throw createError({statusCode:503,statusMessage:'URL du portail non configurée.'})
 const url=new URL(configured||getRequestURL(event).origin)
 if(process.env.NODE_ENV==='production' && url.protocol!=='https:')throw createError({statusCode:503,statusMessage:'URL HTTPS requise.'})
 return url.origin
}
const portalEmailSender = (event:any) => String(useRuntimeConfig(event).contactFrom || 'MC Studio <contact@mc-studio.eu>')
export async function sendPortalEmail(event:any,to:string,subject:string,text:string,idempotencyKey?:string,timeout=10_000) {
 if(['1','true'].includes(process.env.PORTAL_EMAIL_DISABLED||''))return 'disabled'
 const config=useRuntimeConfig(event),apiKey=String(config.resendApiKey||'')
 if(!apiKey)return 'disabled'
 try {
  await $fetch('https://api.resend.com/emails',{method:'POST',timeout,retry:0,headers:{Authorization:`Bearer ${apiKey}`,...(idempotencyKey?{'Idempotency-Key':idempotencyKey}:{})},body:{from:portalEmailSender(event),to:[to],subject,text}})
  return 'sent'
 }catch(error:any){
  console.error('Portal email delivery failed')
  const status = Number(error?.response?.status)
  // An explicit rejection differs from a timeout or a delivery with an unknown outcome.
  return status >= 400 && status < 500 && ![408,409,429].includes(status) ? 'rejected' : 'failed'
 }
}
export async function notificationPreferences(userId:string) {
 const row=await (await portalDb()).prepare('SELECT in_app AS inApp,email,reminder_days AS reminderDays FROM portal_notification_preferences WHERE user_id=?').get(userId)
 return {inApp:row?Boolean(row.inApp):true,email:row?Boolean(row.email):true,reminderDays:row?Number(row.reminderDays):3}
}
// Persistent queue commits with the originating mutation. Network delivery happens separately.
export async function notifyProject(projectId:string,kind:string,title:string,body='',excludeUserId?:string,dedupePrefix?:string,onlyUserId?:string) {
 const db=await portalDb()
 const users=await db.prepare(`SELECT u.id,COALESCE(p.in_app,1) AS inApp,COALESCE(p.email,1) AS email FROM users u JOIN projects project ON project.organization_id=u.organization_id LEFT JOIN portal_members m ON m.user_id=u.id LEFT JOIN portal_notification_preferences p ON p.user_id=u.id WHERE project.id=? AND u.role='client' AND COALESCE(m.suspended,0)=0 ${onlyUserId ? 'AND u.id=?' : ''}`).all(...(onlyUserId ? [projectId,onlyUserId] : [projectId]))
 let inserted=0
 for(const user of users) {
  if(user.id===excludeUserId)continue
  if(!user.inApp && !user.email)continue
  const result=await db.prepare('INSERT INTO portal_notifications(id,user_id,project_id,kind,title,body,created_at,visible,email_status,dedupe_key) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(dedupe_key) DO NOTHING').run(randomUUID(),user.id,projectId,kind,title,body,new Date().toISOString(),user.inApp?1:0,user.email?'pending':'disabled',dedupePrefix?`${dedupePrefix}:${user.id}`:null)
  inserted+=result.changes
 }
 return inserted
}
// Administrator notifications share the same durable queue and preferences as
// client notifications; mutation handlers never perform external I/O in a transaction.
export async function notifyProjectAdmins(projectId:string,kind:string,title:string,body='',excludeUserId?:string,dedupePrefix?:string) {
 const db=await portalDb()
 const admins=await db.prepare(`SELECT u.id,COALESCE(p.in_app,1) AS inApp,COALESCE(p.email,1) AS email FROM users u LEFT JOIN portal_members m ON m.user_id=u.id LEFT JOIN portal_notification_preferences p ON p.user_id=u.id WHERE u.role='admin' AND COALESCE(m.suspended,0)=0`).all()
 for(const admin of admins) {
  if(admin.id===excludeUserId || (!admin.inApp && !admin.email))continue
  await db.prepare('INSERT INTO portal_notifications(id,user_id,project_id,kind,title,body,created_at,visible,email_status,dedupe_key) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(dedupe_key) DO NOTHING').run(randomUUID(),admin.id,projectId,kind,title,body,new Date().toISOString(),admin.inApp?1:0,admin.email?'pending':'disabled',dedupePrefix?`${dedupePrefix}:${admin.id}`:null)
 }
}
const operationKinds = "('reminder','roadmap_reminder','weekly_report')"
const canDispatch = `(n.kind NOT IN ${operationKinds} OR (
 NOT EXISTS (SELECT 1 FROM portal_operation_control c WHERE c.id=1 AND c.paused=1)
 AND NOT EXISTS (SELECT 1 FROM portal_operation_projects p WHERE p.project_id=n.project_id AND p.paused=1)
 AND NOT EXISTS (SELECT 1 FROM portal_operation_scenarios s
  WHERE s.id=CASE WHEN n.kind='weekly_report' THEN 'weekly_report' ELSE 'reminders' END AND s.paused=1)
))`

type QueuedEmail = {
 id:string; title:string; body:string; kind:string; email:string; role:string;
 project_id:string; email_status:string; created_at:string; dedupe_key:string | null; user_id:string
}
const isReminder = (kind:string) => kind === 'reminder' || kind === 'roadmap_reminder'
const isOperationEmail = (kind:string) => isReminder(kind) || kind === 'weekly_report'
const emailAttemptsLimit = 3
// The provider retains idempotency keys for 24 hours. Leave time for the final request.
const emailRetryWindow = 23 * 60 * 60 * 1000

async function claimOperationEmail(db: PortalDatabase, notification: QueuedEmail, claim: string, payloadHash: string, transportReady: boolean) {
 return db.transaction(async () => {
  await lockProject(db, notification.project_id)
  const current = await db.prepare(`
   SELECT u.name,u.email,u.role,u.organization_id,COALESCE(m.member_role,'contributor') AS memberRole,
    COALESCE(m.suspended,0) AS suspended,COALESCE(p.email,1) AS allowEmail,COALESCE(p.reminder_days,3) AS days
   FROM portal_notifications n JOIN users u ON u.id=n.user_id JOIN projects project ON project.id=n.project_id
   LEFT JOIN portal_members m ON m.user_id=u.id LEFT JOIN portal_notification_preferences p ON p.user_id=u.id
   WHERE n.id=? AND n.email_status=? AND u.role='client' AND u.organization_id=project.organization_id AND ${canDispatch}
  `).get(notification.id,notification.email_status)
  if (!current || current.suspended || current.email !== notification.email) return 0
  const now = Date.now()
  if (isReminder(notification.kind)) {
   const user: PortalUser = {
    id:notification.user_id, email:current.email, name:current.name, role:'client',
    organizationId:current.organization_id, memberRole:current.memberRole, suspended:false
   }
   const tasks = await projectTodos(db, {id:notification.project_id}, user)
   const applicable = Number(current.days) > 0 && tasks.some(todo =>
    notification.dedupe_key?.startsWith('reminder:' + todo.kind + ':' + todo.id + ':') &&
    now - Date.parse(todo.createdAt) >= Number(current.days) * 86_400_000)
   if (!applicable) {
    await db.prepare("UPDATE portal_notifications SET email_status='cancelled',visible=0 WHERE id=? AND email_status=?")
     .run(notification.id,notification.email_status)
    return 0
   }
  }
  if (!transportReady || !current.allowEmail) return 0
  const previous = await db.prepare('SELECT attempts,first_attempt_at,payload_hash FROM portal_operation_email_attempts WHERE notification_id=?').get(notification.id)
  const previouslyAttempted = notification.email_status !== 'pending'
  const first = previous ? Date.parse(previous.first_attempt_at) : previouslyAttempted ? Date.parse(notification.created_at) : now
  const attempts = Number(previous?.attempts ?? (previouslyAttempted ? 1 : 0))
  if (!Number.isFinite(first) || now - first >= emailRetryWindow || attempts >= emailAttemptsLimit ||
      (previous && previous.payload_hash !== payloadHash)) {
   await db.prepare("UPDATE portal_notifications SET email_status='delivery_unknown' WHERE id=? AND email_status=?")
    .run(notification.id,notification.email_status)
   return 0
  }
  const updated = await db.prepare(`UPDATE portal_notifications AS n SET email_status=? WHERE id=? AND email_status=? AND ${canDispatch}`)
   .run(claim,notification.id,notification.email_status)
  if (!updated.changes) return 0
  await db.prepare(`
   INSERT INTO portal_operation_email_attempts(notification_id,attempts,first_attempt_at,payload_hash) VALUES(?,?,?,?)
   ON CONFLICT(notification_id) DO UPDATE SET attempts=excluded.attempts
  `).run(notification.id,attempts+1,new Date(first).toISOString(),payloadHash)
  return attempts+1
 })
}

export async function flushNotificationEmails(event:any, options?:{operationsOnly:boolean; limit:number; timeout:number}) {
 const db=await portalDb()
 const transportReady = operationsEmailState(event) === 'configured'
 const baseUrl = transportReady ? portalBaseUrl(event) : ''
 const stale=`sending:${Date.now()-10*60000}`, failed=`failed:${Date.now()-5*60000}`
 const queued: QueuedEmail[] = await db.prepare(`
  SELECT n.id,n.title,n.body,n.kind,u.email,u.role,n.project_id,n.email_status,n.created_at,n.dedupe_key,n.user_id
  FROM portal_notifications n JOIN users u ON u.id=n.user_id
  LEFT JOIN portal_members m ON m.user_id=u.id LEFT JOIN portal_notification_preferences p ON p.user_id=u.id
  WHERE (n.email_status IN ('pending','failed') OR (n.email_status LIKE 'sending:%' AND n.email_status<?) OR (n.email_status LIKE 'failed:%' AND n.email_status<?))
  AND COALESCE(m.suspended,0)=0 AND COALESCE(p.email,1)=1 AND ${canDispatch}
  ${options?.operationsOnly ? `AND n.kind IN ${operationKinds}` : ''}
  ${transportReady ? '' : "AND n.kind<>'weekly_report'"}
  ORDER BY n.created_at,n.id LIMIT ?
 `).all(stale,failed,options?.limit ?? 100)
 let sent=0
 for(const notification of queued) {
  const requestNotification=['request_created','request_reply','request_status'].includes(notification.kind)
  const roadmapNotification=notification.kind.startsWith('roadmap_')
  const tab=roadmapNotification?'roadmap':requestNotification?'requests':''
  const path=tab && notification.role==='admin'?'/portal/admin':'/portal'
  const link=`${baseUrl}${path}?projectId=${encodeURIComponent(notification.project_id)}${tab?'&tab='+tab:''}`
  const subject=`${notification.title} · MC Studio`
  const body=`${notification.body}\n\n${link}`
  const claim=`sending:${Date.now()}:${randomUUID()}`
  const operation = isOperationEmail(notification.kind)
  const claimed = operation
   ? await claimOperationEmail(db,notification,claim,
    createHash('sha256').update(JSON.stringify([portalEmailSender(event),notification.email,subject,body])).digest('hex'),transportReady)
   : (await db.prepare('UPDATE portal_notifications SET email_status=? WHERE id=? AND email_status=?').run(claim,notification.id,notification.email_status)).changes
  if (!claimed) continue
  const state=await sendPortalEmail(event,notification.email,subject,body,`portal-notification-${notification.id}`,options?.timeout)
  let finalState: string = state
  if (state === 'failed' || state === 'rejected') {
   finalState = operation && state === 'rejected' ? 'failed_terminal'
    : operation && claimed >= emailAttemptsLimit ? 'delivery_unknown'
    : `failed:${Date.now()}`
  }
  await db.prepare('UPDATE portal_notifications SET email_status=? WHERE id=? AND email_status=?').run(finalState,notification.id,claim)
  if(state==='sent')sent++
 }
 return {processed:queued.length,sent}
}

export async function deliverNotifications(event:any) {
 try { return await flushNotificationEmails(event) }
 catch { console.error('Portal notification dispatch deferred'); return {processed:0,sent:0} }
}

export function operationsEmailState(event:any) {
 if (['1','true'].includes(process.env.PORTAL_EMAIL_DISABLED || '')) return 'disabled'
 return useRuntimeConfig(event).resendApiKey ? 'configured' : 'unconfigured'
}

export async function deliverOperationNotifications(event:any) {
 try { return await flushNotificationEmails(event, {operationsOnly:true,limit:4,timeout:2_500}) }
 catch { console.error('Portal automation notification dispatch deferred'); return {processed:0,sent:0} }
}
