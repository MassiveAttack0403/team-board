// Version: 0.2.0 — Seed: Mitarbeiter + Tasks + Abwesenheiten + Plan-Einträge (Stand 2026-08-19)
'use strict';
const { getDb } = require('./index');

const db = getDb();

const members = [
  { name: 'Mousser Kerkeni',        email: null },
  { name: 'Franz Kopecky',          email: null },
  { name: 'Emanuel Ivanovic',       email: null },
  { name: 'Jochen Steindorfer',     email: null },
  { name: 'Markus Trummer',         email: null },
  { name: 'Parameshwaran Raju',     email: null },
  { name: 'Ahmed Fadl',             email: null },
  { name: 'Sofiane Ichira',         email: null },
  { name: 'Markus Gerstl',          email: null },
  { name: 'Corinna Rehberger-Gruber', email: null },
  { name: 'Markus Weber',           email: null },
  { name: 'Andreas Kautek',         email: null },
  { name: 'Gernot Dachs',           email: null },
];

const insertMember = db.prepare('INSERT OR IGNORE INTO members (name, email, display_order) VALUES (?,?,?)');
members.forEach((m, i) => insertMember.run(m.name, m.email, i));

const getId = db.prepare('SELECT id FROM members WHERE name=?');

const tasks = [
  // Emanuel Ivanovic
  { member: 'Emanuel Ivanovic',       title: 'Misc.' },
  { member: 'Emanuel Ivanovic',       title: 'Enersun (IL)' },
  { member: 'Emanuel Ivanovic',       title: 'Sie Mob RDB' },
  // Jochen Steindorfer
  { member: 'Jochen Steindorfer',     title: 'Mekorot' },
  { member: 'Jochen Steindorfer',     title: 'Rittmeyer' },
  { member: 'Jochen Steindorfer',     title: 'Lusail' },
  { member: 'Jochen Steindorfer',     title: 'Enersun (IL)' },
  // Markus Trummer
  { member: 'Markus Trummer',         title: 'SABESP' },
  { member: 'Markus Trummer',         title: 'Data Center' },
  { member: 'Markus Trummer',         title: 'SICAM SCC' },
  // Parameshwaran Raju
  { member: 'Parameshwaran Raju',     title: 'Transco' },
  { member: 'Parameshwaran Raju',     title: 'Noida DC1E2' },
  { member: 'Parameshwaran Raju',     title: 'SRs / GF' },
  { member: 'Parameshwaran Raju',     title: 'Siemens Mob Misc' },
  { member: 'Parameshwaran Raju',     title: 'Databases topics' },
  { member: 'Parameshwaran Raju',     title: 'AWBs Http Pub.Rez.' },
  { member: 'Parameshwaran Raju',     title: 'SABESP' },
  // Ahmed Fadl
  { member: 'Ahmed Fadl',             title: 'SRs' },
  { member: 'Ahmed Fadl',             title: 'Cranes' },
  { member: 'Ahmed Fadl',             title: 'SPIE' },
  { member: 'Ahmed Fadl',             title: 'Hera' },
  { member: 'Ahmed Fadl',             title: 'ELTEC (Ernesto)' },
  { member: 'Ahmed Fadl',             title: 'AWBs HTTPPub' },
  { member: 'Ahmed Fadl',             title: 'AWBs Framework' },
  { member: 'Ahmed Fadl',             title: 'Buxbaum K' },
  // Corinna Rehberger-Gruber
  { member: 'Corinna Rehberger-Gruber', title: 'Trainer org' },
  // Gernot Dachs
  { member: 'Gernot Dachs',           title: 'Basis Training online En' },
  { member: 'Gernot Dachs',           title: 'Mo & Di' },
];

const insertTask = db.prepare('INSERT INTO tasks (member_id, title, position) VALUES (?,?,?)');
const posMap = {};
tasks.forEach(t => {
  const row = getId.get(t.member);
  if (!row) return;
  posMap[row.id] = (posMap[row.id] || 0);
  insertTask.run(row.id, t.title, posMap[row.id]++);
});

