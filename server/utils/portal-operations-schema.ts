export const portalOperationsSchema = `
CREATE TABLE IF NOT EXISTS portal_operation_control (
 id INTEGER PRIMARY KEY CHECK(id=1),
 paused INTEGER NOT NULL DEFAULT 0 CHECK(paused IN (0,1)),
 last_tick_at TEXT
);
INSERT INTO portal_operation_control(id) VALUES(1) ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS portal_operation_projects (
 project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
 paused INTEGER NOT NULL CHECK(paused IN (0,1))
);

CREATE TABLE IF NOT EXISTS portal_operation_scenarios (
 id TEXT PRIMARY KEY CHECK(id IN ('reminders','weekly_report')),
 paused INTEGER NOT NULL DEFAULT 0 CHECK(paused IN (0,1)),
 scheduled INTEGER NOT NULL DEFAULT 0 CHECK(scheduled IN (0,1))
);
INSERT INTO portal_operation_scenarios(id) VALUES('reminders'),('weekly_report') ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS portal_operation_runs (
 id TEXT PRIMARY KEY,
 project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 scenario TEXT NOT NULL REFERENCES portal_operation_scenarios(id),
 idempotency_key TEXT NOT NULL,
 source TEXT NOT NULL CHECK(source IN ('scheduled','manual','replay')),
 replay_of TEXT REFERENCES portal_operation_runs(id) ON DELETE SET NULL,
 status TEXT NOT NULL CHECK(status IN ('queued','running','draft','approved','succeeded','failed')),
 attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
 available_at TEXT NOT NULL,
 claim_token TEXT,
 lease_until TEXT,
 period_start TEXT,
 period_end TEXT,
 report_title TEXT,
 report_body TEXT,
 notifications INTEGER,
 error_code TEXT,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 UNIQUE(project_id,scenario,idempotency_key)
);
CREATE INDEX IF NOT EXISTS portal_operation_runs_due_idx ON portal_operation_runs(status,available_at,id);
CREATE INDEX IF NOT EXISTS portal_operation_runs_lease_idx ON portal_operation_runs(status,lease_until,id);
CREATE INDEX IF NOT EXISTS portal_operation_runs_project_idx ON portal_operation_runs(project_id,created_at,id);

CREATE TABLE IF NOT EXISTS portal_operation_events (
 id TEXT PRIMARY KEY,
 project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
 scenario TEXT REFERENCES portal_operation_scenarios(id),
 run_id TEXT REFERENCES portal_operation_runs(id) ON DELETE CASCADE,
 actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
 event TEXT NOT NULL,
 attempt INTEGER,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS portal_operation_events_project_idx ON portal_operation_events(project_id,created_at,id);

CREATE TABLE IF NOT EXISTS portal_operation_email_attempts (
 notification_id TEXT PRIMARY KEY REFERENCES portal_notifications(id) ON DELETE CASCADE,
 attempts INTEGER NOT NULL CHECK(attempts BETWEEN 1 AND 3),
 first_attempt_at TEXT NOT NULL,
 payload_hash TEXT NOT NULL
);
`
