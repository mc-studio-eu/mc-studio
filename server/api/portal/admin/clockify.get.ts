import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { readClockifySnapshot } from '../../../utils/portal-project-timer'

export default defineEventHandler(async event => {
  await requirePortalUser(event, 'admin')
  return readClockifySnapshot(await portalDb())
})
