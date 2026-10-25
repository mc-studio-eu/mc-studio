import { randomUUID } from 'node:crypto'
import { assertSameOrigin, cleanEmail, hashToken, newToken, requirePortalUser, validEmail } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const admin = await requirePortalUser(event, 'admin')
  const body = await readBody<{ organizationId?: unknown; email?: unknown }>(event)
  const organizationId = typeof body.organizationId === 'string' ? body.organizationId : ''
  const email = cleanEmail(body.email)
  if (!organizationId || !validEmail(email)) throw createError({ statusCode: 400, statusMessage: 'Client ou adresse e-mail invalide.' })
  const db = await portalDb()
  const org = await db.prepare('SELECT name FROM organizations WHERE id=?').get(organizationId) as { name: string } | undefined
  if (!org) throw createError({ statusCode: 404, statusMessage: 'Client introuvable.' })
  const existing = await db.prepare('SELECT id,organization_id FROM users WHERE email=?').get(email) as any
  if (existing) throw createError({ statusCode: 409, statusMessage: existing.organization_id === organizationId ? 'Cette adresse a déjà accès à cet espace.' : 'Cette adresse est déjà associée à un autre espace client.' })
  const project = await db.prepare('SELECT id FROM projects WHERE organization_id=? ORDER BY updated_at DESC LIMIT 1').get(organizationId) as { id: string } | undefined
  if (!project) throw createError({ statusCode: 400, statusMessage: 'Ajoutez un projet avant d’inviter ce client.' })
  const configuredBaseUrl = String(useRuntimeConfig(event).public.siteUrl || '')
  if (process.env.NODE_ENV === 'production' && !configuredBaseUrl) {
    throw createError({ statusCode: 503, statusMessage: 'Configurez NUXT_PUBLIC_SITE_URL avant d’envoyer des invitations.' })
  }
  const baseUrl = configuredBaseUrl || getRequestURL(event).origin
  let inviteOrigin: URL
  try { inviteOrigin = new URL(baseUrl) } catch { throw createError({ statusCode: 503, statusMessage: 'NUXT_PUBLIC_SITE_URL est invalide.' }) }
  if (process.env.NODE_ENV === 'production' && inviteOrigin.protocol !== 'https:') {
    throw createError({ statusCode: 503, statusMessage: 'NUXT_PUBLIC_SITE_URL doit utiliser HTTPS.' })
  }
  const rawToken = newToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString()
  await db.prepare('DELETE FROM invitations WHERE organization_id=? AND email=? AND accepted_at IS NULL').run(organizationId, email)
  await db.prepare(`INSERT INTO invitations(id,organization_id,project_id,email,token_hash,expires_at,created_by) VALUES(?,?,?,?,?,?,?)
    ON CONFLICT DO NOTHING`).run(randomUUID(), organizationId, project.id, email, hashToken(rawToken), expiresAt, admin.id)
  const inviteUrl = `${String(baseUrl).replace(/\/$/, '')}/portal/accept?token=${encodeURIComponent(rawToken)}`
  const config = useRuntimeConfig(event)
  const apiKey = String(config.resendApiKey || '')
  const from = String(config.contactFrom || 'MC Studio <contact@mc-studio.eu>')
  let emailSent = false
  if (apiKey) {
    try {
      await $fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: {
          from, to: [email], subject: `Votre espace projet ${org.name} · MC Studio`,
          text: `Bonjour,\n\nMC Studio vous invite à rejoindre l’espace projet de ${org.name}.\nCréez votre compte à l’aide de ce lien (valable 7 jours) :\n${inviteUrl}\n\nÀ bientôt,\nMC Studio`,
          html: `<p>Bonjour,</p><p>MC Studio vous invite à rejoindre l’espace projet de <strong>${org.name.replace(/[&<>"']/g, '')}</strong>.</p><p><a href="${inviteUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">Créer mon compte</a></p><p>Ce lien est valable 7 jours.</p><p>À bientôt,<br>MC Studio</p>`
        }
      })
      emailSent = true
    } catch (error) {
      console.error('Portal invitation email failed', error)
    }
  }
  return { inviteUrl, emailSent, expiresAt }
})
