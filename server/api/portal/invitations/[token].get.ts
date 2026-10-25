import { hashToken } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') || ''
  const row = await (await portalDb()).prepare(`SELECT i.email,i.expires_at AS expiresAt,i.accepted_at AS acceptedAt,o.name AS organization
    FROM invitations i JOIN organizations o ON o.id=i.organization_id
    WHERE i.token_hash=?`).get(hashToken(token)) as any
  if (!row || row.acceptedAt || row.expiresAt <= new Date().toISOString()) {
    throw createError({ statusCode: 410, statusMessage: 'Ce lien d’invitation n’est plus valide.' })
  }
  return { email: row.email, organization: row.organization, expiresAt: row.expiresAt }
})
