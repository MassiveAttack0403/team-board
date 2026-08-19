-- Team Board Schema v0.2.0

CREATE TABLE IF NOT EXISTS members (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id   INTEGER NOT NULL REFERENCES members(id),
  title       TEXT NOT NULL,
  notes       TEXT,
  priority    INTEGER DEFAULT 0,         -- 0=normal 1=high
  due_date    TEXT,                      -- ISO date YYYY-MM-DD
  position    INTEGER DEFAULT 0,         -- sort order within column
  source      TEXT DEFAULT 'manual',     -- 'manual' | 'email' | 'import'
  source_ref  TEXT,                      -- email message-id if from Outlook
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS absences (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id   INTEGER NOT NULL REFERENCES members(id),
  type        TEXT NOT NULL,             -- 'URLAUB' | 'ZA' | 'KS' | 'OTHER'
  date_from   TEXT NOT NULL,
  date_to     TEXT NOT NULL,
  notes       TEXT
);

CREATE TABLE IF NOT EXISTS standup_summaries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  week        TEXT NOT NULL,             -- ISO week e.g. '2026-W34'
  meeting_date TEXT NOT NULL,
  summary     TEXT NOT NULL,
  source_url  TEXT,                      -- Teams meeting link / SharePoint URL
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   INTEGER,
  payload     TEXT,
  actor       TEXT,
  ts          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plan_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,             -- ISO date YYYY-MM-DD
  type        TEXT NOT NULL,             -- see PLAN_TYPES in PlanCalendar.jsx
  label       TEXT,                      -- optional project/event text
  UNIQUE(member_id, date)
);
