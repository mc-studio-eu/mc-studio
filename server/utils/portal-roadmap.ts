import { roadmapDate, roadmapProgress } from '../../shared/portal-roadmap'
import type { RoadmapData, RoadmapPhase, RoadmapStatus, RoadmapStep, RoadmapValidation } from '../../shared/portal-roadmap'
import type { PortalUser } from './portal-auth'
import type { PortalDatabase } from './portal-db'
import { projectWorkflow } from './portal-workflow'

export const roadmapValidationColumns = `v.id,v.step_id AS stepId,v.title,v.description,v.url,v.resource_id AS resourceId,
 v.resource_title AS resourceTitle,v.resource_url AS resourceUrl,v.due_date AS dueDate,
 COALESCE(d.status,'pending') AS status,v.requested_at AS requestedAt,v.requested_by AS requestedBy,
 v.requested_by_name AS requestedByName,d.decided_at AS decidedAt,d.decided_by AS decidedBy,
 d.decided_by_name AS decidedByName,COALESCE(d.comment,'') AS comment`

export function roadmapSummary(phases: RoadmapPhase[]): RoadmapData['summary'] {
  const steps = phases.flatMap(phase => phase.steps)
  const active = (status: RoadmapStatus) => ['in_progress', 'awaiting_validation', 'blocked'].includes(status)
  const current = phases.find(phase => active(phase.status) && phase.progress < 100)
    || phases.find(phase => phase.steps.some(step => active(step.status)))
  const stepDate = (step: RoadmapStep) => step.startDate || step.endDate || '9999-12-31'
  const next = steps.filter(step => step.status !== 'done').sort((a, b) => stepDate(a).localeCompare(stepDate(b)))[0]
  return {
    progress: roadmapProgress(steps),
    currentPhase: current ? { id: current.id, title: current.title, status: current.status, progress: current.progress } : null,
    nextStep: next ? { id: next.id, phaseId: next.phaseId, title: next.title, status: next.status, startDate: next.startDate, endDate: next.endDate } : null,
    pendingValidations: steps.reduce((total, step) => total + step.validations.filter(validation => validation.status === 'pending').length, 0)
  }
}

async function roadmapPlan(db: PortalDatabase, projectId: string): Promise<RoadmapPhase[]> {
  const phases = await db.prepare(`SELECT id,title,description,start_date AS startDate,end_date AS endDate,status,position
    FROM portal_roadmap_phases WHERE project_id=? AND archived=0 ORDER BY position,id`).all(projectId)
  const steps = await db.prepare(`SELECT s.id,s.phase_id AS phaseId,s.title,s.description,s.start_date AS startDate,s.end_date AS endDate,
    s.kind,s.status,s.position,s.requires_validation AS requiresValidation,s.resource_ids AS resourceIds,s.dependency_ids AS dependencyIds,
    s.responsible_id AS responsibleId,u.name AS responsibleName,s.blocker
    FROM portal_roadmap_steps s LEFT JOIN users u ON u.id=s.responsible_id
    WHERE s.project_id=? AND s.archived=0 ORDER BY s.position,s.id`).all(projectId)
  const stepsByPhase = new Map<string, RoadmapStep[]>()
  for (const row of steps) {
    const step: RoadmapStep = {
      ...row, startDate: roadmapDate(row.startDate), endDate: roadmapDate(row.endDate),
      requiresValidation: Boolean(row.requiresValidation), resourceIds: JSON.parse(row.resourceIds),
      dependencyIds: JSON.parse(row.dependencyIds), validations: []
    }
    const siblings = stepsByPhase.get(step.phaseId) || []
    siblings.push(step)
    stepsByPhase.set(step.phaseId, siblings)
  }
  return phases.map(row => {
    const steps = stepsByPhase.get(row.id) || []
    return { ...row, startDate: roadmapDate(row.startDate), endDate: roadmapDate(row.endDate), steps, progress: roadmapProgress(steps) }
  })
}

export async function projectRoadmap(db: PortalDatabase, project: { id: string; name: string; description: string; due_date: string; organization_id: string }, user: PortalUser): Promise<RoadmapData> {
  const phases = await roadmapPlan(db, project.id)
  const steps = phases.flatMap(phase => phase.steps)
  const byStep = new Map(steps.map(step => [step.id, step]))
  const resources = await db.prepare(`SELECT id,title,kind,url,file_name AS fileName FROM resources
    WHERE project_id=? AND archived=0 ORDER BY title,id`).all(project.id)
  const activeResources = new Set(resources.map(resource => resource.id))
  for (const step of steps) step.resourceIds = step.resourceIds.filter(id => activeResources.has(id))
  const history: RoadmapValidation[] = await db.prepare(`SELECT ${roadmapValidationColumns}
    FROM portal_roadmap_validations v LEFT JOIN portal_roadmap_decisions d ON d.validation_id=v.id
    WHERE v.project_id=? ORDER BY v.requested_at,v.step_id,v.attempt`).all(project.id)
  const archivedValidations: RoadmapValidation[] = []
  for (const entry of history) {
    const step = byStep.get(entry.stepId)
    if (step) step.validations.push(entry)
    else if (user.role === 'admin') archivedValidations.push(entry)
  }
  const workflow = await projectWorkflow(db, project, user)
  const scheduled = [...phases, ...steps]
  const starts = scheduled.flatMap(item => item.startDate ? [item.startDate] : []).sort()
  const ends = scheduled.flatMap(item => item.endDate ? [item.endDate] : []).sort()
  const forecast = roadmapDate(project.due_date)
  return {
    project: {
      id: project.id, name: project.name, description: project.description,
      decisionMakerName: workflow.decisionMakerName,
      startDate: starts[0] || ends[0] || null,
      endDate: [...starts, ...ends, ...(forecast ? [forecast] : [])].sort().at(-1) || null
    },
    phases,
    permissions: { canEdit: user.role === 'admin', canReview: workflow.permissions.canReview },
    summary: roadmapSummary(phases), resources, members: workflow.members, archivedValidations
  }
}

export async function syncRoadmapProject(db: PortalDatabase, projectId: string) {
  // Reopen a completed phase when active work is added or reopened in it.
  await db.prepare(`UPDATE portal_roadmap_phases SET status='in_progress' WHERE project_id=? AND archived=0 AND status='done'
    AND EXISTS (SELECT 1 FROM portal_roadmap_steps s WHERE s.phase_id=portal_roadmap_phases.id AND s.archived=0 AND s.status<>'done')`).run(projectId)
  const summary = roadmapSummary(await roadmapPlan(db, projectId))
  await db.prepare('UPDATE projects SET progress=?,current_phase=?,updated_at=? WHERE id=?')
    .run(summary.progress, summary.currentPhase?.title || '', new Date().toISOString(), projectId)
}
