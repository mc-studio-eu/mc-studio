import { portalDb } from './portal-db'
export async function ensurePortalWiki(adminId:string) {
 const db=await portalDb()
 await db.prepare("INSERT INTO resources(id,project_id,kind,title,description,url,content,created_by) VALUES(?,NULL,'wiki',?,?,?, ?,?) ON CONFLICT(id) DO NOTHING")
  .run('mc-wiki-client-documentation','Documentation client','Retrouvez la documentation partagée par MC Studio.', 'https://mc-studio.notion.site/Client-Documentation-3b7bde6abe06805fb2c1c15e50d14a0a?pvs=74', '', adminId)
}
