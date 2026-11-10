import { randomUUID } from 'node:crypto'
import { portalDb } from './portal-db'
import type { PortalUser } from './portal-auth'

export const memberRoles = ['decision_maker','contributor','viewer']
export async function lockProject(db: Awaited<ReturnType<typeof portalDb>>, projectId: string) {
 if (db.dialect === 'postgres') await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(projectId)
}
export async function validateResponsible(db: Awaited<ReturnType<typeof portalDb>>, organizationId: string, id: unknown) {
 if (id === null || id === '' || id === undefined) return null
 if (typeof id !== 'string') throw createError({statusCode:400,statusMessage:'Responsable invalide.'})
 const person = await db.prepare(`SELECT u.id FROM users u LEFT JOIN portal_members m ON m.user_id=u.id WHERE u.id=? AND u.organization_id=? AND u.role='client' AND COALESCE(m.suspended,0)=0 AND COALESCE(m.member_role,'contributor')<>'viewer'`).get(id,organizationId)
 if (!person) throw createError({statusCode:400,statusMessage:'Choisissez un membre actif autorisé de ce client.'})
 return id
}
export function workflowDate(value: unknown) {
 if (value === '' || value == null) return ''
 if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value) throw createError({statusCode:400,statusMessage:'Date invalide.'})
 return value
}
export async function projectWorkflow(db: Awaited<ReturnType<typeof portalDb>>, project: any, user: PortalUser) {
 const decision = await db.prepare('SELECT d.user_id AS decisionMakerId,u.name AS decisionMakerName FROM portal_project_deciders d LEFT JOIN users u ON u.id=d.user_id WHERE d.project_id=?').get(project.id)
 const members = await db.prepare(`SELECT u.id,u.name,u.email,COALESCE(m.member_role,'contributor') AS memberRole,COALESCE(m.suspended,0) AS suspended FROM users u LEFT JOIN portal_members m ON m.user_id=u.id WHERE u.organization_id=? AND u.role='client' ORDER BY u.name,u.id`).all(project.organization_id)
 const canContribute = user.role === 'admin' || user.memberRole !== 'viewer'
 return { ...decision, decisionMakerId:decision?.decisionMakerId || null, decisionMakerName:decision?.decisionMakerName || '', members:members.map(m=>({...m,suspended:Boolean(m.suspended)})), permissions:{canContribute,canReview:user.role==='client' && user.memberRole==='decision_maker' && decision?.decisionMakerId===user.id} }
}
export async function projectTodos(db: Awaited<ReturnType<typeof portalDb>>, project: any, user?: PortalUser) {
 const decision = await db.prepare('SELECT d.user_id AS id,u.name FROM portal_project_deciders d LEFT JOIN users u ON u.id=d.user_id WHERE d.project_id=?').get(project.id)
 const requests = await db.prepare(`SELECT f.id,f.title,f.created_at AS createdAt,'file' AS kind,a.responsible_id AS responsibleId,u.name AS responsibleName,COALESCE(a.due_date,'') AS dueDate,f.status FROM portal_file_requests f LEFT JOIN portal_file_request_assignments a ON a.request_id=f.id LEFT JOIN users u ON u.id=a.responsible_id WHERE f.project_id=? AND f.status='open'`).all(project.id)
 const resources = await db.prepare(`SELECT r.id,r.id AS resourceId,r.title,r.kind,COALESCE((SELECT created_at FROM mockup_versions WHERE resource_id=r.id ORDER BY number DESC LIMIT 1),r.created_at) AS createdAt,r.due_date AS dueDate,r.status FROM resources r WHERE r.project_id=? AND r.archived=0 AND ((r.kind='payment' AND r.status='due') OR (r.kind='mockup' AND r.status IN ('pending','available')))` ).all(project.id)
 const roadmapValidations = await db.prepare(`SELECT v.id,v.step_id AS stepId,v.step_id AS resourceId,v.title,v.requested_at AS createdAt,'roadmap' AS kind,
   v.due_date AS dueDate,'pending' AS status FROM portal_roadmap_validations v
   JOIN portal_roadmap_steps s ON s.id=v.step_id LEFT JOIN portal_roadmap_decisions d ON d.validation_id=v.id
   WHERE v.project_id=? AND s.archived=0 AND d.validation_id IS NULL`).all(project.id)
 const roadmapSteps = await db.prepare(`SELECT s.id,s.id AS stepId,s.id AS resourceId,s.title,s.created_at AS createdAt,'roadmap_step' AS kind,
   s.responsible_id AS responsibleId,u.name AS responsibleName,s.end_date AS dueDate,s.status
   FROM portal_roadmap_steps s LEFT JOIN users u ON u.id=s.responsible_id
   WHERE s.project_id=? AND s.archived=0 AND s.status NOT IN ('done','awaiting_validation')`).all(project.id)
 const todos = [...requests,...[...resources,...roadmapValidations].map(r=>({...r,responsibleId:decision?.id || null,responsibleName:decision?.name || ''})),...roadmapSteps].map(t=>({...t,projectId:project.id}))
 // The client list means actions this person can actually take. Administrators see all outstanding work.
 return user && user.role!=='admin' ? todos.filter(t=>user.memberRole!=='viewer' && (!t.responsibleId || t.responsibleId===user.id) && (t.kind!=='roadmap_step' || t.responsibleId===user.id) && (!['mockup','roadmap'].includes(t.kind) || (user.memberRole==='decision_maker' && decision?.id===user.id))) : todos
}
export async function reviewHistory(db: Awaited<ReturnType<typeof portalDb>>, projectId: string) {
 return db.prepare(`SELECT h.id,h.resource_id AS resourceId,h.version_id AS versionId,h.state,h.feedback,h.author_id AS authorId,u.name AS author,h.created_at AS createdAt FROM portal_review_history h JOIN users u ON u.id=h.author_id WHERE h.project_id=? ORDER BY h.created_at DESC,h.id DESC`).all(projectId)
}
export async function saveReview(db: Awaited<ReturnType<typeof portalDb>>, projectId:string, resourceId:string, versionId:string|null, state:string, feedback:string, authorId:string) {
 await db.prepare('INSERT INTO portal_review_history(id,project_id,resource_id,version_id,state,feedback,author_id,created_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),projectId,resourceId,versionId,state,feedback,authorId,new Date().toISOString())
}
