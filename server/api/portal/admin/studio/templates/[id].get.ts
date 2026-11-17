import { requirePortalUser } from '../../../../../utils/portal-auth'
import { portalDb } from '../../../../../utils/portal-db'
import { studioTemplate } from '../../../../../utils/portal-studio'

export default defineEventHandler(async event => {
  await requirePortalUser(event, 'admin')
  const version = getQuery(event).version
  if (typeof version !== 'string' || !/^\d{1,10}$/.test(version) || Number(version) < 1 || Number(version) > 2_147_483_647) {
    throw createError({ statusCode: 400, statusMessage: 'Version invalide.' })
  }
  return studioTemplate(await portalDb(), getRouterParam(event, 'id'), Number(version))
})
