import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject } from '../../../utils/portal-resources'
import { getSatisfaction, satisfactionBody, satisfactionDefinition, satisfactionRevision } from '../../../utils/portal-satisfaction'
import { lockProject } from '../../../utils/portal-workflow'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);await requirePortalUser(event,'admin')
 const body=satisfactionBody(await readBody(event),['projectId','revision','definition'])
 const revision=satisfactionRevision(body.revision),definition=satisfactionDefinition(body.definition)
 if(typeof body.projectId!=='string'||!body.projectId)throw createError({statusCode:400,statusMessage:'Projet requis.'})
 const {db,project}=await accessibleProject(event,body.projectId)
 return db.transaction(async()=>{
  await lockProject(db,project.id);await requirePortalUser(event,'admin');await accessibleProject(event,project.id)
  const current=await getSatisfaction(db,project.id)
  if(current.revision!==revision)throw createError({statusCode:409,statusMessage:'Le questionnaire a changé. Rechargez-le avant de modifier.'})
  const user=await requirePortalUser(event,'admin'),now=new Date().toISOString()
  await db.prepare('INSERT INTO portal_satisfaction_surveys(project_id,definition,revision,updated_by,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET definition=excluded.definition,revision=excluded.revision,updated_by=excluded.updated_by,updated_at=excluded.updated_at').run(project.id,JSON.stringify(definition),revision+1,user.id,now)
  return {definition,revision:revision+1}
 })
})
