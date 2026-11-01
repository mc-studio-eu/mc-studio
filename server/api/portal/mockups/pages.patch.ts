import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { mockupContext } from '../../../utils/portal-mockups'
import { recordActivity } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const body = await readBody(event)
  const { db, project, user, version } = await mockupContext(event, body.projectId, body.versionId)
  if (!Array.isArray(body.screenIds) || body.screenIds.some((id: unknown) => typeof id !== 'string') || new Set(body.screenIds).size !== body.screenIds.length) throw createError({ statusCode: 400, statusMessage: 'Ordre des pages invalide.' })
  await db.transaction(async () => {
    const current = await db.prepare('SELECT id FROM mockup_screens WHERE version_id=? ORDER BY position,id').all(version.id) as { id: string }[]
    const expected = new Set(current.map(screen => screen.id))
    if (body.screenIds.length !== current.length || body.screenIds.some((id: string) => !expected.has(id))) throw createError({ statusCode: 409, statusMessage: 'La liste des pages a changé. Rechargez la maquette.' })
    for (const [position, id] of body.screenIds.entries()) await db.prepare('UPDATE mockup_screens SET position=? WHERE id=? AND version_id=?').run(position, id, version.id)
    await db.prepare("UPDATE mockup_versions SET state='pending',reviewed_by=NULL,reviewed_at=NULL WHERE id=?").run(version.id)
    await db.prepare(`INSERT INTO project_reviews(project_id,state,feedback,updated_by) VALUES(?,'pending','',?) ON CONFLICT(project_id) DO UPDATE SET state='pending',feedback='',updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).run(project.id,user.id)
    await recordActivity(project.id, `MC Studio a modifié l’ordre des pages de « ${version.title} » · version ${version.number}.`)
  })
  return { ok: true }
})
