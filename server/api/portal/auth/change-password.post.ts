import { assertSameOrigin, hashPassword, requirePortalUser, verifyPassword } from '../../../utils/portal-auth'
import { portalDb } from '../../../utils/portal-db'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);const user=await requirePortalUser(event),body=await readBody(event),db=await portalDb()
 if(typeof body.currentPassword!=='string'||body.currentPassword.length>200||typeof body.password!=='string'||body.password.length<12||body.password.length>200)throw createError({statusCode:400,statusMessage:'Utilisez un mot de passe de 12 à 200 caractères.'})
 const previous=await db.prepare('SELECT password_hash FROM users WHERE id=?').get(user.id)
 if(!previous||!await verifyPassword(body.currentPassword,previous.password_hash))throw createError({statusCode:400,statusMessage:'Le mot de passe actuel est incorrect.'})
 const password=await hashPassword(body.password)
 await db.transaction(async()=>{
  const changed=await db.prepare('UPDATE users SET password_hash=? WHERE id=? AND password_hash=?').run(password,user.id,previous.password_hash)
  if(!changed.changes)throw createError({statusCode:409,statusMessage:'Le mot de passe a changé. Reconnectez-vous.'})
  await db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id)
  await db.prepare('DELETE FROM portal_password_resets WHERE user_id=?').run(user.id)
 })
 deleteCookie(event,'mc_portal_session',{path:'/'})
 return {ok:true}
})
