import { assertSameOrigin, requirePortalUser } from '../../../../../utils/portal-auth'
import { portalDb } from '../../../../../utils/portal-db'
import { qualifyStudioRequest } from '../../../../../utils/portal-studio'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  return qualifyStudioRequest(await portalDb(), user.id, getRouterParam(event, 'id') || '', await readBody(event))
})
