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
 const requestId = parts?.find(p => p.name === 'requestId')?.data.toString().trim() || ''
 if (!file || !file.data.length || file.data.length > max) throw createError({ statusCode: 400, statusMessage: 'Choisissez un fichier de 10 Mo maximum.' })
 const name = file.filename!.replace(/[\x00-\x1f\x7f/\\]/g, '_').slice(0, 180)
 const kind = 'file'
 const id = randomUUID()
 await db.transaction(async () => {
  if (db.dialect === 'postgres') await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(project.id)
  const request = requestId
   ? await db.prepare("SELECT id,title FROM portal_file_requests WHERE id=? AND project_id=? AND status='open'").get(requestId,project.id) as {id:string;title:string}|undefined
   : undefined
  if (requestId && !request) throw createError({statusCode:409,statusMessage:'Cette demande a déjà reçu un fichier ou n’existe plus.'})
  const size = await db.prepare('SELECT COALESCE(SUM(file_size),0) AS total FROM resources WHERE project_id=?').get(project.id)
  if (Number(size.total) + file.data.length > 100 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'Le stockage de ce projet a atteint 100 Mo. Contactez MC Studio.' })
  await db.prepare('INSERT INTO resources(id,project_id,kind,title,file_name,file_size,file_data,created_by) VALUES(?,?,?,?,?,?,?,?)')
   .run(id,project.id,kind,name,name,file.data.length,file.data.toString('base64'),user.id)
  if (request) {
   const fulfilled = await db.prepare("UPDATE portal_file_requests SET status='fulfilled',uploaded_by=?,resource_id=?,fulfilled_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'").run(user.id,id,request.id)
   if (!fulfilled.changes) throw createError({statusCode:409,statusMessage:'Cette demande vient d’être satisfaite. Actualisez la page.'})
  }
  await recordActivity(project.id, request ? `${user.name} a envoyé « ${name} » pour la demande : ${request.title}` : `${user.name} a déposé : ${name}`)
 })
 return { id }
})
