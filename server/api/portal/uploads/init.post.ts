import { randomUUID } from 'node:crypto'
import { assertSameOrigin } from '../../../utils/portal-auth'
import { accessibleProject } from '../../../utils/portal-resources'
import { directUploadInput, assertAssetUploadFolder, lockUploadProject, assertUploadQuota, openUploadRequest, MULTIPART_PRODUCTION_MAX_BYTES } from '../../../utils/portal-direct-upload'
import { portalObjectStoreConfigured, portalUploadUrlLifetime, signPortalUpload } from '../../../utils/portal-object-store'
import { assertPortalR2UploadsEnabled, consumePortalR2Operation, portalR2UploadsRequested, reservePortalR2Bytes } from '../../../utils/portal-r2-budget'
import { PORTAL_MULTIPART_FILE_MAX_BYTES } from '#shared/portal-upload'

export default defineEventHandler(async event => {
 assertSameOrigin(event)
 const body = await readBody(event)
 const {user,db,project} = await accessibleProject(event,typeof body?.projectId === 'string' ? body.projectId : undefined)
 const input = directUploadInput(body)
 if (input.kind === 'asset' && user.role !== 'admin') throw createError({statusCode:403,statusMessage:'Accès réservé à MC Studio.'})
 if (input.kind === 'asset') await assertAssetUploadFolder(db,project.id,input.metadata.category)
 const r2Configured = portalObjectStoreConfigured()
 assertPortalR2UploadsEnabled(r2Configured)
 if (!r2Configured) {
  if (portalR2UploadsRequested()) throw createError({statusCode:503,statusMessage:'Le stockage R2 n’est pas configuré. Contactez MC Studio.'})
  const maxBytes = process.env.NODE_ENV === 'production' ? MULTIPART_PRODUCTION_MAX_BYTES : PORTAL_MULTIPART_FILE_MAX_BYTES
  if (input.size > maxBytes) throw createError({statusCode:503,statusMessage:'Les gros fichiers nécessitent la configuration du stockage R2. Contactez MC Studio.'})
  return {transport:'multipart' as const}
 }
 const upload = await db.transaction(async () => {
  await lockUploadProject(db,project.id)
  const existing = await db.prepare('SELECT * FROM portal_uploads WHERE user_id=? AND client_key=?').get(user.id,input.clientKey)
  if (existing) {
   if (existing.project_id !== project.id || existing.kind !== input.kind || existing.file_name !== input.fileName || Number(existing.file_size) !== input.size || existing.mime_type !== input.mime || existing.metadata !== JSON.stringify(input.metadata)) throw createError({statusCode:409,statusMessage:'Cette clé de dépôt est déjà utilisée.'})
   if (existing.result_id) return existing
   portalUploadUrlLifetime(existing.created_at,existing.expires_at)
   // A pre-guard receipt was already included in the storage baseline. Do
   // not reissue its credentials without establishing that baseline first.
   if (!await db.prepare('SELECT id FROM portal_r2_storage_budget WHERE id=1').get()) throw createError({statusCode:410,statusMessage:'Le dépôt a expiré. Recommencez le transfert.'})
   await consumePortalR2Operation(db,'upload')
   return existing
  }
  if (input.kind === 'file') await openUploadRequest(db,project.id,input.metadata.requestId)
  await assertUploadQuota(db,project.id,input.kind,input.size)
  const id = randomUUID(), staging = `portal/staging/${project.id}/${id}`
  const now = new Date().toISOString(), expires = new Date(Date.now()+15*60*1000).toISOString()
  await reservePortalR2Bytes(db,input.size*2)
  await consumePortalR2Operation(db,'upload')
  await db.prepare('INSERT INTO portal_uploads(id,user_id,project_id,kind,client_key,staging_key,file_name,mime_type,file_size,metadata,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id,user.id,project.id,input.kind,input.clientKey,staging,input.fileName,input.mime,input.size,JSON.stringify(input.metadata),expires,now)
  await db.prepare('INSERT INTO portal_r2_copy_credits(upload_id) VALUES(?)').run(id)
  return {id,staging_key:staging,mime_type:input.mime,file_size:input.size,result_id:null,created_at:now,expires_at:expires}
 })
 if (upload.result_id) return {transport:'complete' as const,id:upload.result_id}
 return {transport:'r2' as const,uploadId:upload.id,url:await signPortalUpload(upload.staging_key,upload.mime_type,Number(upload.file_size),upload.created_at,upload.expires_at),mimeType:upload.mime_type}
})
