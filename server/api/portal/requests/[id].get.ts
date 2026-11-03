import { accessibleRequest, requestMessages, canContributeRequest, canChangeRequestStatus } from '../../../utils/portal-requests'

export default defineEventHandler(async event => {
 const { db, request, user } = await accessibleRequest(event, getRouterParam(event, 'id') || '')
 return { request, messages: await requestMessages(db, request.id), permissions: { canReply: canContributeRequest(user), canChangeStatus: canChangeRequestStatus(user, request) } }
})
