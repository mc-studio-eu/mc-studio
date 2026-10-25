import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { portalDb } from '../server/utils/portal-db.ts'
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
   const tables=['organizations','users','projects','invitations','sessions','project_reviews','resources','activity','mockup_versions','mockup_screens','mockup_annotations','mockup_replies','growth_sites']
   await db.transaction(async()=>{
    for(const table of tables){
     if(!source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table))continue
     const rows=source.prepare(`SELECT * FROM ${table}`).all()
     for(const row of rows){
      const columns=Object.keys(row),key=table==='sessions'?'token_hash':table==='project_reviews'?'project_id':'id'
      const existing=await db.prepare(`SELECT * FROM ${table} WHERE ${key}=?`).get(row[key])
      if(existing){
       if(columns.some(c=>String(existing[c]??'')!==String(row[c]??'')))throw new Error(`Conflit dans ${table} : arrêt sans écrasement des données distantes.`)
       continue
      }
      await db.prepare(`INSERT INTO ${table}(${columns.map(c=>`"${c}"`).join(',')}) VALUES(${columns.map(()=>'?').join(',')})`).run(...columns.map(c=>row[c]))
     }
     console.log(`${table}: ${rows.length} enregistrements vérifiés ou migrés.`)
    }
   })
   console.log('Migration validée. Copie locale et sauvegarde conservées.')
  }finally{source.close()}
 }
}finally{await db.close()}
