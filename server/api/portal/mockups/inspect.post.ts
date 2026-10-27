import { assertSameOrigin,requirePortalUser } from '../../../utils/portal-auth'
import { figmaSource,inspectFigma } from '../../../utils/portal-figma'
import { isError } from 'h3'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);await requirePortalUser(event,'admin')
 const body=await readBody(event)
 try { return await inspectFigma(figmaSource(body.url)) }
 catch (error) {
  if (isError(error)) throw error
  console.error('Figma file inspection failed', error instanceof Error ? error.message : 'Unknown error')
  throw createError({statusCode:502,statusMessage:'Impossible de lire ce fichier Figma. Vérifiez le lien, les droits d’accès du compte Figma et réessayez.'})
 }
})
