export const portalCommercialSchema = `
CREATE TABLE IF NOT EXISTS portal_crm_contacts (
 id TEXT PRIMARY KEY, organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
 name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
 phone TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
 archived_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_crm_opportunities (
 id TEXT PRIMARY KEY, contact_id TEXT REFERENCES portal_crm_contacts(id),
 title TEXT NOT NULL, source TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
 probability INTEGER CHECK(probability BETWEEN 0 AND 100),
 stage TEXT NOT NULL CHECK(stage IN ('network','new','qualified','proposal','negotiation','won','lost')),
 next_action TEXT NOT NULL DEFAULT '', next_action_date TEXT NOT NULL DEFAULT '',
 lost_reason TEXT NOT NULL DEFAULT '',
 organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
 project_id TEXT UNIQUE REFERENCES projects(id) ON DELETE SET NULL,
 converted_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS crm_opportunity_next_action_idx ON portal_crm_opportunities(stage,next_action_date);

CREATE TABLE IF NOT EXISTS portal_crm_opportunity_history (
 id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL REFERENCES portal_crm_opportunities(id),
 kind TEXT NOT NULL CHECK(kind IN ('created','updated','converted')),
 snapshot TEXT NOT NULL, author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS crm_history_opportunity_idx ON portal_crm_opportunity_history(opportunity_id,created_at,id);

CREATE TABLE IF NOT EXISTS portal_crm_calls (
 id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL REFERENCES portal_crm_opportunities(id),
 occurred_on TEXT NOT NULL, raw_notes TEXT NOT NULL DEFAULT '', summary TEXT NOT NULL,
 commitments TEXT NOT NULL DEFAULT '', owners TEXT NOT NULL DEFAULT '', unknowns TEXT NOT NULL DEFAULT '',
 author_id TEXT REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS crm_calls_opportunity_idx ON portal_crm_calls(opportunity_id,occurred_on);

CREATE TABLE IF NOT EXISTS portal_crm_documents (
 id TEXT PRIMARY KEY, opportunity_id TEXT NOT NULL REFERENCES portal_crm_opportunities(id),
 kind TEXT NOT NULL CHECK(kind IN ('quote','contract')), created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_crm_document_versions (
 id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES portal_crm_documents(id),
 version INTEGER NOT NULL CHECK(version > 0), title TEXT NOT NULL,
 scope TEXT NOT NULL, exclusions TEXT NOT NULL, schedule TEXT NOT NULL,
 amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0), external_url TEXT NOT NULL DEFAULT '',
 author_id TEXT REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL,
 UNIQUE(document_id,version)
);

CREATE TABLE IF NOT EXISTS portal_crm_signatures (
 version_id TEXT PRIMARY KEY REFERENCES portal_crm_document_versions(id),
 signer TEXT NOT NULL, signed_on TEXT NOT NULL, evidence TEXT NOT NULL,
 recorded_by TEXT REFERENCES users(id) ON DELETE SET NULL, recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_finance_invoices (
 id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
 project_name TEXT NOT NULL, organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
 organization_name TEXT NOT NULL, reference TEXT NOT NULL, reference_key TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL, issued_on TEXT NOT NULL, external_url TEXT NOT NULL DEFAULT '',
 total_cents INTEGER NOT NULL CHECK(total_cents > 0),
 net_cents INTEGER NOT NULL CHECK(net_cents BETWEEN 0 AND total_cents),
 cancelled_at TEXT, cancellation_reason TEXT NOT NULL DEFAULT '',
 created_by TEXT REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS finance_invoices_project_idx ON portal_finance_invoices(project_id);

CREATE TABLE IF NOT EXISTS portal_finance_installments (
 id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL REFERENCES portal_finance_invoices(id),
 due_date TEXT NOT NULL, amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
 UNIQUE(invoice_id,due_date)
);
CREATE INDEX IF NOT EXISTS finance_installments_due_idx ON portal_finance_installments(due_date);

CREATE TABLE IF NOT EXISTS portal_finance_entries (
 id TEXT PRIMARY KEY, installment_id TEXT NOT NULL REFERENCES portal_finance_installments(id),
 source TEXT NOT NULL CHECK(source IN ('manual','webhook')), reference TEXT NOT NULL, reference_key TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('receipt','refund','failed')), amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
 occurred_on TEXT NOT NULL, note TEXT NOT NULL DEFAULT '',
 recorded_by TEXT REFERENCES users(id) ON DELETE SET NULL, recorded_at TEXT NOT NULL,
 UNIQUE(source,reference_key)
);
CREATE INDEX IF NOT EXISTS finance_entries_installment_idx ON portal_finance_entries(installment_id);

CREATE TABLE IF NOT EXISTS portal_finance_budgets (
 project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
 estimated_minutes INTEGER NOT NULL CHECK(estimated_minutes >= 0),
 estimated_cost_cents INTEGER NOT NULL CHECK(estimated_cost_cents >= 0),
 updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_finance_costs (
 id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id) ON DELETE SET NULL, project_name TEXT NOT NULL,
 label TEXT NOT NULL, occurred_on TEXT NOT NULL, minutes INTEGER NOT NULL CHECK(minutes >= 0),
 cost_cents INTEGER NOT NULL CHECK(cost_cents >= 0), created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 CHECK(minutes > 0 OR cost_cents > 0)
);
CREATE INDEX IF NOT EXISTS finance_costs_project_idx ON portal_finance_costs(project_id);
`
