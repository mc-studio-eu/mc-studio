import { chmodSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { AsyncLocalStorage } from 'node:async_hooks'
import { Pool, type PoolClient } from 'pg'
import { portalSchema } from './portal-schema.ts'

const transactionContext = new AsyncLocalStorage<PoolClient>()
let database: Promise<PortalDatabase> | undefined
export interface PortalDatabase {
 dialect: 'postgres' | 'sqlite'
 prepare(sql: string): { get(...args: any[]): Promise<any>; all(...args: any[]): Promise<any[]>; run(...args: any[]): Promise<{ changes: number }> }
 transaction<T>(fn: (db: PortalDatabase) => Promise<T>): Promise<T>
 close(): Promise<void>
}
// Query text is application-owned; preserve camelCase SQL aliases on PostgreSQL.
function postgresSql(sql: string) {
 let n = 0
 return sql.replace(/\?/g, () => `$${++n}`).replace(/\bAS ([a-z][a-zA-Z]*)\b/g, (_, alias) => `AS "${alias}"`)
}
export function portalDb(): Promise<PortalDatabase> {
 if (!database) database = connect().catch(error => { database = undefined; throw error })
 return database
}
async function connect(): Promise<PortalDatabase> {
 const connectionString = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL
 if (connectionString) {
  const pool = new Pool({ connectionString, max: 5, connectionTimeoutMillis: 15000, idleTimeoutMillis: 30000 })
  // A dedicated schema prevents collisions with the existing MC Studio database.
  const client = await pool.connect()
  try {
   await client.query('BEGIN')
   await client.query("SELECT pg_advisory_xact_lock(147731924)")
   await client.query('CREATE SCHEMA IF NOT EXISTS mc_portal')
   await client.query('SET LOCAL search_path TO mc_portal')
   await client.query(portalSchema)
   await client.query("UPDATE resources SET kind='file' WHERE kind='document'")
   await client.query("UPDATE resources SET archived=1,updated_at=CURRENT_TIMESTAMP WHERE id IN ('mc-wiki-welcome','mc-wiki-feedback','mc-wiki-files') AND archived=0")
   await client.query("UPDATE resources SET url='https://mc-studio.notion.site/Client-Documentation-3b7bde6abe06805fb2c1c15e50d14a0',updated_at=CURRENT_TIMESTAMP WHERE id='mc-wiki-client-documentation' AND url<>'https://mc-studio.notion.site/Client-Documentation-3b7bde6abe06805fb2c1c15e50d14a0'")
   await client.query('CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users(lower(email))')
   await client.query('COMMIT')
  } catch (error) { await client.query('ROLLBACK'); throw error }
  finally { client.release() }
  const query = async (sql: string, args: any[]) => {
   const current = transactionContext.getStore()
   if (current) return current.query(postgresSql(sql), args)
   const c = await pool.connect()
   try { await c.query('SET search_path TO mc_portal'); return await c.query(postgresSql(sql), args) }
   finally { c.release() }
  }
  const db: PortalDatabase = {
   dialect: 'postgres',
   prepare: sql => ({
    get: async (...args) => (await query(sql, args)).rows[0],
    all: async (...args) => (await query(sql, args)).rows,
    run: async (...args) => ({ changes: (await query(sql, args)).rowCount || 0 })
   }),
   transaction: async fn => {
    if (transactionContext.getStore()) return fn(db)
    const c = await pool.connect()
    try {
     await c.query('BEGIN'); await c.query('SET LOCAL search_path TO mc_portal')
     const value = await transactionContext.run(c, () => fn(db))
     await c.query('COMMIT'); return value
    } catch (error) { await c.query('ROLLBACK'); throw error }
    finally { c.release() }
   },
   close: async () => { await pool.end(); database = undefined }
  }
  return db
 }
 if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL must be configured in production.')
 const { DatabaseSync } = await import('node:sqlite')
 const file = resolve(process.env.NUXT_PORTAL_DB_PATH || '.data/portal/portal.sqlite')
 mkdirSync(dirname(file), { recursive: true, mode: 0o700 })
 const sqlite = new DatabaseSync(file); chmodSync(file, 0o600)
 sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;')
 sqlite.exec(portalSchema)
 sqlite.prepare("UPDATE resources SET kind='file' WHERE kind='document'").run()
 sqlite.prepare("UPDATE resources SET archived=1,updated_at=CURRENT_TIMESTAMP WHERE id IN ('mc-wiki-welcome','mc-wiki-feedback','mc-wiki-files') AND archived=0").run()
 sqlite.prepare("UPDATE resources SET url='https://mc-studio.notion.site/Client-Documentation-3b7bde6abe06805fb2c1c15e50d14a0',updated_at=CURRENT_TIMESTAMP WHERE id='mc-wiki-client-documentation' AND url<>'https://mc-studio.notion.site/Client-Documentation-3b7bde6abe06805fb2c1c15e50d14a0'").run()
 sqlite.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users(lower(email))')
 // Serialize SQLite operations so unrelated requests cannot enter another transaction.
 const context = new AsyncLocalStorage<boolean>()
 let tail = Promise.resolve()
 const exclusive = <T>(fn: () => Promise<T>): Promise<T> => {
  if (context.getStore()) return fn()
  const result = tail.then(() => context.run(true, fn))
  tail = result.then(() => {}, () => {})
  return result
 }
 const db: PortalDatabase = {
  dialect: 'sqlite',
  prepare: sql => ({
   get: (...args) => exclusive(async () => sqlite.prepare(sql).get(...args)),
   all: (...args) => exclusive(async () => sqlite.prepare(sql).all(...args)),
   run: (...args) => exclusive(async () => ({ changes: Number(sqlite.prepare(sql).run(...args).changes) }))
  }),
  transaction: fn => exclusive(async () => {
   sqlite.exec('BEGIN IMMEDIATE')
   try { const result = await fn(db); sqlite.exec('COMMIT'); return result }
   catch (error) { sqlite.exec('ROLLBACK'); throw error }
  }),
  close: async () => { sqlite.close(); database = undefined }
 }
 return db
}
