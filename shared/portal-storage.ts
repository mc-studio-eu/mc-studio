export type PortalStorageGroup = {
 count: number
 knownBytes: number
 unknownSizeCount: number
}

export type PortalProjectStorage = {
 id: string
 organization: string
 name: string
 fileBytes: number
 assetBytes: number
 pendingFileBytes: number
 pendingAssetBytes: number
}

export type PortalStorageStatus = {
 updatedAt: string
 utcDay: string
 r2Configured: boolean
 r2UploadsRequested: boolean
 inventory: {
  r2Files: PortalStorageGroup
  r2Assets: PortalStorageGroup
  databaseFiles: PortalStorageGroup
  databaseAssets: PortalStorageGroup
  orphanObjects: number
 }
 budget: {
  reservedBytes: number | null
  limitBytes: number | null
  operations: {
   operation: 'upload' | 'head' | 'copy' | 'download'
   used: number
   limit: number | null
  }[]
 }
 projects: PortalProjectStorage[]
}