const absences = [
  { member: 'Mousser Kerkeni',    type: 'URLAUB', from: '2026-08-18', to: '2026-08-31' },
  { member: 'Franz Kopecky',      type: 'URLAUB', from: '2026-08-18', to: '2026-08-31' },
  { member: 'Sofiane Ichira',     type: 'URLAUB', from: '2026-08-18', to: '2026-08-31' },
  { member: 'Parameshwaran Raju', type: 'URLAUB', from: '2026-08-20', to: '2026-08-22', notes: 'ab Mi' },
  { member: 'Markus Weber',       type: 'URLAUB', from: '2026-08-10', to: '2026-08-31' },
  { member: 'Andreas Kautek',     type: 'URLAUB', from: '2026-08-10', to: '2026-08-24' },
  { member: 'Gernot Dachs',       type: 'URLAUB', from: '2026-08-18', to: '2026-09-03' },
];

const insertAbsence = db.prepare('INSERT INTO absences (member_id, type, date_from, date_to, notes) VALUES (?,?,?,?,?)');
absences.forEach(a => {
  const row = getId.get(a.member);
  if (!row) return;
  insertAbsence.run(row.id, a.type, a.from, a.to, a.notes || null);
});

const insertPlan = db.prepare(`
  INSERT OR IGNORE INTO plan_entries (member_id, date, type, label) VALUES (?,?,?,?)
`);

function planRange(memberName, type, from, to, label = null) {
  const row = getId.get(memberName);
  if (!row) return;
  const end = new Date(to);
  for (let d = new Date(from); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    insertPlan.run(row.id, d.toISOString().slice(0, 10), type, label);
  }
}

// ── August 2026 ────────────────────────────────────────────────
// Urlaub (spiegelt Abwesenheits-Tabelle)
planRange('Mousser Kerkeni',         'vacation',          '2026-08-18', '2026-08-31');
planRange('Franz Kopecky',           'vacation',          '2026-08-18', '2026-08-31');
planRange('Sofiane Ichira',          'vacation',          '2026-08-18', '2026-08-31');
planRange('Markus Weber',            'vacation',          '2026-08-10', '2026-08-31');
planRange('Andreas Kautek',          'vacation',          '2026-08-10', '2026-08-24');
planRange('Gernot Dachs',            'vacation',          '2026-08-18', '2026-09-03');
planRange('Parameshwaran Raju',      'vacation',          '2026-08-20', '2026-08-22');

// Arbeit im August (Mitarbeiter ohne Urlaub)
planRange('Emanuel Ivanovic',        'consulting_blocked', '2026-08-18', '2026-08-31', 'Enersun IL');
planRange('Jochen Steindorfer',      'travel',             '2026-08-18', '2026-08-22', 'Lusail');
planRange('Jochen Steindorfer',      'consulting_blocked', '2026-08-25', '2026-08-31', 'Mekorot');
planRange('Markus Trummer',          'consulting_blocked', '2026-08-18', '2026-08-31', 'SABESP');
planRange('Parameshwaran Raju',      'consulting_blocked', '2026-08-18', '2026-08-19', 'Transco');
planRange('Parameshwaran Raju',      'consulting_blocked', '2026-08-25', '2026-08-31', 'Noida DC1E2');
planRange('Ahmed Fadl',              'consulting_ordered', '2026-08-18', '2026-08-22', 'SPIE');
planRange('Ahmed Fadl',              'consulting_blocked', '2026-08-25', '2026-08-31', 'Cranes');
planRange('Sofiane Ichira',          'vacation',          '2026-08-01', '2026-08-17');
planRange('Markus Gerstl',           'home_office',       '2026-08-18', '2026-08-21');
planRange('Markus Gerstl',           'consulting_blocked', '2026-08-22', '2026-08-31');
planRange('Corinna Rehberger-Gruber','training_blocked',  '2026-08-18', '2026-08-31', 'Trainer org');

