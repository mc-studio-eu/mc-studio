import fs from 'node:fs/promises';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const outDir = '/Users/mohamedchettah/Project/mc-studio/outputs/2026-09-14-leads-london-tech';
const outFile = `${outDir}/leads-london-tech-opportunites-site.xlsx`;

// Observations made from public home pages on 14 September 2026. They describe an
// outreach hypothesis, not a judgment about the company or its product quality.
const leads = [
  ['SaaS workforce', 'Rotageek', 'Londres / UK', 'Gestion de workforce : prévision, modélisation, plannings, pointage et IA pour organisations multi-sites.', 'Accueil très dense : navigation par solutions, fonctionnalités, secteurs, ressources et preuves. Une entrée « par situation métier » peut être plus immédiate.', 'Transformer l’arrivée sur le site en 3 parcours : retail, hospitality et healthcare, chacun avec un scénario opérationnel et une démo contextualisée.', 'SaaS B2B / CRM R&A Energy', 'hello@rotageek.com', 'https://www.rotageek.com/', 'Très haute', 'À qualifier'],
  ['Fintech data', 'Codat', 'Londres / UK', 'Infrastructure de données ERP pour banques commerciales : insights, connecteurs et opportunités de revenu.', 'Positionnement récent « advisory intelligence » : les deux produits et plusieurs audiences bancaires se croisent dès la navigation.', 'Clarifier le récit de la nouvelle catégorie par persona (card, treasury, fintech) avec une preuve de valeur visible avant les détails techniques.', 'CRM R&A Energy', 'Contact via “Book a Meeting”', 'https://codat.io/', 'Haute', 'À qualifier'],
  ['Fintech', 'Soldo', 'Londres / UK', 'Gestion des dépenses et cartes pour équipes finance.', 'Offre et navigation riches, avec plusieurs modules et cas d’usage finance à synthétiser pour un premier visiteur.', 'Créer une landing par déclencheur d’achat : contrôle des dépenses, clôture, équipes terrain ou entités multiples.', 'CRM R&A Energy', 'Contact via site', 'https://www.soldo.com/en-gb/', 'Haute', 'À qualifier'],
  ['Fintech B2B', 'Kriya', 'Londres / UK', 'B2B PayLater, invoice finance et financement du besoin en fonds de roulement.', 'Plusieurs produits de financement et audiences ; le bénéfice prioritaire peut varier entre marchand, plateforme et PME.', 'Faire émerger un parcours décisionnel très concret : une vente, un besoin de cash, puis le mécanisme Kriya.', 'R&A Energy — offre B2B technique', 'Contact via site', 'https://www.kriya.co/', 'Moyenne', 'À qualifier'],
  ['Legal AI', 'Luminance', 'Londres / UK', 'IA juridique pour automatiser et augmenter les équipes juridiques.', 'Promesse « Legal-Grade AI » forte, mais univers produit et cas d’usage enterprise demandent une mise en scène simple pour les nouveaux visiteurs.', 'Mettre en avant une démo narrative par moment de travail : contrat, négociation, analyse ou knowledge management.', 'Arises — expérience produit', 'Contact via site', 'https://www.luminance.com/', 'Haute', 'À qualifier'],
  ['Martech B2B', 'Turtl', 'Londres / UK', 'Plateforme de Revenue Content et personnalisation ABM ; annonce 440+ clients et 90+ collaborateurs.', 'Le site mêle plateforme, IA Hatch, ABM, intégrations et contenus : riche, mais le premier bénéfice dépend du rôle marketing du visiteur.', 'Réorganiser la page d’entrée par rôle : demand gen, ABM, content et sales, avec une preuve de pipeline dédiée.', 'Personal — expérience SaaS / contenu', 'Formulaire public', 'https://turtl.co/', 'Haute', 'À qualifier'],
  ['Finance SaaS', 'Chaser', 'Londres / UK', 'Automatisation des comptes clients, relances, recouvrement et prévisions de cash.', 'Le site présente logiciel, services, portail de paiement, IA, événements et nombreuses ressources dès les premiers parcours.', 'Faire une landing « finance team » qui montre le chemin facture → relance → paiement → forecast, avant le catalogue complet.', 'CRM R&A Energy', 'Contact via démo', 'https://www.chaserhq.com/', 'Très haute', 'À qualifier'],
  ['Core banking', 'SaaScada', 'Londres / UK', 'Plateforme de core banking en temps réel pour banques et fintechs.', 'L’accueil additionne expertise fondateurs, récompenses, partenaires, clients et contenus : beaucoup de signaux de réassurance à hiérarchiser.', 'Concentrer le premier écran sur un scénario de lancement bancaire, puis faire remonter les preuves selon le niveau de maturité.', 'R&A Energy — offre B2B complexe', 'hello@saascada.com', 'https://saascada.com/', 'Haute', 'À qualifier'],
  ['Fintech', 'TREASY', 'Londres / UK', 'SaaS de treasury management et composition de produits pour institutions financières ; fondée en 2024.', 'Le site expose une promesse ambitieuse et plusieurs partenariats, mais le produit concret et l’audience prioritaire méritent une démonstration plus rapide.', 'Construire un parcours « banque / institution » avec une visualisation de la transaction et les gains opérationnels.', 'CRM R&A Energy', 'Contact via site', 'https://treasy.com/', 'Très haute', 'À qualifier'],
  ['Fintech', 'Pitch Black Technology', 'Londres / UK', 'Plateformes fintech pour intermédiaires et prêteurs, modules achetables et intégrables.', 'La home répète le message principal et enchaîne beaucoup de capacités techniques ; le « pourquoi maintenant » est peu distinct dans le premier flux.', 'Créer des entrées nettes prêteur vs intermédiaire et une architecture orientée workflow plutôt que liste de fonctionnalités.', 'Arises — produit / workflow', 'Contact via site', 'https://www.pitchblacktechnology.com/', 'Très haute', 'À qualifier'],
  ['AI venture studio', 'Ideallio', 'Canary Wharf, Londres', 'Venture studio IA B2B, avec portefeuille de neuf lignes produit et focus marchés réglementés.', 'La page combine modèle venture studio, portefeuille et capacités : les deux audiences (fondateurs/domain experts et partenaires) doivent se reconnaître vite.', 'Séparer clairement les deux parcours de conversion et donner à chaque projet du portefeuille son propre mini-récit produit.', 'Shika Consulting — offre de conseil', 'contact@ideallio.com', 'https://ideallio.com/', 'Très haute', 'À qualifier'],
  ['AI B2B', 'Forthen', 'Londres / UK', 'Conseil et intégration IA pour petites entreprises de cols blancs ; automatisation de workflows choisis.', 'Le discours est humain et précis, mais la page liste beaucoup d’étapes et d’explications avant de montrer quelques exemples de livrables.', 'Passer par trois cas concrets (cabinet, finance, RH) et une avant/après de workflow pour accélérer la compréhension.', 'Shika Consulting', 'ollie@forthen.uk', 'https://www.forthen.uk/', 'Très haute', 'À qualifier'],
  ['AI customer agent', 'Punchline', 'Londres / UK', 'Agent IA pour site et téléphone : support, recherche produit, retours et mise à jour de commande.', 'La documentation décrit un produit très large : chat, voix, e-commerce, no-code et try-on. Une première démonstration doit guider la lecture.', 'Donner une entrée par objectif e-commerce : réduire tickets, guider l’achat ou automatiser les retours.', 'Personal — produit / expérience', 'hi@punchline.ai', 'https://punchline.ai/', 'Très haute', 'À qualifier'],
  ['B2B AI', 'STRATOS', 'Londres / UK', 'Entreprise IA/data fondée en 2022, destinée à la croissance des organisations B2B complexes.', 'Proposition de valeur très haute altitude (« sustainable value creation ») : elle peut gagner à devenir immédiatement tangible par cas client.', 'Travailler le récit « portefeuille → décision → impact » et exposer les résultats ou écrans avant la méthode.', 'Arises — rendre un système complexe tangible', 'Contact via site', 'https://stratos.ai/', 'Haute', 'À qualifier'],
  ['AI support', 'Gradient Labs', 'Londres / UK', 'Startup IA de service client pour entreprises financières et équipes réglementées.', 'Sujet sensible et complexe (automation + conformité) : bonne candidate pour un site qui rend la confiance et le workflow plus visuels.', 'Créer une démonstration progressive : question client → contrôle → action autorisée → escalade humaine.', 'CRM R&A Energy / expérience SaaS', 'Contact via site', 'https://www.gradient-labs.ai/', 'Haute', 'À qualifier'],
];

