import { MULTIPART_PRODUCTION_MAX_BYTES } from './portal-direct-upload'
import { createError, getRequestHeader, type H3Event } from 'h3'

// h3's multipart parser builds a JS array for every byte. Keep the body bounded
// and use Node's native multipart parser instead, including for binary files.
export async function readPortalUpload(event: H3Event, maxBytes: number): Promise<FormData> {
 if (process.env.NODE_ENV === 'production') maxBytes = Math.min(maxBytes, MULTIPART_PRODUCTION_MAX_BYTES)
 const contentType = getRequestHeader(event, 'content-type') || ''
 if (!/^multipart\/form-data\s*;/i.test(contentType)) throw createError({ statusCode: 400, statusMessage: 'Envoyez le fichier au format multipart.' })
 const limit = maxBytes + 64 * 1024
 const tooLarge = () => createError({ statusCode: 413, statusMessage: `Le fichier dépasse la limite de ${maxBytes / 1024 / 1024} Mo.` })
 const req = event.node.req
 if (Number(getRequestHeader(event, 'content-length') || 0) > limit) {
  req.resume()
  throw tooLarge()
 }
 const body = await new Promise<Buffer>((resolve, reject) => {
  const chunks: Buffer[] = []
  let length = 0
  const cleanup = () => { req.off('data', onData); req.off('end', onEnd); req.off('error', onError); req.off('aborted', onAborted) }
  const onError = (error: Error) => { cleanup(); reject(error) }
  const onAborted = () => onError(createError({ statusCode: 400, statusMessage: 'Le transfert a été interrompu.' }))
  const onEnd = () => { cleanup(); resolve(Buffer.concat(chunks, length)) }
  const onData = (chunk: Buffer | string) => {
   const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
   length += bytes.length
   if (length > limit) {
    cleanup()
    // Drain rather than destroy the request, so clients receive the 413 response.
    req.resume()
    reject(tooLarge())
   } else chunks.push(bytes)
  }
  req.on('data', onData); req.once('end', onEnd); req.once('error', onError); req.once('aborted', onAborted)
 })
 try {
  return await new Response(new Uint8Array(body), { headers: { 'Content-Type': contentType } }).formData()
 } catch {
  throw createError({ statusCode: 400, statusMessage: 'Le fichier reçu est incomplet ou invalide. Réessayez.' })
 }
}

export function portalUploadFile(form: FormData, maxBytes: number): File {
 const files = [...form.values()].filter((value): value is File => typeof value !== 'string')
 const file = form.get('file')
 if (files.length !== 1 || !file || typeof file === 'string' || !file.name || !file.size) {
  throw createError({ statusCode: 400, statusMessage: 'Choisissez un fichier non vide.' })
 }
 if (file.size > maxBytes) throw createError({ statusCode: 413, statusMessage: `Le fichier dépasse la limite de ${maxBytes / 1024 / 1024} Mo.` })
 return file
}

export function portalUploadText(form: FormData, name: string): string {
 const value = form.get(name)
 return typeof value === 'string' ? value.trim() : ''
}