// ── September 2026 ─────────────────────────────────────────────
planRange('Gernot Dachs',            'training_blocked',  '2026-09-04', '2026-09-30', 'Basis Training');
planRange('Mousser Kerkeni',         'consulting_blocked', '2026-09-01', '2026-09-30');
planRange('Franz Kopecky',           'consulting_blocked', '2026-09-01', '2026-09-30');
planRange('Sofiane Ichira',          'consulting_blocked', '2026-09-01', '2026-09-30');
planRange('Emanuel Ivanovic',        'consulting_blocked', '2026-09-01', '2026-09-12', 'Sie Mob RDB');
planRange('Emanuel Ivanovic',        'travel',             '2026-09-15', '2026-09-19', 'Enersun IL');
planRange('Emanuel Ivanovic',        'consulting_blocked', '2026-09-22', '2026-09-30', 'Enersun IL');
planRange('Jochen Steindorfer',      'travel',             '2026-09-01', '2026-09-05', 'Rittmeyer');
planRange('Jochen Steindorfer',      'consulting_blocked', '2026-09-08', '2026-09-19', 'Mekorot');
planRange('Jochen Steindorfer',      'travel',             '2026-09-22', '2026-09-30', 'Lusail');
planRange('Markus Trummer',          'consulting_blocked', '2026-09-01', '2026-09-18', 'SABESP');
planRange('Markus Trummer',          'training_blocked',  '2026-09-21', '2026-09-25', 'SICAM SCC');
planRange('Markus Trummer',          'consulting_blocked', '2026-09-28', '2026-09-30', 'Data Center');
planRange('Parameshwaran Raju',      'consulting_blocked', '2026-09-01', '2026-09-30', 'Transco');
planRange('Ahmed Fadl',              'consulting_ordered', '2026-09-01', '2026-09-12', 'Hera');
planRange('Ahmed Fadl',              'travel',             '2026-09-15', '2026-09-19', 'ELTEC');
planRange('Ahmed Fadl',              'consulting_blocked', '2026-09-22', '2026-09-30', 'Cranes');
planRange('Markus Weber',            'consulting_blocked', '2026-09-01', '2026-09-30');
planRange('Andreas Kautek',          'consulting_blocked', '2026-09-01', '2026-09-30');
planRange('Markus Gerstl',           'consulting_blocked', '2026-09-01', '2026-09-30');
planRange('Corinna Rehberger-Gruber','training_ordered',  '2026-09-01', '2026-09-30', 'Trainer org');
planRange('Sofiane Ichira',          'vacation',          '2026-09-28', '2026-09-30');

