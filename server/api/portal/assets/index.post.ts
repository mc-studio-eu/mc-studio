import { randomUUID } from 'node:crypto'
import { assertSameOrigin } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
import { readPortalUpload, portalUploadFile, portalUploadText } from '../../../utils/portal-upload'
import { PORTAL_ASSET_MAX_BYTES } from '#shared/portal-upload'
import { PORTAL_ASSET_DEFAULT_FOLDERS } from '#shared/portal-assets'

const types: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' }
export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const { user, db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Accès réservé à MC Studio.' })
  const form = await readPortalUpload(event, PORTAL_ASSET_MAX_BYTES)
  const file = portalUploadFile(form, PORTAL_ASSET_MAX_BYTES)
  const title = portalUploadText(form, 'title').slice(0, 160)
  const description = portalUploadText(form, 'description').slice(0, 1000)
  const category = portalUploadText(form, 'category')
  const validCategory = PORTAL_ASSET_DEFAULT_FOLDERS.some(folder => folder.id === category)
    || Boolean(await db.prepare('SELECT id FROM portal_asset_folders WHERE id=? AND project_id=?').get(category, project.id))
  if (!title || !validCategory) throw createError({ statusCode: 400, statusMessage: 'Ajoutez une image, un titre et un dossier valides.' })
  const name = file.name.replace(/[\x00-\x1f\x7f/\\]/g, '_').slice(0, 180)
  const ext = name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  const mimeType = types[ext]
  if (!mimeType || (file.type && file.type !== mimeType)) throw createError({ statusCode: 400, statusMessage: 'Format accepté : PNG, JPG, WEBP, GIF ou AVIF.' })
  const data = Buffer.from(await file.arrayBuffer()).toString('base64')
  const id = randomUUID()
  await db.transaction(async () => {
    if (db.dialect === 'postgres') await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(project.id)
    const usage = await db.prepare('SELECT COALESCE(SUM(file_size),0) AS total FROM portal_assets WHERE project_id=?').get(project.id)
    if (Number(usage.total) + file.size > 100 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'La médiathèque de ce projet a atteint 100 Mo.' })
    await db.prepare('INSERT INTO portal_assets(id,project_id,title,description,category,file_name,mime_type,file_size,file_data,created_by) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id, project.id, title, description, category, name, mimeType, file.size, data, user.id)
    await recordActivity(project.id, `MC Studio a ajouté un asset : ${title}`)
  })
  return { id }
})
