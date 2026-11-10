import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { PortalDatabase } from './portal-db'
import { PORTAL_FILE_MAX_BYTES, PORTAL_FILE_QUOTA_BYTES, PORTAL_ASSET_MAX_BYTES, PORTAL_ASSET_QUOTA_BYTES } from '../../shared/portal-upload'
import { PORTAL_ASSET_DEFAULT_FOLDERS } from '../../shared/portal-assets'

export const assetTypes: Record<string, string> = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.avif':'image/avif' }
export const MULTIPART_PRODUCTION_MAX_BYTES = 3 * 1024 * 1024
export function directUploadInput(body: any) {
 if (!body || !['file','asset'].includes(body.kind) || typeof body.clientKey !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(body.clientKey)) throw createError({statusCode:400,statusMessage:'Dépôt invalide.'})
 const kind = body.kind as 'file'|'asset'
 const fileName = typeof body.fileName === 'string' ? body.fileName.replace(/[\x00-\x1f\x7f/\\]/g,'_').slice(0,180) : ''
 const size = body.fileSize
 const maxBytes = kind === 'file' ? PORTAL_FILE_MAX_BYTES : PORTAL_ASSET_MAX_BYTES
 if (!fileName || !Number.isSafeInteger(size) || size <= 0 || size > maxBytes) throw createError({statusCode:413,statusMessage:`Choisissez un fichier non vide de ${maxBytes / 1024 / 1024} Mo maximum.`})
 const text = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0,max) : ''
 const metadata = { requestId:text(body.requestId,100), title:text(body.title,160), description:text(body.description,1000), category:text(body.category,40) }
 let mime = 'application/octet-stream'
 if (kind === 'asset') {
  mime = assetTypes[fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''] || ''
  if (!mime || (body.mimeType && body.mimeType !== mime) || !metadata.title || !metadata.category) throw createError({statusCode:400,statusMessage:'Ajoutez une image, un titre et un dossier valides (PNG, JPG, WEBP, GIF ou AVIF).'})
 }
 return {kind,fileName,size,mime,metadata,clientKey:body.clientKey as string}
}
export async function assertAssetUploadFolder(db: PortalDatabase, projectId: string, category: string) {
 const valid = PORTAL_ASSET_DEFAULT_FOLDERS.some(folder => folder.id === category)
  || Boolean(await db.prepare('SELECT id FROM portal_asset_folders WHERE id=? AND project_id=?').get(category,projectId))
 if (!valid) throw createError({statusCode:400,statusMessage:'Choisissez un dossier valide pour ce projet.'})
}
export async function lockUploadProject(db: PortalDatabase, projectId: string) {
 if (db.dialect === 'postgres') await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(projectId)
}
export async function assertUploadQuota(db: PortalDatabase, projectId: string, kind: 'file'|'asset', size: number, excludeUpload = '') {
 const usage = await db.prepare(`SELECT COALESCE(SUM(file_size),0) AS total FROM ${kind === 'file' ? 'resources' : 'portal_assets'} WHERE project_id=?`).get(projectId)
 const reserved = await db.prepare('SELECT COALESCE(SUM(file_size),0) AS total FROM portal_uploads WHERE project_id=? AND kind=? AND result_id IS NULL AND expires_at>? AND id<>?').get(projectId,kind,new Date().toISOString(),excludeUpload)
 if (Number(usage.total)+Number(reserved.total)+size > (kind === 'file' ? PORTAL_FILE_QUOTA_BYTES : PORTAL_ASSET_QUOTA_BYTES)) throw createError({statusCode:413,statusMessage:kind === 'file' ? 'Ce fichier dépasserait les 500 Mo du projet (transferts en cours inclus).' : 'La médiathèque a atteint 100 Mo (transferts en cours inclus).'})
}
export async function openUploadRequest(db: PortalDatabase, projectId: string, requestId: string) {
 if (!requestId) return undefined
 const request = await db.prepare("SELECT id,title FROM portal_file_requests WHERE id=? AND project_id=? AND status='open'").get(requestId,projectId)
 if (!request) throw createError({statusCode:409,statusMessage:'Cette demande a déjà reçu un fichier ou n’existe plus.'})
 return request
}
export function newPortalObjectKey(projectId: string) { return `portal/objects/${projectId}/${randomUUID()}` }
