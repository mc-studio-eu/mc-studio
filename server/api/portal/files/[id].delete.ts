import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { recordActivity } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event)
  const id = getRouterParam(event, 'id') || ''
  const db = await portalDb()
  const file = await db.prepare(`SELECT r.id,r.title,r.project_id AS projectId,p.organization_id AS organizationId
    FROM resources r JOIN projects p ON p.id=r.project_id
    WHERE r.id=? AND r.kind='file' AND r.archived=0`).get(id) as {
      id: string; title: string; projectId: string; organizationId: string
    } | undefined

  if (!file || (user.role !== 'admin' && file.organizationId !== user.organizationId)) {
    throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable.' })
  }

  await db.transaction(async () => {
    const deleted = await db.prepare("DELETE FROM resources WHERE id=? AND kind='file' AND archived=0").run(file.id)
    if (!deleted.changes) throw createError({ statusCode: 404, statusMessage: 'Fichier introuvable.' })
    await recordActivity(file.projectId, `${user.role === 'admin' ? 'MC Studio' : user.name} a supprimé le fichier « ${file.title} ».`)
  })

  return { ok: true }
})
