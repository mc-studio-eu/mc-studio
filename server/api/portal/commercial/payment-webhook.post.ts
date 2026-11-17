import { createHmac, timingSafeEqual } from 'node:crypto'
import { recordCommercialEntry } from '../../../utils/portal-commercial'
import { portalDb } from '../../../utils/portal-db'

const maxBytes = 16_384

export default defineEventHandler(async event => {
  const secret = process.env.PORTAL_PAYMENT_WEBHOOK_SECRET
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) throw createError({ statusCode: 503, statusMessage: 'Webhook financier non configuré.' })
  if (!/^application\/json(?:\s*;|$)/i.test(getRequestHeader(event, 'content-type') || '')) {
    throw createError({ statusCode: 415, statusMessage: 'Un corps JSON est requis.' })
  }
  const signature = getRequestHeader(event, 'x-portal-signature') || ''
  if (!/^[a-f0-9]{64}$/i.test(signature)) throw createError({ statusCode: 401, statusMessage: 'Signature invalide.' })
  if (Number(getRequestHeader(event, 'content-length')) > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: 'Charge JSON trop volumineuse.' })
  }
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of event.node.req.iterator({ destroyOnReturn: false })) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > maxBytes) throw createError({ statusCode: 413, statusMessage: 'Charge JSON trop volumineuse.' })
    chunks.push(bytes)
  }
  const raw = Buffer.concat(chunks, size)
  const expected = createHmac('sha256', secret).update(raw).digest()
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) throw createError({ statusCode: 401, statusMessage: 'Signature invalide.' })
  let payload
  try {
    payload = JSON.parse(raw.toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Charge JSON invalide.' })
  }
  return recordCommercialEntry(await portalDb(), payload, 'webhook', null)
})
