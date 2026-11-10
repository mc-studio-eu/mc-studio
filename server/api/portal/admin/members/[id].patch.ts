import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
import { lockProject, memberRoles } from '../../../../utils/portal-workflow'
import { recordActivity } from '../../../../utils/portal-resources'
export default defineEventHandler(async event=>{
 assertSameOrigin(event); await requirePortalUser(event,'admin')
 const id=getRouterParam(event,'id')||'', body=await readBody(event), db=await portalDb()
 if ((body.memberRole!==undefined && !memberRoles.includes(body.memberRole)) || (body.suspended!==undefined && typeof body.suspended!=='boolean') || (body.memberRole===undefined && body.suspended===undefined)) throw createError({statusCode:400,statusMessage:'Rôle ou état invalide.'})
 await db.transaction(async()=>{
  const user=await db.prepare("SELECT id,organization_id,name FROM users WHERE id=? AND role='client'").get(id)
  if(!user)throw createError({statusCode:404,statusMessage:'Membre introuvable.'})
  const projects=await db.prepare('SELECT id FROM projects WHERE organization_id=? ORDER BY id').all(user.organization_id)
  for(const project of projects)await lockProject(db,project.id)
  const previous=await db.prepare('SELECT member_role,suspended FROM portal_members WHERE user_id=?').get(id)
  const role=body.memberRole??previous?.member_role??'contributor', suspended=body.suspended??Boolean(previous?.suspended)
  await db.prepare(`INSERT INTO portal_members(user_id,member_role,suspended) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET member_role=excluded.member_role,suspended=excluded.suspended,updated_at=CURRENT_TIMESTAMP`).run(id,role,suspended?1:0)
  if(suspended || role!=='decision_maker')await db.prepare('DELETE FROM portal_project_deciders WHERE user_id=?').run(id)
  if(suspended || role==='viewer') {
   await db.prepare('UPDATE portal_file_request_assignments SET responsible_id=NULL WHERE responsible_id=?').run(id)
   await db.prepare('UPDATE portal_roadmap_steps SET responsible_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE responsible_id=? AND archived=0').run(id)
  }
  if(suspended) {
   await db.prepare('DELETE FROM sessions WHERE user_id=?').run(id)
   await db.prepare('DELETE FROM portal_password_resets WHERE user_id=?').run(id)
  }
  for(const project of projects)await recordActivity(project.id,`Accès de ${user.name} : ${suspended?'suspendu':role==='viewer'?'lecteur':role==='decision_maker'?'décideur':'contributeur'}.`)
 })
 return {ok:true}
})
