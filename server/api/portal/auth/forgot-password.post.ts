import { assertSameOrigin, cleanEmail, hashToken, newToken, validEmail } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
import { portalBaseUrl, sendPortalEmail } from '../../../utils/portal-notifications'
const attempts=new Map<string,{count:number,reset:number}>()
export default defineEventHandler(async event=>{
 assertSameOrigin(event)
 const ip=getRequestIP(event)||'unknown', now=Date.now(), current=attempts.get(ip)
 if(current && current.reset>now && current.count>=5)throw createError({statusCode:429,statusMessage:'Réessayez dans quelques minutes.'})
 if(!current||current.reset<=now)attempts.set(ip,{count:1,reset:now+15*60000});else current.count++
 if(attempts.size>10000)for(const [key,value] of attempts)if(value.reset<=now)attempts.delete(key)
 const body=await readBody(event),email=cleanEmail(body.email),db=await portalDb()
 const base=portalBaseUrl(event)
 const user=validEmail(email)?await db.prepare(`SELECT u.id,u.email FROM users u LEFT JOIN portal_members m ON m.user_id=u.id WHERE lower(u.email)=? AND COALESCE(m.suspended,0)=0`).get(email):null
 // The same response is returned for unknown, suspended and known accounts. Tokens never leave the email channel.
 if(user) {
  const token=newToken()
  const recent=await db.prepare('SELECT created_at FROM portal_password_resets WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(user.id)
  if(!recent || now-Date.parse(recent.created_at)>=60000) {
   await db.transaction(async()=>{
    await db.prepare('DELETE FROM portal_password_resets WHERE user_id=? OR expires_at<?').run(user.id,new Date(now).toISOString())
    await db.prepare('INSERT INTO portal_password_resets(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').run(hashToken(token),user.id,new Date(now+30*60000).toISOString(),new Date(now).toISOString())
   })
   await sendPortalEmail(event,user.email,'Réinitialiser votre mot de passe · MC Studio',`Ce lien personnel est valable 30 minutes et une seule fois :\n${base}/portal/reset-password?token=${encodeURIComponent(token)}\n\nSi vous n’avez pas demandé ce changement, ignorez cet e-mail.`)
  }
 }
 return {ok:true}
})
