import type { PortalProjectStorage, PortalStorageGroup, PortalStorageStatus } from '../../shared/portal-storage.ts'
import type { PortalDatabase } from './portal-db.ts'
import { portalR2UploadsRequested, readPortalR2Budget } from './portal-r2-budget.ts'
import { portalObjectStoreConfigured } from './portal-object-store.ts'

async function readInventory(db: PortalDatabase): Promise<PortalStorageStatus['inventory']> {
 const groups = await db.prepare(`
  WITH stored_files AS (
   SELECT CASE WHEN o.id IS NULL THEN 'databaseFiles' ELSE 'r2Files' END AS storage, r.file_size
   FROM resources r LEFT JOIN portal_objects o ON o.resource_id=r.id
   WHERE r.kind='file' AND (o.id IS NOT NULL OR r.file_data<>'')
   UNION ALL
   SELECT CASE WHEN o.id IS NULL THEN 'databaseAssets' ELSE 'r2Assets' END, a.file_size
   FROM portal_assets a LEFT JOIN portal_objects o ON o.asset_id=a.id
   WHERE o.id IS NOT NULL OR a.file_data<>''
  )
  SELECT storage, COUNT(*) AS count,
         SUM(CASE WHEN file_size>0 THEN file_size ELSE 0 END) AS bytes,
         SUM(CASE WHEN file_size>0 THEN 0 ELSE 1 END) AS unknown
  FROM stored_files GROUP BY storage
  UNION ALL
  SELECT 'orphans', COUNT(*), 0, 0
  FROM portal_objects WHERE resource_id IS NULL AND asset_id IS NULL
 `).all()
 const group = (storage: string): PortalStorageGroup => {
  const row = groups.find(row => row.storage === storage)
  return { count: Number(row?.count ?? 0), knownBytes: Number(row?.bytes ?? 0), unknownSizeCount: Number(row?.unknown ?? 0) }
 }
 return {
  r2Files: group('r2Files'),
  r2Assets: group('r2Assets'),
  databaseFiles: group('databaseFiles'),
  databaseAssets: group('databaseAssets'),
  orphanObjects: group('orphans').count
 }
}

async function readProjectStorage(db: PortalDatabase, now: string): Promise<PortalProjectStorage[]> {
 // Match the direct-upload quota calculations, including archived rows and active staging reservations.
 const rows = await db.prepare(`
  WITH file_usage AS (
   SELECT project_id, SUM(file_size) AS bytes FROM resources GROUP BY project_id
  ), asset_usage AS (
   SELECT project_id, SUM(file_size) AS bytes FROM portal_assets GROUP BY project_id
  ), pending AS (
   SELECT project_id,
          SUM(CASE WHEN kind='file' THEN file_size ELSE 0 END) AS files,
          SUM(CASE WHEN kind='asset' THEN file_size ELSE 0 END) AS assets
   FROM portal_uploads WHERE result_id IS NULL AND expires_at>? GROUP BY project_id
  )
  SELECT p.id, p.name, o.name AS organization,
         COALESCE(f.bytes,0) AS fileBytes, COALESCE(a.bytes,0) AS assetBytes,
         COALESCE(u.files,0) AS pendingFileBytes, COALESCE(u.assets,0) AS pendingAssetBytes
  FROM projects p JOIN organizations o ON o.id=p.organization_id
  LEFT JOIN file_usage f ON f.project_id=p.id
  LEFT JOIN asset_usage a ON a.project_id=p.id
  LEFT JOIN pending u ON u.project_id=p.id
  WHERE COALESCE(f.bytes,0)<>0 OR COALESCE(a.bytes,0)<>0 OR COALESCE(u.files,0)<>0 OR COALESCE(u.assets,0)<>0
  ORDER BY o.name, p.name, p.id
 `).all(now)
 return rows.map(row => ({
  id: row.id,
  name: row.name,
  organization: row.organization,
  fileBytes: Number(row.fileBytes),
  assetBytes: Number(row.assetBytes),
  pendingFileBytes: Number(row.pendingFileBytes),
  pendingAssetBytes: Number(row.pendingAssetBytes)
 }))
}

export async function readPortalStorageStatus(db: PortalDatabase, now = new Date()): Promise<PortalStorageStatus> {
 const updatedAt = now.toISOString()
 const utcDay = updatedAt.slice(0, 10)
 const [inventory, budget, projects] = await Promise.all([
  readInventory(db),
  readPortalR2Budget(db, utcDay),
  readProjectStorage(db, updatedAt)
 ])
 return {
  updatedAt,
  utcDay,
  r2Configured: portalObjectStoreConfigured(),
  r2UploadsRequested: portalR2UploadsRequested(),
  inventory,
  budget,
  projects
 }
}
