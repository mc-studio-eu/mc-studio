import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "outputs/rentree-cold-email-2026/brevo");
const CONTACTS_FILE = path.join(OUT_DIR, "contacts-startups-lyon.csv");
const STATE_FILE = path.join(OUT_DIR, "brevo-state.json");
const API_BASE = "https://api.brevo.com/v3";

const ATTRIBUTES = [
  "STARTUP",
  "SALUTATION",
  "SUBJECT_LINE",
  "INTRO",
  "OBSERVATION",
  "LANDING_IDEA",
  "OFFER_CTA",
  "SOURCE_SITE",
  "PRIORITY",
  "SEQUENCE_DAY",
  "DATA_ORIGIN",
  "STATUS",
];

const campaignTemplates = [
  {
    key: "email_1",
    name: "MC Studio - Startups Lyon - Email 1 - Idee landing",
    subject: "Une idee rapide pour {{ contact.STARTUP }}",
    previewText: "Deux pistes concretes pour rendre votre offre plus claire.",
    offsetDays: 0,
    htmlContent: `
<p>{{ contact.SALUTATION }}</p>
<p>Je suis Mohamed, fondateur de MC Studio.</p>
<p>{{ contact.INTRO }}</p>
<p>{{ contact.OBSERVATION }}</p>
<p>{{ contact.LANDING_IDEA }}</p>
<p>{{ contact.OFFER_CTA }}</p>
<p>Vous voulez que je vous envoie 2 pistes concretes pour ameliorer cette page ?</p>
<p>Mohamed<br>MC Studio<br><a href="https://www.mc-studio.eu">https://www.mc-studio.eu</a></p>
<p style="font-size:12px;color:#666;">Si ce n'est pas pertinent, repondez simplement stop et je ne vous recontacterai pas.</p>`,
  },
  {
    key: "email_2",
    name: "MC Studio - Startups Lyon - Email 2 - Precision",
    subject: "Je precise pour {{ contact.STARTUP }}",
    previewText: "Le but: clarte, confiance et demande qualifiee.",
    offsetDays: 4,
    htmlContent: `
<p>{{ contact.SALUTATION }}</p>
<p>Je me permets de completer mon message.</p>
<p>Quand on travaille une landing chez MC Studio, le but n'est pas seulement de rendre la page plus jolie. On cherche surtout a faire comprendre l'offre plus vite, renforcer la confiance, puis guider vers une demande qualifiee.</p>
<p>Dans votre cas, l'angle qui m'a paru le plus interessant est celui-ci: {{ contact.OBSERVATION }}</p>
<p>Si vous voulez, je peux vous envoyer une mini structure de page adaptee a {{ contact.STARTUP }}.</p>
<p>Mohamed</p>
<p style="font-size:12px;color:#666;">Stop sur simple reponse.</p>`,
  },
  {
    key: "email_3",
    name: "MC Studio - Startups Lyon - Email 3 - Derniere relance",
    subject: "Je ferme la boucle",
    previewText: "Dernier message de ma part.",
    offsetDays: 9,
    htmlContent: `
<p>{{ contact.SALUTATION }}</p>
<p>Dernier message de ma part.</p>
<p>Si la landing ou le site n'est pas un sujet pour cette rentree, aucun souci.</p>
<p>Si vous voulez quand meme un avis rapide, repondez simplement "avis" et je vous envoie 2-3 points concrets sur {{ contact.STARTUP }}.</p>
<p>Bonne journee,<br>Mohamed<br>MC Studio</p>
<p style="font-size:12px;color:#666;">Stop sur simple reponse.</p>`,
  },
];

function loadDotEnv() {
  try {
    const content = fsSync.readFileSync(".env", "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [rawKey, ...rest] = trimmed.split("=");
      const key = rawKey.trim();
      if (process.env[key]) continue;
      const value = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  } catch {
    // Optional local .env support.
  }
}

function parseArgs() {
  const flags = new Set(process.argv.slice(2));
  return {
    dryRun: !flags.has("--live"),
    createOnly: flags.has("--create-only"),
    sendNow: flags.has("--send-now"),
    scheduleFollowups: flags.has("--schedule-followups"),
    sendTest: flags.has("--send-test"),
  };
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      current = "";
      continue;
    }
    current += char;
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const [headers, ...data] = rows;
  return data.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

function nowPlusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 15, 0, 0);
  return date.toISOString();
}

