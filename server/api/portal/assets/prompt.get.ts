import { portalDb } from '../../../utils/portal-db'
import { requirePortalUser } from '../../../utils/portal-auth'
export default defineEventHandler(async event => {
  await requirePortalUser(event)
  const row = await (await portalDb()).prepare("SELECT value,updated_at AS updatedAt FROM portal_settings WHERE key='global_image_prompt'").get()
  return { prompt: row?.value || '', updatedAt: row?.updatedAt || null }
})
