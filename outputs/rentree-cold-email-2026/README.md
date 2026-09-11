# MC Studio - Sprint cold email rentree 2026

Objectif du sprint de 2h: mettre en ligne une premiere campagne cold email B2B propre, capable de generer des rendez-vous pour vendre des landing pages, sites vitrines et projets app/CRM, sans exposer le domaine principal `mc-studio.eu`.

Hypothese commerciale de depart:

- Offre site: landing page a partir de 1 890 EUR HT, site 5 pages a partir de 2 990 EUR HT.
- Offre app/CRM: sur devis, ciblee sur les entreprises qui ont un probleme operationnel clair.
- CTA principal: demander un avis rapide ou reserver un appel via MC Studio.
- Marche prioritaire: PME et independants B2B en France, surtout services, conseil, nettoyage, energie, BTP, finance/compta, immobilier, transport, formation.

## Ce qu'on lance aujourd'hui

Campagne 1: `MC Studio - Rentree - Site clair en 15 jours - Services B2B`

Promesse: aider une entreprise dont le site ne vend pas assez bien a clarifier son offre, rassurer plus vite et transformer plus de visiteurs en demandes de devis.

Campagne 2: `MC Studio - Rentree - App CRM operations - PME`

Promesse: identifier les process repetitifs qui meritent une app interne, un CRM ou un portail metier.

La campagne 1 part en premier. La campagne 2 sert a capter les opportunites plus grosses, mais seulement sur des prospects ou un signal operationnel existe.

## Sprint 2h

0-10 min: choisir un seul segment pour le premier tir.

Decision recommandee: services B2B avec site faible ou confus, parce que l'offre a 2 990 EUR HT est facile a comprendre et a closer plus vite qu'une app sur mesure.

10-25 min: verifier l'infrastructure.

- Ne pas envoyer depuis `contact@mc-studio.eu`.
- Utiliser des domaines secondaires dedies a la prospection.
- Configurer SPF, DKIM, DMARC, MX et tracking propre.
- Ajouter un lien de desinscription ou une phrase d'opposition simple.
- Envoyer les reponses vers une boite surveillee tous les jours.

25-40 min: creer la campagne dans Instantly ou Smartlead.

Parametres de depart:

- Timezone: Europe/Paris.
- Jours actifs: lundi-vendredi.
- Fenetre d'envoi: 09:10-17:30.
- Delai entre envois par inbox: 10-15 minutes.
- Stop sequence on reply: active.
- Unsubscribe / do-not-contact global: active.
- Open tracking: optionnel; priorite aux reponses et rendez-vous.
- Click tracking: desactive au debut si le domaine tracking n'est pas solide.

40-65 min: preparer 100 prospects.

Chaque lead doit avoir au minimum:

- Email professionnel.
- Prenom ou civilite si disponible.
- Nom de l'entreprise.
- Site web.
- Segment.
- Probleme observe ou angle d'approche.
- Source de la donnee.

65-85 min: importer le CSV et mapper les variables.

Variables recommandees:

- `first_name`
- `company_name`
- `website_url`
- `segment`
- `observed_issue`
- `proof_case`
- `offer_angle`
- `source_url`

85-105 min: QA avant lancement.

- Envoyer 3 tests a soi-meme.
- Verifier l'objet, les variables, les accents, les liens.
- Verifier que la signature contient MC Studio, site et moyen de contact.
- Verifier que la demande de retrait est simple.
- Verifier que le formulaire ou le lien de RDV fonctionne.

105-120 min: lancer le premier lot.

Volume recommande si les inbox sont neuves ou froides:

- Jour 1-3: 10 nouveaux leads par inbox et par jour.
- Jour 4-7: 15 nouveaux leads par inbox et par jour.
- Semaine 2: 20-25 nouveaux leads par inbox et par jour si les bounces restent bas.
- Semaine 3: 30 nouveaux leads par inbox et par jour si les reponses sont bonnes.

Ne pas viser 6000 emails/jour au demarrage. Ce volume suppose une vraie infrastructure, beaucoup de domaines, une hygiene de liste stricte, des exclusions, une surveillance quotidienne et un taux de plaintes tres faible.

## Setup domaines et inbox

Phase 1, cette semaine:

- 2 a 3 domaines secondaires.
- 2 a 3 inbox par domaine.
- 4 a 9 inbox au total.
- 10-15 nouveaux leads par inbox/jour au lancement.
- Objectif: 40-135 nouveaux leads/jour, qualite avant volume.

Phase 2, apres 14-21 jours de signaux propres:

- 10-20 inbox.
- 20-30 nouveaux leads par inbox/jour.
- Objectif: 200-600 nouveaux leads/jour.

Phase 3, seulement si le playbook close:

- 30-60 inbox.
- Segments separes par campagne.
- Objectif: 900-1800 nouveaux leads/jour.

## Liste de prospects prioritaire

Ordre de priorite:

1. Anciens leads, anciens devis, anciennes conversations Instagram/LinkedIn.
2. Entreprises locales avec site daté, confus ou peu rassurant.
3. Prestataires B2B qui vivent du devis: nettoyage, energie, travaux, transport, conseil, compta, formation.
4. Startups ou SaaS early-stage avec offre floue.
5. PME avec equipe commerciale ou terrain et process manuel.

Les sites se vendent sur la clarte et la conversion. Les apps se vendent sur le cout du desordre operationnel.

## Regles de qualite

Un lead est bon si:

- Il vend quelque chose avec un panier ou une valeur client suffisante.
- Son site actuel peut vraiment freiner la confiance ou la prise de contact.
- Le contact est professionnellement pertinent.
- Le message peut etre relie a son activite.
- On peut expliquer l'origine du contact si la personne demande.

Un lead est mauvais si:

- Le contact est personnel sans lien pro.
- L'entreprise n'a pas d'offre claire.
- Le site est deja tres bon sans angle evident.
- Le budget probable est trop bas.
- La source ne permet pas une prospection propre.

## Dashboard quotidien

A suivre chaque jour:

- Leads ajoutes.
- Emails envoyes.
- Bounces.
- Replies.
- Replies positives.
- RDV pris.
- RDV tenus.
- Devis envoyes.
- Signatures.
- Raisons de refus.
- Segments qui repondent le mieux.

Seuils de decision:

- Bounce trop haut: pause, verification emails, nettoyage liste.
- Reponses negatives nombreuses: retravailler segment et angle.
- Reponses positives mais pas de RDV: ameliorer call-to-action et vitesse de rappel.
- RDV mais pas de closing: travailler qualification, offre, preuve et prix.

## Message de rappel apres reponse positive

Quand quelqu'un repond "oui", repondre vite:

Bonjour {{first_name}},

Top, merci pour votre retour.

Le plus simple: je regarde votre site / votre parcours actuel et je vous envoie 2-3 pistes concretes. Si c'est pertinent, on bloque ensuite 20 minutes pour voir ce qui merite vraiment d'etre refait.

Vous avez un site ou une page prioritaire a me partager ?

Mohamed

## Sources utiles

- CNIL, regles de prospection commerciale electronique B2B: https://www.cnil.fr/fr/communication-electronique-quelles-regles
- Gmail sender guidelines: https://support.google.com/mail/answer/81126
- Gmail sender guidelines FAQ: https://support.google.com/mail/answer/14229414
- Instantly account and campaign limits: https://help.instantly.ai/en/articles/6248612-account-and-campaign-limits
- Smartlead campaign and warmup docs: https://helpcenter.smartlead.ai/en/articles/442-how-to-create-an-email-campaign-in-smartlead-the-new-version
