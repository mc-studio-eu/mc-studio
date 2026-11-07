import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser, requireContributor } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
import { getSatisfaction, responseRow, satisfactionBody, satisfactionAnswers, satisfactionRevision } from '../../../utils/portal-satisfaction'
import { lockProject } from '../../../utils/portal-workflow'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);requireContributor(await requirePortalUser(event,'client'))
 const body=satisfactionBody(await readBody(event),['projectId','revision','answers']),revision=satisfactionRevision(body.revision)
 if(typeof body.projectId!=='string'||!body.projectId)throw createError({statusCode:400,statusMessage:'Projet requis.'})
 const {db,project}=await accessibleProject(event,body.projectId)
 return db.transaction(async()=>{
  await lockProject(db,project.id)
  const {user}=await accessibleProject(event,project.id);await requirePortalUser(event,'client');requireContributor(user)
  if(await db.prepare('SELECT id FROM portal_satisfaction_responses WHERE project_id=? AND user_id=?').get(project.id,user.id))throw createError({statusCode:409,statusMessage:'Votre réponse a déjà été enregistrée.'})
  const survey=await getSatisfaction(db,project.id)
  if(survey.revision!==revision)throw createError({statusCode:409,statusMessage:'Le questionnaire a changé. Rechargez-le avant de répondre.'})
  const answers=satisfactionAnswers(body.answers,survey.definition),organization=await db.prepare('SELECT name FROM organizations WHERE id=?').get(project.organization_id)
  const row={id:randomUUID(),project_id:project.id,user_id:user.id,revision,submitted_at:new Date().toISOString(),respondent:JSON.stringify({name:user.name,email:user.email,projectName:project.name,organizationName:organization.name}),definition:JSON.stringify(survey.definition),answers:JSON.stringify(answers)}
  await db.prepare('INSERT INTO portal_satisfaction_responses(id,project_id,user_id,revision,submitted_at,respondent,definition,answers) VALUES(?,?,?,?,?,?,?,?)').run(row.id,row.project_id,row.user_id,row.revision,row.submitted_at,row.respondent,row.definition,row.answers)
  await recordActivity(project.id,'Un questionnaire de satisfaction a été complété.')
  return {response:responseRow(row)}
 })
})
