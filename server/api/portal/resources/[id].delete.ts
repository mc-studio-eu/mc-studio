import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { recordActivity } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const db = await portalDb()
  const id = getRouterParam(event, 'id') || ''
  const resource = await db.prepare('SELECT id,title,kind,project_id AS projectId FROM resources WHERE id=? AND archived=0').get(id) as {id:string;title:string;kind:string;projectId:string|null}|undefined
  if (!resource) throw createError({ statusCode: 404, statusMessage: 'Ressource introuvable.' })
  await db.transaction(async () => {
    const result = await db.prepare('DELETE FROM resources WHERE id=?').run(resource.id)
    if (!result.changes) throw createError({ statusCode: 404, statusMessage: 'Ressource introuvable.' })
    if (resource.projectId) await recordActivity(resource.projectId, `MC Studio a supprimé : ${resource.title}`)
  })
  return { ok: true }
})
