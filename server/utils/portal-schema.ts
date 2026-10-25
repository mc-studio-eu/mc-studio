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

      current_phase TEXT NOT NULL DEFAULT 'Cadrage', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

`
