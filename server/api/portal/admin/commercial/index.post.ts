import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { commercialMutation } from '../../../../utils/portal-commercial'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const actor = await requirePortalUser(event, 'admin')
  return commercialMutation(await portalDb(), await readBody(event), actor.id)
})
