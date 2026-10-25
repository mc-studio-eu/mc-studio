import { accessibleProject } from '../../../utils/portal-resources'
export default defineEventHandler(async event => {
 const { db, user, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
 const projects = await db.prepare('SELECT id,name FROM projects WHERE organization_id=? ORDER BY created_at DESC').all(project.organization_id)
 const review = await db.prepare('SELECT state,feedback FROM project_reviews WHERE project_id=?').get(project.id)
 return { project: { id:project.id,name:project.name,description:project.description,status:project.status,progress:project.progress,dueDate:project.due_date,currentPhase:project.current_phase }, projects, review:review || {state:'pending',feedback:''} }
})
