<script setup lang="ts">
import { memberRoleLabels } from '~/types/portal'
const props = defineProps<{ name: string; email?: string; memberRole?: string }>()
const currentPassword = ref(''), password = ref(''), confirmation = ref(''), busy = ref(false), error = ref('')
const changePassword = async () => {
  error.value = ''
  if (password.value !== confirmation.value) { error.value = 'Les mots de passe ne correspondent pas.'; return }
  busy.value = true
  try {
    await $fetch('/api/portal/auth/change-password', { method: 'POST', body: { currentPassword: currentPassword.value, password: password.value } })
    await navigateTo('/portal/login?password=changed')
  } catch (cause: any) { error.value = cause?.data?.statusMessage || 'Impossible de modifier le mot de passe.' }
  finally { busy.value = false }
}
</script>
<template>
  <section class="account-panel"><h1>Mon compte</h1><p>{{ props.name }} · {{ props.email }}</p><p v-if="memberRole">Votre rôle : <strong>{{ memberRoleLabels[memberRole] || memberRole }}</strong></p><p class="muted">Chaque membre utilise son propre compte pour conserver l’historique de ses contributions.</p>
    <form @submit.prevent="changePassword"><h2>Changer mon mot de passe</h2><label>Mot de passe actuel<input v-model="currentPassword" type="password" required autocomplete="current-password"></label><label>Nouveau mot de passe<input v-model="password" type="password" required minlength="12" maxlength="200" autocomplete="new-password"><small>12 caractères minimum.</small></label><label>Confirmer le nouveau mot de passe<input v-model="confirmation" type="password" required minlength="12" maxlength="200" autocomplete="new-password"></label><p class="muted">Vous devrez vous reconnecter sur vos appareils après ce changement.</p><p v-if="error" role="alert" class="error-message">{{ error }}</p><button :disabled="busy">{{ busy ? 'Enregistrement…' : 'Changer mon mot de passe' }}</button></form>
  </section>
</template>
<style scoped>
.account-panel{padding:32px;max-width:800px;color:var(--portal-text,#eee);font-size:14px;overflow-wrap:anywhere}
h1{margin:0 0 12px;font-size:28px;font-weight:600}
h2{margin:0;font-size:18px;font-weight:600}
p{margin:0;font-size:13px;line-height:1.6}
.account-panel>p+p{margin-top:8px}
.account-panel>p:first-of-type{font-size:15px;color:var(--portal-text)}
.muted,small{color:var(--portal-muted,#999);line-height:1.6}
form{display:grid;gap:24px;padding:28px;margin-top:28px;border:1px solid var(--portal-line,#333);background:var(--portal-surface);border-radius:8px;max-width:640px}
label{display:grid;gap:8px;font-size:13px;min-width:0}
input{width:100%;min-width:0;height:44px;border:1px solid var(--portal-line,#444);color:inherit;padding:0 12px;font:inherit;background:var(--portal-raised);border-radius:8px}
small{font-size:12px}
button{justify-self:start;min-height:44px;border:1px solid var(--portal-accent);border-radius:8px;background:var(--portal-accent);color:var(--portal-accent-ink,#fff);cursor:pointer;font:inherit;font-size:13px;font-weight:500;padding:9px 16px}
button:hover:not(:disabled){background:var(--portal-accent-hover)}
button:disabled{opacity:.5;cursor:wait}
.error-message{padding:12px;border:1px solid var(--portal-danger);background:var(--portal-danger-soft);color:var(--portal-danger);border-radius:8px}
input:focus-visible,button:focus-visible{outline:2px solid var(--portal-accent);outline-offset:3px}
@media(max-width:700px){.account-panel{padding:24px 16px}h1{font-size:24px}form{padding:20px 16px}}
</style>
