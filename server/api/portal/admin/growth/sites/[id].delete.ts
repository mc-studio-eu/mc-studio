import { assertSameOrigin, requirePortalUser } from '../../../../../utils/portal-auth'
import { growthDb } from '../../../../../utils/portal-growth'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const id = getRouterParam(event, 'id') || ''
  if (id === 'mc-studio') throw createError({ statusCode: 400, statusMessage: 'Le site principal MC Studio ne peut pas être supprimé.' })
  const result = await (await growthDb()).prepare('DELETE FROM growth_sites WHERE id=?').run(id)
  if (!result.changes) throw createError({ statusCode: 404, statusMessage: 'Site suivi introuvable.' })
  return { ok: true }
})
