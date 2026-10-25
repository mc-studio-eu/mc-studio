import { randomUUID, randomBytes, scryptSync } from 'node:crypto'
import { createInterface } from 'node:readline'
import { portalDb } from '../server/utils/portal-db.ts'

try { process.loadEnvFile('.env') } catch { /* environment may be provided by the host */ }

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (question: string) => new Promise<string>(resolve => rl.question(question, resolve))
const askPassword = () => new Promise<string>((resolve, reject) => {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) return reject(new Error('Lancez ce script depuis un terminal interactif.'))
  const input = process.stdin
  const output = process.stdout
  let value = ''
  output.write('Mot de passe admin (12 caractères minimum, saisie masquée) : ')
  input.setRawMode(true); input.resume(); input.setEncoding('utf8')
  const onData = (chunk: string) => {
    for (const char of chunk) {
      if (char === '\u0003') { cleanup(); reject(new Error('Création annulée.')); return }
      if (char === '\r' || char === '\n') { cleanup(); output.write('\n'); resolve(value); return }
      if (char === '\u007f' || char === '\b') value = value.slice(0, -1)
      else if (char >= ' ') value += char
    }
  }
  const cleanup = () => { input.off('data', onData); input.setRawMode(false); rl.close() }
  input.on('data', onData)
})

try {
  const email = (await ask('E-mail administrateur : ')).trim().toLowerCase()
  const name = (await ask('Nom affiché : ')).trim().slice(0, 100)
  rl.pause()
  const password = await askPassword()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length < 2 || password.length < 12) {
    throw new Error('E-mail, nom ou mot de passe invalide. Le mot de passe doit contenir au moins 12 caractères.')
  }
  const salt = randomBytes(16).toString('hex')
  const passwordHash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`
  const db = await portalDb()
  const existing = await db.prepare('SELECT id FROM users WHERE email=?').get(email) as { id: string } | undefined
  if (existing) {
    await db.prepare("UPDATE users SET name=?,password_hash=?,role='admin',organization_id=NULL WHERE id=?").run(name, passwordHash, existing.id)
    console.log(`Compte administrateur mis à jour pour ${email}.`)
  } else {
    await db.prepare("INSERT INTO users(id,email,name,password_hash,role) VALUES(?,?,?,?,'admin')").run(randomUUID(), email, name, passwordHash)
    console.log(`Compte administrateur créé pour ${email}.`)
  }
  await db.close()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Échec de la création du compte.')
  process.exitCode = 1
  rl.close()
}
