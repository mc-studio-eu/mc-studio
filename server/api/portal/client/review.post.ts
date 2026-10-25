import { assertSameOrigin } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
export default defineEventHandler(async event => {
 assertSameOrigin(event)
 const body = await readBody(event)
 const { user, db, project } = await accessibleProject(event, String(body.projectId || '') || undefined)
 if (user.role !== 'client' || !['approved','changes'].includes(body.state)) throw createError({ statusCode:400,statusMessage:'Choix invalide.' })
 const feedback = typeof body.feedback === 'string' ? body.feedback.trim().slice(0,3000) : ''
 if (body.state === 'changes' && !feedback) throw createError({ statusCode:400,statusMessage:'Précisez les modifications souhaitées.' })
 await db.transaction(async () => {
  const resource = await db.prepare("SELECT id,title FROM resources WHERE id=? AND project_id=? AND kind='mockup' AND archived=0").get(String(body.resourceId || ''),project.id)
  if (!resource) throw createError({ statusCode:404,statusMessage:'Maquette introuvable.' })
  if(await db.prepare('SELECT id FROM mockup_versions WHERE resource_id=? LIMIT 1').get(resource.id))throw createError({statusCode:400,statusMessage:'Ouvrez la version de la maquette pour la valider.'})
  await db.prepare('UPDATE resources SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(body.state,resource.id)
  await db.prepare(`INSERT INTO project_reviews(project_id,state,feedback,updated_by) VALUES(?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET state=excluded.state,feedback=excluded.feedback,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).run(project.id,body.state,feedback,user.id)
  await recordActivity(project.id, `${user.name} ${body.state === 'approved' ? 'a validé' : 'demande des modifications sur'} « ${resource.title} ».${feedback ? ' '+feedback : ''}`)
 })
 return { ok:true }
})
