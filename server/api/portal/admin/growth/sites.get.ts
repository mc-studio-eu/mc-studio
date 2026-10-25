import { requirePortalUser } from '../../../../utils/portal-auth'
import { growthDb } from '../../../../utils/portal-growth'
export default defineEventHandler(async event=>{
 await requirePortalUser(event,'admin')
 const sites=await (await growthDb()).prepare("SELECT * FROM growth_sites ORDER BY CASE WHEN id='mc-studio' THEN 0 ELSE 1 END,name").all()
 return {sites,googleConfigured:Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),cruxConfigured:Boolean(process.env.CRUX_API_KEY)}
})
