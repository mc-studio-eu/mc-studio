import { randomUUID } from 'node:crypto'
import { assertSameOrigin } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'
import { assertAssetUploadFolder, lockUploadProject, assertUploadQuota, openUploadRequest, newPortalObjectKey } from '../../../utils/portal-direct-upload'
import { headPortalObject, copyPortalObject, deletePortalObject } from '../../../utils/portal-object-store'

export default defineEventHandler(async event => {
 assertSameOrigin(event)
 const body = await readBody(event)
 const {user,db,project} = await accessibleProject(event,typeof body?.projectId === 'string' ? body.projectId : undefined)
 const upload = await db.prepare('SELECT * FROM portal_uploads WHERE id=? AND user_id=? AND project_id=?').get(typeof body?.uploadId === 'string' ? body.uploadId : '',user.id,project.id)
 if (!upload) throw createError({statusCode:404,statusMessage:'Dépôt introuvable.'})
 if (upload.kind === 'asset' && user.role !== 'admin') throw createError({statusCode:403,statusMessage:'Accès réservé à MC Studio.'})
 if (upload.result_id) return {id:upload.result_id}
 if (upload.expires_at <= new Date().toISOString()) throw createError({statusCode:410,statusMessage:'Le dépôt a expiré. Recommencez le transfert.'})
 let head
 try { head = await headPortalObject(upload.staging_key) }
 catch { throw createError({statusCode:409,statusMessage:'Le transfert R2 n’est pas terminé. Réessayez la confirmation.'}) }
 if (Number(head.ContentLength) !== Number(upload.file_size) || head.ContentType !== upload.mime_type || !head.ETag) throw createError({statusCode:400,statusMessage:'La taille ou le format reçu ne correspond pas au fichier annoncé.'})
 // Each attempt owns a unique final key, so concurrent confirmations can never
 // overwrite a committed object. Keep unreferenced attempts for bounded cleanup.
 const objectId = randomUUID(), objectKey = newPortalObjectKey(project.id)
 await db.prepare('INSERT INTO portal_objects(id,object_key,created_at) VALUES(?,?,?)').run(objectId,objectKey,new Date().toISOString())
 try { await copyPortalObject(upload.staging_key,objectKey,head.ETag,upload.mime_type) }
 catch { throw createError({statusCode:409,statusMessage:'Le fichier a changé pendant la confirmation. Réessayez le dépôt.'}) }
 const result = await db.transaction(async () => {
  await lockUploadProject(db,project.id)
  const current = await db.prepare('SELECT result_id,expires_at FROM portal_uploads WHERE id=?').get(upload.id)
  if (current.result_id) return {id:current.result_id}
  if (current.expires_at <= new Date().toISOString()) throw createError({statusCode:410,statusMessage:'Le dépôt a expiré. Recommencez le transfert.'})
  await assertUploadQuota(db,project.id,upload.kind,Number(upload.file_size),upload.id)
  const metadata = JSON.parse(upload.metadata), id = randomUUID()
  if (upload.kind === 'file') {
   const request = await openUploadRequest(db,project.id,metadata.requestId)
   await db.prepare("INSERT INTO resources(id,project_id,kind,title,file_name,file_size,file_data,created_by) VALUES(?,?,'file',?,?,?,'',?)").run(id,project.id,upload.file_name,upload.file_name,upload.file_size,user.id)
   if (request) {
    const fulfilled = await db.prepare("UPDATE portal_file_requests SET status='fulfilled',uploaded_by=?,resource_id=?,fulfilled_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'").run(user.id,id,request.id)
    if (!fulfilled.changes) throw createError({statusCode:409,statusMessage:'Cette demande vient d’être satisfaite.'})
   }
   await db.prepare('UPDATE portal_objects SET resource_id=? WHERE id=?').run(id,objectId)
   await recordActivity(project.id,request ? `${user.name} a envoyé « ${upload.file_name} » pour la demande : ${request.title}` : `${user.name} a déposé : ${upload.file_name}`)
  } else {
   await assertAssetUploadFolder(db,project.id,metadata.category)
   await db.prepare("INSERT INTO portal_assets(id,project_id,title,description,category,file_name,mime_type,file_size,file_data,created_by) VALUES(?,?,?,?,?,?,?,?,'',?)").run(id,project.id,metadata.title,metadata.description,metadata.category,upload.file_name,upload.mime_type,upload.file_size,user.id)
   await db.prepare('UPDATE portal_objects SET asset_id=? WHERE id=?').run(id,objectId)
   await recordActivity(project.id,`MC Studio a ajouté un asset : ${metadata.title}`)
  }
  await db.prepare('UPDATE portal_uploads SET result_id=? WHERE id=?').run(id,upload.id)
  return {id}
 })
 // Expiring PUT credentials only address staging; even replay after this delete
 // cannot mutate the immutable object referenced by the resource.
 await deletePortalObject(upload.staging_key).catch(() => {})
 return result
})
