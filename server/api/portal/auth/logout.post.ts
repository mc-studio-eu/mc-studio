import { hashToken } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const token = getCookie(event, 'mc_portal_session')
  if (token) await (await portalDb()).prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token))
  deleteCookie(event, 'mc_portal_session', { path: '/' })
  return { ok: true }
})
