import { lockProject, validateResponsible } from '../../../../utils/portal-workflow'
import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { recordActivity } from '../../../../utils/portal-resources'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const id = getRouterParam(event, 'id') || ''
  const body = await readBody<{ name?: unknown; status?: unknown; progress?: unknown; dueDate?: unknown; description?: unknown; currentPhase?: unknown; decisionMakerId?: unknown }>(event)
  const db = await portalDb()
  await db.transaction(async () => {
  await lockProject(db,id)
  const previous = await db.prepare('SELECT * FROM projects WHERE id=?').get(id)
  if (!previous) throw createError({statusCode:404,statusMessage:'Projet introuvable.'})
  const text = (value:unknown, fallback:string, max:number) => value === undefined ? fallback : typeof value==='string' ? value.trim().slice(0,max) : ''
  const name=text(body.name,previous.name,160), status=text(body.status,previous.status,50), description=text(body.description,previous.description,1500), dueDate=text(body.dueDate,previous.due_date,40), currentPhase=text(body.currentPhase,previous.current_phase,40)
  const progress=body.progress===undefined?previous.progress:Number(body.progress)
  if (!['Cadrage','Design','Développement','Mise en ligne'].includes(currentPhase) || !name || !status || !Number.isInteger(progress) || progress<0 || progress>100) throw createError({statusCode:400,statusMessage:'Informations de projet invalides.'})
  if(body.decisionMakerId!==undefined) {
   const decider=await validateResponsible(db,previous.organization_id,body.decisionMakerId)
   if(decider) {
    const member=await db.prepare('SELECT member_role FROM portal_members WHERE user_id=?').get(decider)
    if(member?.member_role!=='decision_maker')throw createError({statusCode:400,statusMessage:'Ce membre doit avoir le rôle décideur.'})
   }
   const person=decider?await db.prepare('SELECT name FROM users WHERE id=?').get(decider):null
   await recordActivity(id,`Décideur du projet : ${person?.name || 'non désigné'}.`)
   await db.prepare('INSERT INTO portal_project_deciders(project_id,user_id) VALUES(?,?) ON CONFLICT(project_id) DO UPDATE SET user_id=excluded.user_id,updated_at=CURRENT_TIMESTAMP').run(id,decider)
  }
  await db.prepare('UPDATE projects SET name=?,status=?,progress=?,due_date=?,description=?,current_phase=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name,status,progress,dueDate,description,currentPhase,id)
  await recordActivity(id, `Projet mis à jour : ${currentPhase} · ${progress} % · ${status}`)
  })
  return { ok: true }
})
