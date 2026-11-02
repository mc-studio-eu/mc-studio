import { accessibleProject } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  const { db, project } = await accessibleProject(event, String(getQuery(event).projectId || '') || undefined)
  const requests = await db.prepare(`SELECT fr.id,fr.project_id AS projectId,fr.title,fr.description,fr.status,
      fr.resource_id AS resourceId,fr.created_at AS createdAt,fr.fulfilled_at AS fulfilledAt,
      creator.name AS createdBy,uploader.name AS uploadedBy,r.file_name AS fileName
    FROM portal_file_requests fr
    JOIN users creator ON creator.id=fr.created_by
    LEFT JOIN users uploader ON uploader.id=fr.uploaded_by
    LEFT JOIN resources r ON r.id=fr.resource_id
    WHERE fr.project_id=? ORDER BY CASE WHEN fr.status='open' THEN 0 ELSE 1 END,fr.created_at DESC`).all(project.id)
  return { requests }
})
