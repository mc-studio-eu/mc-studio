<script setup lang="ts">
const email = ref('')
const password = ref('')
const remember = ref(true)
const revealPassword = ref(false)
const error = ref('')
const submitting = ref(false)
const localePath = useLocalePath()

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
    await navigateTo(localePath(user.role === 'admin' ? '/portal/admin' : '/portal'), { replace: true })
  } catch (cause: any) {
    error.value = cause?.data?.statusMessage || 'Connexion impossible. Vérifiez vos identifiants.'
  } finally { submitting.value = false }
}
</script>

<template>
  <main class="portal-login"><div class="portal-login-header"><div class="login-brand"><PortalBrand /></div><PortalThemeToggle /></div><section class="login-card"><h1>Bienvenue</h1><p class="login-intro">Connectez-vous pour retrouver votre projet et vos documents.</p><p v-if="useRoute().query.password==='changed'" class="login-intro" role="status">Mot de passe modifié. Reconnectez-vous pour continuer.</p><form @submit.prevent="signIn"><label for="portal-email">Adresse e-mail</label><input id="portal-email" v-model="email" type="email" autocomplete="email" placeholder="vous@entreprise.fr" required><div class="password-label"><label for="portal-password">Mot de passe</label><NuxtLink to="/portal/forgot-password">Mot de passe oublié ?</NuxtLink></div><div class="password-field"><input id="portal-password" v-model="password" :type="revealPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Votre mot de passe" required><button type="button" @click="revealPassword = !revealPassword">{{ revealPassword ? 'Masquer' : 'Afficher' }}</button></div><label class="remember-check"><input v-model="remember" type="checkbox"><span>Rester connecté</span></label><p v-if="error" class="login-error" role="alert">{{ error }}</p><button class="login-submit" type="submit" :disabled="submitting"><span>{{ submitting ? 'Connexion…' : 'Se connecter' }}</span><span>→</span></button></form><div class="privacy-note"><span>⌑</span><p>Votre espace est privé et accessible uniquement avec votre compte.</p></div></section><footer class="login-footer"><span>© 2026 MC Studio</span><span>Besoin d’aide ? <a href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer">Écrire sur WhatsApp ↗</a></span></footer></main>
</template>
