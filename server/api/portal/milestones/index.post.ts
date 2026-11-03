import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
import { validateResponsible, workflowDate } from '../../../utils/portal-workflow'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);await requirePortalUser(event,'admin');const body=await readBody(event)
 const {db,user,project}=await accessibleProject(event,String(body.projectId||''))
 const title=typeof body.title==='string'?body.title.trim():'',description=typeof body.description==='string'?body.description.trim():'',kind=body.kind||'milestone',status=body.status||'todo',blocker=typeof body.blocker==='string'?body.blocker.trim():''
 if(!title||title.length>160||description.length>3000||blocker.length>1000||!['milestone','deliverable','checklist'].includes(kind)||!['todo','in_progress','done','blocked'].includes(status))throw createError({statusCode:400,statusMessage:'Livrable ou jalon invalide.'})
 const responsibleId=await validateResponsible(db,project.organization_id,body.responsibleId),dueDate=workflowDate(body.dueDate),id=randomUUID(),now=new Date().toISOString()
 await db.transaction(async()=>{
  await db.prepare('INSERT INTO portal_milestones(id,project_id,title,description,kind,status,due_date,responsible_id,blocker,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id,project.id,title,description,kind,status,dueDate,responsibleId,blocker,user.id,now,now)
  await recordActivity(project.id,`Ajout : ${title}.`)
 })
 return {id}
})
