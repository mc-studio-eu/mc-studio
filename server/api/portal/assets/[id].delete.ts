import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const db = await portalDb(), id = getRouterParam(event, 'id') || ''
  const asset = await db.prepare('SELECT id,project_id AS projectId,title FROM portal_assets WHERE id=?').get(id)
  if (!asset) throw createError({ statusCode: 404, statusMessage: 'Image introuvable.' })
  await accessibleProject(event, asset.projectId)
  await db.transaction(async () => { await db.prepare('DELETE FROM portal_assets WHERE id=?').run(id); await recordActivity(asset.projectId, `MC Studio a supprimé l’asset : ${asset.title}`) })
  return { ok: true }
})
