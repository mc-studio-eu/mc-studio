import { accessibleProject } from '../../../utils/portal-resources'
import { canContributeRequest, requestsForProject } from '../../../utils/portal-requests'

export default defineEventHandler(async event => {
 const { db, project, user } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
 return { requests: await requestsForProject(db, project.id), permissions: { canCreate: canContributeRequest(user) } }
})
