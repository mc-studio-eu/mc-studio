<script setup lang="ts">
const email = ref('')
const password = ref('')
const remember = ref(true)
const revealPassword = ref(false)
const error = ref('')
const submitting = ref(false)

useHead({ title: 'Connexion · MC Studio' })

const signIn = async () => {
  error.value = ''
  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Saisissez votre adresse e-mail et votre mot de passe.'
    return
  }
  submitting.value = true
  try {
    const { user } = await $fetch<{ user: { role: string } }>('/api/portal/auth/login', { method: 'POST', body: { email: email.value, password: password.value, remember: remember.value } })
    await navigateTo(user.role === 'admin' ? '/portal/admin' : '/portal')
  } catch (cause: any) {
    error.value = cause?.data?.statusMessage || 'Connexion impossible. Vérifiez vos identifiants.'
  } finally { submitting.value = false }
}
</script>

<template>
  <main class="portal-login"><div class="portal-login-header"><div class="login-brand"><PortalBrand /></div><PortalThemeToggle /></div><section class="login-card"><h1>Bienvenue</h1><p class="login-intro">Connectez-vous pour retrouver votre projet et vos documents.</p><form @submit.prevent="signIn"><label for="portal-email">Adresse e-mail</label><input id="portal-email" v-model="email" type="email" autocomplete="email" placeholder="vous@entreprise.fr" required><div class="password-label"><label for="portal-password">Mot de passe</label><a href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer">Besoin d’aide ?</a></div><div class="password-field"><input id="portal-password" v-model="password" :type="revealPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Votre mot de passe" required><button type="button" @click="revealPassword = !revealPassword">{{ revealPassword ? 'Masquer' : 'Afficher' }}</button></div><label class="remember-check"><input v-model="remember" type="checkbox"><span>Rester connecté</span></label><p v-if="error" class="login-error" role="alert">{{ error }}</p><button class="login-submit" type="submit" :disabled="submitting"><span>{{ submitting ? 'Connexion…' : 'Se connecter' }}</span><span>→</span></button></form><div class="privacy-note"><span>⌑</span><p>Votre espace est privé et accessible uniquement avec votre compte.</p></div></section><footer class="login-footer"><span>© 2026 MC Studio</span><span>Besoin d’aide ? <a href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer">Écrire sur WhatsApp ↗</a></span></footer></main>
</template>

<style>

