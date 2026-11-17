import { requirePortalUser } from '../../../../../utils/portal-auth'
import { portalDb } from '../../../../../utils/portal-db'
import { studioTemplates } from '../../../../../utils/portal-studio'

export default defineEventHandler(async event => {
  await requirePortalUser(event, 'admin')
  return studioTemplates(await portalDb())
})
