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
    'portal_roadmap_phase_prerequisites','portal_uploads','portal_objects','portal_r2_storage_budget','portal_r2_copy_credits','portal_r2_daily_operations',
    'portal_operation_control','portal_operation_projects','portal_operation_scenarios','portal_operation_runs','portal_operation_events','portal_operation_email_attempts',
    'portal_studio_template_versions','portal_studio_launches','portal_studio_request_qualification',
    'portal_crm_contacts','portal_crm_opportunities','portal_crm_opportunity_history','portal_crm_calls',
    'portal_crm_documents','portal_crm_document_versions','portal_crm_signatures',
    'portal_finance_invoices','portal_finance_installments','portal_finance_entries','portal_finance_budgets','portal_finance_costs','portal_finance_time_sessions',
    'portal_contact_submissions']
   const keys: Record<string, string[]> = {
    sessions: ['token_hash'], portal_password_resets: ['token_hash'], portal_settings: ['key'],
    project_reviews: ['project_id'], portal_project_prompts: ['project_id'], portal_project_deciders: ['project_id'],
    portal_satisfaction_surveys: ['project_id'], portal_roadmap_migrations: ['project_id'],
    portal_user_preferences: ['user_id'], portal_members: ['user_id'], portal_notification_preferences: ['user_id'],
    portal_invitation_roles: ['invitation_id'], portal_file_request_assignments: ['request_id'],
    portal_roadmap_decisions: ['validation_id'], portal_r2_copy_credits: ['upload_id'],
    portal_roadmap_phase_prerequisites: ['project_id','phase_id','step_id'],
    portal_r2_daily_operations: ['operation','utc_day'],
    portal_operation_projects: ['project_id'],
    portal_operation_email_attempts: ['notification_id'],
    portal_studio_template_versions: ['template_id','version'],
    portal_studio_launches: ['idempotency_key'],
    portal_studio_request_qualification: ['request_id'],
    portal_crm_signatures: ['version_id'],
    portal_finance_budgets: ['project_id']
   }
   await db.transaction(async()=>{
    // Newly initialized operation defaults are not user configuration. Import
    // them only while the destination has no operation history or settings.
    const operationState = await db.prepare('SELECT paused,last_tick_at FROM portal_operation_control WHERE id=1').get()
    const operationScenarios = await db.prepare('SELECT paused,scheduled FROM portal_operation_scenarios').all()
    const operationHistory = await db.prepare('SELECT COUNT(*) AS count FROM portal_operation_events').get()
    const operationRuns = await db.prepare('SELECT COUNT(*) AS count FROM portal_operation_runs').get()
    const operationProjects = await db.prepare('SELECT COUNT(*) AS count FROM portal_operation_projects').get()
    const pristineOperations = operationState?.paused === 0 && operationState.last_tick_at == null
      && operationScenarios.every(row => row.paused === 0 && row.scheduled === 0)
      && Number(operationHistory.count) === 0 && Number(operationRuns.count) === 0 && Number(operationProjects.count) === 0
    for(const table of tables){
     if(!source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table))continue
     const rows=source.prepare(`SELECT * FROM ${table}`).all()
     if (table === 'portal_operation_runs') {
      const byId = new Map(rows.map(row => [row.id, row]))
      const depths = new Map<unknown, number>()
      const visiting = new Set<unknown>()
      const depth = (row: Record<string, any>): number => {
       if (depths.has(row.id)) return depths.get(row.id)!
       if (visiting.has(row.id)) throw new Error('Cycle dans les reprises d’automatisation : migration arrêtée.')
       visiting.add(row.id)
       const parent = row.replay_of && byId.get(row.replay_of)
       const result = parent ? depth(parent) + 1 : 0
       visiting.delete(row.id)
       depths.set(row.id, result)
       return result
      }
      rows.sort((a, b) => depth(a) - depth(b))
     }
     for(const row of rows){
      const columns = Object.keys(row), key = keys[table] || ['id']
      const existing = await db.prepare(`SELECT * FROM ${table} WHERE ${key.map(column=>`"${column}"=?`).join(' AND ')}`).get(...key.map(column=>row[column]))
      if(existing){
       if (pristineOperations && ['portal_operation_control','portal_operation_scenarios'].includes(table)) {
        const mutable = columns.filter(column => !key.includes(column))
        await db.prepare(`UPDATE ${table} SET ${mutable.map(column => `"${column}"=?`).join(',')} WHERE ${key.map(column => `"${column}"=?`).join(' AND ')}`)
         .run(...mutable.map(column => row[column]), ...key.map(column => row[column]))
        continue
       }
       const seedTemplate = table === 'portal_studio_template_versions' && row.version === 1 && row.created_by == null && existing.created_by == null
       const compared = table === 'projects' ? columns.filter(c => !['progress', 'current_phase', 'updated_at'].includes(c)) : seedTemplate ? columns.filter(c => c !== 'created_at') : columns
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
