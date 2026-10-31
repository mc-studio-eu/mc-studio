import { requirePortalUser } from '../../../../utils/portal-auth'
import { ensurePortalWiki } from '../../../../utils/portal-wiki'
import { portalDb } from '../../../../utils/portal-db'

export default defineEventHandler(async (event) => {
  const admin = await requirePortalUser(event, 'admin')
  await ensurePortalWiki(admin.id)
  const db = await portalDb()
  const organizations = await db.prepare(`SELECT o.id,o.name,
      (SELECT name FROM users WHERE organization_id=o.id ORDER BY created_at LIMIT 1) AS contact,
      (SELECT email FROM users WHERE organization_id=o.id ORDER BY created_at LIMIT 1) AS email,
      (SELECT i.email FROM invitations i WHERE i.organization_id=o.id AND i.accepted_at IS NULL AND i.expires_at>? ORDER BY i.created_at DESC LIMIT 1) AS invitedEmail,
      (SELECT i.expires_at FROM invitations i WHERE i.organization_id=o.id AND i.accepted_at IS NULL AND i.expires_at>? ORDER BY i.created_at DESC LIMIT 1) AS inviteExpiresAt
    FROM organizations o ORDER BY o.created_at DESC`).all(new Date().toISOString(), new Date().toISOString()) as any[]

  const projects = await db.prepare(`SELECT p.id,p.organization_id AS organizationId,p.name,p.description,
      p.current_phase AS currentPhase,p.status,p.progress,p.due_date AS dueDate,p.created_at AS createdAt,p.updated_at AS updatedAt,
      (SELECT state FROM project_reviews WHERE project_id=p.id) AS reviewState,
      (SELECT feedback FROM project_reviews WHERE project_id=p.id) AS reviewFeedback
    FROM projects p ORDER BY p.updated_at DESC,p.created_at DESC`).all() as any[]

  return { clients: organizations.map(org => ({
    ...org,
    projects: projects.filter(project => project.organizationId === org.id),
  })) }
})
