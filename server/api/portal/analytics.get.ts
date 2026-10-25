import { createSign } from 'node:crypto'
import { requirePortalUser } from '../../utils/portal-auth'
import { portalDb } from '../../utils/portal-db'
let token: {value:string;expires:number}|undefined
const reports = new Map<string,{expires:number;metrics:{label:string;value:number}[]}>()
export default defineEventHandler(async event => {
 const user=await requirePortalUser(event), id=String(getQuery(event).resourceId || '')
 const resource=await (await portalDb()).prepare("SELECT r.content,p.organization_id FROM resources r JOIN projects p ON p.id=r.project_id WHERE r.id=? AND r.kind='analytics' AND r.archived=0").get(id)
 if(!resource || (user.role!=='admin' && user.organizationId!==resource.organization_id)) throw createError({statusCode:404,statusMessage:'Rapport introuvable.'})
 const property=resource.content.trim()
 if(!/^\d+$/.test(property)) return {connected:false,message:'La propriété Google Analytics reste à renseigner par MC Studio.'}
 const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON
 if(!raw)return {connected:false,message:'La connexion aux statistiques sera activée par MC Studio. Votre rapport reste accessible via le lien ci-dessous.'}
 try{
  const cached=reports.get(property)
  if(cached && cached.expires>Date.now())return {connected:true,metrics:cached.metrics}
  if(!token || token.expires<Date.now()){
   const account=JSON.parse(raw), now=Math.floor(Date.now()/1000)
   const encode=(o:unknown)=>Buffer.from(JSON.stringify(o)).toString('base64url')
   const assertion=`${encode({alg:'RS256',typ:'JWT'})}.${encode({iss:account.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})}`
   const signature=createSign('RSA-SHA256').update(assertion).sign(account.private_key,'base64url')
   const response=await $fetch<{access_token:string}>('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:`${assertion}.${signature}`}),timeout:15000})
   token={value:response.access_token,expires:Date.now()+3300_000}
  }
  const response=await $fetch<any>(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`,{method:'POST',headers:{Authorization:`Bearer ${token.value}`},body:{dateRanges:[{startDate:'30daysAgo',endDate:'yesterday'}],metrics:[{name:'activeUsers'},{name:'sessions'},{name:'screenPageViews'}]},timeout:15000})
  const metrics=['Visiteurs actifs','Sessions','Pages vues'].map((label,i)=>({label,value:Number(response.rows?.[0]?.metricValues?.[i]?.value || 0)}))
  reports.set(property,{expires:Date.now()+300000,metrics});return {connected:true,metrics}
 }catch{return {connected:false,message:'Google Analytics n’est pas accessible actuellement. MC Studio doit vérifier les droits sur cette propriété.'}}
})