async function readState() {
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeState(state) {
  await fs.writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function brevo(method, endpoint, body) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return {};

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data.message || data.code || text || `${method} ${endpoint} failed`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

async function ensureAttributes() {
  const existing = await brevo("GET", "/contacts/attributes");
  const existingNames = new Set((existing.attributes || []).map((attribute) => attribute.name));

  for (const name of ATTRIBUTES) {
    if (existingNames.has(name)) continue;
    await brevo("POST", `/contacts/attributes/normal/${name}`, { type: "text" });
  }
}

async function createFolderAndList(state) {
  if (!state.folderId) {
    const folder = await brevo("POST", "/contacts/folders", {
      name: "MC Studio - Prospection",
    });
    state.folderId = folder.id;
  }

  if (!state.listId) {
    const list = await brevo("POST", "/contacts/lists", {
      name: "MC Studio - Startups Lyon - Rentree 2026",
      folderId: state.folderId,
    });
    state.listId = list.id;
  }

  return state;
}

async function importContacts(contacts, listId) {
  for (const contact of contacts) {
    const attributes = {};
    for (const key of ATTRIBUTES) attributes[key] = contact[key] || "";
    await brevo("POST", "/contacts", {
      email: contact.EMAIL,
      attributes,
      listIds: [listId],
      updateEnabled: true,
    });
  }
}

async function createCampaigns(state, options) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.NUXT_CONTACT_TO;
  const senderName = process.env.BREVO_SENDER_NAME || "Mohamed de MC Studio";
  const replyTo = process.env.BREVO_REPLY_TO || senderEmail;

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL or NUXT_CONTACT_TO is missing");
  }

  state.campaigns ||= {};

  for (const template of campaignTemplates) {
    if (state.campaigns[template.key]) continue;

    const payload = {
      name: template.name,
      sender: { name: senderName, email: senderEmail },
      replyTo,
      subject: template.subject,
      previewText: template.previewText,
      htmlContent: template.htmlContent,
      recipients: { listIds: [state.listId] },
      mirrorActive: false,
      tag: "mc-studio-rentree-2026",
      utmCampaign: "MC Studio Rentree 2026",
      utmContent: template.key,
    };

    if (options.scheduleFollowups && template.offsetDays > 0) {
      payload.scheduledAt = nowPlusDays(template.offsetDays);
    }

    const campaign = await brevo("POST", "/emailCampaigns", payload);
    state.campaigns[template.key] = campaign.id;
  }

  return state;
}

async function sendTestEmails(state) {
  const emailTo = (process.env.BREVO_TEST_EMAIL || process.env.BREVO_REPLY_TO || process.env.NUXT_CONTACT_TO || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!emailTo.length) {
    throw new Error("BREVO_TEST_EMAIL is missing");
  }

  for (const campaignId of Object.values(state.campaigns || {})) {
    await brevo("POST", `/emailCampaigns/${campaignId}/sendTest`, { emailTo });
  }
}

async function sendFirstCampaign(state) {
  if (process.env.BREVO_LIVE_SEND_CONFIRM !== "SEND_MC_STUDIO_RENTREE_2026") {
    throw new Error("Set BREVO_LIVE_SEND_CONFIRM=SEND_MC_STUDIO_RENTREE_2026 to send live");
  }
  await brevo("POST", `/emailCampaigns/${state.campaigns.email_1}/sendNow`);
}

async function main() {
  loadDotEnv();
  const options = parseArgs();
  const contacts = parseCsv(await fs.readFile(CONTACTS_FILE, "utf8"));
  const validContacts = contacts.filter((contact) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.EMAIL));

  if (options.dryRun) {
    console.log("Dry run only");
    console.log(`Contacts ready: ${validContacts.length}`);
    console.log(`Campaign drafts to create: ${campaignTemplates.length}`);
    console.log("Run with --live --create-only to create Brevo attributes, list, contacts and campaign drafts.");
    console.log("Run with --live --send-test to send tests.");
    console.log("Run with --live --send-now to send Email 1, after tests and final review.");
    return;
  }

  let state = await readState();
  await ensureAttributes();
  state = await createFolderAndList(state);
  await importContacts(validContacts, state.listId);
  state = await createCampaigns(state, options);
  await writeState(state);

  if (options.sendTest) {
    await sendTestEmails(state);
  }

  if (options.sendNow) {
    await sendFirstCampaign(state);
  }

  console.log(JSON.stringify({ contacts: validContacts.length, state }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  if (error.status) console.error(`Brevo status: ${error.status}`);
  process.exit(1);
});
