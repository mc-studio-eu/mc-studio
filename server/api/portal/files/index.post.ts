import { randomUUID } from 'node:crypto'
import { assertSameOrigin } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
import { readPortalUpload, portalUploadFile, portalUploadText } from '../../../utils/portal-upload'
import { PORTAL_FILE_MAX_BYTES, PORTAL_FILE_QUOTA_BYTES } from '#shared/portal-upload'
export default defineEventHandler(async event => {
 assertSameOrigin(event)
 const { user, db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
 const form = await readPortalUpload(event, PORTAL_FILE_MAX_BYTES)
 const file = portalUploadFile(form, PORTAL_FILE_MAX_BYTES)
 const requestId = portalUploadText(form, 'requestId')
 const name = file.name.replace(/[\x00-\x1f\x7f/\\]/g, '_').slice(0, 180)
 const data = Buffer.from(await file.arrayBuffer()).toString('base64')
 const kind = 'file'
 const id = randomUUID()
 await db.transaction(async () => {
  if (db.dialect === 'postgres') await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(project.id)
  const request = requestId
   ? await db.prepare("SELECT id,title FROM portal_file_requests WHERE id=? AND project_id=? AND status='open'").get(requestId,project.id) as {id:string;title:string}|undefined
   : undefined
  if (requestId && !request) throw createError({statusCode:409,statusMessage:'Cette demande a déjà reçu un fichier ou n’existe plus.'})
  const size = await db.prepare('SELECT COALESCE(SUM(file_size),0) AS total FROM resources WHERE project_id=?').get(project.id)
  if (Number(size.total) + file.size > PORTAL_FILE_QUOTA_BYTES) throw createError({ statusCode: 413, statusMessage: 'Ce fichier dépasserait les 500 Mo de stockage du projet. Supprimez un fichier ou contactez MC Studio.' })
  await db.prepare('INSERT INTO resources(id,project_id,kind,title,file_name,file_size,file_data,created_by) VALUES(?,?,?,?,?,?,?,?)')
   .run(id,project.id,kind,name,name,file.size,data,user.id)
  if (request) {
   const fulfilled = await db.prepare("UPDATE portal_file_requests SET status='fulfilled',uploaded_by=?,resource_id=?,fulfilled_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'").run(user.id,id,request.id)
   if (!fulfilled.changes) throw createError({statusCode:409,statusMessage:'Cette demande vient d’être satisfaite. Actualisez la page.'})
  }
  await recordActivity(project.id, request ? `${user.name} a envoyé « ${name} » pour la demande : ${request.title}` : `${user.name} a déposé : ${name}`)
 })
 return { id }
})
