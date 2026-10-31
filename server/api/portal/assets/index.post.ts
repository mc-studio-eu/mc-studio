import { randomUUID } from 'node:crypto'
import { assertSameOrigin } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'

const categories = ['marks', 'palette', 'typography', 'applications', 'exports']
const types: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' }
export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const { user, db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Accès réservé à MC Studio.' })
  const max = 10 * 1024 * 1024, limit = max + 65536
  if (Number(getRequestHeader(event, 'content-length') || 0) > limit) throw createError({ statusCode: 413, statusMessage: 'Image trop volumineuse (10 Mo maximum).' })
  const chunks: Buffer[] = []; let length = 0
  for await (const chunk of event.node.req) { const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); length += bytes.length; if (length > limit) throw createError({ statusCode: 413, statusMessage: 'Image trop volumineuse.' }); chunks.push(bytes) }
  ;(event.node.req as any).rawBody = Buffer.concat(chunks)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  const title = String(parts?.find(p => p.name === 'title')?.data.toString() || '').trim().slice(0, 160)
  const description = String(parts?.find(p => p.name === 'description')?.data.toString() || '').trim().slice(0, 1000)
  const category = String(parts?.find(p => p.name === 'category')?.data.toString() || '')
  if (!file?.data.length || file.data.length > max || !title || !categories.includes(category)) throw createError({ statusCode: 400, statusMessage: 'Ajoutez une image, un titre et une catégorie valides.' })
  const name = file.filename!.replace(/[\x00-\x1f\x7f/\\]/g, '_').slice(0, 180)
  const ext = name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  const mimeType = types[ext]
  if (!mimeType || (file.type && file.type !== mimeType)) throw createError({ statusCode: 400, statusMessage: 'Format accepté : PNG, JPG, WEBP, GIF ou AVIF.' })
  const id = randomUUID()
  await db.transaction(async () => {
    const usage = await db.prepare('SELECT COALESCE(SUM(file_size),0) AS total FROM portal_assets WHERE project_id=?').get(project.id)
    if (Number(usage.total) + file.data.length > 100 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'La médiathèque de ce projet a atteint 100 Mo.' })
    await db.prepare('INSERT INTO portal_assets(id,project_id,title,description,category,file_name,mime_type,file_size,file_data,created_by) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id, project.id, title, description, category, name, mimeType, file.data.length, file.data.toString('base64'), user.id)
    await recordActivity(project.id, `MC Studio a ajouté un asset : ${title}`)
  })
  return { id }
})
