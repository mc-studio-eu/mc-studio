export const portalSchema = `

    CREATE TABLE IF NOT EXISTS organizations (

      id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

    );

    CREATE TABLE IF NOT EXISTS users (

      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,

      password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','client')),

      organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

    );

    CREATE TABLE IF NOT EXISTS projects (

      id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

      name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'En cours',

      progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100), due_date TEXT NOT NULL DEFAULT '',

      current_phase TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

    );

    CREATE INDEX IF NOT EXISTS projects_org_idx ON projects(organization_id);

    CREATE TABLE IF NOT EXISTS invitations (

      id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE, email TEXT NOT NULL,

      token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, accepted_at TEXT,

      created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

    );

    CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations(email);

    CREATE TABLE IF NOT EXISTS sessions (

      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

    );

    CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS project_reviews (

      project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,

      state TEXT NOT NULL CHECK(state IN ('pending','approved','changes')),

      feedback TEXT NOT NULL DEFAULT '', updated_by TEXT NOT NULL REFERENCES users(id),

      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

    );



CREATE TABLE IF NOT EXISTS resources (

 id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,

 kind TEXT NOT NULL CHECK(kind IN ('payment','file','mockup','link','wiki','analytics')),

 title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '',

 content TEXT NOT NULL DEFAULT '', amount INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'EUR',

 status TEXT NOT NULL DEFAULT 'available', due_date TEXT NOT NULL DEFAULT '',

 file_name TEXT NOT NULL DEFAULT '', file_size INTEGER NOT NULL DEFAULT 0, file_data TEXT NOT NULL DEFAULT '',

 created_by TEXT NOT NULL REFERENCES users(id), archived INTEGER NOT NULL DEFAULT 0,

 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

 CHECK(project_id IS NOT NULL OR kind='wiki')

);

CREATE TABLE IF NOT EXISTS portal_asset_folders (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 label TEXT NOT NULL, name_key TEXT NOT NULL, created_by TEXT NOT NULL REFERENCES users(id),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(project_id,name_key)
);

CREATE TABLE IF NOT EXISTS portal_assets (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL,
 file_name TEXT NOT NULL, mime_type TEXT NOT NULL, file_size INTEGER NOT NULL,
 file_data TEXT NOT NULL, created_by TEXT NOT NULL REFERENCES users(id),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS portal_assets_project_idx ON portal_assets(project_id,created_at);

    CREATE TABLE IF NOT EXISTS portal_project_prompts (
      project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL DEFAULT '', updated_by TEXT REFERENCES users(id),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS portal_settings (
 key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '', updated_by TEXT REFERENCES users(id),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portal_file_requests (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','fulfilled')),
 created_by TEXT NOT NULL REFERENCES users(id), uploaded_by TEXT REFERENCES users(id),
 resource_id TEXT REFERENCES resources(id) ON DELETE SET NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, fulfilled_at TEXT
);
CREATE INDEX IF NOT EXISTS portal_file_requests_project_idx ON portal_file_requests(project_id,status,created_at);

CREATE TABLE IF NOT EXISTS portal_requests (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title TEXT NOT NULL, body TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
 created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 resolved_by TEXT REFERENCES users(id), resolved_at TEXT,
 CHECK((status='open' AND resolved_by IS NULL AND resolved_at IS NULL) OR
       (status='resolved' AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS portal_requests_project_idx ON portal_requests(project_id,status,created_at);
CREATE TABLE IF NOT EXISTS portal_request_messages (
 id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES portal_requests(id) ON DELETE CASCADE,
 body TEXT NOT NULL, author_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL,
 type TEXT NOT NULL DEFAULT 'reply' CHECK(type IN ('reply','status')),
 status TEXT CHECK(status IN ('open','resolved')),
 CHECK((type='reply' AND status IS NULL) OR (type='status' AND status IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS portal_request_messages_request_idx ON portal_request_messages(request_id,created_at);

CREATE TABLE IF NOT EXISTS portal_user_preferences (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK(onboarding_completed IN (0,1)),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS resources_project_idx ON resources(project_id);

CREATE TABLE IF NOT EXISTS activity (

 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

 message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE IF NOT EXISTS mockup_versions (

 id TEXT PRIMARY KEY, resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,

 number INTEGER NOT NULL, file_key TEXT NOT NULL, source_version TEXT NOT NULL,

 published_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL,

 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','approved','changes')),

 reviewed_by TEXT REFERENCES users(id), reviewed_at TEXT,

 UNIQUE(resource_id,number)

);

CREATE INDEX IF NOT EXISTS mockup_versions_resource_idx ON mockup_versions(resource_id);

CREATE TABLE IF NOT EXISTS mockup_screens (

 id TEXT PRIMARY KEY, version_id TEXT NOT NULL REFERENCES mockup_versions(id) ON DELETE CASCADE,

 node_id TEXT NOT NULL, name TEXT NOT NULL, position INTEGER NOT NULL,

 width INTEGER NOT NULL, height INTEGER NOT NULL, image_data TEXT NOT NULL, file_size INTEGER NOT NULL

);

CREATE INDEX IF NOT EXISTS mockup_screens_version_idx ON mockup_screens(version_id);

CREATE TABLE IF NOT EXISTS mockup_annotations (

 id TEXT PRIMARY KEY, screen_id TEXT NOT NULL REFERENCES mockup_screens(id) ON DELETE CASCADE,

 x REAL NOT NULL CHECK(x BETWEEN 0 AND 1), y REAL NOT NULL CHECK(y BETWEEN 0 AND 1),

 body TEXT NOT NULL, author_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL,

 resolved INTEGER NOT NULL DEFAULT 0 CHECK(resolved IN (0,1))

);

CREATE INDEX IF NOT EXISTS mockup_annotations_screen_idx ON mockup_annotations(screen_id);

CREATE TABLE IF NOT EXISTS mockup_replies (

 id TEXT PRIMARY KEY, annotation_id TEXT NOT NULL REFERENCES mockup_annotations(id) ON DELETE CASCADE,

 body TEXT NOT NULL, author_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL

);

CREATE INDEX IF NOT EXISTS mockup_replies_annotation_idx ON mockup_replies(annotation_id);

CREATE TABLE IF NOT EXISTS growth_sites (

 id TEXT PRIMARY KEY, name TEXT NOT NULL, origin TEXT NOT NULL,

 ga4_property TEXT NOT NULL DEFAULT '', search_property TEXT NOT NULL DEFAULT '',

 ahrefs_url TEXT NOT NULL DEFAULT '', plausible_url TEXT NOT NULL DEFAULT '', clarity_url TEXT NOT NULL DEFAULT '',

 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

);


CREATE TABLE IF NOT EXISTS portal_members (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 member_role TEXT NOT NULL DEFAULT 'contributor' CHECK(member_role IN ('decision_maker','contributor','viewer')),
 suspended INTEGER NOT NULL DEFAULT 0 CHECK(suspended IN (0,1)), updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS portal_project_deciders (
 project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
 user_id TEXT REFERENCES users(id), updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS portal_invitation_roles (
 invitation_id TEXT PRIMARY KEY REFERENCES invitations(id) ON DELETE CASCADE,
 member_role TEXT NOT NULL CHECK(member_role IN ('decision_maker','contributor','viewer'))
);
CREATE TABLE IF NOT EXISTS portal_review_history (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
 version_id TEXT REFERENCES mockup_versions(id) ON DELETE CASCADE,
 state TEXT NOT NULL CHECK(state IN ('approved','changes')), feedback TEXT NOT NULL DEFAULT '',
 author_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS portal_password_resets (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS portal_password_resets_user_idx ON portal_password_resets(user_id);
CREATE TABLE IF NOT EXISTS portal_notification_preferences (
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 in_app INTEGER NOT NULL DEFAULT 1 CHECK(in_app IN (0,1)), email INTEGER NOT NULL DEFAULT 1 CHECK(email IN (0,1)),
 reminder_days INTEGER NOT NULL DEFAULT 3 CHECK(reminder_days BETWEEN 0 AND 30)
);
CREATE TABLE IF NOT EXISTS portal_notifications (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL, read_at TEXT, visible INTEGER NOT NULL DEFAULT 1,
 email_status TEXT NOT NULL DEFAULT 'pending', dedupe_key TEXT UNIQUE
);
CREATE INDEX IF NOT EXISTS portal_notifications_user_idx ON portal_notifications(user_id,created_at);
CREATE TABLE IF NOT EXISTS portal_milestones (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 kind TEXT NOT NULL DEFAULT 'milestone' CHECK(kind IN ('milestone','deliverable','checklist')),
 status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in_progress','done','blocked')),
 due_date TEXT NOT NULL DEFAULT '', responsible_id TEXT REFERENCES users(id), blocker TEXT NOT NULL DEFAULT '',
 created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
-- Roadmap archives remain available for the project's validation history.
CREATE TABLE IF NOT EXISTS portal_roadmap_phases (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 start_date TEXT, end_date TEXT,
 status TEXT NOT NULL CHECK(status IN ('planned','in_progress','awaiting_validation','blocked','done')),
 position INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
 UNIQUE(project_id,id), CHECK(start_date IS NULL OR end_date IS NULL OR start_date<=end_date)
);
CREATE INDEX IF NOT EXISTS portal_roadmap_phases_project_idx ON portal_roadmap_phases(project_id,archived,position);
CREATE TABLE IF NOT EXISTS portal_roadmap_steps (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL, phase_id TEXT NOT NULL,
 title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
 start_date TEXT, end_date TEXT,
 kind TEXT NOT NULL DEFAULT 'step' CHECK(kind IN ('step','milestone','deliverable','checklist')),
 status TEXT NOT NULL CHECK(status IN ('planned','in_progress','awaiting_validation','blocked','done')),
 position INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
 requires_validation INTEGER NOT NULL DEFAULT 0 CHECK(requires_validation IN (0,1)),
 resource_ids TEXT NOT NULL DEFAULT '[]', dependency_ids TEXT NOT NULL DEFAULT '[]',
 responsible_id TEXT REFERENCES users(id) ON DELETE SET NULL, blocker TEXT NOT NULL DEFAULT '',
 created_by TEXT REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 UNIQUE(project_id,id),
 FOREIGN KEY(project_id,phase_id) REFERENCES portal_roadmap_phases(project_id,id) ON DELETE CASCADE,
 CHECK(start_date IS NULL OR end_date IS NULL OR start_date<=end_date)
);
CREATE INDEX IF NOT EXISTS portal_roadmap_steps_project_idx ON portal_roadmap_steps(project_id,archived,phase_id,position);
CREATE TABLE IF NOT EXISTS portal_roadmap_phase_prerequisites (
 project_id TEXT NOT NULL, phase_id TEXT NOT NULL, step_id TEXT NOT NULL,
 PRIMARY KEY(project_id,phase_id,step_id),
 FOREIGN KEY(project_id,phase_id) REFERENCES portal_roadmap_phases(project_id,id) ON DELETE CASCADE,
 FOREIGN KEY(project_id,step_id) REFERENCES portal_roadmap_steps(project_id,id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS portal_roadmap_phase_prerequisites_step_idx ON portal_roadmap_phase_prerequisites(project_id,step_id);
CREATE TABLE IF NOT EXISTS portal_roadmap_validations (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL, step_id TEXT NOT NULL, attempt INTEGER NOT NULL,
 title TEXT NOT NULL, description TEXT NOT NULL, url TEXT NOT NULL DEFAULT '',
 resource_id TEXT, resource_title TEXT NOT NULL DEFAULT '', resource_url TEXT NOT NULL DEFAULT '',
 due_date TEXT, requested_at TEXT NOT NULL, requested_by TEXT NOT NULL, requested_by_name TEXT NOT NULL,
 UNIQUE(step_id,attempt),
 FOREIGN KEY(project_id,step_id) REFERENCES portal_roadmap_steps(project_id,id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS portal_roadmap_validations_project_idx ON portal_roadmap_validations(project_id);
CREATE TABLE IF NOT EXISTS portal_roadmap_decisions (
 validation_id TEXT PRIMARY KEY REFERENCES portal_roadmap_validations(id) ON DELETE CASCADE,
 status TEXT NOT NULL CHECK(status IN ('approved','changes','cancelled')),
 comment TEXT NOT NULL DEFAULT '', decided_at TEXT NOT NULL, decided_by TEXT NOT NULL, decided_by_name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS portal_roadmap_migrations (
 project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS portal_file_request_assignments (
 request_id TEXT PRIMARY KEY REFERENCES portal_file_requests(id) ON DELETE CASCADE,
 responsible_id TEXT REFERENCES users(id), due_date TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS portal_satisfaction_surveys (
 project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
 definition TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision>0),
 updated_by TEXT REFERENCES users(id), updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS portal_satisfaction_responses (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL CHECK(revision>=0), submitted_at TEXT NOT NULL,
 respondent TEXT NOT NULL, definition TEXT NOT NULL, answers TEXT NOT NULL,
 UNIQUE(project_id,user_id)
);
CREATE INDEX IF NOT EXISTS portal_satisfaction_responses_project_idx ON portal_satisfaction_responses(project_id,submitted_at);

-- Additive object references preserve existing base64 files and assets.
CREATE TABLE IF NOT EXISTS portal_uploads (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('file','asset')), client_key TEXT NOT NULL,
 staging_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, mime_type TEXT NOT NULL,
 file_size INTEGER NOT NULL, metadata TEXT NOT NULL, expires_at TEXT NOT NULL,
 result_id TEXT, created_at TEXT NOT NULL,
 UNIQUE(user_id,client_key)
);
CREATE INDEX IF NOT EXISTS portal_uploads_project_idx ON portal_uploads(project_id,expires_at);
CREATE TABLE IF NOT EXISTS portal_objects (
 id TEXT PRIMARY KEY, object_key TEXT NOT NULL UNIQUE,
 resource_id TEXT UNIQUE REFERENCES resources(id) ON DELETE SET NULL,
 asset_id TEXT UNIQUE REFERENCES portal_assets(id) ON DELETE SET NULL,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS portal_r2_storage_budget (
 id INTEGER PRIMARY KEY CHECK(id=1),
 bytes_reserved BIGINT NOT NULL CHECK(bytes_reserved>=0)
);
CREATE TABLE IF NOT EXISTS portal_r2_copy_credits (
 upload_id TEXT PRIMARY KEY REFERENCES portal_uploads(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS portal_r2_daily_operations (
 operation TEXT NOT NULL CHECK(operation IN ('upload','head','copy','download')),
 utc_day TEXT NOT NULL,
 used_count BIGINT NOT NULL CHECK(used_count>0),
 PRIMARY KEY(operation,utc_day)
);
`

