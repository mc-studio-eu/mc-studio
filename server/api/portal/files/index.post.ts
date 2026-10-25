import { randomUUID } from 'node:crypto'
import { assertSameOrigin } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
export default defineEventHandler(async event => {
 assertSameOrigin(event)
 const { user, db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
 const max = 10 * 1024 * 1024
 const limit = max + 65536
 if (Number(getRequestHeader(event, 'content-length') || 0) > limit) throw createError({ statusCode: 413, statusMessage: 'Fichier trop volumineux.' })
 const chunks: Buffer[] = []; let length = 0
 for await (const chunk of event.node.req) {
  const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
  length += bytes.length
  if (length > limit) throw createError({ statusCode: 413, statusMessage: 'Fichier trop volumineux.' })
  chunks.push(bytes)
 }
 // h3 supports a pre-read rawBody; cap the stream before parsing multipart data.
 ;(event.node.req as any).rawBody = Buffer.concat(chunks)
 const parts = await readMultipartFormData(event)
 const file = parts?.find(p => p.name === 'file' && p.filename)
 if (!file || !file.data.length || file.data.length > max) throw createError({ statusCode: 400, statusMessage: 'Choisissez un fichier de 10 Mo maximum.' })
 const name = file.filename!.replace(/[\x00-\x1f\x7f/\\]/g, '_').slice(0, 180)
 const kind = 'file'
 const id = randomUUID()
 await db.transaction(async () => {
  if (db.dialect === 'postgres') await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(project.id)
  const size = await db.prepare('SELECT COALESCE(SUM(file_size),0) AS total FROM resources WHERE project_id=?').get(project.id)
  if (Number(size.total) + file.data.length > 100 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'Le stockage de ce projet a atteint 100 Mo. Contactez MC Studio.' })
  await db.prepare('INSERT INTO resources(id,project_id,kind,title,file_name,file_size,file_data,created_by) VALUES(?,?,?,?,?,?,?,?)')
   .run(id,project.id,kind,name,name,file.data.length,file.data.toString('base64'),user.id)
  await recordActivity(project.id, `${user.name} a déposé : ${name}`)
 })
 return { id }
})
