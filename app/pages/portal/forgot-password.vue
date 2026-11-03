<script setup lang="ts">
const email = ref(''), busy = ref(false), sent = ref(false), error = ref('')
useHead({ title: 'Mot de passe oublié · MC Studio', meta: [{ name: 'robots', content: 'noindex,nofollow' }] })
async function requestReset() {
  busy.value = true; error.value = ''
  try { await $fetch('/api/portal/auth/forgot-password', { method: 'POST', body: { email: email.value } }); sent.value = true }
  catch (cause: any) { error.value = cause?.data?.statusMessage || 'Impossible de traiter votre demande. Réessayez.' }
  finally { busy.value = false }
}
</script>
<template><main class="portal-login"><div class="portal-login-header"><PortalBrand/><PortalThemeToggle/></div><section class="login-card"><h1>Mot de passe oublié</h1><p v-if="sent" class="login-intro" role="status">Si un compte actif utilise cette adresse, un lien temporaire vous sera transmis. Consultez votre messagerie et vos courriers indésirables.</p><form v-else @submit.prevent="requestReset"><p class="login-intro">Recevez un lien pour choisir un nouveau mot de passe.</p><label for="reset-email">Adresse e-mail</label><input id="reset-email" v-model="email" type="email" required autocomplete="email" maxlength="254"><p v-if="error" class="login-error" role="alert">{{ error }}</p><button class="login-submit" :disabled="busy">{{ busy ? 'Demande en cours…' : 'Recevoir un lien' }}</button></form><NuxtLink class="return-login" to="/portal/login">← Retour à la connexion</NuxtLink></section></main></template>
<style scoped>.return-login{display:inline-block;margin-top:22px;font-size:13px;color:var(--portal-text,#ddd);text-decoration:none}</style>
