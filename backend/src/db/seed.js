// Version: 0.1.0 — Seed: Mitarbeiter + Tasks + Abwesenheiten vom Whiteboard (Stand 2026-08-18)
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

console.log('Seed done:', members.length, 'members,', tasks.length, 'tasks,', absences.length, 'absences');
