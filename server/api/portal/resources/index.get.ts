import { resourceColumns, accessibleProject } from '../../../utils/portal-resources'
export default defineEventHandler(async event => {
 const { db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
 const resources = await db.prepare(`SELECT ${resourceColumns} FROM resources r WHERE r.archived=0 AND (r.project_id=? OR (r.project_id IS NULL AND r.kind='wiki')) ORDER BY r.created_at DESC,r.id`).all(project.id)
 const activity = await db.prepare('SELECT id,message,created_at AS createdAt FROM activity WHERE project_id=? ORDER BY created_at DESC,id DESC LIMIT 30').all(project.id)
 return { resources, activity }
})
