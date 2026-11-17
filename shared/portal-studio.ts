import type { RoadmapStepKind } from './portal-roadmap'

export const studioCategories = ['request', 'validation', 'document', 'deliverable', 'payment'] as const
export const studioClassifications = ['bug', 'evolution', 'question', 'out_of_scope'] as const
export const studioPriorities = ['low', 'normal', 'high', 'urgent'] as const
export const studioTemplateIds = ['application', 'website', 'maintenance'] as const

export type StudioCategory = typeof studioCategories[number]
export type StudioClassification = typeof studioClassifications[number]
export type StudioPriority = typeof studioPriorities[number]
export type StudioTemplateId = typeof studioTemplateIds[number]

type StudioDatedItem = { title: string; description: string; startDay: number; endDay: number }
export type StudioTemplateStep = StudioDatedItem & { kind: RoadmapStepKind; requiresValidation: boolean }
export type StudioTemplatePhase = StudioDatedItem & { steps: StudioTemplateStep[] }
export type StudioTemplateFile = { title: string; description: string; dueDay: number }

export interface StudioTemplateDefinition {
  title: string
  phases: StudioTemplatePhase[]
  files: StudioTemplateFile[]
}

export interface StudioTemplate {
  id: StudioTemplateId
  version: number
  definition: StudioTemplateDefinition
}

export interface StudioTemplateSummary {
  id: StudioTemplateId
  version: number
  title: string
}

export interface StudioOnboardingInput {
  organizationId: string
  existingProjectId?: string
  templateId: StudioTemplateId
  templateVersion: number
  name: string
  description: string
  startDate: string
}

export interface StudioOnboardingProject {
  id: string
  organizationId: string
  name: string
}

interface StudioPlannedItem { title: string; description: string; startDate: string; endDate: string }
export interface StudioOnboardingPlan {
  organizationName: string
  templateTitle: string
  templateVersion: number
  name: string
  description: string
  startDate: string
  dueDate: string
  phases: (StudioPlannedItem & { steps: (StudioPlannedItem & Pick<StudioTemplateStep, 'kind' | 'requiresValidation'>)[] })[]
  files: { title: string; description: string; dueDate: string }[]
}

export interface StudioLaunchResult {
  projectId: string
  organizationId: string
  replayed: boolean
}

export interface StudioQualification {
  classification: StudioClassification | null
  priority: StudioPriority
  responsibleId: string | null
  dueDate: string | null
  snoozedUntil: string | null
}

export interface StudioItem {
  id: string
  category: StudioCategory
  title: string
  detail: string
  organizationId: string | null
  organizationName: string
  projectId: string | null
  projectName: string
  responsibleName: string | null
  dueDate: string | null
  qualification?: StudioQualification
  snoozed: boolean
  reason: string
  link: Record<string, string>
}

export interface StudioCockpit {
  today: string
  items: StudioItem[]
  priorities: StudioItem[]
  admins: { id: string; name: string }[]
  decisions: { id: string; title: string; detail: string; dueDate: string | null; link: Record<string, string> }[]
}
