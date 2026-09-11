# Campagne Brevo - MC Studio startups Lyon

Base source: `validation-mails-brevo-startups-lyon.xlsx`

Liste Brevo cible: `MC Studio - Startups Lyon - Rentree 2026`

Sender recommande: `Mohamed de MC Studio`

Reply-to recommande: une inbox surveillee tous les jours.

## Email 1

Nom campagne: `MC Studio - Startups Lyon - Email 1 - Idee landing`

Objet: `Une idee rapide pour {{ contact.STARTUP }}`

Preheader: `Deux pistes concretes pour rendre votre offre plus claire.`

HTML:

```html
<p>{{ contact.SALUTATION }}</p>

<p>Je suis Mohamed, fondateur de MC Studio.</p>

<p>{{ contact.INTRO }}</p>

<p>{{ contact.OBSERVATION }}</p>

<p>{{ contact.LANDING_IDEA }}</p>

<p>{{ contact.OFFER_CTA }}</p>

<p>Vous voulez que je vous envoie 2 pistes concretes pour ameliorer cette page ?</p>

<p>Mohamed<br>
MC Studio<br>
<a href="https://www.mc-studio.eu">https://www.mc-studio.eu</a></p>

<p style="font-size:12px;color:#666;">Si ce n'est pas pertinent, repondez simplement stop et je ne vous recontacterai pas.</p>
```

## Email 2 - J+4

Nom campagne: `MC Studio - Startups Lyon - Email 2 - Precision`

Objet: `Je precise pour {{ contact.STARTUP }}`

Preheader: `Le but: clarte, confiance et demande qualifiee.`

HTML:

```html
<p>{{ contact.SALUTATION }}</p>

<p>Je me permets de completer mon message.</p>

<p>Quand on travaille une landing chez MC Studio, le but n'est pas seulement de rendre la page plus jolie. On cherche surtout a faire comprendre l'offre plus vite, renforcer la confiance, puis guider vers une demande qualifiee.</p>

<p>Dans votre cas, l'angle qui m'a paru le plus interessant est celui-ci: {{ contact.OBSERVATION }}</p>

<p>Si vous voulez, je peux vous envoyer une mini structure de page adaptee a {{ contact.STARTUP }}.</p>

<p>Mohamed</p>

<p style="font-size:12px;color:#666;">Stop sur simple reponse.</p>
```

## Email 3 - J+9

Nom campagne: `MC Studio - Startups Lyon - Email 3 - Derniere relance`

Objet: `Je ferme la boucle`

Preheader: `Dernier message de ma part.`

HTML:

```html
<p>{{ contact.SALUTATION }}</p>

<p>Dernier message de ma part.</p>

<p>Si la landing ou le site n'est pas un sujet pour cette rentree, aucun souci.</p>

<p>Si vous voulez quand meme un avis rapide, repondez simplement "avis" et je vous envoie 2-3 points concrets sur {{ contact.STARTUP }}.</p>

<p>Bonne journee,<br>
Mohamed<br>
MC Studio</p>

<p style="font-size:12px;color:#666;">Stop sur simple reponse.</p>
```

## Limite Brevo

Brevo sait creer une liste, importer les contacts, creer des campagnes et envoyer ou programmer les emails. En revanche, une sequence de cold email doit idealement exclure automatiquement les contacts qui repondent. Si les reponses arrivent dans une boite externe, il faut soit verifier la boite avant chaque relance, soit utiliser un outil de sequence cold email dedie.
