import fs from 'node:fs/promises';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const outDir = '/Users/mohamedchettah/Project/mc-studio/outputs/2026-09-14-leads-lyon';
const outFile = `${outDir}/leads-lyon-mc-studio.xlsx`;

const leads = [
  ['Startups SaaS / IA / tech', 'Uplace', 'Lyon', 'Équipe Uplace', 'Contact général', 'contact@uplace.fr', 'Base interne : parcours agents immobiliers, 450 contrôles par dossier et 60 % de temps gagné.', 'Faire porter les preuves de gain de temps dès le premier écran.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://uplace.fr/', 'Relire le site et trouver un décideur produit ou marketing.'],
  ['Startups SaaS / IA / tech', 'Chat3D', 'Lyon', 'Équipe Chat3D', 'Contact général', 'contact@chat3d.ai', 'Base interne : outils 3D sur mesure, de la préparation à la validation ; promesse de productivité jusqu’à x5.', 'Raconter un workflow complet sur un asset concret.', 'Arises', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://chat3d.ai/', 'Identifier le fondateur ou le responsable produit.'],
  ['Startups SaaS / IA / tech', 'Sopht', 'Lyon', 'Équipe Sopht', 'Contact général', 'contact@sopht.com', 'Base interne : optimisation des coûts et du carbone IT ; ROI jusqu’à 4 € économisés pour 1 € investi.', 'Relier le ROI au parcours produit : données, recommandation, décision.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://sopht.com/', 'Vérifier le décideur marketing ou go-to-market.'],
  ['Startups SaaS / IA / tech', 'WeCount', 'Lyon', 'Équipe WeCount', 'Contact général', 'contact-us@wecount.io', 'Base interne : plateforme Climat & ESG, expertise et accompagnement de 700+ entreprises.', 'Rendre visible le chemin collecte de données → plan d’action → trajectoire.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://www.wecount.io/', 'Chercher une actualité produit, recrutement ou événement.'],
  ['Startups SaaS / IA / tech', 'Oligofeed', 'Lyon', 'Équipe Oligofeed', 'Contact général', 'contact@oligofeed.com', 'Base interne : micronutrition animale issue de 10 ans de recherche, avec une offre dédiée à l’apiculture.', 'Transformer la recherche scientifique en parcours de saison apicole.', 'Arises', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://oligofeed.com/', 'Identifier le fondateur ou la personne en charge du marketing.'],
  ['Startups SaaS / IA / tech', 'Wizaplace', 'Lyon', 'Équipe Wizaplace', 'Contact général', 'contact@wizaplace.com', 'Base interne : plateforme marketplace B2B/B2C, centrale d’achats, économie circulaire, banque et assurance.', 'Créer une landing par cas d’usage plutôt qu’une présentation de toute la plateforme.', 'Personal', 'Écosystème lyonnais / à qualifier', 'Moyenne', 'https://www.wizaplace.com/', 'Cibler marketing, product marketing ou direction commerciale.'],
  ['Startups SaaS / IA / tech', 'Cosmo Tech', 'Lyon', 'Équipe Cosmo Tech', 'Contact général', 'contact@cosmotech.com', 'Base interne : AI-Simulation pour actifs et supply chain, avec accélération du time-to-value jusqu’à 20x.', 'Mettre en scène une décision métier simulée avant son coût réel.', 'Arises', 'Écosystème lyonnais / à qualifier', 'Moyenne', 'https://cosmotech.com/', 'Vérifier le bon interlocuteur et les actualités.'],
  ['Startups SaaS / IA / tech', 'Eden AI', 'Lyon', 'Équipe Eden AI', 'Contact général', 'contact@edenai.co', 'Base interne : 500+ modèles via une API, endpoint européen et fallback automatique.', 'Montrer un appel API, un basculement fournisseur et le contrôle coût/performance.', 'Personal', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://www.edenai.co/', 'Trouver un décideur marketing ou cofondateur.'],
  ['Startups SaaS / IA / tech', 'SKEZI', 'Lyon', 'Équipe SKEZI', 'Contact général', 'contact@skezi.eu', 'Base interne : collecte de données patients, 600 000+ patients et 20 M de données.', 'Suivre une étude de la création de cohorte au reporting.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Moyenne', 'https://skezi.eu/', 'Vérifier si une campagne ou nouvelle verticale est active.'],
  ['Startups SaaS / IA / tech', 'Datacapt', 'Lyon', 'Équipe Datacapt', 'Contact général', 'contact@datacapt.com', 'Base interne : eClinical avec EDC, ePRO, eConsent, CTMS et démonstrations interactives.', 'Illustrer un essai clinique de l’eCRF au reporting.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Moyenne', 'https://www.datacapt.com/', 'Cibler marketing ou business development.'],
  ['Startups SaaS / IA / tech', 'Komia', 'Lyon', 'Manuel João', 'Contact public', 'm.manueljoao@komia.io', 'Base interne : planning, paie, HACCP et stocks réunis pour 1 000+ établissements.', 'Faire vivre une journée de restaurateur dans une seule interface.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://www.komia.io/', 'Vérifier que Manuel João est toujours le bon contact.'],
  ['Startups SaaS / IA / tech', 'Reecall', 'Lyon', 'Équipe Reecall', 'Contact général', 'contact@reecall.com', 'Base interne : 35 M+ interactions et 450 scénarios traités par agents vocaux.', 'Montrer un appel, sa qualification et la donnée remontée au CRM.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://reecall.com/fr', 'Identifier le responsable marketing ou un fondateur.'],
  ['Startups SaaS / IA / tech', 'Vizcab', 'Lyon', 'Équipe Vizcab', 'Contact général', 'contact@vizcab.io', 'Base interne : plateforme ACV, add-in Excel et API, 21 000 EPD et 95 % de satisfaction.', 'Aider un bureau d’études à choisir le bon point d’entrée produit.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Moyenne', 'https://vizcab.io/', 'Vérifier un lancement de produit ou une nouvelle page.'],
  ['Startups SaaS / IA / tech', 'Fleezy', 'Lyon', 'Équipe Fleezy', 'Contact général', 'contact@fleezy.io', 'Base interne : gestion des équipements avec 70 h gagnées par équipe et jusqu’à 300 % de ROI.', 'Raconter le cycle de vie d’un équipement, de l’affectation à la restitution.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://www.fleezy.io/', 'Cibler produit, marketing ou direction commerciale.'],
  ['Startups SaaS / IA / tech', 'Tilkee by Efalia', 'Lyon', 'Équipe Tilkee', 'Contact général', 'contact@efalia.com', 'Recrutement récent : alternance Commerce / CSM à Lyon ; solution de signaux d’achat et CRM Salesforce + IA.', 'Montrer comment une démo ou un contenu commercial devient une preuve de vente.', 'CRM R&A Energy', 'Écosystème lyonnais / à qualifier', 'Haute', 'https://fr.linkedin.com/posts/tilkee_alternance-commerce-sales-activity-7470111135992655872-oZCh', 'Chercher le responsable marketing Tilkee.'],
  ['Conseil, finance, RH, B2B', 'CoHéRence RH', 'Lyon et périphérie', 'Équipe CoHéRence RH', 'Contact général', 'contact@coherencerh.fr', 'Cabinet de stratégie RH : rémunération, développement RH et contrôle de gestion sociale.', 'Clarifier les offres par problème dirigeant : rémunération, organisation ou développement RH.', 'Shika Consulting', 'À chercher : parcours et réseau local de la fondatrice', 'Haute', 'https://www.coherencerh.fr/', 'Identifier la fondatrice et vérifier l’actualité du cabinet.'],
  ['Conseil, finance, RH, B2B', 'HRConseil', 'Lyon 2e', 'Équipe HRConseil', 'Contact général', 'contact@hrconseil.com', 'Conseil RH et SIRH présent à Lyon ; expertise GTA, paie, talent management et transformation digitale.', 'Segmenter une offre dense par besoin opérationnel et par persona RH.', 'CRM R&A Energy', 'À chercher : études, école ou réseau RH/tech commun', 'Haute', 'https://hrconseil.com/', 'Cibler la direction marketing ou associée Lyon.'],
  ['Conseil, finance, RH, B2B', 'Kenseo RH', 'Lyon 3e', 'Angélique Aubry', 'Contact public', 'accueil@kenseo.fr', 'Cabinet RH lyonnais : recrutement, outplacement et accompagnement des cadres et dirigeants.', 'Rendre le parcours entreprise distinct de celui des candidats et dirigeants.', 'Shika Consulting', 'À chercher : réseau lyonnais ou école commune', 'Haute', 'https://www.kenseo.fr/contact/', 'Vérifier si Angélique Aubry est la décideuse digitale.'],
  ['Conseil, finance, RH, B2B', 'AELA Conseil', 'Lyon', 'Servane Courvoisier', 'Fondatrice / contact public', 'servane@aela-conseil.fr', 'DRH externalisée et conseil RH pour métiers de service et environnements opérationnels.', 'Faire ressortir les situations concrètes qui déclenchent l’intervention d’une DRH externalisée.', 'Shika Consulting', 'À chercher : parcours de Servane et connexions lyonnaises', 'Haute', 'https://www.aela-conseil.fr/', 'Email direct public : relire le site avant envoi.'],
  ['Conseil, finance, RH, B2B', 'ADH Conseil RH', 'Lyon 7e', 'Équipe ADH Lyon', 'Contact général', 'groupe.adh@adh.fr', 'Cabinet local implanté depuis 1989 : recrutement de cadres, outplacement, coaching et développement des talents.', 'Créer des entrées par enjeu : recruter, sécuriser une transition ou développer les managers.', 'Shika Consulting', 'À chercher : interlocuteur lyonnais et réseau commun', 'Moyenne', 'https://www.adh.fr/lyon/', 'Identifier l’associé ou la personne marketing locale.'],
  ['Conseil, finance, RH, B2B', 'Hub Conseil', 'Lyon 2e', 'Équipe Hub Conseil', 'Contact général', 'contact@hubconseil.fr', 'Cabinet de conseil pour entreprises, avec offre RH, situé au 6 rue Émile Zola.', 'Rendre les prestations et le bénéfice client plus immédiatement lisibles.', 'Shika Consulting', 'À chercher : fondateur et expérience commune', 'Haute', 'https://hubconseil.fr/', 'Auditer la page d’accueil et trouver le décideur.'],
  ['Conseil, finance, RH, B2B', 'Fortify', 'Lyon 9e', 'Équipe Fortify', 'Contact général', 'contact@fortify.fr', 'Conseil et audit RH / SIRH, avec implantation lyonnaise.', 'Présenter un parcours projet SIRH, de l’audit au déploiement, plutôt qu’une simple liste d’expertises.', 'CRM R&A Energy', 'À chercher : parcours fondateurs et réseau SIRH', 'Moyenne', 'https://www.fortify.fr/', 'Vérifier le positionnement actuel et l’interlocuteur.'],
  ['Conseil, finance, RH, B2B', 'FEELINJOB', 'Lyon', 'Hervé Jacob', 'Fondateur / contact public', 'herve.jacob@feelinjob.com', 'Recruteur IT lyonnais spécialisé en start-ups, scale-ups, éditeurs SaaS et culture tech.', 'Mettre en avant une expérience candidat/employeur très incarnée et sélective.', 'Shika Consulting', 'Mohamed : écosystème startup/tech lyonnais', 'Haute', 'https://fr.linkedin.com/company/feelinjob', 'Email direct public : s’appuyer sur le DevFest Lyon ou l’écosystème tech.'],
  ['Conseil, finance, RH, B2B', 'Ressources UP', 'Lyon 6e', 'Équipe Ressources UP', 'Contact recrutement', 'recrutement@ressourcesup.fr', 'Cabinet lyonnais de recrutement, conseil RH, formation, coaching et assessment.', 'Séparer les parcours entreprise, candidat et formation pour fluidifier la prise de contact.', 'Shika Consulting', 'À chercher : consultant ou réseau client commun', 'Haute', 'https://www.ressourcesup.fr/contactez-nous', 'Identifier un associé ou responsable développement.'],
  ['Conseil, finance, RH, B2B', 'Karpos RH', 'Lyon 9e', 'Équipe Karpos RH', 'Contact général', 'contact@karpos-rh.com', 'Cabinet créé en 2019 : recrutement top/middle management, conseil RH et assessment ; nombreuses offres actives.', 'Mettre les spécialisations et les cas clients au service d’une entrée par besoin de recrutement.', 'Shika Consulting', 'À chercher : réseau RH / ASVEL féminin / Lyon', 'Haute', 'https://karpos-rh.com/', 'Utiliser un signal de recrutement récent plutôt qu’un audit générique.'],
  ['Conseil, finance, RH, B2B', 'Cymadiau Conseil', 'Lyon / Brest', 'Équipe Cymadiau', 'Contact général', 'contact@cymadiau.fr', 'Conseil marketing B2B spécialisé IT, logiciel et tech, créé à Lyon.', 'Parler d’une landing orientée conversion pour une verticale IT précise.', 'Shika Consulting', 'Mohamed : marketing B2B, design et écosystème tech', 'Moyenne', 'https://www.cymadiau.fr/', 'Vérifier le contact fondateur et éviter un message concurrentiel trop frontal.'],
  ['Lancement, refonte ou recrutement', 'HUB612', 'Lyon 3e', 'Maud Charaf', 'Directrice / contact public', 'maud.charaf@hub612.com', 'Accélérateur et fonds pour fintech, insurtech et SaaS B2B ; 100+ startups accompagnées, actualité d’avril 2026.', 'Proposer un échange partenariat / intervenant plutôt qu’un pitch de refonte classique.', 'Personal', 'Mohamed : écosystème startup lyonnais', 'Haute', 'https://www.lyon-finance.org/member/hub-612/', 'Lead partenariat : personnaliser autour de leur portefeuille et de l’événement.'],
  ['Lancement, refonte ou recrutement', 'Digiforma', 'Lyon 7e', 'Pascale', 'Contact événement public', 'pascale@digiforma.com', 'Recrutement Low-Code / IA à Lyon et roadmap 2026 portée par les fondateurs ; 6 000+ organismes de formation utilisateurs.', 'Rendre les évolutions produit et les cas d’usage IA immédiatement visibles pour les prospects formation.', 'CRM R&A Energy', 'Mohamed : produit digital et écosystème lyonnais', 'Haute', 'https://live.digiforma.com/ateliers/', 'Préférer un contact marketing/partenariats si identifié ; Pascale est liée à l’événement.'],
  ['Lancement, refonte ou recrutement', 'DOOD', 'Lyon 2e', 'Xavier Marchese', 'Directeur de la publication', 'contact@dood.company', 'FoodTech SaaS lyonnaise, présente dans le mapping startups AURA 2026 et avec des recrutements récents.', 'Clarifier l’offre et les parcours de démonstration pour les restaurateurs et enseignes.', 'CRM R&A Energy', 'Mohamed : startup lyonnaise / produit et design digital', 'Haute', 'https://www.dood.com/en/mentions-legales/', 'Chercher un contact marketing ou produit avant l’envoi.'],
  ['Lancement, refonte ou recrutement', 'Effet B', 'Villeurbanne', 'Équipe Effet B', 'Contact RH public', 'rh@effetb.com', 'Éditeur de Studea, livret numérique de gestion de l’alternance ; recrutement récent d’un chef de projet.', 'Transformer les fonctionnalités de gestion d’alternance en scénario simple pour un établissement.', 'Personal', 'Mohamed : métropole lyonnaise / numérique éducatif', 'Moyenne', 'https://fr.linkedin.com/company/effet-b', 'Email RH public : chercher auparavant marketing ou direction produit.'],
];

const projects = [
  ['CRM R&A Energy', 'Outil métier / CRM', 'Prospects, planning, carte des rendez-vous, rôles, automatisations et visibilité opérationnelle.', 'SaaS B2B, logiciels métier, données, opérations, équipes commerciales.'],
  ['Shika Consulting', 'Site de conseil', 'Navigation par profils, services, tarifs, contenus et éléments de confiance.', 'Cabinets de conseil, RH, finance, B2B, offres de service complexes.'],
  ['Personal', 'Produit SaaS / app', 'Produit bilingue, feed, favoris et flux de création pour créateurs.', 'Produits SaaS, IA, outils de contenu, plateformes avec expérience utilisateur à clarifier.'],
  ['Arises', 'Branding + site + app', 'Positionnement et expérience pour transformer des tâches chaotiques en planning équilibré.', 'Produits numériques, IA, apps, expérience produit à raconter par un avant/après.'],
  ['R&A Energy', 'Site B2B', 'Clarification d’une offre énergie B2B et d’un parcours commercial.', 'Services B2B, offres techniques, acquisition et demande de devis.'],
  ['Maison AWL', 'Plateforme créateur', 'Marketplace et espace digital pour une audience de créatrice.', 'Plateformes, communautés, membres, parcours d’inscription.'],
];

const wb = Workbook.create();
const sheet = wb.worksheets.add('Leads');
const refs = wb.worksheets.add('Projets MC Studio');
for (const s of [sheet, refs]) { s.showGridLines = false; s.tabColor = '#1F4E78'; }

sheet.getRange('A1:N1').merge();
sheet.getRange('A1').values = [['Leads lyonnais — MC Studio']];
sheet.getRange('A2:N2').merge();
sheet.getRange('A2').values = [['30 contacts B2B à personnaliser manuellement. Emails : adresses professionnelles publiques ou déjà présentes dans la base interne MC Studio.']];
sheet.getRange('A4:N4').values = [[
  'Segment', 'Entreprise', 'Ville', 'Contact', 'Fonction', 'Email professionnel', 'Signal / contexte', 'Observation personnalisée', 'Projet MC Studio à citer', 'Point commun avec Mohamed', 'Priorité', 'Source', 'Vérification avant envoi', 'Statut'
]];
sheet.getRange(`A5:N${4 + leads.length}`).values = leads.map(r => [...r, 'À écrire']);

refs.getRange('A1:D1').merge();
refs.getRange('A1').values = [['Références MC Studio à utiliser selon le lead']];
refs.getRange('A2:D2').merge();
refs.getRange('A2').values = [['Choisir une seule référence réellement pertinente dans l’email : le tableau n’est pas un script.']];
refs.getRange('A4:D4').values = [['Projet', 'Type', 'Preuve à retenir', 'Lead idéal']];
refs.getRange(`A5:D${4 + projects.length}`).values = projects;

const navy = '#17324D'; const blue = '#2F75B5'; const lightBlue = '#EAF2F8'; const amber = '#FFF2CC'; const lightGrey = '#F4F6F8';
for (const s of [sheet, refs]) {
  s.getRange('A1:N1').format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 15, name: 'Arial' }, horizontalAlignment: 'left', verticalAlignment: 'center' };
  s.getRange('A1:N1').format.rowHeight = 28;
  s.getRange('A2:N2').format = { font: { italic: true, color: '#4B5563', size: 10, name: 'Arial' }, wrapText: true, verticalAlignment: 'center' };
  s.getRange('A2:N2').format.rowHeight = 32;
}
sheet.getRange('A4:N4').format = { fill: blue, font: { bold: true, color: '#FFFFFF', size: 10, name: 'Arial' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
sheet.getRange('A4:N4').format.rowHeight = 34;
sheet.getRange(`A5:N${4 + leads.length}`).format = { font: { size: 10, name: 'Arial', color: '#1F2937' }, verticalAlignment: 'top', wrapText: true };
sheet.getRange(`A5:N${4 + leads.length}`).format.borders = { insideHorizontal: { style: 'thin', color: '#DDE3EA' }, bottom: { style: 'thin', color: '#DDE3EA' } };
sheet.getRange(`A5:N${4 + leads.length}`).format.rowHeight = 58;
sheet.getRange(`A5:N${4 + leads.length}`).getColumn(0).format.fill = lightBlue;
sheet.getRange(`K5:K${4 + leads.length}`).format.fill = amber;
sheet.getRange(`N5:N${4 + leads.length}`).format.fill = lightGrey;
sheet.getRange(`L5:L${4 + leads.length}`).format.font = { color: '#1D4ED8', size: 9, name: 'Arial' };
sheet.getRange(`F5:F${4 + leads.length}`).format.font = { color: '#0F766E', bold: true, size: 10, name: 'Arial' };
sheet.freezePanes.freezeRows(4);
sheet.freezePanes.freezeColumns(2);

refs.getRange('A4:D4').format = { fill: blue, font: { bold: true, color: '#FFFFFF', size: 10, name: 'Arial' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
refs.getRange('A5:D10').format = { font: { size: 10, name: 'Arial', color: '#1F2937' }, verticalAlignment: 'top', wrapText: true };
refs.getRange('A5:D10').format.borders = { insideHorizontal: { style: 'thin', color: '#DDE3EA' }, bottom: { style: 'thin', color: '#DDE3EA' } };
refs.getRange('A5:A10').format.fill = lightBlue;
refs.getRange('A5:D10').format.rowHeight = 42;

const widths = [18, 18, 14, 20, 22, 26, 42, 40, 22, 29, 11, 38, 36, 13];
widths.forEach((width, i) => sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidth = width);
[24, 20, 54, 48].forEach((width, i) => refs.getRangeByIndexes(0, i, 1, 1).format.columnWidth = width);
sheet.getRange(`N5:N${4 + leads.length}`).dataValidation = { rule: { type: 'list', values: ['À écrire', 'Prêt à envoyer', 'Envoyé', 'Répondu', 'À exclure'] } };
sheet.getRange(`K5:K${4 + leads.length}`).conditionalFormats.add('containsText', { text: 'Haute', format: { fill: '#FCE4D6', font: { color: '#9C0006', bold: true } } });

wb.recalculate();
const check = await wb.inspect({ kind: 'table', range: 'Leads!A1:N12', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 14 });
console.log(check.ndjson);
const errors = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
console.log(errors.ndjson);
const preview = await wb.render({ sheetName: 'Leads', range: 'A1:N12', scale: 1.4 });
await fs.writeFile(`${outDir}/leads-preview.png`, new Uint8Array(await preview.arrayBuffer()));
await fs.mkdir(outDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outFile);
console.log(outFile);
