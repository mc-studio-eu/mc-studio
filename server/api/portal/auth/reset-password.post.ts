import { assertSameOrigin, hashPassword, hashToken } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
const attempts=new Map<string,{count:number,reset:number}>()
export default defineEventHandler(async event=>{
 assertSameOrigin(event)
 const ip=getRequestIP(event)||'unknown',attempt=attempts.get(ip),time=Date.now()
 if(attempt && attempt.reset>time && attempt.count>=10)throw createError({statusCode:429,statusMessage:'Réessayez dans quelques minutes.'})
 if(!attempt || attempt.reset<=time)attempts.set(ip,{count:1,reset:time+15*60000});else attempt.count++
 if(attempts.size>10000)for(const [key,value] of attempts)if(value.reset<=time)attempts.delete(key)
 const body=await readBody(event)
 if(typeof body.token!=='string'||body.token.length>200||typeof body.password!=='string'||body.password.length<12||body.password.length>200)throw createError({statusCode:400,statusMessage:'Lien invalide ou mot de passe de 12 à 200 caractères requis.'})
 const db=await portalDb(),now=new Date().toISOString()
 const valid=await db.prepare('SELECT token_hash FROM portal_password_resets WHERE token_hash=? AND used_at IS NULL AND expires_at>?').get(hashToken(body.token),now)
 if(!valid)throw createError({statusCode:410,statusMessage:'Ce lien est expiré ou déjà utilisé.'})
 const password=await hashPassword(body.password)
 await db.transaction(async()=>{
  const reset=await db.prepare(`SELECT r.user_id FROM portal_password_resets r JOIN users u ON u.id=r.user_id LEFT JOIN portal_members m ON m.user_id=u.id WHERE r.token_hash=? AND r.used_at IS NULL AND r.expires_at>? AND COALESCE(m.suspended,0)=0`).get(hashToken(body.token),now)
  if(!reset)throw createError({statusCode:410,statusMessage:'Ce lien est expiré ou déjà utilisé.'})
  const claimed=await db.prepare('UPDATE portal_password_resets SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>?').run(now,hashToken(body.token),now)
  if(!claimed.changes)throw createError({statusCode:410,statusMessage:'Ce lien est expiré ou déjà utilisé.'})
  await db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(password,reset.user_id)
  await db.prepare('DELETE FROM sessions WHERE user_id=?').run(reset.user_id)
  await db.prepare('UPDATE portal_password_resets SET used_at=? WHERE user_id=? AND used_at IS NULL').run(now,reset.user_id)
 })
 deleteCookie(event,'mc_portal_session',{path:'/'})
 return {ok:true}
})
