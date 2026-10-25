import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { resourceInput, recordActivity } from '../../../utils/portal-resources'
export default defineEventHandler(async event => {
 assertSameOrigin(event); await requirePortalUser(event, 'admin')
 const db = await portalDb(), id = getRouterParam(event, 'id') || ''
 const current = await db.prepare('SELECT * FROM resources WHERE id=? AND archived=0').get(id)
 if (!current) throw createError({ statusCode: 404, statusMessage: 'Ressource introuvable.' })
 const body = await readBody(event)
 if (body.archived === true) {
  await db.prepare('UPDATE resources SET archived=1,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(id)
  return { ok: true }
 }
 if(await db.prepare('SELECT id FROM mockup_versions WHERE resource_id=? LIMIT 1').get(id))throw createError({statusCode:400,statusMessage:'Utilisez la rubrique Maquettes pour publier une nouvelle version.'})
 const r = resourceInput({ ...body, kind: current.kind })
 await db.transaction(async () => {
  await db.prepare('UPDATE resources SET title=?,description=?,url=?,content=?,amount=?,status=?,due_date=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
   .run(r.title,r.description,r.url,r.content,r.amount,r.status,r.dueDate,id)
  if (current.project_id) await recordActivity(current.project_id, `MC Studio a mis à jour : ${r.title}`)
 })
 return { ok: true }
})
