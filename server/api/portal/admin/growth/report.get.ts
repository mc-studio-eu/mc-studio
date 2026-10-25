import { requirePortalUser } from '../../../../utils/portal-auth'
import { growthDb,growthPeriod,growthGa4,growthSearch,growthVitals } from '../../../../utils/portal-growth'
const cache=new Map<string,{expires:number;data:any}>()
export default defineEventHandler(async event=>{
 await requirePortalUser(event,'admin')
 const query=getQuery(event),days=Number(query.days||28)
 if(![7,28,90].includes(days))throw createError({statusCode:400,statusMessage:'Période invalide.'})
 const site=await (await growthDb()).prepare('SELECT * FROM growth_sites WHERE id=?').get(String(query.siteId||'mc-studio'))
 if(!site)throw createError({statusCode:404,statusMessage:'Site introuvable.'})
 const period=growthPeriod(days),key=JSON.stringify([site,period,Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),Boolean(process.env.CRUX_API_KEY)])
 const cached=cache.get(key);if(cached&&cached.expires>Date.now())return cached.data
 const [ga4,search,vitals]=await Promise.all([growthGa4(site,period),growthSearch(site,period),growthVitals(site)])
 const data={period,ga4,search,vitals,fetchedAt:new Date().toISOString()}
 if(cache.size>100)cache.clear()
 cache.set(key,{expires:Date.now()+300000,data});return data
})
