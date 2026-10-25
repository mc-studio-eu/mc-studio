import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { portalDb } from './portal-db'

const scryptAsync = promisify(scrypt)
export const hashToken = (value: string) => createHash('sha256').update(value).digest('hex')
export const newToken = () => randomBytes(32).toString('base64url')

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const key = await scryptAsync(password, salt, 64) as Buffer
  return `scrypt$${salt}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const actual = await scryptAsync(password, salt, 64) as Buffer
  const expected = Buffer.from(hash, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export type PortalUser = { id: string; email: string; name: string; role: 'admin' | 'client'; organizationId: string | null }

export async function getPortalUser(event: any): Promise<PortalUser | null> {
  const cookie = getCookie(event, 'mc_portal_session')
  if (!cookie) return null
  const db = await portalDb()
  const row = await db.prepare(`SELECT u.id,u.email,u.name,u.role,u.organization_id AS organizationId
    FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`)
    .get(hashToken(cookie), new Date().toISOString()) as PortalUser | undefined
  return row || null
}

export async function requirePortalUser(event: any, role?: 'admin' | 'client') {
  const user = await getPortalUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Connexion requise.' })
  if (role && user.role !== role) throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
  return user
}

export function assertSameOrigin(event: any) {
  const origin = getRequestHeader(event, 'origin')
  if (!origin) return
  try {
    if (new URL(origin).host !== getRequestURL(event).host) {
      throw createError({ statusCode: 403, statusMessage: 'Origine invalide.' })
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 403, statusMessage: 'Origine invalide.' })
  }
}

export function cleanEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase().slice(0, 254) : ''
}
export const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