// ── Oktober 2026 ───────────────────────────────────────────────
planRange('Mousser Kerkeni',         'consulting_blocked', '2026-10-01', '2026-10-31');
planRange('Franz Kopecky',           'consulting_blocked', '2026-10-01', '2026-10-31');
planRange('Emanuel Ivanovic',        'travel',             '2026-10-01', '2026-10-09', 'Enersun IL');
planRange('Emanuel Ivanovic',        'consulting_blocked', '2026-10-12', '2026-10-23', 'Sie Mob RDB');
planRange('Emanuel Ivanovic',        'vacation',          '2026-10-26', '2026-10-31');
planRange('Jochen Steindorfer',      'consulting_blocked', '2026-10-01', '2026-10-16', 'Mekorot');
planRange('Jochen Steindorfer',      'travel',             '2026-10-19', '2026-10-23', 'Lusail');
planRange('Jochen Steindorfer',      'home_office',       '2026-10-26', '2026-10-31');
planRange('Markus Trummer',          'consulting_blocked', '2026-10-01', '2026-10-14', 'SABESP');
planRange('Markus Trummer',          'travel',             '2026-10-15', '2026-10-23', 'Data Center');
planRange('Markus Trummer',          'consulting_blocked', '2026-10-26', '2026-10-31', 'SICAM SCC');
planRange('Parameshwaran Raju',      'travel',             '2026-10-01', '2026-10-09', 'Noida DC1E2');
planRange('Parameshwaran Raju',      'consulting_blocked', '2026-10-12', '2026-10-31', 'Transco');
planRange('Ahmed Fadl',              'consulting_blocked', '2026-10-01', '2026-10-09', 'SPIE');
planRange('Ahmed Fadl',              'consulting_ordered', '2026-10-12', '2026-10-23', 'Buxbaum K');
planRange('Ahmed Fadl',              'travel',             '2026-10-26', '2026-10-30', 'Cranes');
planRange('Sofiane Ichira',          'consulting_blocked', '2026-10-01', '2026-10-31');
planRange('Markus Weber',            'consulting_blocked', '2026-10-01', '2026-10-31');
planRange('Andreas Kautek',          'vacation',          '2026-10-19', '2026-10-23');
planRange('Andreas Kautek',          'consulting_blocked', '2026-10-01', '2026-10-17');
planRange('Andreas Kautek',          'consulting_blocked', '2026-10-26', '2026-10-31');
planRange('Markus Gerstl',           'consulting_blocked', '2026-10-01', '2026-10-31');
planRange('Corinna Rehberger-Gruber','training_ordered',  '2026-10-01', '2026-10-31', 'Trainer org');
planRange('Gernot Dachs',            'training_blocked',  '2026-10-01', '2026-10-31', 'Basis Training');

// ── November 2026 ──────────────────────────────────────────────
planRange('Mousser Kerkeni',         'consulting_blocked', '2026-11-02', '2026-11-30');
planRange('Franz Kopecky',           'vacation',          '2026-11-02', '2026-11-06');
planRange('Franz Kopecky',           'consulting_blocked', '2026-11-09', '2026-11-30');
planRange('Emanuel Ivanovic',        'consulting_blocked', '2026-11-02', '2026-11-20', 'Enersun IL');
planRange('Emanuel Ivanovic',        'no_travel',         '2026-11-23', '2026-11-30');
planRange('Jochen Steindorfer',      'travel',             '2026-11-02', '2026-11-06', 'Rittmeyer');
planRange('Jochen Steindorfer',      'consulting_blocked', '2026-11-09', '2026-11-30', 'Mekorot');
planRange('Markus Trummer',          'consulting_blocked', '2026-11-02', '2026-11-13', 'SABESP');
planRange('Markus Trummer',          'travel',             '2026-11-16', '2026-11-20', 'Data Center');
planRange('Markus Trummer',          'home_office',       '2026-11-23', '2026-11-30');
planRange('Parameshwaran Raju',      'consulting_blocked', '2026-11-02', '2026-11-30', 'Transco');
planRange('Ahmed Fadl',              'consulting_ordered', '2026-11-02', '2026-11-13', 'Hera');
planRange('Ahmed Fadl',              'consulting_blocked', '2026-11-16', '2026-11-30', 'Cranes');
planRange('Sofiane Ichira',          'consulting_blocked', '2026-11-02', '2026-11-30');
planRange('Markus Weber',            'consulting_blocked', '2026-11-02', '2026-11-30');
planRange('Andreas Kautek',          'consulting_blocked', '2026-11-02', '2026-11-30');
planRange('Markus Gerstl',           'home_office',       '2026-11-02', '2026-11-06');
planRange('Markus Gerstl',           'consulting_blocked', '2026-11-09', '2026-11-30');
planRange('Corinna Rehberger-Gruber','training_ordered',  '2026-11-02', '2026-11-30', 'Trainer org');
planRange('Gernot Dachs',            'training_blocked',  '2026-11-02', '2026-11-28', 'Basis Training');

console.log('Seed done:', members.length, 'members,', tasks.length, 'tasks,', absences.length, 'absences, plan_entries added');
