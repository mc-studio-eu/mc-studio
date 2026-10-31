import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const body = await readBody(event)
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (prompt.length > 12000) throw createError({ statusCode: 400, statusMessage: 'Le prompt ne peut pas dépasser 12 000 caractères.' })
  await (await portalDb()).prepare("INSERT INTO portal_settings(key,value,updated_by,updated_at) VALUES('global_image_prompt',?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP").run(prompt, user.id)
  return { ok: true }
})
