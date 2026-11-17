import { assertSameOrigin, requirePortalUser } from '../../../../../utils/portal-auth'
import { portalDb } from '../../../../../utils/portal-db'
import { previewStudioOnboarding } from '../../../../../utils/portal-studio'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  return previewStudioOnboarding(await portalDb(), await readBody(event))
})
