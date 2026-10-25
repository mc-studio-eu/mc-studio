import { randomUUID } from 'node:crypto'
import { portalDb } from '../../../utils/portal-db'
import { hashToken, cleanEmail, verifyPassword } from '../../../utils/portal-auth'

const attempts = new Map<string, { count: number; reset: number }>()

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const ip = getRequestIP(event) || 'unknown'
  const current = attempts.get(ip)
  if (current && current.reset > Date.now() && current.count >= 10) {
    throw createError({ statusCode: 429, statusMessage: 'Trop de tentatives. Réessayez dans quelques minutes.' })
  }
  const body = await readBody<{ email?: unknown; password?: unknown; remember?: unknown }>(event)
  const email = cleanEmail(body.email)
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : ''
  const db = await portalDb()
  const user = await db.prepare('SELECT id,email,name,role,organization_id AS organizationId,password_hash FROM users WHERE email=?').get(email) as any
  const valid = user ? await verifyPassword(password, user.password_hash) : false
  if (!valid) {
    if (!current || current.reset <= Date.now()) attempts.set(ip, { count: 1, reset: Date.now() + 15 * 60_000 })
    else current.count += 1
    throw createError({ statusCode: 401, statusMessage: 'Adresse e-mail ou mot de passe incorrect.' })
  }
  attempts.delete(ip)
  const token = randomUUID() + randomUUID()
  const maxAge = body.remember === false ? 24 * 60 * 60 : 30 * 24 * 60 * 60
  await db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)')
    .run(hashToken(token), user.id, new Date(Date.now() + maxAge * 1000).toISOString())
  setCookie(event, 'mc_portal_session', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', ...(body.remember === false ? {} : { maxAge })
  })
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId } }
})
