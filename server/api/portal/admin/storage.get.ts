import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { readPortalStorageStatus } from '../../../utils/portal-storage'

export default defineEventHandler(async event => {
 await requirePortalUser(event, 'admin')
 return readPortalStorageStatus(await portalDb())
})
