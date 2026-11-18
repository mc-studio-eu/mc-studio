import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
import { projectTimerMutation } from '../../../../utils/portal-project-timer'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const actor = await requirePortalUser(event, 'admin')
  return projectTimerMutation(await portalDb(), await readBody(event), actor.id)
})
