<script setup lang="ts">
const route = useRoute()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const email = ref('')
const organization = ref('')
const name = ref('')
const password = ref('')
const reveal = ref(false)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const expired = ref(false)
useHead({ title: 'Créer votre compte · MC Studio' })
onMounted(async () => {
  try {
    const invitation = await $fetch<{ email: string; organization: string }>(`/api/portal/invitations/${encodeURIComponent(token.value)}`)
    email.value = invitation.email
    organization.value = invitation.organization
  } catch (cause: any) {
    expired.value = true
    error.value = cause?.data?.statusMessage || 'Ce lien d’invitation n’est plus valide.'
  } finally { loading.value = false }
})
const accept = async () => {
  error.value = ''; submitting.value = true
  try {
    await $fetch('/api/portal/invitations/accept', { method: 'POST', body: { token: token.value, email: email.value, name: name.value, password: password.value } })
    await navigateTo('/portal')
  } catch (cause: any) { error.value = cause?.data?.statusMessage || 'Impossible de créer le compte.' }
  finally { submitting.value = false }
}
</script>

<template>
  <main class="portal-login"><div class="portal-login-header"><div class="login-brand"><PortalBrand /></div><PortalThemeToggle /></div><section class="login-card"><div class="login-icon">MC</div><template v-if="loading"><h1>Vérification…</h1><p class="login-intro">Nous vérifions votre invitation.</p></template><template v-else-if="expired"><h1>Lien indisponible</h1><p class="login-intro">{{ error }}</p><a class="accept-help" href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer">Demander une nouvelle invitation ↗</a></template><template v-else><h1>Créez votre compte</h1><p class="login-intro">Rejoignez l’espace privé de {{ organization }}.</p><form @submit.prevent="accept"><label for="invite-email">Adresse e-mail</label><input id="invite-email" v-model="email" type="email" autocomplete="email" readonly><label for="invite-name">Votre nom</label><input id="invite-name" v-model="name" autocomplete="name" required placeholder="Prénom et nom"><label for="invite-password">Choisissez un mot de passe</label><div class="password-field"><input id="invite-password" v-model="password" :type="reveal ? 'text' : 'password'" autocomplete="new-password" minlength="12" required placeholder="12 caractères minimum"><button type="button" @click="reveal = !reveal">{{ reveal ? 'Masquer' : 'Afficher' }}</button></div><p class="password-hint">12 caractères minimum.</p><p v-if="error" class="login-error" role="alert">{{ error }}</p><button class="login-submit" type="submit" :disabled="submitting"><span>{{ submitting ? 'Création du compte…' : 'Créer mon compte' }}</span><span>→</span></button></form><div class="privacy-note"><span>⌑</span><p>Vous ne verrez que les projets liés à cet espace client.</p></div></template></section><footer class="login-footer"><span>© 2026 MC Studio</span><span>Une question ? <a href="https://wa.me/33781724683" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></span></footer></main>
</template>

<style scoped>
.accept-help{display:inline-block;margin-top:18px;color:var(--portal-text, #bebebe);text-decoration:none;font-size:13px}.password-hint{margin:-12px 0 14px;color:var(--portal-muted, #888);font-size:11px}.login-card form>input[readonly]{color:var(--portal-muted, #aaa);cursor:not-allowed}
</style>
