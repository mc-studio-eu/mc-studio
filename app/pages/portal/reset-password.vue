<script setup lang="ts">
const route = useRoute()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const password = ref(''), confirmation = ref(''), busy = ref(false), done = ref(false), error = ref('')
useHead({ title: 'Nouveau mot de passe · MC Studio', meta: [{ name: 'robots', content: 'noindex,nofollow' }] })
async function resetPassword() {
  error.value = ''
  if (password.value !== confirmation.value) { error.value = 'Les mots de passe ne correspondent pas.'; return }
  busy.value = true
  try { await $fetch('/api/portal/auth/reset-password', { method: 'POST', body: { token: token.value, password: password.value } }); done.value = true; password.value = ''; confirmation.value = '' }
  catch (cause: any) { error.value = cause?.data?.statusMessage || 'Ce lien est invalide ou expiré. Demandez un nouveau lien.' }
  finally { busy.value = false }
}
</script>
<template><main class="portal-login"><div class="portal-login-header"><PortalBrand/><PortalThemeToggle/></div><section class="login-card"><h1>{{ done ? 'Mot de passe modifié' : 'Nouveau mot de passe' }}</h1><p v-if="done" class="login-intro" role="status">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p><p v-else-if="!token" class="login-intro">Ce lien ne contient pas de jeton de réinitialisation.</p><form v-else @submit.prevent="resetPassword"><p class="login-intro">Choisissez un mot de passe d’au moins 12 caractères.</p><label for="new-password">Nouveau mot de passe</label><input id="new-password" v-model="password" type="password" required minlength="12" maxlength="200" autocomplete="new-password"><label for="confirm-password">Confirmer le mot de passe</label><input id="confirm-password" v-model="confirmation" type="password" required minlength="12" maxlength="200" autocomplete="new-password"><p v-if="error" class="login-error" role="alert">{{ error }}</p><button class="login-submit" :disabled="busy">{{ busy ? 'Enregistrement…' : 'Enregistrer le mot de passe' }}</button></form><NuxtLink v-if="!done" class="return-login" to="/portal/forgot-password">Demander un nouveau lien</NuxtLink><NuxtLink class="return-login" to="/portal/login">← Retour à la connexion</NuxtLink></section></main></template>
<style scoped>.return-login{display:block;margin-top:22px;font-size:13px;color:var(--portal-text,#ddd);text-decoration:none}</style>
