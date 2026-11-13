#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'

const middlewarePath = new URL('../app/middleware/portal-auth.global.ts', import.meta.url)
const source = readFileSync(middlewarePath, 'utf8')
const executable = stripTypeScriptTypes(source, { mode: 'strip' })
  .replace('export default defineNuxtRouteMiddleware(', 'globalThis.portalAuthMiddleware = defineNuxtRouteMiddleware(')

function loadMiddleware() {
  let currentUser = null
  let backendError = null
  let authCalls = 0
  const navigations = []
  const sandbox = {
    defineNuxtRouteMiddleware: middleware => middleware,
    useRequestFetch: () => async endpoint => {
      authCalls += 1
      assert.equal(endpoint, '/api/portal/auth/me')
      if (backendError) throw backendError
      return { user: currentUser }
    },
    navigateTo: (destination, options) => {
      const navigation = { destination, options }
      navigations.push(navigation)
      return navigation
    }
  }

  runInNewContext(executable, sandbox, { filename: 'portal-auth.global.ts' })
  return {
    middleware: sandbox.portalAuthMiddleware,
    navigations,
    get authCalls() { return authCalls },
    setUser(user) { currentUser = user },
    setBackendError(error) { backendError = error }
  }
}

async function visit(harness, path, query = {}) {
  return harness.middleware({ path, query })
}

const plain = value => JSON.parse(JSON.stringify(value))

const guest = loadMiddleware()
assert.equal(await visit(guest, '/portal/login'), undefined, 'guest can stay on login')
assert.equal(guest.authCalls, 1, 'login navigation still checks for a current session')
assert.equal(guest.navigations.length, 0)
console.log('PASS guest login remains accessible')

for (const path of ['/portal', '/portal/admin', '/portal/admin/']) {
  const harness = loadMiddleware()
  const result = await visit(harness, path)
  assert.deepEqual(plain(result), {
    destination: '/portal/login',
    options: { replace: true }
  }, `guest navigation from ${path} replaces history with login`)
  assert.deepEqual(plain(harness.navigations), [plain(result)])
}
console.log('PASS guest protected portal routes redirect with replace, including trailing slash')

for (const [role, expectedPath] of [['admin', '/portal/admin'], ['client', '/portal']]) {
  const harness = loadMiddleware()
  harness.setUser({ role })
  const result = await visit(harness, '/portal/login')
  assert.deepEqual(plain(result), {
    destination: { path: expectedPath, query: {} },
    options: { replace: true }
  }, `${role} login redirects to its home page`)
}
console.log('PASS admin and client login redirects')

const mismatch = loadMiddleware()
mismatch.setUser({ role: 'admin' })
const mismatchResult = await visit(mismatch, '/portal', { tab: 'files', filter: 'active' })
assert.deepEqual(plain(mismatchResult), {
  destination: { path: '/portal/admin', query: { tab: 'files', filter: 'active' } },
  options: { replace: true }
}, 'role mismatch redirects to admin while preserving the requested query')

const authorizedQuery = loadMiddleware()
authorizedQuery.setUser({ role: 'admin' })
assert.equal(await visit(authorizedQuery, '/portal/admin', { tab: 'files' }), undefined,
  'authorized navigation on the role home page allows its query')
assert.equal(authorizedQuery.authCalls, 1, 'authorized query navigation checked the current session')
assert.equal(authorizedQuery.navigations.length, 0)
console.log('PASS role mismatch preserves query and authorized query navigation is allowed')

for (const [role, path, expected] of [
  ['admin', '/en/portal', { path: '/en/portal/admin', query: { view: 'recent' } }],
  ['client', '/en/portal/admin/', { path: '/en/portal', query: { view: 'recent' } }]
]) {
  const harness = loadMiddleware()
  harness.setUser({ role })
  const result = await visit(harness, path, { view: 'recent' })
  assert.deepEqual(plain(result), { destination: expected, options: { replace: true } },
    `localized ${path} redirects retain locale and query`)
}
console.log('PASS /en locale and localized trailing slash redirects')

for (const path of [
  '/about', '/en/about', '/portal/reset-password', '/portal/forgot-password', '/portal/accept'
]) {
  const harness = loadMiddleware()
  assert.equal(await visit(harness, path), undefined, `${path} is outside protected auth navigation`)
  assert.equal(harness.authCalls, 0, `${path} does not make a session request`)
}
const trailingLogin = loadMiddleware()
assert.equal(await visit(trailingLogin, '/portal/login/'), undefined, 'trailing-slash login remains accessible')
assert.equal(trailingLogin.navigations.length, 0)
console.log('PASS unrelated, reset, invite, and trailing-slash login routes are unaffected')

const freshness = loadMiddleware()
const guestResult = await visit(freshness, '/portal')
assert.deepEqual(plain(guestResult), {
  destination: '/portal/login',
  options: { replace: true }
}, 'a guest is redirected before login')
freshness.setUser({ role: 'client' })
assert.equal(await visit(freshness, '/portal'), undefined, 'new client session authorizes portal on next navigation')
freshness.setUser(null)
const loggedOutResult = await visit(freshness, '/portal')
assert.deepEqual(plain(loggedOutResult), {
  destination: '/portal/login',
  options: { replace: true }
}, 'logout is observed on the next navigation')
assert.equal(freshness.authCalls, 3, 'session is refreshed for each navigation')
console.log('PASS session freshness observes login and logout between navigations')

const failure = loadMiddleware()
const backendFailure = new Error('portal auth backend unavailable')
failure.setBackendError(backendFailure)
await assert.rejects(visit(failure, '/portal'), error => error === backendFailure,
  'auth backend failures propagate to Nuxt')
assert.equal(failure.navigations.length, 0, 'backend failure does not invent a redirect')
console.log('PASS auth backend failures propagate unchanged')
