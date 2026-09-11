# Brevo implementation - MC Studio

Ce dossier contient l'implementation prete pour creer la campagne Brevo a partir du fichier Excel deja present dans `outputs/019fe5d0-175f-7c11-ada2-df5e2754bb6a/validation-mails-brevo-startups-lyon.xlsx`.

## Fichiers

- `contacts-startups-lyon.csv`: fichier d'import avec les emails reels, genere depuis l'Excel.
- `contacts-startups-lyon-preview.csv`: version masquee pour controle rapide.
- `campaign-content.md`: contenu des 3 emails.
- `brevo_campaign.mjs`: script API Brevo.
- `brevo-state.json`: cree au premier run live pour memoriser les IDs Brevo.

## Variables a ajouter dans `.env`

```bash
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME="Mohamed de MC Studio"
BREVO_REPLY_TO=
BREVO_TEST_EMAIL=
```

`BREVO_SENDER_EMAIL` doit etre un sender valide dans Brevo. `BREVO_REPLY_TO` doit etre une boite surveillee pour retirer les contacts qui repondent avant relance.

## Commandes

Extraire la base depuis l'Excel:

```bash
/Users/mohamedchettah/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 outputs/rentree-cold-email-2026/brevo/extract_brevo_contacts.py
```

Verifier le dry-run:

```bash
/Users/mohamedchettah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node outputs/rentree-cold-email-2026/brevo/brevo_campaign.mjs
```

Creer dans Brevo: attributs, dossier, liste, contacts et 3 campagnes en brouillon:

```bash
/Users/mohamedchettah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node outputs/rentree-cold-email-2026/brevo/brevo_campaign.mjs --live --create-only
```

Envoyer les tests:

```bash
/Users/mohamedchettah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node outputs/rentree-cold-email-2026/brevo/brevo_campaign.mjs --live --send-test
```

Envoyer le premier email:

```bash
BREVO_LIVE_SEND_CONFIRM=SEND_MC_STUDIO_RENTREE_2026 /Users/mohamedchettah/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node outputs/rentree-cold-email-2026/brevo/brevo_campaign.mjs --live --send-now
```

## Relances

Les emails 2 et 3 sont crees comme campagnes distinctes. Avant de les envoyer, retirer de la liste les contacts qui ont repondu ou demande stop.

La relance automatique parfaite demande soit une vraie automation Brevo branchee sur l'etat de contact, soit un outil de sequence cold email. Brevo seul ne sait pas toujours exclure automatiquement les reponses qui arrivent dans une boite externe.
