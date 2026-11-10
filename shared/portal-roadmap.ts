export const roadmapStatuses = ['planned', 'in_progress', 'awaiting_validation', 'blocked', 'done'] as const
export type RoadmapStatus = typeof roadmapStatuses[number]
export type RoadmapStepKind = 'step' | 'milestone' | 'deliverable' | 'checklist'

export interface RoadmapValidation {
  id: string
  stepId: string
  title: string
  description: string
  url: string
  resourceId: string | null
  resourceTitle: string
  resourceUrl: string
  dueDate: string | null
  status: 'pending' | 'approved' | 'changes' | 'cancelled'
  requestedAt: string
  requestedBy: string
  requestedByName: string
  decidedAt: string | null
  decidedBy: string | null
  decidedByName: string | null
  comment: string
}

interface RoadmapItem {
  id: string
  title: string
  description: string
  startDate: string | null
  endDate: string | null
  status: RoadmapStatus
  position: number
}

export interface RoadmapStep extends RoadmapItem {
  phaseId: string
  kind: RoadmapStepKind
  requiresValidation: boolean
  resourceIds: string[]
  dependencyIds: string[]
  responsibleId: string | null
  responsibleName: string | null
  blocker: string
  validations: RoadmapValidation[]
}

export interface RoadmapPhase extends RoadmapItem {
  progress: number
  steps: RoadmapStep[]
}

export interface RoadmapData {
  project: { id: string; name: string; description: string; decisionMakerName: string; startDate: string | null; endDate: string | null }
  phases: RoadmapPhase[]
  permissions: { canEdit: boolean; canReview: boolean }
  summary: {
    progress: number
    currentPhase: Pick<RoadmapPhase, 'id' | 'title' | 'status' | 'progress'> | null
    nextStep: Pick<RoadmapStep, 'id' | 'phaseId' | 'title' | 'status' | 'startDate' | 'endDate'> | null
    pendingValidations: number
  }
  members: { id: string; name: string; email: string; memberRole: string; suspended: boolean }[]
  resources: { id: string; title: string; kind: string; url: string; fileName: string }[]
  archivedValidations: RoadmapValidation[]
}

export function roadmapDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return null
  const date = new Date(value + 'T00:00:00.000Z')
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value ? value : null
}

export function roadmapProgress(items: readonly { status: RoadmapStatus }[]) {
  return items.length ? Math.round(100 * items.filter(item => item.status === 'done').length / items.length) : 0
}
