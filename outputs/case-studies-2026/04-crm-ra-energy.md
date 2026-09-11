# 04 — CRM R&A Energy

## A. Diagnostic

**Ce qui fonctionne**
- Le bon angle : le produit suit le processus de l'entreprise, et non l'inverse.
- Les profils utilisateurs sont identifiés (téléprospecteurs, commerciaux terrain, apporteurs d'affaires).
- La continuité avec le site est une vraie preuve de fidélisation.

**Ce qui manque pour convaincre** (tout ceci existe dans `projects.ts`, mais a disparu de ta nouvelle version)
- **Les fonctionnalités différenciantes** : vérification Google Calendar + temps de trajet au moment de la prise de RDV, 5 rôles cloisonnés jusqu'à la base de données, fiches enrichies via SIRET et adresse, historique automatique, carte des tournées.
- **Les problèmes concrets d'avant** : doublons, RDV intenables faute de temps de trajet, pas d'historique, données sensibles visibles par tous.
- **La stack** (Nuxt + Supabase), rassurante pour un prospect qui s'y connaît.
- **L'adoption** : combien d'utilisateurs, depuis quand, combien de RDV pris via le CRM.

**Ce qui est trop générique**
- « Pilotage de l'activité », « vues adaptées à l'équipe commerciale », « suffisamment simple pour être utilisée quotidiennement ».

**⚠️ Visuels** : `crm-planning.png` montre un planning vide (« Aucun RDV cette semaine »), la barre Nuxt DevTools et « Mohamed Chettah · Admin ». À refaire avec des données de démo. Il faut aussi vérifier qu'aucune capture n'expose de vraies données prospects.

## B. Informations manquantes
- [INFORMATION À DEMANDER : liste exacte des 5 rôles. projects.ts cite admin, télépro, commercial, régies : il en manque un, ou « régies » en recouvre deux ?]
- [INFORMATION À DEMANDER : nombre d'utilisateurs actifs, par rôle]
- [INFORMATION À DEMANDER : volume de prospects dans la base, RDV planifiés depuis la mise en service]
- [INFORMATION À DEMANDER : date de mise en service, durée de développement]
- [INFORMATION À DEMANDER : les fichiers Excel ont-ils été migrés ? Combien de lignes ?]
- [INFORMATION À DEMANDER : le CRM bloque-t-il un RDV intenable, ou affiche-t-il seulement une alerte ?]
- [INFORMATION À DEMANDER : le CRM détecte-t-il les doublons (via SIRET, par exemple) ?]
- [INFORMATION À DEMANDER : API utilisée pour le calcul de trajet]
- [INFORMATION À DEMANDER : temps gagné selon l'équipe (planification, saisie)]
- [INFORMATION À DEMANDER : témoignage spécifique au CRM. Celui de Yazid C. parle du site.]

## C. Nouvelle structure
1. Hero
2. Le client (+ lien vers le chapitre 1 : le site)
3. Le challenge
4. Les objectifs
5. Notre approche (4 décisions)
6. La solution
7. Focus features (3)
8. Le résultat
9. Témoignage (spécifique CRM, à obtenir)
10. CTA outil métier

## D. Copy final

### HERO
**Catégorie** : CRM sur mesure · Outil métier

**Client** : R&A Energy

# Remplacer les fichiers Excel par un CRM qui vérifie chaque rendez-vous avant qu'il soit posé.

Après son site, R&A Energy nous a confié son outil interne : un CRM qui réunit prospection, rendez-vous et tournées terrain, construit sur son processus commercial réel.

**Infos clés**
- Application web sur mesure · Nuxt + Supabase
- 5 rôles utilisateurs
- Intégration Google Calendar + calcul du temps de trajet
- Deuxième projet avec le client
- [INFORMATION À DEMANDER : durée de développement]

---

### LE CLIENT
R&A Energy est courtier en énergie pour les professionnels. Son équipe de 10 à 20 personnes réunit téléprospecteurs, commerciaux terrain et apporteurs d'affaires.

Nous avions déjà conçu son identité et son site. Quand la croissance a rendu les fichiers partagés ingérables, l'équipe est revenue vers nous pour son outil métier.

→ *Chapitre 1 : l'identité et le site de R&A Energy*

---

### LE CHALLENGE
La prospection vivait dans des fichiers Excel et des agendas séparés.

Les conséquences étaient concrètes : des doublons, des rendez-vous posés sans tenir compte du trajet du commercial, aucun historique des échanges, des informations sensibles visibles par tout le monde.

Chaque rendez-vous impossible à honorer, c'est un prospect qualifié qui refroidit.

Un CRM générique aurait obligé l'équipe à changer sa façon de travailler. Nous avons fait l'inverse.

---

### LES OBJECTIFS
- Centraliser prospects, rendez-vous et documents dans un seul outil.
- Supprimer les rendez-vous impossibles à tenir (conflit d'agenda ou trajet irréaliste).
- Donner à chaque rôle exactement ce qu'il doit voir, rien de plus.
- Faire adopter l'outil par une équipe habituée à Excel.

---

### NOTRE APPROCHE

**01 — Cartographier le processus avant de coder**
Nous avons suivi le parcours d'un prospect de bout en bout : création par un téléprospecteur, qualification, prise de rendez-vous, visite terrain. Chaque écran du CRM correspond à une étape de ce parcours. Rien n'a été ajouté simplement parce que « les CRM l'ont ».

**02 — Mettre la contrainte terrain dans le logiciel**
Stocker des prospects, n'importe quel outil sait le faire. Ce qui manquait à R&A Energy, c'était des rendez-vous fiables. Nous avons donc placé la vérification au moment exact où le rendez-vous est posé : agenda du commercial et temps de trajet réel.

**03 — Cloisonner par rôle, jusqu'à la base de données**
Un téléprospecteur, un commercial et un apporteur d'affaires n'ont pas besoin des mêmes informations. Cinq rôles, avec des permissions appliquées au niveau de la base : chacun ne voit que ses fiches, ses rendez-vous et ses documents. Quand les données sont commerciales, masquer un bouton ne suffit pas.

**04 — Réduire la saisie pour obtenir l'adoption**
Un outil jugé lourd finit abandonné au profit d'Excel. Les fiches se complètent automatiquement via les API SIRET et adresse, et l'historique d'activité s'écrit tout seul. Moins de saisie, plus de chances que l'outil soit utilisé chaque jour.

---

### LA SOLUTION
Un CRM web construit sur le processus commercial de R&A Energy, du premier appel à la visite terrain.

**6 modules** : Tableau de bord · Prospects · Planning · Carte des RDV · Équipe · Paramètres

- Pipeline de prospects
- Fiches enrichies automatiquement (SIRET, adresse), commentaires, documents
- Historique d'activité automatique
- Prise de rendez-vous avec vérification Google Calendar et temps de trajet
- Planning de l'équipe commerciale
- Carte des rendez-vous et des tournées
- 5 rôles aux permissions distinctes
- Interface utilisable sur mobile (tableau de bord, prospects)
- Stack : Nuxt + Supabase

---

### FOCUS FEATURES

**Le rendez-vous vérifié**
Quand un téléprospecteur pose un rendez-vous, le CRM vérifie en direct deux choses : le créneau est libre dans le Google Calendar du commercial, et le trajet depuis le rendez-vous précédent est réaliste. Le téléprospecteur voit immédiatement si le créneau est tenable. Le prospect qualifié rencontre un commercial à l'heure, au lieu d'un rendez-vous reporté.

**La carte des rendez-vous**
Les rendez-vous de la semaine s'affichent sur une carte. Le responsable voit la répartition géographique d'un coup d'œil et peut regrouper les visites par zone plutôt que de faire traverser la région à un commercial pour un seul rendez-vous.

**Des données cloisonnées par rôle**
Chaque rôle a son périmètre, appliqué jusque dans la base de données. R&A Energy peut ainsi ouvrir l'outil à des partenaires externes sans exposer son fichier client. L'outil accompagne la croissance de l'équipe sans créer de risque.

---

### LE RÉSULTAT
**6** modules · **5** rôles · **Google Calendar** + API SIRET et adresse · **[INFORMATION À DEMANDER : X utilisateurs actifs]**

R&A Energy a remplacé ses fichiers partagés par un seul outil, construit sur son propre processus. Les rendez-vous sont vérifiés avant d'être posés, les données sont cloisonnées et l'historique s'écrit seul.

[INFORMATION À DEMANDER : RDV planifiés via le CRM depuis sa mise en service / temps gagné selon l'équipe]

Et ce projet est né d'un premier site. Pour nous, le meilleur indicateur de confiance, c'est un client qui revient.

---

### TÉMOIGNAGE
[INFORMATION À DEMANDER : témoignage de Yazid C. sur le CRM (ce qui a changé dans l'organisation de l'équipe, adoption, temps gagné)]

*En attendant : ne pas réutiliser le témoignage actuel, qui parle du site. Ou alors le présenter explicitement comme « À propos de notre premier projet ensemble ».*

---

### CTA
## Votre équipe commerciale travaille encore sur des fichiers Excel partagés ?
On construit l'outil qui suit votre processus, et pas l'inverse.

**Parler de mon projet →**

## E. Suggestions visuelles
- **Hero** : `crm-hero-mockup.png`.
- **Le challenge** : before/after entre une capture Excel anonymisée (colonnes, doublons surlignés) et une fiche prospect du CRM.
- **Notre approche 01** : schéma du parcours prospect (téléprospecteur → qualification → RDV vérifié → visite terrain), avec les rôles à chaque étape.
- **Focus RDV vérifié** : vidéo ou GIF de la prise de RDV qui montre la vérification agenda + trajet. C'est le visuel clé de la page.
- **Focus carte** : `crm-carte.png` en pleine largeur.
- **Focus rôles** : tableau visuel des 5 rôles × données visibles.
- **Mobile** : `crm-mobile-dashboard.png` + `crm-mobile-prospects.png`.
- ⚠️ Refaire `crm-planning.png` (écran vide, DevTools et nom admin visibles) et anonymiser toutes les captures.

## F. 3 headlines alternatives
1. **Business** : Un CRM sur mesure pour qu'aucun rendez-vous commercial ne soit posé à l'aveugle.
2. **Transformation** : Des fichiers Excel partagés à un outil unique pour toute l'équipe commerciale.
3. **Premium / éditorial** : Un logiciel à la forme exacte d'une équipe commerciale.
