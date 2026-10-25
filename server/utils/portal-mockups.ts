import { createError } from 'h3'
import { accessibleProject } from './portal-resources'
export async function mockupContext(event:any,projectId:unknown,versionId:unknown) {
 if(typeof projectId!=='string' || !projectId)throw createError({statusCode:400,statusMessage:'Projet requis.'})
 const context=await accessibleProject(event,projectId)
 const version=await context.db.prepare(`SELECT v.*,r.title FROM mockup_versions v JOIN resources r ON r.id=v.resource_id WHERE v.id=? AND r.project_id=? AND r.archived=0`).get(String(versionId||''),projectId)
 if(!version)throw createError({statusCode:404,statusMessage:'Version introuvable.'})
 return {...context,version}
}
