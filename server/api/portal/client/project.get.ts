import { projectWorkflow } from '../../../utils/portal-workflow'
import { accessibleProject } from '../../../utils/portal-resources'
import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
export default defineEventHandler(async event => {
 const requested=String(getQuery(event).projectId||'')
 if(!requested) {
  const user=await requirePortalUser(event),db=await portalDb()
  const project=await db.prepare('SELECT id FROM projects WHERE organization_id=? LIMIT 1').get(user.organizationId)
  if(!project)return {project:null,projects:[],members:[],permissions:{canContribute:user.role==='admin'||user.memberRole!=='viewer',canReview:false},review:{state:'pending',feedback:''}}
 }
 const { db, user, project } = await accessibleProject(event, requested || undefined)
 const projects = await db.prepare('SELECT id,name FROM projects WHERE organization_id=? ORDER BY updated_at DESC,created_at DESC').all(project.organization_id)
 const review = await db.prepare('SELECT state,feedback FROM project_reviews WHERE project_id=?').get(project.id)
 const workflow = await projectWorkflow(db,project,user)
 return { members:workflow.members, permissions:workflow.permissions, project: { decisionMakerId:workflow.decisionMakerId,decisionMakerName:workflow.decisionMakerName,id:project.id,name:project.name,description:project.description,status:project.status,progress:project.progress,dueDate:project.due_date,currentPhase:project.current_phase }, projects, review:review || {state:'pending',feedback:''} }
})
