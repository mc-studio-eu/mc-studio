import { requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject } from '../../../utils/portal-resources'
import { responseRow } from '../../../utils/portal-satisfaction'
export default defineEventHandler(async event=>{
 await requirePortalUser(event,'admin')
 const {db,project}=await accessibleProject(event,String(getQuery(event).projectId||''))
 return {responses:(await db.prepare('SELECT * FROM portal_satisfaction_responses WHERE project_id=? ORDER BY submitted_at DESC,id').all(project.id)).map(responseRow)}
})
