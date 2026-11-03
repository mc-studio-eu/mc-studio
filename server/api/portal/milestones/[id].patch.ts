import { assertSameOrigin, requirePortalUser, requireContributor } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
import { portalDb } from '../../../utils/portal-db'
import { validateResponsible, workflowDate } from '../../../utils/portal-workflow'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);const user=await requirePortalUser(event);requireContributor(user)
 const db=await portalDb(),body=await readBody(event),id=getRouterParam(event,'id')||''
 const row=await db.prepare('SELECT * FROM portal_milestones WHERE id=?').get(id)
 if(!row)throw createError({statusCode:404,statusMessage:'Jalon introuvable.'})
 const {project}=await accessibleProject(event,row.project_id)
 if(user.role!=='admin' && (row.responsible_id!==user.id||Object.keys(body).some(k=>!['status','blocker'].includes(k))))throw createError({statusCode:403,statusMessage:'Seul le responsable peut mettre à jour son avancement.'})
 const title=body.title===undefined?row.title:typeof body.title==='string'?body.title.trim():'',description=body.description===undefined?row.description:typeof body.description==='string'?body.description.trim():'',kind=body.kind??row.kind,status=body.status??row.status,blocker=body.blocker===undefined?row.blocker:typeof body.blocker==='string'?body.blocker.trim():''
 if(!title||title.length>160||description.length>3000||blocker.length>1000||!['milestone','deliverable','checklist'].includes(kind)||!['todo','in_progress','done','blocked'].includes(status))throw createError({statusCode:400,statusMessage:'Jalon invalide.'})
 const responsible=body.responsibleId===undefined?row.responsible_id:await validateResponsible(db,project.organization_id,body.responsibleId),dueDate=body.dueDate===undefined?row.due_date:workflowDate(body.dueDate)
 await db.transaction(async()=>{
  await db.prepare('UPDATE portal_milestones SET title=?,description=?,kind=?,status=?,due_date=?,responsible_id=?,blocker=?,updated_at=? WHERE id=?').run(title,description,kind,status,dueDate,responsible,blocker,new Date().toISOString(),id)
  await recordActivity(project.id,`${user.name} a mis à jour « ${title} » : ${status}${blocker?' · '+blocker:''}.`)
 })
 return {ok:true}
})
