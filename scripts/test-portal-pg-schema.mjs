// Simulate a transaction pooler returning a fresh backend after each transaction.
import assert from 'node:assert/strict'
import pg from 'pg'
import { portalDb } from '../server/utils/portal-db.ts'

process.env.DATABASE_URL = 'postgres://unused.invalid/test'
pg.Pool.prototype.connect = async function () {
  let inTransaction = false
  let portalSchema = false
  return {
    async query(sql) {
      if (sql === 'BEGIN') inTransaction = true
      if (sql === 'SET LOCAL search_path TO mc_portal') {
        assert.ok(inTransaction)
        portalSchema = true
      }
      if (sql === 'COMMIT' || sql === 'ROLLBACK') {
        inTransaction = false
        portalSchema = false
      }
      if (sql === 'SELECT id FROM sessions') {
        assert.ok(inTransaction && portalSchema, 'Session lookup lost its portal schema')
      }
      return { rows: [], rowCount: 0 }
    },
    release() { assert.equal(inTransaction, false) }
  }
}
const db = await portalDb()
try {
  const read = () => db.prepare('SELECT id FROM sessions').all()
  await Promise.all([read(), read(), db.transaction(read)])
  console.log('PASS portal schema stays selected for standalone, parallel and transactional reads')
} finally {
  await db.close()
}
