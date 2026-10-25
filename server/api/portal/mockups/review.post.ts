import { assertSameOrigin } from '../../../utils/portal-auth'
import { mockupContext } from '../../../utils/portal-mockups'
import { recordActivity } from '../../../utils/portal-resources'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);const body=await readBody(event)
 const {db,user,project,version}=await mockupContext(event,body.projectId,body.versionId)
 if(user.role!=='client'||!['approved','changes'].includes(body.state))throw createError({statusCode:403,statusMessage:'Validation réservée au client.'})
 await db.transaction(async()=>{
  if(db.dialect==='postgres')await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(project.id)
  const latest=await db.prepare('SELECT id FROM mockup_versions WHERE resource_id=? ORDER BY number DESC LIMIT 1').get(version.resource_id)
  if(latest.id!==version.id)throw createError({statusCode:409,statusMessage:'Une nouvelle version est disponible. Ouvrez-la pour donner votre avis.'})
  await db.prepare('UPDATE mockup_versions SET state=?,reviewed_by=?,reviewed_at=? WHERE id=?').run(body.state,user.id,new Date().toISOString(),version.id)
  await db.prepare('UPDATE resources SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(body.state,version.resource_id)
  await db.prepare(`INSERT INTO project_reviews(project_id,state,feedback,updated_by) VALUES(?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET state=excluded.state,feedback=excluded.feedback,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).run(project.id,body.state,`${version.title} · version ${version.number}`,user.id)
  await recordActivity(project.id,`${user.name} ${body.state==='approved'?'a validé':'demande des modifications sur'} « ${version.title} » · version ${version.number}.`)
 })
 return {ok:true}
})
