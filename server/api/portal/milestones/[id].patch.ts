import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  await requirePortalUser(event)
  throw createError({ statusCode: 410, statusMessage: 'Utilisez la feuille de route de ce projet.' })
})
