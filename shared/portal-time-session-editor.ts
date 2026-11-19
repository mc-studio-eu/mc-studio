export interface SessionEditorProject { id: string; name: string; organizationId: string }
export interface SessionEditorClient { id: string; name: string }

const parisTime = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})

export function sessionParisTime(timestamp: string) {
  const parts = parisTime.formatToParts(new Date(timestamp))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}:${part('second')}`
}

// Round-trip each possible Paris offset to reject missing hours and expose repeated hours explicitly.
export function sessionParisCandidates(local: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(local)) return []
  const normalized = local.length === 16 ? `${local}:00` : local
  const wall = Date.parse(`${normalized}Z`)
  if (!Number.isFinite(wall)) return []
  const candidates = [60, 120].map(minutes => new Date(wall - minutes * 60_000).toISOString())
  return candidates.filter(candidate => sessionParisTime(candidate) === normalized).sort()
}

export function sessionDurationSeconds(value: string) {
  const parts = /^(\d{1,6}):([0-5]\d):([0-5]\d)$/.exec(value)
  return parts ? Number(parts[1]) * 3600 + Number(parts[2]) * 60 + Number(parts[3]) : null
}
