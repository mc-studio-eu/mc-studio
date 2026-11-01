import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const body = await readBody(event)
  const projectId = typeof body.projectId === 'string' ? body.projectId : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'Projet requis.' })
  if (!title || title.length > 160) throw createError({ statusCode: 400, statusMessage: 'Le nom doit contenir entre 1 et 160 caractères.' })

  const { db, project } = await accessibleProject(event, projectId)
  const id = getRouterParam(event, 'id') || ''
  const mockup = await db.prepare("SELECT id,title FROM resources WHERE id=? AND project_id=? AND kind='mockup' AND archived=0").get(id, project.id) as { id: string; title: string } | undefined
  if (!mockup) throw createError({ statusCode: 404, statusMessage: 'Maquette introuvable.' })
  if (mockup.title === title) return { ok: true, title }

  await db.transaction(async () => {
    await db.prepare('UPDATE resources SET title=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(title, id)
    await recordActivity(project.id, `MC Studio a renommé la maquette « ${mockup.title} » en « ${title} ».`)
  })
  return { ok: true, title }
})
