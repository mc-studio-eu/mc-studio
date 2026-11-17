import { portalDb } from '../../../utils/portal-db'
import { deliverOperationNotifications } from '../../../utils/portal-notifications'
import { authorizePortalOperationsTick, runPortalOperationsTick } from '../../../utils/portal-operations'

export default defineEventHandler(async event => {
 authorizePortalOperationsTick(getRequestHeader(event, 'authorization'))
 const result = await runPortalOperationsTick(await portalDb())
 const email = result.paused ? {processed:0,sent:0} : await deliverOperationNotifications(event)
 return {ok:true, ...result, email}
})
