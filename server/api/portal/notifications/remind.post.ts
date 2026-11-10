import { timingSafeEqual } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { flushNotificationEmails, notifyProject } from '../../../utils/portal-notifications'
import { lockProject, projectTodos } from '../../../utils/portal-workflow'
export default defineEventHandler(async event=>{
 const configured=process.env.PORTAL_REMINDER_SECRET||'', provided=(getRequestHeader(event,'authorization')||'').replace(/^Bearer /,'')
 const isWorker=configured.length>=24 && Buffer.byteLength(configured)===Buffer.byteLength(provided) && timingSafeEqual(Buffer.from(configured),Buffer.from(provided))
 if(!isWorker){assertSameOrigin(event);await requirePortalUser(event,'admin')}
 const body=await readBody(event)||{},db=await portalDb(),now=Date.now()
 const projects=body.projectId?await db.prepare('SELECT * FROM projects WHERE id=?').all(String(body.projectId)):await db.prepare('SELECT * FROM projects').all()
 let queued=0
 await db.transaction(async()=>{
 for(const project of projects) {
  await lockProject(db,project.id)
  const todos=await projectTodos(db,project)
  const users=await db.prepare(`SELECT u.id,COALESCE(p.reminder_days,3) AS days,COALESCE(m.member_role,'contributor') AS role FROM users u LEFT JOIN portal_members m ON m.user_id=u.id LEFT JOIN portal_notification_preferences p ON p.user_id=u.id WHERE u.organization_id=? AND u.role='client' AND COALESCE(m.suspended,0)=0 AND COALESCE(m.member_role,'contributor')<>'viewer' AND (COALESCE(p.in_app,1)=1 OR COALESCE(p.email,1)=1)`).all(project.organization_id)
  for(const user of users) {
   if(!user.days)continue
   for(const todo of todos) {
    if(todo.responsibleId && todo.responsibleId!==user.id)continue
    if(['mockup','roadmap'].includes(todo.kind) && (!todo.responsibleId||user.role!=='decision_maker'))continue
    if(todo.kind==='roadmap_step' && todo.responsibleId!==user.id)continue
    if(now-Date.parse(todo.createdAt)<Number(user.days)*86400000)continue
    const kind=['roadmap','roadmap_step'].includes(todo.kind)?'roadmap_reminder':'reminder'
    const last=await db.prepare('SELECT created_at FROM portal_notifications WHERE user_id=? AND kind=? AND dedupe_key LIKE ? ORDER BY created_at DESC LIMIT 1').get(user.id,kind,`reminder:${todo.kind}:${todo.id}:%:${user.id}`)
    if(last && now-Date.parse(last.created_at)<Number(user.days)*86400000)continue
    const bucket=Math.floor(now/(Number(user.days)*86400000))
    await notifyProject(project.id,kind,`Action attendue : ${todo.title}`,`Une action vous attend dans le projet ${project.name}${todo.dueDate?' pour le '+todo.dueDate:''}.`,undefined,`reminder:${todo.kind}:${todo.id}:${bucket}`,user.id)
    queued++
   }
  }
 }
 })
 return {ok:true,queued,...await flushNotificationEmails(event)}
})