const sources = [
  ['Méthode', 'Audit léger des pages publiques : clarté de l’offre, densité de navigation, mise en avant des cas d’usage et capacité de démonstration. Ce n’est pas un verdict esthétique.'],
  ['Périmètre', '15 entreprises tech avec ancrage Londres / UK. Contacts : uniquement emails génériques visibles publiquement ou chemin de contact public.'],
  ['Usage', 'Lis la ligne avant l’email, vérifie le site le jour même, puis choisis un seul angle. Ne pas dire « votre site est mauvais ».'],
  ['Timing', 'Les priorités « très haute » signalent un angle de proposition clair, pas une intention d’achat vérifiée.'],
];

const wb = Workbook.create();
const sheet = wb.worksheets.add('Leads Londres');
const notes = wb.worksheets.add('Méthode & sources');
for (const s of [sheet, notes]) { s.showGridLines = false; s.tabColor = '#1F4E78'; }

sheet.getRange('A1:K1').merge();
sheet.getRange('A1').values = [['Startups tech Londres — opportunités site pour MC Studio']];
sheet.getRange('A2:K2').merge();
sheet.getRange('A2').values = [['Liste courte pour une approche manuelle. Les observations sont des hypothèses issues de pages publiques : elles servent à préparer l’email, pas à juger la qualité d’une entreprise.']];
sheet.getRange('A4:K4').values = [['Segment', 'Entreprise', 'Localisation', 'Contexte business', 'Observation du site', 'Angle MC Studio possible', 'Référence MC Studio', 'Contact public', 'Site / source', 'Priorité', 'Statut']];
sheet.getRange(`A5:K${4 + leads.length}`).values = leads;

