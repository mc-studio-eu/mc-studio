import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')

  const id = getRouterParam(event, 'id') || ''
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Client invalide.' })

  const db = await portalDb()
  const result = await db.prepare('DELETE FROM organizations WHERE id=?').run(id)
  if (!result.changes) throw createError({ statusCode: 404, statusMessage: 'Client introuvable.' })

  return { ok: true }
})
