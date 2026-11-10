import { lockProject, validateResponsible, workflowDate } from '../../../../utils/portal-workflow'
import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { recordActivity } from '../../../../utils/portal-resources'
import { portalDb } from '../../../../utils/portal-db'
import { deliverNotifications, notifyProject } from '../../../../utils/portal-notifications'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const id = getRouterParam(event, 'id') || ''
  const body = await readBody<{ name?: unknown; status?: unknown; dueDate?: unknown; description?: unknown; decisionMakerId?: unknown }>(event)
  const db = await portalDb()
  let queued = false
  await db.transaction(async () => {
  await lockProject(db,id)
  const previous = await db.prepare('SELECT * FROM projects WHERE id=?').get(id)
  if (!previous) throw createError({statusCode:404,statusMessage:'Projet introuvable.'})
  const text = (value:unknown, fallback:string, max:number) => value === undefined ? fallback : typeof value==='string' ? value.trim().slice(0,max) : ''
  const name=text(body.name,previous.name,160), status=text(body.status,previous.status,50), description=text(body.description,previous.description,1500)
  const dueDate=body.dueDate===undefined?previous.due_date:workflowDate(body.dueDate)
  if (!name || !status) throw createError({statusCode:400,statusMessage:'Informations de projet invalides.'})
  if(body.decisionMakerId!==undefined) {
   const decider=await validateResponsible(db,previous.organization_id,body.decisionMakerId)
   if(decider) {
    const member=await db.prepare('SELECT member_role FROM portal_members WHERE user_id=?').get(decider)
    if(member?.member_role!=='decision_maker')throw createError({statusCode:400,statusMessage:'Ce membre doit avoir le rôle décideur.'})
   }
   const person=decider?await db.prepare('SELECT name FROM users WHERE id=?').get(decider):null
   await recordActivity(id,`Décideur du projet : ${person?.name || 'non désigné'}.`)
   await db.prepare('INSERT INTO portal_project_deciders(project_id,user_id) VALUES(?,?) ON CONFLICT(project_id) DO UPDATE SET user_id=excluded.user_id,updated_at=CURRENT_TIMESTAMP').run(id,decider)
   if(decider) {
    const pending = await db.prepare(`SELECT v.id,v.title,v.description FROM portal_roadmap_validations v
      LEFT JOIN portal_roadmap_decisions d ON d.validation_id=v.id WHERE v.project_id=? AND d.validation_id IS NULL`).all(id)
    for (const entry of pending) {
     await notifyProject(id,'roadmap_validation',`À valider : ${entry.title}`,entry.description,undefined,`roadmap-validation:${entry.id}`,decider)
    }
    queued = pending.length > 0
   }
  }
  await db.prepare('UPDATE projects SET name=?,status=?,due_date=?,description=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(name,status,dueDate,description,id)
  await recordActivity(id, `Projet mis à jour : ${name} · ${status}`)
  })
  if (queued) await deliverNotifications(event)
  return { ok: true }
})
