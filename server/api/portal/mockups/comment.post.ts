import { randomUUID } from 'node:crypto'
import { assertSameOrigin } from '../../../utils/portal-auth'
import { mockupContext } from '../../../utils/portal-mockups'
import { recordActivity } from '../../../utils/portal-resources'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);const body=await readBody(event)
 const {db,user,project,version}=await mockupContext(event,body.projectId,body.versionId)
 const text=typeof body.body==='string'?body.body.trim():''
 if(body.action!=='resolve' && (!text || text.length>3000))throw createError({statusCode:400,statusMessage:'Écrivez un commentaire de 1 à 3 000 caractères.'})
 return db.transaction(async()=>{
  if(body.action==='reply'||body.action==='resolve'){
   const annotation=await db.prepare('SELECT a.id FROM mockup_annotations a JOIN mockup_screens s ON s.id=a.screen_id WHERE a.id=? AND s.version_id=?').get(String(body.annotationId||''),version.id)
   if(!annotation)throw createError({statusCode:404,statusMessage:'Annotation introuvable.'})
   if(body.action==='resolve'){
    if(typeof body.resolved!=='boolean')throw createError({statusCode:400,statusMessage:'État invalide.'})
    await db.prepare('UPDATE mockup_annotations SET resolved=? WHERE id=?').run(body.resolved?1:0,annotation.id)
   }else await db.prepare('INSERT INTO mockup_replies(id,annotation_id,body,author_id,created_at) VALUES(?,?,?,?,?)').run(randomUUID(),annotation.id,text,user.id,new Date().toISOString())
  }else if(body.action==='create'){
   const screen=await db.prepare('SELECT id FROM mockup_screens WHERE id=? AND version_id=?').get(String(body.screenId||''),version.id)
   if(!screen || typeof body.x!=='number'||typeof body.y!=='number'||!Number.isFinite(body.x)||!Number.isFinite(body.y)||body.x<0||body.x>1||body.y<0||body.y>1)throw createError({statusCode:400,statusMessage:'Position invalide.'})
   await db.prepare('INSERT INTO mockup_annotations(id,screen_id,x,y,body,author_id,created_at) VALUES(?,?,?,?,?,?,?)').run(randomUUID(),screen.id,body.x,body.y,text,user.id,new Date().toISOString())
   await recordActivity(project.id,`${user.name} a annoté « ${version.title} » · version ${version.number}.`)
  }else throw createError({statusCode:400,statusMessage:'Action invalide.'})
  return {ok:true}
 })
})
