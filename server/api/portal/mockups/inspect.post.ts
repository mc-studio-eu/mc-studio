import { assertSameOrigin,requirePortalUser } from '../../../utils/portal-auth'
import { figmaSource,inspectFigma } from '../../../utils/portal-figma'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);await requirePortalUser(event,'admin')
 const body=await readBody(event)
 return inspectFigma(figmaSource(body.url))
})
