import { requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'

export default defineEventHandler(async event => {
  const user = await requirePortalUser(event, 'client')
  const row = await (await portalDb()).prepare('SELECT onboarding_completed AS completed FROM portal_user_preferences WHERE user_id=?').get(user.id)
  return { completed: Boolean(row?.completed) }
})
