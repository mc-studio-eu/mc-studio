import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'client')
  await (await portalDb()).prepare(`INSERT INTO portal_user_preferences(user_id,onboarding_completed,updated_at) VALUES(?,1,CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET onboarding_completed=1,updated_at=CURRENT_TIMESTAMP`).run(user.id)
  return { ok: true }
})