// Run in the schema transaction, and after the explicit SQLite import. The per-project
// marker is written last so retries cannot recreate archived or edited legacy steps.
export const portalRoadmapMigration = `
INSERT INTO portal_roadmap_phases(id,project_id,title,status,position)
SELECT 'legacy-milestones:' || m.project_id,m.project_id,'Étapes existantes',
 CASE WHEN SUM(CASE WHEN m.status='done' THEN 1 ELSE 0 END)=COUNT(*) THEN 'done'
      WHEN SUM(CASE WHEN m.status='in_progress' THEN 1 ELSE 0 END)>0 THEN 'in_progress'
      WHEN SUM(CASE WHEN m.status='blocked' THEN 1 ELSE 0 END)>0 THEN 'blocked'
      ELSE 'planned' END,
 COALESCE((SELECT MAX(p.position)+1 FROM portal_roadmap_phases p WHERE p.project_id=m.project_id AND p.archived=0),0)
FROM portal_milestones m
WHERE NOT EXISTS (SELECT 1 FROM portal_roadmap_migrations x WHERE x.project_id=m.project_id)
GROUP BY m.project_id
ON CONFLICT(id) DO NOTHING;

INSERT INTO portal_roadmap_steps(id,project_id,phase_id,title,description,kind,status,end_date,position,responsible_id,blocker,created_by,created_at,updated_at)
SELECT m.id,m.project_id,'legacy-milestones:' || m.project_id,m.title,m.description,m.kind,
 CASE WHEN m.status='todo' THEN 'planned' ELSE m.status END,NULLIF(m.due_date,''),
 ROW_NUMBER() OVER (PARTITION BY m.project_id ORDER BY CASE WHEN m.due_date='' THEN 1 ELSE 0 END,m.due_date,m.created_at,m.id)-1,
 m.responsible_id,m.blocker,m.created_by,m.created_at,m.updated_at
FROM portal_milestones m
WHERE NOT EXISTS (SELECT 1 FROM portal_roadmap_migrations x WHERE x.project_id=m.project_id)
ON CONFLICT(id) DO NOTHING;

UPDATE projects SET
 progress=COALESCE((SELECT (100*SUM(CASE WHEN s.status='done' THEN 1 ELSE 0 END)+COUNT(*)/2)/NULLIF(COUNT(*),0)
                    FROM portal_roadmap_steps s WHERE s.project_id=projects.id AND s.archived=0),0),
 current_phase=COALESCE((SELECT p.title FROM portal_roadmap_phases p
                         WHERE p.project_id=projects.id AND p.archived=0 AND p.status IN ('in_progress','blocked','awaiting_validation')
                         ORDER BY p.position,p.id LIMIT 1),'')
WHERE EXISTS (SELECT 1 FROM portal_milestones m WHERE m.project_id=projects.id)
  AND NOT EXISTS (SELECT 1 FROM portal_roadmap_migrations x WHERE x.project_id=projects.id);

INSERT INTO portal_roadmap_migrations(project_id)
SELECT DISTINCT project_id FROM portal_milestones WHERE 1=1
ON CONFLICT(project_id) DO NOTHING;

UPDATE projects SET progress=0,current_phase=''
WHERE (progress<>0 OR current_phase<>'')
 AND NOT EXISTS (SELECT 1 FROM portal_roadmap_phases p WHERE p.project_id=projects.id AND p.archived=0);
`
