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
      (SELECT user_id FROM portal_project_deciders WHERE project_id=p.id) AS decisionMakerId,p.current_phase AS currentPhase,p.status,p.progress,p.due_date AS dueDate,p.created_at AS createdAt,p.updated_at AS updatedAt,
      (SELECT state FROM project_reviews WHERE project_id=p.id) AS reviewState,
      (SELECT feedback FROM project_reviews WHERE project_id=p.id) AS reviewFeedback
    FROM projects p ORDER BY p.updated_at DESC,p.created_at DESC`).all() as any[]

  const members = await db.prepare("SELECT u.id,u.organization_id AS organizationId,u.name,u.email,u.created_at AS createdAt,COALESCE(m.member_role,'contributor') AS memberRole,COALESCE(m.suspended,0) AS suspended FROM users u LEFT JOIN portal_members m ON m.user_id=u.id WHERE u.role='client' ORDER BY u.created_at,u.id").all()
  const invitations = await db.prepare(`SELECT i.id,i.organization_id AS organizationId,i.email,i.expires_at AS expiresAt,i.created_at AS createdAt,COALESCE(r.member_role,'contributor') AS memberRole
    FROM invitations i LEFT JOIN portal_invitation_roles r ON r.invitation_id=i.id WHERE i.accepted_at IS NULL ORDER BY i.created_at DESC,i.id`).all()

  return { clients: organizations.map(org => ({
    ...org,
    members: members.filter(member => member.organizationId === org.id).map(member => ({...member,suspended:Boolean(member.suspended)})),
    invitations: invitations.filter(invitation => invitation.organizationId === org.id),
    projects: projects.filter(project => project.organizationId === org.id),
  })) }
})
