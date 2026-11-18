export interface PortalTimeSession {
  id: string
  projectId: string | null
  projectName: string
  description: string
  startedAt: string
  stoppedAt: string | null
  durationSeconds: number | null
  author: string | null
}

export function portalProjectTimeSeconds(costs: ReadonlyArray<{ minutes: number }>, sessions: ReadonlyArray<Pick<PortalTimeSession, 'durationSeconds'>>) {
  return costs.reduce((sum, cost) => sum + cost.minutes * 60, 0)
    + sessions.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0)
}

export function portalTimerDuration(seconds: number) {
  const duration = Math.max(0, Math.floor(seconds))
  return [Math.floor(duration / 3600), Math.floor(duration / 60) % 60, duration % 60]
    .map(part => String(part).padStart(2, '0')).join(':')
}
