<script setup lang="ts">
const details = [
 { label: 'Titulaire du compte', value: 'MOHAMED KHALED CHETTAH', copyValue: 'MOHAMED KHALED CHETTAH' },
 { label: 'IBAN', value: 'FR80 2043 3026 26N2 6341 8247 738', copyValue: 'FR802043302626N263418247738' },
 { label: 'BIC', value: 'NTSBFRM1XXX', copyValue: 'NTSBFRM1XXX' },
]
const copied = ref(''), copyError = ref('')
const copy = async (detail: typeof details[number]) => {
 copied.value = ''; copyError.value = ''
 try {
  await navigator.clipboard.writeText(detail.copyValue)
  copied.value = detail.label
 } catch {
  copyError.value = 'Copie impossible. Sélectionnez et copiez les coordonnées ci-dessous.'
 }
}
</script>

<template>
 <section class="bank-transfer" aria-labelledby="bank-transfer-title">
  <h3 id="bank-transfer-title"><UIcon name="i-tabler-building-bank"/>Coordonnées de paiement</h3>
  <dl>
   <div v-for="detail in details" :key="detail.label" class="bank-row">
    <div><dt>{{detail.label}}</dt><dd>{{detail.value}}</dd></div>
    <button type="button" :aria-label="'Copier : '+detail.label" @click="copy(detail)"><UIcon :name="copied===detail.label?'i-tabler-check':'i-tabler-copy'"/>{{copied===detail.label?'Copié':'Copier'}}</button>
   </div>
  </dl>
  <p v-if="copied" class="copy-status" role="status">{{copied}} copié dans le presse-papiers.</p>
  <p v-if="copyError" class="copy-error" role="alert">{{copyError}}</p>
  <div class="bank-help"><h4><UIcon name="i-tabler-info-circle"/>Comment régler ?</h4><p>Effectuez un virement SEPA depuis votre application bancaire en utilisant ces coordonnées et le montant de l’échéance à régler. Votre paiement sera confirmé par MC Studio après réception des fonds.</p></div>
 </section>
</template>

<style scoped>
.bank-transfer{margin-bottom:28px;padding:24px 0;border-top:1px solid var(--portal-line);border-bottom:1px solid var(--portal-line);color:var(--portal-text)}
h3,h4{display:flex;align-items:center;gap:10px;margin:0;font-weight:500}
h3{font-size:18px}h3 .iconify{color:var(--portal-accent-text);font-size:22px}
dl{margin:12px 0 0}.bank-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 0;border-bottom:1px solid var(--portal-line)}
.bank-row>div{min-width:0}dt{font-size:12px;color:var(--portal-muted);margin-bottom:8px}dd{margin:0;font-size:14px;font-weight:500;overflow-wrap:anywhere;user-select:text}
button{display:inline-flex;align-items:center;justify-content:center;gap:8px;flex:none;min-height:40px;padding:8px 12px;border:1px solid var(--portal-line);border-radius:8px;background:var(--portal-raised);color:var(--portal-text);font:inherit;font-size:12px;cursor:pointer}
button:hover{border-color:var(--portal-accent)}button:focus-visible{outline:2px solid var(--portal-accent);outline-offset:3px}
.bank-help{padding-top:24px}h4{font-size:14px}.bank-help p{margin:10px 0 0;max-width:780px;font-size:13px;line-height:1.7;color:var(--portal-muted)}
.copy-status,.copy-error{margin:12px 0 0;font-size:12px}.copy-status{color:var(--portal-success)}.copy-error{color:var(--portal-danger)}
@media(max-width:600px){.bank-row{flex-wrap:wrap;gap:12px}dd{font-size:13px}.bank-row>div{flex:1 1 220px}}
</style>
