import { accessibleProject } from '../../../utils/portal-resources'
import { getSatisfaction, responseRow } from '../../../utils/portal-satisfaction'
export default defineEventHandler(async event=>{
 const {db,project,user}=await accessibleProject(event,String(getQuery(event).projectId||'')||undefined)
 const survey=await getSatisfaction(db,project.id)
 const organization=await db.prepare('SELECT name FROM organizations WHERE id=?').get(project.organization_id)
 const response=await db.prepare('SELECT * FROM portal_satisfaction_responses WHERE project_id=? AND user_id=?').get(project.id,user.id)
 return {...survey,project:{name:project.name,organizationName:organization.name},respondent:{name:user.name,email:user.email},response:response?responseRow(response):null,permissions:{canEdit:user.role==='admin',canSubmit:user.role==='client'&&user.memberRole!=='viewer'&&!response}}
})
