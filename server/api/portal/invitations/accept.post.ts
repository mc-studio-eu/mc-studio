import { randomUUID } from 'node:crypto'
import { assertSameOrigin, cleanEmail, hashPassword, hashToken, newToken, validEmail } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const body = await readBody<{ token?: unknown; email?: unknown; name?: unknown; password?: unknown }>(event)
  const token = typeof body.token === 'string' ? body.token : ''
  const email = cleanEmail(body.email)
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!token || !validEmail(email) || name.length < 2 || password.length < 12 || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Vérifiez les informations et utilisez un mot de passe de 12 caractères minimum.' })
  }
  const db = await portalDb()
  const invitation = await db.prepare(`SELECT id,email,organization_id AS organizationId,expires_at AS expiresAt,accepted_at AS acceptedAt
    FROM invitations WHERE token_hash=?`).get(hashToken(token)) as any
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date().toISOString()) {
    throw createError({ statusCode: 410, statusMessage: 'Ce lien d’invitation n’est plus valide.' })
  }
  if (email !== invitation.email.toLowerCase()) throw createError({ statusCode: 400, statusMessage: 'Utilisez l’adresse e-mail associée à l’invitation.' })
  if (await db.prepare('SELECT id FROM users WHERE email=?').get(email)) {
    throw createError({ statusCode: 409, statusMessage: 'Un compte existe déjà pour cette adresse. Connectez-vous.' })
  }
  const userId = randomUUID()
  const passwordHash = await hashPassword(password)
  const session = newToken()
  await db.transaction(async () => {
    const claimed = await db.prepare('UPDATE invitations SET accepted_at=? WHERE id=? AND accepted_at IS NULL AND expires_at>?').run(new Date().toISOString(), invitation.id, new Date().toISOString())
    if (!claimed.changes) throw createError({ statusCode: 410, statusMessage: 'Invitation déjà utilisée ou expirée.' })
    await db.prepare(`INSERT INTO users(id,email,name,password_hash,role,organization_id) VALUES(?,?,?,?, 'client',?)`)
      .run(userId, email, name, passwordHash, invitation.organizationId)
    await db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)')
      .run(hashToken(session), userId, new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString())
  })
  setCookie(event, 'mc_portal_session', session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 30 * 24 * 60 * 60 })
  return { ok: true }
})