.portal-login{--purple:#f0bf6c;min-height:100vh;padding:23px 27px 17px;background:var(--portal-surface, #0f0f0f);color:var(--portal-text, #f1f1f4);font:12px 'Inter',sans-serif;display:flex;flex-direction:column;align-items:center}.login-brand{align-self:flex-start;display:flex;align-items:center;gap:9px;color:inherit;text-decoration:none}.login-logo{font:800 26px 'Manrope';letter-spacing:-3px}.login-logo span{color:#f0bf6c}.login-brand>span:last-child{display:flex;flex-direction:column;gap:3px}.login-brand b{font:600 11px 'Manrope'}.login-brand small{font-size:8px;color:var(--portal-muted, #77777c)}.login-card{width:min(390px,100%);margin:auto;padding:27px 28px 22px;border:1px solid var(--portal-line, #29292c);border-radius:7px;background:var(--portal-surface, #171717);box-shadow:0 18px 55px #0003}.login-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:6px;background:#30291e;color:#f0cf98;font:700 15px 'Manrope';margin-bottom:20px}.login-kicker{font-size:8px;letter-spacing:1px;color:#e6bc79;font-weight:600}.login-card h1{font:500 28px 'Host Grotesk';letter-spacing:-.6px;margin:8px 0 5px;color:var(--portal-text, #f4f4f6)}.login-intro{font-size:10px;color:var(--portal-muted, #929297);margin:0 0 22px}.login-card form>label:not(.remember-check),.password-label label{font-size:9px;display:block;color:var(--portal-text, #d0d0d3);font-weight:500;margin-bottom:6px}.login-card form>input,.password-field{width:100%;height:36px;border:1px solid var(--portal-line, #38383b);border-radius:4px;background:var(--portal-surface, #18191b);color:var(--portal-text, #e7e7ea);outline:none;padding:0 10px;font:10px 'Inter';margin-bottom:14px}.login-card input:focus{border-color:#f0bf6c;box-shadow:0 0 0 2px #f0bf6c1d}.login-card form>input::placeholder,.password-field input::placeholder{color:var(--portal-muted, #69696e)}.password-label{display:flex;justify-content:space-between;align-items:center}.password-label a{font-size:8px;color:#eac58a;text-decoration:none;margin-bottom:6px}.password-label>button{display:none}.password-field{display:flex;padding:0;margin-bottom:13px}.password-field input{flex:1;min-width:0;border:0;outline:none;background:transparent;padding:0 10px;color:var(--portal-text, #e7e7ea);font:10px 'Inter'}.password-field>button{background:none;border:0;color:var(--portal-muted, #919196);font-size:8px;padding:0 10px}.remember-check{display:flex;align-items:center;gap:7px;color:var(--portal-muted, #a6a6ab);font-size:9px;margin:1px 0 17px;cursor:pointer}.remember-check input{appearance:none;width:13px;height:13px;border:1px solid var(--portal-line, #505054);border-radius:3px;background:var(--portal-surface, #1a1b1d);margin:0}.remember-check input:checked{background:#a27a34;border-color:#e6bc79}.remember-check input:checked:after{content:'✓';display:block;color:white;text-align:center;font-size:9px;line-height:12px}.login-error{font-size:9px;color:#ff9999;margin:-8px 0 10px}.login-submit{width:100%;height:36px;padding:0 11px;border-radius:4px;border:1px solid #edc687;background:#f0bf6c;color:var(--portal-text, #fff);font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:space-between;transition:background .15s}.login-submit:hover{background:linear-gradient(100deg,#fff 40%,#f6cd8a)}.login-submit:disabled{opacity:.65;cursor:wait}.login-divider{display:flex;align-items:center;gap:9px;margin:19px 0 10px}.login-divider span{height:1px;background:var(--portal-raised, #303034);flex:1}.login-divider b{font-size:7px;letter-spacing:.8px;color:var(--portal-muted, #77777c)}.demo-copy{font-size:9px;color:var(--portal-muted, #99999e);margin:0 0 14px;line-height:1.5}.privacy-note{display:flex;align-items:center;gap:8px;border:1px solid var(--portal-line, #2d302e);background:var(--portal-surface, #1a1d1b);border-radius:4px;padding:8px 9px}.privacy-note>span{color:#8cb28c;font-size:13px}.privacy-note p{margin:0;color:var(--portal-muted, #a2a2a4);font-size:8px;line-height:1.45}.login-footer{width:min(390px,100%);display:flex;justify-content:space-between;color:var(--portal-muted, #717176);font-size:8px}.login-footer a{color:#eac58a;text-decoration:none;margin-left:3px}
@media(max-width:500px){.portal-login{padding:18px 15px 14px}.login-brand{margin-bottom:20px}.login-card{padding:22px 19px;margin:auto}.login-footer{font-size:7px}}

.portal-login { font-size: 14px; }
.login-card { width: min(420px, 100%); padding: 32px; }
.login-brand b { font-size: 14px; }
.login-brand small { font-size: 12px; }
.login-intro, .demo-copy { font-size: 13px; line-height: 1.5; }
.login-kicker { font-size: 11px; }
.login-card form > label:not(.remember-check), .password-label label { font-size: 13px; margin-bottom: 8px; }
.login-card form > input, .password-field { height: 40px; font-size: 14px; margin-bottom: 20px; }
.password-field input { font-size: 14px; }
.password-label a, .password-field > button { font-size: 12px; }
.remember-check { font-size: 13px; }
.login-submit { height: 44px; border-radius: 14px; font-size: 14px; background: linear-gradient(100deg, #fff 25%, #f0bf6c); color: var(--portal-muted, #0f0f0f); border-color: #edc687; }
.login-divider b { font-size: 10px; }
.privacy-note p { font-size: 12px; }
.login-footer { font-size: 11px; margin-top: 24px; }
.portal-login input:focus-visible, .portal-login button:focus-visible { outline: 2px solid #f0bf6c; outline-offset: 3px; }
</style>
