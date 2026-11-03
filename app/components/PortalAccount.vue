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
.account-panel{padding:24px;max-width:680px;color:var(--portal-text,#eee)}h1{font-size:22px;font-weight:500;margin:0 0 14px}h2{font-size:17px;font-weight:500;margin:0 0 18px}p{font-size:13px}.muted,small{color:var(--portal-muted,#999);line-height:1.6}form{padding:22px;margin-top:26px;border:1px solid var(--portal-line,#333);border-radius:10px;background:var(--portal-surface,#181818)}label{display:grid;gap:8px;margin:16px 0;font-size:13px}input{height:42px;border:1px solid var(--portal-line,#444);border-radius:6px;background:var(--portal-surface,#151515);color:inherit;padding:0 12px;font:inherit}button{padding:10px 16px;border:1px solid #d4ad5b;border-radius:99px;background:linear-gradient(#e5c46a,#c99b3d);color:#191919;cursor:pointer;font:inherit}button:disabled{opacity:.5;cursor:wait}.error-message{color:#ed9b8d}input:focus-visible,button:focus-visible{outline:2px solid #d4ad5b;outline-offset:3px}@media(max-width:700px){.account-panel{padding:20px 16px}form{padding:18px}}
</style>