notes.getRange('A1:B1').merge();
notes.getRange('A1').values = [['Méthode et règles d’utilisation']];
notes.getRange('A3:B3').values = [['Élément', 'Détail']];
notes.getRange(`A4:B${3 + sources.length}`).values = sources;

const navy = '#17324D', blue = '#2F75B5', pale = '#EAF2F8', amber = '#FFF2CC', grey = '#F4F6F8';
sheet.getRange('A1:K1').format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 15, name: 'Arial' }, verticalAlignment: 'center' };
sheet.getRange('A1:K1').format.rowHeight = 28;
sheet.getRange('A2:K2').format = { font: { italic: true, color: '#4B5563', size: 10, name: 'Arial' }, wrapText: true, verticalAlignment: 'center' };
sheet.getRange('A2:K2').format.rowHeight = 34;
sheet.getRange('A4:K4').format = { fill: blue, font: { bold: true, color: '#FFFFFF', size: 10, name: 'Arial' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
sheet.getRange('A4:K4').format.rowHeight = 34;
sheet.getRange(`A5:K${4 + leads.length}`).format = { font: { size: 10, name: 'Arial', color: '#1F2937' }, verticalAlignment: 'top', wrapText: true };
sheet.getRange(`A5:K${4 + leads.length}`).format.borders = { insideHorizontal: { style: 'thin', color: '#DDE3EA' }, bottom: { style: 'thin', color: '#DDE3EA' } };
sheet.getRange(`A5:K${4 + leads.length}`).format.rowHeight = 86;
sheet.getRange(`A5:A${4 + leads.length}`).format.fill = pale;
sheet.getRange(`J5:J${4 + leads.length}`).format.fill = amber;
sheet.getRange(`K5:K${4 + leads.length}`).format.fill = grey;
sheet.getRange(`H5:H${4 + leads.length}`).format.font = { color: '#0F766E', bold: true, size: 10, name: 'Arial' };
sheet.getRange(`I5:I${4 + leads.length}`).format.font = { color: '#1D4ED8', size: 9, name: 'Arial' };
sheet.getRange(`K5:K${4 + leads.length}`).dataValidation = { rule: { type: 'list', values: ['À qualifier', 'À écrire', 'Prêt à envoyer', 'Envoyé', 'Répondu', 'À exclure'] } };
sheet.getRange(`J5:J${4 + leads.length}`).conditionalFormats.add('containsText', { text: 'Très haute', format: { fill: '#FCE4D6', font: { color: '#9C0006', bold: true } } });
[16, 20, 17, 42, 48, 47, 29, 25, 36, 13, 15].forEach((w, i) => sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidth = w);
sheet.freezePanes.freezeRows(4); sheet.freezePanes.freezeColumns(2);

notes.getRange('A1:B1').format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 15, name: 'Arial' }, verticalAlignment: 'center' };
notes.getRange('A1:B1').format.rowHeight = 28;
notes.getRange('A3:B3').format = { fill: blue, font: { bold: true, color: '#FFFFFF', size: 10, name: 'Arial' }, verticalAlignment: 'center' };
notes.getRange(`A4:B${3 + sources.length}`).format = { font: { size: 10, name: 'Arial', color: '#1F2937' }, verticalAlignment: 'top', wrapText: true };
notes.getRange(`A4:B${3 + sources.length}`).format.rowHeight = 46;
notes.getRange(`A4:A${3 + sources.length}`).format.fill = pale;
notes.getRange('A1').format.columnWidth = 22; notes.getRange('B1').format.columnWidth = 95;

wb.recalculate();
const check = await wb.inspect({ kind: 'table', range: 'Leads Londres!A1:K10', include: 'values,formulas', tableMaxRows: 10, tableMaxCols: 11 });
console.log(check.ndjson);
const errors = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
console.log(errors.ndjson);
const preview = await wb.render({ sheetName: 'Leads Londres', range: 'A1:K10', scale: 1.25 });
await fs.writeFile(`${outDir}/leads-london-preview.png`, new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outFile);
console.log(outFile);
