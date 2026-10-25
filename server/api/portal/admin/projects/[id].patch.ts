import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { recordActivity } from '../../../../utils/portal-resources'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  await requirePortalUser(event, 'admin')
  const id = getRouterParam(event, 'id') || ''
  const body = await readBody<{ name?: unknown; status?: unknown; progress?: unknown; dueDate?: unknown; description?: unknown; currentPhase?: unknown }>(event)
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 160) : ''
  const status = typeof body.status === 'string' ? body.status.trim().slice(0, 50) : ''
  const progress = Number(body.progress)
  const dueDate = typeof body.dueDate === 'string' ? body.dueDate.trim().slice(0, 40) : ''
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 1500) : ''
  const currentPhase = typeof body.currentPhase === 'string' ? body.currentPhase : ''
  if (!['Cadrage', 'Design', 'Développement', 'Mise en ligne'].includes(currentPhase)) throw createError({ statusCode: 400, statusMessage: 'Étape de projet invalide.' })
  if (!name || !status || !Number.isInteger(progress) || progress < 0 || progress > 100) throw createError({ statusCode: 400, statusMessage: 'Informations de projet invalides.' })
  const db = await portalDb()
  await db.transaction(async () => {
  const result = await db.prepare(`UPDATE projects SET name=?,status=?,progress=?,due_date=?,description=?,current_phase=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(name, status, progress, dueDate, description, currentPhase, id)
  if (!result.changes) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable.' })
  await recordActivity(id, `Projet mis à jour : ${currentPhase} · ${progress} % · ${status}`)
  })
  return { ok: true }
})
