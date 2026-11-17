import { requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
import { operationsEmailState } from '../../../../utils/portal-notifications'
import { portalOperationsOverview } from '../../../../utils/portal-operations'

export default defineEventHandler(async event => {
 await requirePortalUser(event, 'admin')
 const {projectId} = getQuery(event)
 if (projectId !== undefined && typeof projectId !== 'string') {
  throw createError({statusCode:400, statusMessage:'Projet invalide.'})
 }
 return await portalOperationsOverview(await portalDb(), projectId, operationsEmailState(event))
})
