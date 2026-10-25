import { accessibleProject } from '../../../utils/portal-resources'
import { mockupContext } from '../../../utils/portal-mockups'
export default defineEventHandler(async event=>{
 const query=getQuery(event), projectId=String(query.projectId||'')
 if(!projectId)throw createError({statusCode:400,statusMessage:'Projet requis.'})
 const {db}=await accessibleProject(event,projectId)
 const versions=await db.prepare(`SELECT v.id,v.resource_id AS resourceId,v.number,v.file_key AS fileKey,v.state,v.created_at AS createdAt,v.reviewed_at AS reviewedAt,u.name AS reviewer,r.title,(SELECT s.id FROM mockup_screens s WHERE s.version_id=v.id ORDER BY s.position LIMIT 1) AS coverId,(SELECT COUNT(*) FROM mockup_screens s WHERE s.version_id=v.id) AS screenCount FROM mockup_versions v JOIN resources r ON r.id=v.resource_id LEFT JOIN users u ON u.id=v.reviewed_by WHERE r.project_id=? AND r.archived=0 ORDER BY v.created_at DESC,v.number DESC`).all(projectId)
 if(!query.versionId)return {versions}
 const {version}=await mockupContext(event,projectId,query.versionId)
 const screens=await db.prepare('SELECT id,node_id AS nodeId,name,width,height FROM mockup_screens WHERE version_id=? ORDER BY position').all(version.id)
 const annotations=await db.prepare(`SELECT a.id,a.screen_id AS screenId,a.x,a.y,a.body,a.resolved,a.created_at AS createdAt,u.name AS author FROM mockup_annotations a JOIN mockup_screens s ON s.id=a.screen_id JOIN users u ON u.id=a.author_id WHERE s.version_id=? ORDER BY a.created_at,a.id`).all(version.id)
 const replies=await db.prepare(`SELECT r.id,r.annotation_id AS annotationId,r.body,r.created_at AS createdAt,u.name AS author FROM mockup_replies r JOIN mockup_annotations a ON a.id=r.annotation_id JOIN mockup_screens s ON s.id=a.screen_id JOIN users u ON u.id=r.author_id WHERE s.version_id=? ORDER BY r.created_at,r.id`).all(version.id)
 return {versions,screens,annotations,replies}
})
