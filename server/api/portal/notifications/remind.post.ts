import { timingSafeEqual } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { deliverOperationNotifications } from '../../../utils/portal-notifications'
import { runPortalReminderTrigger } from '../../../utils/portal-operations'

export default defineEventHandler(async event => {
 const configured = Buffer.from(process.env.PORTAL_REMINDER_SECRET || '')
 const authorization = getRequestHeader(event, 'authorization') || ''
 const provided = Buffer.from(authorization.startsWith('Bearer ') ? authorization.slice(7) : '')
 const isWorker = configured.length >= 24 && configured.length === provided.length && timingSafeEqual(configured, provided)
 let actorId: string | undefined
 if (!isWorker) {
  assertSameOrigin(event)
  actorId = (await requirePortalUser(event, 'admin')).id
 }
 const body = await readBody(event) || {}
 const result = await runPortalReminderTrigger(body.projectId ? String(body.projectId) : undefined, actorId)
 return {
  ok:true, ...result, ...await deliverOperationNotifications(event),
  ...(result.skipped ? {message:'Les automatisations en pause ont été ignorées.'} :
   result.deferred ? {message:'Des relances restent dans la file d’exécution.'} : {})
 }
})
