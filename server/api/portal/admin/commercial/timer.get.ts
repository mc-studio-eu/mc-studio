import { requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
import { projectTimerStatus } from '../../../../utils/portal-project-timer'

export default defineEventHandler(async event => {
  const actor = await requirePortalUser(event, 'admin')
  return projectTimerStatus(await portalDb(), actor.id)
})
