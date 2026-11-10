import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { portalDb } from '../server/utils/portal-db.ts'
import { portalRoadmapMigration } from '../server/utils/portal-schema.ts'
try { process.loadEnvFile('.env') } catch {}
if (!process.env.DATABASE_URL && !process.env.NUXT_DATABASE_URL) throw new Error('Ajoutez DATABASE_URL dans .env avant la migration.')
const sourcePath=resolve(process.env.NUXT_PORTAL_DB_PATH || '.data/portal/portal.sqlite')
const db=await portalDb()
try {
 if(!existsSync(sourcePath)){console.log('Schéma mc_portal créé sur PostgreSQL. Aucune base locale à migrer.')}
 else {
  const source=new DatabaseSync(sourcePath,{readOnly:true})
  try {
   // Backup includes WAL contents via SQLite's consistent VACUUM INTO snapshot.
   const backup=sourcePath+'.backup-'+Date.now()
   source.exec(`VACUUM INTO '${backup.replace(/'/g,"''")}'`)
   const tables=['organizations','users','projects','invitations','sessions','project_reviews','resources','portal_asset_folders','portal_assets','portal_project_prompts','portal_settings','portal_file_requests','portal_requests','portal_request_messages','portal_user_preferences','activity','mockup_versions','mockup_screens','mockup_annotations','mockup_replies','growth_sites','portal_members','portal_project_deciders','portal_invitation_roles','portal_review_history','portal_password_resets','portal_notification_preferences','portal_notifications','portal_milestones','portal_roadmap_phases','portal_roadmap_steps','portal_roadmap_validations','portal_roadmap_decisions','portal_roadmap_migrations','portal_file_request_assignments','portal_satisfaction_surveys','portal_satisfaction_responses',
    'portal_uploads','portal_objects','portal_r2_storage_budget','portal_r2_copy_credits','portal_r2_daily_operations']
   const keys: Record<string, string[]> = {
    sessions: ['token_hash'], portal_password_resets: ['token_hash'], portal_settings: ['key'],
    project_reviews: ['project_id'], portal_project_prompts: ['project_id'], portal_project_deciders: ['project_id'],
    portal_satisfaction_surveys: ['project_id'], portal_roadmap_migrations: ['project_id'],
    portal_user_preferences: ['user_id'], portal_members: ['user_id'], portal_notification_preferences: ['user_id'],
    portal_invitation_roles: ['invitation_id'], portal_file_request_assignments: ['request_id'],
    portal_roadmap_decisions: ['validation_id'], portal_r2_copy_credits: ['upload_id'],
    portal_r2_daily_operations: ['operation','utc_day']
   }
   await db.transaction(async()=>{
    for(const table of tables){
     if(!source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table))continue
     const rows=source.prepare(`SELECT * FROM ${table}`).all()
     for(const row of rows){
      const columns = Object.keys(row), key = keys[table] || ['id']
      const existing = await db.prepare(`SELECT * FROM ${table} WHERE ${key.map(column=>`"${column}"=?`).join(' AND ')}`).get(...key.map(column=>row[column]))
      if(existing){
       const compared = table === 'projects' ? columns.filter(c => !['progress', 'current_phase', 'updated_at'].includes(c)) : columns
       if(compared.some(c=>String(existing[c]??'')!==String(row[c]??'')))throw new Error(`Conflit dans ${table} : arrêt sans écrasement des données distantes.`)
       continue
      }
      await db.prepare(`INSERT INTO ${table}(${columns.map(c=>`"${c}"`).join(',')}) VALUES(${columns.map(()=>'?').join(',')})`).run(...columns.map(c=>row[c]))
     }
     console.log(`${table}: ${rows.length} enregistrements vérifiés ou migrés.`)
    }
    await db.prepare(portalRoadmapMigration).run()
   })
   console.log('Migration validée. Copie locale et sauvegarde conservées.')
  }finally{source.close()}
 }
}finally{await db.close()}
