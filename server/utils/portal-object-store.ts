import { S3Client, PutObjectCommand, HeadObjectCommand, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createError } from 'h3'

let client: S3Client | undefined
export function portalObjectStoreConfigured() {
 return Boolean(process.env.R2_ENDPOINT && process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)
}
function store() {
 if (!portalObjectStoreConfigured()) throw createError({ statusCode: 503, statusMessage: 'Le stockage R2 n’est pas configuré. Contactez MC Studio.' })
 client ||= new S3Client({ region: 'auto', endpoint: process.env.R2_ENDPOINT!, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! }, requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED' })
 return { client, Bucket: process.env.R2_BUCKET! }
}
export async function signPortalUpload(key: string, mime: string, size: number) {
 const { client, Bucket } = store()
 return getSignedUrl(client, new PutObjectCommand({ Bucket, Key: key, ContentType: mime, ContentLength: size }), { expiresIn: 300, signableHeaders: new Set(['content-type', 'content-length']) })
}
export async function headPortalObject(key: string) {
 const { client, Bucket } = store()
 return client.send(new HeadObjectCommand({ Bucket, Key: key }))
}
export async function copyPortalObject(source: string, destination: string, etag: string, mime: string) {
 const { client, Bucket } = store()
 await client.send(new CopyObjectCommand({ Bucket, Key: destination, CopySource: `${Bucket}/${source.split('/').map(encodeURIComponent).join('/')}`, CopySourceIfMatch: etag, MetadataDirective: 'REPLACE', ContentType: mime, CacheControl: 'private, no-store' }))
}
export async function deletePortalObject(key: string) {
 const { client, Bucket } = store()
 await client.send(new DeleteObjectCommand({ Bucket, Key: key }))
}
export async function signPortalDownload(key: string, name: string, mime: string, inline = false) {
 const { client, Bucket } = store()
 return getSignedUrl(client, new GetObjectCommand({ Bucket, Key: key, ResponseContentType: mime, ResponseCacheControl: 'private, no-store', ResponseContentDisposition: `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(name).replace(/'/g, '%27')}` }), { expiresIn: 60 })
}
