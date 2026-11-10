import { S3Client, PutObjectCommand, HeadObjectCommand, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createError } from 'h3'
import type { PortalDatabase } from './portal-db.ts'
import { consumePortalR2Operation } from './portal-r2-budget.ts'

let client: S3Client | undefined
export function portalObjectStoreConfigured() {
 return Boolean(process.env.R2_ENDPOINT && process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)
}
function store() {
 if (!portalObjectStoreConfigured()) throw createError({ statusCode: 503, statusMessage: 'Le stockage R2 n’est pas configuré. Contactez MC Studio.' })
 client ||= new S3Client({ region: 'auto', endpoint: process.env.R2_ENDPOINT!, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! }, maxAttempts: 1, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' })
 return { client, Bucket: process.env.R2_BUCKET! }
}
export function portalUploadUrlLifetime(createdAt: string, expiresAt: string, now = new Date()) {
 const deadline = Math.min(Date.parse(createdAt) + 300_000, Date.parse(expiresAt))
 const seconds = Math.min(300, Math.floor((deadline - now.getTime()) / 1000))
 if (!(seconds > 0)) throw createError({statusCode:410,statusMessage:'Le dépôt a expiré. Recommencez le transfert.'})
 return seconds
}
export async function signPortalUpload(key: string, mime: string, size: number, createdAt: string, expiresAt: string) {
 const { client, Bucket } = store()
 const signingDate = new Date()
 return getSignedUrl(client, new PutObjectCommand({ Bucket, Key: key, ContentType: mime, ContentLength: size, StorageClass: 'STANDARD' }), {
  signingDate,
  expiresIn: portalUploadUrlLifetime(createdAt, expiresAt, signingDate),
  signableHeaders: new Set(['content-type', 'content-length']),
  unhoistableHeaders: new Set(['x-amz-storage-class'])
 })
}
export async function headPortalObject(key: string) {
 const { client, Bucket } = store()
 return client.send(new HeadObjectCommand({ Bucket, Key: key }))
}
export async function copyPortalObject(source: string, destination: string, etag: string, mime: string) {
 const { client, Bucket } = store()
 await client.send(new CopyObjectCommand({ Bucket, Key: destination, CopySource: `${Bucket}/${source.split('/').map(encodeURIComponent).join('/')}`, CopySourceIfMatch: etag, MetadataDirective: 'REPLACE', ContentType: mime, CacheControl: 'private, no-store', StorageClass: 'STANDARD' }))
}
export async function deletePortalObject(key: string) {
 const { client, Bucket } = store()
 await client.send(new DeleteObjectCommand({ Bucket, Key: key }))
}
export async function signPortalDownload(db: PortalDatabase, key: string, name: string, mime: string, inline = false) {
 const { client, Bucket } = store()
 await consumePortalR2Operation(db,'download')
 return getSignedUrl(client, new GetObjectCommand({ Bucket, Key: key, ResponseContentType: mime, ResponseCacheControl: 'private, no-store', ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(name).replace(/'/g, '%27')}` }), { expiresIn: 60 })
}
