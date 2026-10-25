import { getPortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  const user = await getPortalUser(event)
  if (!user) return { user: null }
  if (user.role === 'client' && user.organizationId) {
    const row = await (await portalDb()).prepare('SELECT name FROM organizations WHERE id=?').get(user.organizationId) as { name: string } | undefined
    return { user, organization: row || null }
  }
  return { user }
})
