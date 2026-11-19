#!/usr/bin/env node
import assert from 'node:assert/strict'
import { clockifyReport, clockifyReportCustomRange, clockifyReportDate, clockifyReportMove, clockifyReportRange } from '../shared/portal-clockify-report.ts'

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

const filteredClient = clockifyReport(data, week, { clientId: 'atelier' })
assert.equal(filteredClient.totalSeconds, 9000)
assert.equal(filteredClient.sessionCount, 3)
assert.deepEqual(filteredClient.clients.map(client => client.key), ['atelier'])
assert.deepEqual(filteredClient.projects.map(project => project.key), ['site'])
const filteredProject = clockifyReport(data, week, { projectId: 'app' })
assert.equal(filteredProject.totalSeconds, 7242)
assert.equal(filteredProject.days.reduce((total, day) => total + day.seconds, 0), filteredProject.totalSeconds)
assert.deepEqual(filteredProject.projects.map(project => project.key), ['app'])
assert.equal(clockifyReport(data, week, { clientId: 'atelier', projectId: 'app' }).totalSeconds, 0)
assert.equal(clockifyReport(data, week, { projectId: 'deleted-project' }).totalSeconds, 0)
assert.equal(clockifyReport(data, week, { clientId: 'unknown-client' }).totalSeconds, 0)

assert.equal(clockifyReportCustomRange('2026-02-30', '2026-03-01'), undefined)
assert.equal(clockifyReportCustomRange('2026-11-20', '2026-11-19'), undefined)
const singleDay = clockifyReportCustomRange('2026-11-16', '2026-11-16')
assert.equal(singleDay.dates.length, 1)
assert.equal(clockifyReport(data, singleDay).totalSeconds, 1800)
const custom = clockifyReportCustomRange('2026-11-16', '2026-11-17')
const customReport = clockifyReport(data, custom)
assert.equal(customReport.totalSeconds, 9042)
assert.equal(clockifyReport(data, custom, { clientId: 'studio' }).totalSeconds, 7242)

// Inclusive dates use Paris calendar days on both sides of midnight and across DST.
const edges = { ...data, timeSessions: [
  session('before', '2026-11-15T22:59:59.000Z', 10),
  session('first', '2026-11-15T23:00:00.000Z', 20),
  session('last', '2026-11-16T22:59:59.000Z', 30),
  session('after', '2026-11-16T23:00:00.000Z', 40),
] }
assert.equal(clockifyReport(edges, singleDay).totalSeconds, 50)
const dstDay = clockifyReportCustomRange('2026-10-25', '2026-10-25')
assert.equal(clockifyReport({ ...data, timeSessions: [session('summer', '2026-10-25T00:30:00.000Z', 60), session('winter', '2026-10-25T01:30:00.000Z', 120)] }, dstDay).totalSeconds, 180)

const quarter = clockifyReportCustomRange('2026-01-15', '2026-03-21')
assert.equal(quarter.aggregation, 'month')
assert.deepEqual(quarter.dates, ['2026-01-15', '2026-02-01', '2026-03-01'])
const quarterReport = clockifyReport({ ...data, timeSessions: [
  session('jan', '2026-01-31T10:00:00.000Z', 10),
  session('feb', '2026-02-01T10:00:00.000Z', 20),
  session('march', '2026-03-21T10:00:00.000Z', 30),
  session('outside', '2026-03-22T10:00:00.000Z', 40),
] }, quarter)
assert.equal(quarterReport.totalSeconds, 60)
assert.deepEqual(quarterReport.days.map(day => [day.date, day.endDate, day.seconds]), [
  ['2026-01-15', '2026-01-31', 10], ['2026-02-01', '2026-02-28', 20], ['2026-03-01', '2026-03-21', 30],
])
const decades = clockifyReportCustomRange('1980-01-01', '2026-12-31')
assert.equal(decades.aggregation, 'year')
assert.equal(decades.dates.length, 47)
assert.equal(clockifyReport(data, decades).totalSeconds, data.timeSessions.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0))
const enormous = clockifyReportCustomRange('0001-01-01', '9999-12-31')
assert.ok(enormous.dates.length <= 60)
assert.ok(enormous.bucketYears > 1)
const enormousReport = clockifyReport(data, enormous)
assert.equal(enormousReport.totalSeconds, clockifyReport(data, decades).totalSeconds)
assert.equal(enormousReport.days.reduce((total, day) => total + day.seconds, 0), enormousReport.totalSeconds)
assert.equal(enormousReport.days.at(-1).endDate, '9999-12-31')
console.log('PASS rapport Clockify : filtres combinés, plages Paris inclusives, DST, agrégation bornée, navigation et actualisation')
