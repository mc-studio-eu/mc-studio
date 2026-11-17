import { assertSameOrigin, requirePortalUser } from '../../../../../utils/portal-auth'
import { portalDb } from '../../../../../utils/portal-db'
import { launchStudioOnboarding } from '../../../../../utils/portal-studio'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  return launchStudioOnboarding(await portalDb(), user.id, await readBody(event))
})
