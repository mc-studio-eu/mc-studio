import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const id = getRouterParam(event, 'id') || ''
  const organizationId = String(getQuery(event).organizationId || '')
  if (!organizationId) throw createError({ statusCode: 400, statusMessage: 'Client requis.' })
  const result = await (await portalDb()).prepare('DELETE FROM invitations WHERE id=? AND organization_id=? AND accepted_at IS NULL').run(id, organizationId)
  if (!result.changes) throw createError({ statusCode: 409, statusMessage: 'Cette invitation a déjà été acceptée ou annulée. Actualisez la liste.' })
  return { ok: true }
})
