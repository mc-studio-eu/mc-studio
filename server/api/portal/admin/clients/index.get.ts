import { requirePortalUser } from '../../../../utils/portal-auth'
import { ensurePortalWiki } from '../../../../utils/portal-wiki'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  const admin = await requirePortalUser(event, 'admin')
  await ensurePortalWiki(admin.id)
  const clients = await (await portalDb()).prepare(`SELECT o.id,o.name,
      (SELECT name FROM users WHERE organization_id=o.id ORDER BY created_at LIMIT 1) AS contact,
      (SELECT email FROM users WHERE organization_id=o.id ORDER BY created_at LIMIT 1) AS email,
      p.id AS projectId,p.name AS project,p.description,p.current_phase AS currentPhase,p.status,p.progress,p.due_date AS dueDate,
      (SELECT state FROM project_reviews WHERE project_id=p.id) AS reviewState,
      (SELECT feedback FROM project_reviews WHERE project_id=p.id) AS reviewFeedback,
      (SELECT i.email FROM invitations i WHERE i.organization_id=o.id AND i.accepted_at IS NULL AND i.expires_at>? ORDER BY i.created_at DESC LIMIT 1) AS invitedEmail,
      (SELECT i.expires_at FROM invitations i WHERE i.organization_id=o.id AND i.accepted_at IS NULL AND i.expires_at>? ORDER BY i.created_at DESC LIMIT 1) AS inviteExpiresAt
    FROM organizations o LEFT JOIN projects p ON p.id=(SELECT id FROM projects WHERE organization_id=o.id ORDER BY updated_at DESC LIMIT 1)
    ORDER BY o.created_at DESC`).all(new Date().toISOString(), new Date().toISOString())
  return { clients }
})
