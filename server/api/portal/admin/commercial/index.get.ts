import { requirePortalUser } from '../../../../utils/portal-auth'
import { commercialSnapshot } from '../../../../utils/portal-commercial'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async event => {
  await requirePortalUser(event, 'admin')
  return commercialSnapshot(await portalDb())
})
