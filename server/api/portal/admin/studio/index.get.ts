import { requirePortalUser } from '../../../../utils/portal-auth'
import { commercialOutstanding } from '../../../../utils/portal-commercial'
import { portalDb } from '../../../../utils/portal-db'
import { studioCockpit } from '../../../../utils/portal-studio'

export default defineEventHandler(async event => {
  await requirePortalUser(event, 'admin')
  const db = await portalDb()
  return studioCockpit(db, await commercialOutstanding(db))
})
