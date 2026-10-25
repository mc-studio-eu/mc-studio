import { createSign } from 'node:crypto'
import { createError } from 'h3'
import { portalDb } from './portal-db'
export async function growthDb(){
 const db=await portalDb()
 await db.prepare(`INSERT INTO growth_sites(id,name,origin) VALUES('mc-studio','MC Studio','https://www.mc-studio.eu') ON CONFLICT(id) DO NOTHING`).run()
 return db
}
export function growthInput(body:any){
 const name=String(body.name||'').trim().slice(0,100)
 let origin=''
 try{const u=new URL(body.origin);if(u.protocol!=='https:'||u.username||u.password||u.port)throw Error();origin=u.origin}catch{throw createError({statusCode:400,statusMessage:'Indiquez une adresse de site HTTPS valide.'})}
 if(!name)throw createError({statusCode:400,statusMessage:'Nom du site requis.'})
 const ga4=String(body.ga4_property||'').trim(),search=String(body.search_property||'').trim()
 if(ga4&&!/^\d{1,20}$/.test(ga4))throw createError({statusCode:400,statusMessage:'La propriété GA4 est un identifiant numérique.'})
 if(search && !/^sc-domain:[a-z0-9.-]+$/i.test(search)){try{const u=new URL(search);if(u.protocol!=='https:'||u.username||u.password)throw Error()}catch{throw createError({statusCode:400,statusMessage:'Propriété Search Console invalide.'})}}
 const urls=['ahrefs_url','plausible_url','clarity_url'].map(key=>{
  const value=String(body[key]||'').trim();if(!value)return ''
  try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||value.length>2000)throw Error();return u.href}catch{throw createError({statusCode:400,statusMessage:'Les liens des outils doivent être en HTTPS.'})}
 })
 return {name,origin,ga4,search,urls}
}
let cachedToken:{token:string;expires:number}|undefined
export async function growthGoogleToken(){
 if(cachedToken&&cachedToken.expires>Date.now())return cachedToken.token
 const account=JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON||'{}'),now=Math.floor(Date.now()/1000)
 const encode=(o:unknown)=>Buffer.from(JSON.stringify(o)).toString('base64url')
 const assertion=`${encode({alg:'RS256',typ:'JWT'})}.${encode({iss:account.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})}`
 const signed=createSign('RSA-SHA256').update(assertion).sign(account.private_key,'base64url')
 const result=await $fetch<any>('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:`${assertion}.${signed}`}),timeout:15000})
 cachedToken={token:result.access_token,expires:Date.now()+3300000};return cachedToken.token
}
export function growthPeriod(days:number){
 // End three days ago: avoid comparing today's partial GA4 data or provisional GSC data.
 const day=(offset:number)=>{const d=new Date();d.setUTCDate(d.getUTCDate()-offset);return d.toISOString().slice(0,10)}
 return {start:day(days+2),end:day(3),previousStart:day(2*days+2),previousEnd:day(days+3),days}
}
export async function growthGa4(site:any,period:ReturnType<typeof growthPeriod>){
 if(!site.ga4_property||!process.env.GOOGLE_SERVICE_ACCOUNT_JSON)return {state:'setup',message:'Renseignez la propriété GA4 et le compte de service Google.'}
 try{
 const token=await growthGoogleToken()
 const run=(body:any)=>$fetch<any>(`https://analyticsdata.googleapis.com/v1beta/properties/${site.ga4_property}:runReport`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body,timeout:20000})
 const ranges=[{startDate:period.start,endDate:period.end,name:'current'},{startDate:period.previousStart,endDate:period.previousEnd,name:'previous'}]
 const metrics=['activeUsers','sessions','screenPageViews','keyEvents']
 const [totals,daily,channels,pages]=await Promise.all([
 run({dateRanges:ranges,metrics:metrics.map(name=>({name}))}),
 run({dateRanges:[ranges[0]],dimensions:[{name:'date'}],metrics:[{name:'sessions'},{name:'keyEvents'}],orderBys:[{dimension:{dimensionName:'date'}}],limit:100}),
 run({dateRanges:[ranges[0]],dimensions:[{name:'sessionDefaultChannelGroup'}],metrics:[{name:'sessions'}],orderBys:[{metric:{metricName:'sessions'},desc:true}],limit:12}),
 run({dateRanges:[ranges[0]],dimensions:[{name:'pagePath'}],metrics:[{name:'screenPageViews'}],orderBys:[{metric:{metricName:'screenPageViews'},desc:true}],limit:10})])
 const row=(name:string)=>totals.rows?.find((r:any)=>r.dimensionValues?.some((v:any)=>v.value===name))
 const values=(r:any)=>Object.fromEntries(metrics.map((key,i)=>[key,Number(r?.metricValues?.[i]?.value||0)]))
 return {state:'connected',current:values(row('current')),previous:values(row('previous')),daily:(daily.rows||[]).map((r:any)=>({date:r.dimensionValues[0].value.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'),sessions:Number(r.metricValues[0].value),keyEvents:Number(r.metricValues[1].value)})),channels:(channels.rows||[]).map((r:any)=>({name:r.dimensionValues[0].value,value:Number(r.metricValues[0].value)})),pages:(pages.rows||[]).map((r:any)=>({name:r.dimensionValues[0].value,value:Number(r.metricValues[0].value)})),timeZone:totals.metadata?.timeZone||'Fuseau de la propriété',thresholded:Boolean(totals.metadata?.subjectToThresholding)}
 }catch{return {state:'error',message:'GA4 inaccessible. Vérifiez l’API activée, la propriété et les droits de lecture du compte de service.'}}
}
export async function growthSearch(site:any,period:ReturnType<typeof growthPeriod>){
 if(!site.search_property||!process.env.GOOGLE_SERVICE_ACCOUNT_JSON)return {state:'setup',message:'Renseignez la propriété Search Console et donnez accès au compte de service.'}
 try{
 const token=await growthGoogleToken()
 const run=(startDate:string,endDate:string,dimensions:string[]=[],rowLimit=100)=>$fetch<any>(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.search_property)}/searchAnalytics/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:{startDate,endDate,dimensions,rowLimit,dataState:'final',type:'web'},timeout:20000})
 const [total,previous,daily,queries]=await Promise.all([run(period.start,period.end),run(period.previousStart,period.previousEnd),run(period.start,period.end,['date']),run(period.start,period.end,['query'],10)])
 const normalize=(r:any)=>r?{clicks:Number(r.clicks),impressions:Number(r.impressions),ctr:Number(r.ctr),position:Number(r.position)}:{clicks:0,impressions:0,ctr:null,position:null}
 return {state:'connected',current:normalize(total.rows?.[0]),previous:normalize(previous.rows?.[0]),daily:(daily.rows||[]).map((r:any)=>({date:r.keys[0],...normalize(r)})),queries:(queries.rows||[]).map((r:any)=>({name:r.keys[0],...normalize(r)}))}
 }catch{return {state:'error',message:'Search Console inaccessible. Vérifiez l’identifiant exact de la propriété et ses autorisations.'}}
}
export async function growthVitals(site:any){
 if(!process.env.CRUX_API_KEY)return {state:'setup',message:'Ajoutez la clé API Chrome UX Report sur le serveur.'}
 try{
 const result=await $fetch<any>('https://chromeuxreport.googleapis.com/v1/records:queryRecord',{method:'POST',query:{key:process.env.CRUX_API_KEY},body:{origin:site.origin,formFactor:'PHONE',metrics:['largest_contentful_paint','interaction_to_next_paint','cumulative_layout_shift']},timeout:20000})
 const metrics=result.record.metrics
 return {state:'connected',period:result.record.collectionPeriod,metrics:[{name:'LCP',label:'Chargement',value:metrics.largest_contentful_paint?.percentiles?.p75??null,unit:'ms',good:2500},{name:'INP',label:'Réactivité',value:metrics.interaction_to_next_paint?.percentiles?.p75??null,unit:'ms',good:200},{name:'CLS',label:'Stabilité visuelle',value:metrics.cumulative_layout_shift?.percentiles?.p75??null,unit:'',good:.1}]}
 }catch(e:any){return {state:e?.statusCode===404?'empty':'error',message:e?.statusCode===404?'Pas assez de visites Chrome pour mesurer cette origine.':'CrUX inaccessible. Vérifiez la clé API et son activation.'}}
}
