import { randomUUID } from 'node:crypto'
import { portalDb } from './portal-db'
import { requirePortalUser } from './portal-auth'

export const resourceColumns = `r.id,r.project_id AS projectId,r.kind,r.title,r.description,r.url,r.content,r.amount,r.currency,r.status,r.due_date AS dueDate,r.file_name AS fileName,r.file_size AS fileSize,r.created_at AS createdAt,r.updated_at AS updatedAt,(SELECT COUNT(*) FROM mockup_versions mv WHERE mv.resource_id=r.id) AS versionCount`
export async function accessibleProject(event: any, id?: string) {
 const user = await requirePortalUser(event)
 const db = await portalDb()
 const project = id
  ? await db.prepare('SELECT * FROM projects WHERE id=?').get(id)
  : await db.prepare('SELECT * FROM projects WHERE organization_id=? ORDER BY updated_at DESC LIMIT 1').get(user.organizationId)
 if (!project || (user.role !== 'admin' && project.organization_id !== user.organizationId)) throw createError({ statusCode: 404, statusMessage: 'Projet introuvable.' })
 return { user, db, project }
}
export function resourceInput(body: any) {
 const text = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : ''
 const kind = text(body.kind, 20), title = text(body.title, 160), url = text(body.url, 2000)
 if (!['payment','document','file','mockup','link','wiki','analytics'].includes(kind) || !title) throw createError({ statusCode: 400, statusMessage: 'Choisissez une rubrique et un titre.' })
 if (url) {
  try { const parsed = new URL(url); if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error() }
  catch { throw createError({ statusCode: 400, statusMessage: 'Le lien doit être une adresse HTTPS valide.' }) }
 }
 const amount = Number(body.amount || 0)
 if (!Number.isSafeInteger(amount) || amount < 0 || amount > 100000000) throw createError({ statusCode: 400, statusMessage: 'Montant invalide.' })
 const status = text(body.status, 30) || (kind === 'payment' ? 'due' : 'available')
 const allowed = kind === 'payment' ? ['due','paid','cancelled'] : kind === 'mockup' ? ['available','pending','approved','changes'] : ['available']
 if (!allowed.includes(status)) throw createError({ statusCode: 400, statusMessage: 'Statut invalide.' })
 if (kind === 'payment' && status === 'due' && !url) throw createError({ statusCode: 400, statusMessage: 'Ajoutez le lien de paiement.' })
 const dueDate = text(body.dueDate, 10)
 if (dueDate && (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || isNaN(Date.parse(dueDate)))) throw createError({ statusCode: 400, statusMessage: 'Date invalide.' })
 return { kind, title, description: text(body.description, 3000), url, content: text(body.content, 40000), amount, status, dueDate }
}
export async function recordActivity(projectId: string, message: string) {
 await (await portalDb()).prepare('INSERT INTO activity(id,project_id,message,created_at) VALUES(?,?,?,?)').run(randomUUID(), projectId, message, new Date().toISOString())
}
