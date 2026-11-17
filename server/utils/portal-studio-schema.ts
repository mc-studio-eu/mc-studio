import type { StudioTemplateDefinition, StudioTemplateFile, StudioTemplateId, StudioTemplatePhase, StudioTemplateStep } from '../../shared/portal-studio.ts'

function phase(title: string, startDay: number, endDay: number, steps: StudioTemplateStep[], description = ''): StudioTemplatePhase {
  return { title, description, startDay, endDay, steps }
}

function step(title: string, startDay: number, endDay: number, kind: StudioTemplateStep['kind'] = 'step', requiresValidation = false): StudioTemplateStep {
  return { title, description: '', startDay, endDay, kind, requiresValidation }
}

function file(title: string, description: string, dueDay: number): StudioTemplateFile {
  return { title, description, dueDay }
}

// These seeds install revision 1 only. Published revisions are immutable records.
const initialTemplates: Record<StudioTemplateId, StudioTemplateDefinition> = {
  application: {
    title: 'Application',
    phases: [
      phase('Cadrage', 0, 5, [step('Atelier de lancement', 0, 1), step('Valider le périmètre', 2, 5, 'milestone', true)]),
      phase('Conception', 6, 14, [step('Parcours et maquettes', 6, 11, 'deliverable'), step('Valider les maquettes', 12, 14, 'milestone', true)]),
      phase('Développement et recette', 15, 32, [step('Développer la première version', 15, 26, 'deliverable'), step('Recette fonctionnelle', 27, 30, 'checklist'), step('Valider la mise en service', 31, 32, 'milestone', true)])
    ],
    files: [
      file('Brief fonctionnel', 'Partagez les objectifs, parcours prioritaires et contraintes du produit.', 3),
      file('Charte et ressources graphiques', 'Joignez les logos, polices et références disponibles.', 5)
    ]
  },
  website: {
    title: 'Site web',
    phases: [
      phase('Contenus et arborescence', 0, 5, [step('Atelier de lancement', 0, 1), step('Valider l’arborescence', 2, 5, 'milestone', true)]),
      phase('Design et intégration', 6, 17, [step('Maquettes des pages', 6, 10, 'deliverable', true), step('Intégrer et vérifier les pages', 11, 17, 'deliverable')]),
      phase('Mise en ligne', 18, 22, [step('Recette avant publication', 18, 20, 'checklist'), step('Valider la mise en ligne', 21, 22, 'milestone', true)])
    ],
    files: [
      file('Textes et visuels du site', 'Rassemblez les contenus validés pour les pages prévues.', 5),
      file('Logo et charte graphique', 'Privilégiez les formats SVG, PDF ou PNG haute définition.', 3)
    ]
  },
  maintenance: {
    title: 'Maintenance',
    phases: [
      phase('Prise en main', 0, 4, [step('Inventaire du périmètre', 0, 2), step('Audit initial', 2, 4, 'deliverable')]),
      phase('Mise en place du suivi', 5, 10, [step('Planifier les premières interventions', 5, 7), step('Valider le plan de maintenance', 8, 10, 'milestone', true)])
    ],
    files: [
      file('Documentation technique existante', 'Indiquez les environnements, les services utilisés et les contacts techniques. Partagez les identifiants par votre canal sécurisé habituel.', 3)
    ]
  }
}

const checked = (values: string[]) => values.map(value => `'${value}'`).join(',')

export const portalStudioSchema = `
CREATE TABLE IF NOT EXISTS portal_studio_template_versions (
 template_id TEXT NOT NULL CHECK(template_id IN (${checked(Object.keys(initialTemplates))})),
 version INTEGER NOT NULL CHECK(version > 0),
 definition TEXT NOT NULL, created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(template_id,version)
);

CREATE TABLE IF NOT EXISTS portal_studio_launches (
 idempotency_key TEXT PRIMARY KEY, input_hash TEXT NOT NULL,
 organization_id TEXT NOT NULL, project_id TEXT UNIQUE REFERENCES projects(id) ON DELETE SET NULL,
 template_id TEXT NOT NULL, template_version INTEGER NOT NULL, created_at TEXT NOT NULL,
 FOREIGN KEY(template_id,template_version) REFERENCES portal_studio_template_versions(template_id,version)
);

CREATE TABLE IF NOT EXISTS portal_studio_request_qualification (
 request_id TEXT PRIMARY KEY REFERENCES portal_requests(id) ON DELETE CASCADE,
 classification TEXT CHECK(classification IN ('bug','evolution','question','out_of_scope')),
 priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
 responsible_id TEXT REFERENCES users(id) ON DELETE SET NULL, due_date TEXT, snoozed_until TEXT,
 updated_by TEXT REFERENCES users(id) ON DELETE SET NULL, updated_at TEXT NOT NULL
);

${Object.entries(initialTemplates).map(([id, definition]) => `
INSERT INTO portal_studio_template_versions(template_id,version,definition)
VALUES('${id}',1,'${JSON.stringify(definition).replace(/'/g, "''")}')
ON CONFLICT(template_id,version) DO NOTHING;`).join('\n')}
`
