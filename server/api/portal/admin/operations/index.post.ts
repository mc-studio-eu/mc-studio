import { assertSameOrigin, requirePortalUser } from '../../../../utils/portal-auth'
import { portalDb } from '../../../../utils/portal-db'
import { deliverOperationNotifications } from '../../../../utils/portal-notifications'
import { updatePortalOperations, type OperationAction } from '../../../../utils/portal-operations'

export default defineEventHandler(async event => {
 assertSameOrigin(event)
 const admin = await requirePortalUser(event, 'admin')
 const body = await readBody<OperationAction>(event)
 if (!body || typeof body !== 'object' || Array.isArray(body)) {
  throw createError({statusCode:400, statusMessage:'Action invalide.'})
 }
 const result = await updatePortalOperations(await portalDb(), body, admin.id)
 if (result.dispatch || (result.run?.scenario === 'reminders' && result.run.status === 'succeeded')) {
  await deliverOperationNotifications(event)
 }
 return result
})
