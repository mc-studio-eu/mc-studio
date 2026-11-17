export const portalContactIntakeSchema = `
CREATE TABLE IF NOT EXISTS portal_contact_submissions (
 id TEXT PRIMARY KEY,
 contact_id TEXT REFERENCES portal_crm_contacts(id) ON DELETE SET NULL,
 opportunity_id TEXT REFERENCES portal_crm_opportunities(id) ON DELETE SET NULL,
 message TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
`
