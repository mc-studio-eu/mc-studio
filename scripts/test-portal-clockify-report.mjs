#!/usr/bin/env node
import assert from 'node:assert/strict'
import { clockifyReport, clockifyReportDate, clockifyReportMove, clockifyReportRange } from '../shared/portal-clockify-report.ts'

const session = (id, startedAt, durationSeconds, projectId = 'site', projectName = 'Site') => ({
  id, startedAt, stoppedAt: durationSeconds === null ? null : new Date(Date.parse(startedAt) + durationSeconds * 1000).toISOString(),
  durationSeconds, projectId, projectName, description: '', author: 'Admin',
})
const data = {
  historyRevision: '',
  clients: [{ id: 'atelier', name: 'Atelier' }, { id: 'studio', name: 'Studio' }],
  projects: [{ id: 'site', name: 'Site', organizationId: 'atelier' }, { id: 'app', name: 'Application', organizationId: 'studio' }],
  timeSessions: [
    session('sunday', '2026-11-15T22:30:00.000Z', 3600),
    session('monday', '2026-11-15T23:15:00.000Z', 1800),
    session('tuesday', '2026-11-17T10:00:00.000Z', 2 * 3600 + 42, 'app', 'Application'),
    session('overnight', '2026-11-22T22:30:00.000Z', 2 * 3600),
    session('next-week', '2026-11-22T23:15:00.000Z', 800),
    session('orphan', '2026-11-18T12:00:00.000Z', 1200, null, 'Ancien site'),
    session('orphan-other', '2026-11-19T12:00:00.000Z', 500, null, 'Ancienne application'),
    session('running', '2026-11-19T10:00:00.000Z', null),
    session('zero', '2026-11-20T10:00:00.000Z', 0),
  ],
}

assert.equal(clockifyReportDate('2026-02-29'), false)
assert.equal(clockifyReportDate('2024-02-29'), true)
assert.equal(clockifyReportDate('invalid'), false)
assert.equal(clockifyReportDate(['2026-11-19']), false)
const week = clockifyReportRange('2026-11-19', 'week')
assert.deepEqual([week.start, week.end, week.dates.length], ['2026-11-16', '2026-11-22', 7])
assert.deepEqual(clockifyReportRange('2026-11-22', 'week'), week)
const month = clockifyReportRange('2026-11-30', 'month')
assert.deepEqual([month.start, month.end, month.dates.length], ['2026-11-01', '2026-11-30', 30])
assert.equal(clockifyReportRange('2024-02-11', 'month').dates.length, 29)
assert.equal(clockifyReportRange('2026-02-11', 'month').dates.length, 28)
assert.equal(clockifyReportMove('2026-11-19', 'week', -1), '2026-11-12')
assert.equal(clockifyReportMove('2026-12-31', 'week', 1), '2027-01-07')
assert.equal(clockifyReportMove('2026-01-31', 'month', 1), '2026-02-01')
assert.equal(clockifyReportMove('2026-01-31', 'month', -1), '2025-12-01')

const report = clockifyReport(data, week)
assert.equal(report.sessionCount, 6)
assert.equal(report.totalSeconds, 17_942)
assert.deepEqual(report.days.map(day => day.seconds), [1800, 7242, 1200, 500, 0, 0, 7200])
assert.equal(report.days.reduce((sum, day) => sum + day.seconds, 0), report.totalSeconds)
assert.deepEqual(report.projects.map(group => [group.name, group.seconds]), [['Site', 9000], ['Application', 7242], ['Ancien site', 1200], ['Ancienne application', 500]])
assert.equal(report.projects.reduce((sum, project) => sum + project.seconds, 0), report.totalSeconds)
assert.deepEqual(report.clients.map(group => [group.name, group.seconds]), [['Atelier', 9000], ['Studio', 7242], ['Client non disponible', 1700]])
assert.equal(report.clients.reduce((sum, client) => sum + client.seconds, 0), report.totalSeconds)

// Both October DST occurrences have the same calendar day in Paris and retain their exact elapsed seconds.
const dst = clockifyReport({ ...data, timeSessions: [session('summer', '2026-10-25T00:30:00.000Z', 60), session('winter', '2026-10-25T01:30:00.000Z', 120)] }, clockifyReportRange('2026-10-25', 'week'))
assert.equal(dst.totalSeconds, 180)
assert.equal(dst.days.find(day => day.date === '2026-10-25').seconds, 180)

const edited = { ...data, timeSessions: data.timeSessions.map(row => row.id === 'tuesday' ? { ...row, durationSeconds: 600 } : row) }
assert.equal(clockifyReport(edited, week).totalSeconds, report.totalSeconds - 7242 + 600)
const deleted = { ...edited, timeSessions: edited.timeSessions.filter(row => row.id !== 'overnight') }
assert.equal(clockifyReport(deleted, week).totalSeconds, report.totalSeconds - 7242 + 600 - 7200)
const empty = clockifyReport(data, clockifyReportRange('2027-01-01', 'month'))
assert.equal(empty.totalSeconds, 0)
assert.equal(empty.sessionCount, 0)
assert.equal(empty.days.length, 31)
assert.ok(empty.days.every(day => day.seconds === 0))
assert.deepEqual(empty.projects, [])
assert.deepEqual(empty.clients, [])
console.log('PASS rapport Clockify : semaines/mois, jours Paris et DST, secondes exactes, regroupements et actualisation')
