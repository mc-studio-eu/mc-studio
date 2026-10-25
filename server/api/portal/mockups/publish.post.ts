import { randomUUID } from 'node:crypto'
import { assertSameOrigin,requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject,recordActivity } from '../../../utils/portal-resources'
import { figmaSource,inspectFigma,figmaRequest,figmaImage } from '../../../utils/portal-figma'
export default defineEventHandler(async event=>{
 assertSameOrigin(event);await requirePortalUser(event,'admin')
 const body=await readBody(event)
 if(typeof body.projectId!=='string'||!body.projectId)throw createError({statusCode:400,statusMessage:'Projet requis.'})
 const {db,user,project}=await accessibleProject(event,body.projectId)
 const key=figmaSource(body.url),sourceVersion=String(body.sourceVersion||'')
 const ids=Array.isArray(body.nodeIds)?[...new Set(body.nodeIds)].filter((id):id is string=>typeof id==='string'&&/^\d+:\d+$/.test(id)):[]
 if(!ids.length||!/^\d{1,40}$/.test(sourceVersion))throw createError({statusCode:400,statusMessage:'Choisissez au moins un écran après avoir chargé le fichier.'})
 const resourceId=String(body.resourceId||'')
 if(resourceId){const existing=await db.prepare(`SELECT v.file_key FROM mockup_versions v JOIN resources r ON r.id=v.resource_id WHERE r.id=? AND r.project_id=? AND r.archived=0 LIMIT 1`).get(resourceId,project.id);if(!existing || existing.file_key!==key)throw createError({statusCode:400,statusMessage:'Ce fichier ne correspond pas à cette maquette.'})}
 const file=await inspectFigma(key,sourceVersion)
 const selected=ids.map(id=>file.screens.find(s=>s.id===id))
 if(selected.some(s=>!s))throw createError({statusCode:400,statusMessage:'Un écran a disparu. Rechargez le fichier.'})
 const params=new URLSearchParams({ids:ids.join(','),version:sourceVersion,format:'png',scale:'1',use_absolute_bounds:'true'})
 const rendered=await figmaRequest(`images/${key}?${params}`)
 const exports=[]
 for(const screen of selected){if(!screen)continue;const url=rendered.images?.[screen.id];if(!url)throw createError({statusCode:502,statusMessage:'Figma n’a pas pu exporter tous les écrans. Aucune version publiée.'});exports.push({...screen,...await figmaImage(url)})}
 return db.transaction(async()=>{
  if(db.dialect==='postgres')await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(project.id)
  if(resourceId && !await db.prepare('SELECT id FROM resources WHERE id=? AND project_id=? AND archived=0').get(resourceId,project.id))throw createError({statusCode:404,statusMessage:'Maquette archivée.'})
  const storage=await db.prepare(`SELECT COALESCE(SUM(s.file_size),0) AS total FROM mockup_screens s JOIN mockup_versions v ON v.id=s.version_id JOIN resources r ON r.id=v.resource_id WHERE r.project_id=?`).get(project.id)
  if(Number(storage.total)+exports.reduce((n,s)=>n+s.size,0)>200*1024*1024)throw createError({statusCode:413,statusMessage:'Les maquettes de ce projet dépassent 200 Mo.'})
  const rid=resourceId||randomUUID(),now=new Date().toISOString()
  if(!resourceId)await db.prepare("INSERT INTO resources(id,project_id,kind,title,url,status,created_by,created_at,updated_at) VALUES(?,?,'mockup',?,?,'pending',?,?,?)").run(rid,project.id,file.name,`https://www.figma.com/design/${key}`,user.id,now,now)
  const last=await db.prepare('SELECT COALESCE(MAX(number),0) AS number FROM mockup_versions WHERE resource_id=?').get(rid)
  const versionId=randomUUID(),number=Number(last.number)+1
  await db.prepare('INSERT INTO mockup_versions(id,resource_id,number,file_key,source_version,published_by,created_at) VALUES(?,?,?,?,?,?,?)').run(versionId,rid,number,key,sourceVersion,user.id,now)
  for(const [position,screen] of exports.entries())await db.prepare('INSERT INTO mockup_screens(id,version_id,node_id,name,position,width,height,image_data,file_size) VALUES(?,?,?,?,?,?,?,?,?)').run(randomUUID(),versionId,screen.id,screen.name,position,screen.width,screen.height,screen.data,screen.size)
  await db.prepare("UPDATE resources SET status='pending',updated_at=? WHERE id=?").run(now,rid)
  await db.prepare(`INSERT INTO project_reviews(project_id,state,feedback,updated_by) VALUES(?,'pending','',?) ON CONFLICT(project_id) DO UPDATE SET state='pending',feedback='',updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).run(project.id,user.id)
  await recordActivity(project.id,`MC Studio a publié « ${file.name} » · version ${number} · ${exports.length} écran(s).`)
  return {versionId,resourceId:rid}
 })
})
