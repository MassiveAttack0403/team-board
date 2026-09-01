// Version: 0.1.0
// Clears Aug-Sep 2026 and re-seeds from whiteboard image
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../data/board.db');
const db = new DatabaseSync(DB_PATH);

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function workdays(fromStr, toStr) {
  const result = [];
  const d = new Date(fromStr);
  const to = new Date(toStr);
  while (d <= to) {
    if (d.getDay() !== 0 && d.getDay() !== 6) result.push(fmt(new Date(d)));
    d.setDate(d.getDate() + 1);
  }
  return result;
}

function block(fromStr, toStr, type, label = '') {
  return workdays(fromStr, toStr).map(date => ({ date, type, label }));
}

const getMember = db.prepare('SELECT id FROM members WHERE name = ?');

function memberId(name) {
  const row = getMember.get(name);
  if (!row) { console.warn(`Member not found: ${name}`); return null; }
  return row.id;
}

db.exec("DELETE FROM plan_entries WHERE date >= '2026-08-01' AND date <= '2026-09-30'");
console.log('Cleared Aug-Sep 2026 plan_entries');

const DATA = {
  'Corinna Rehberger-Gruber': [
    ...block('2026-08-03', '2026-08-31', 'consulting_blocked'),
    ...block('2026-09-01', '2026-09-07', 'consulting_blocked'),
    ...block('2026-09-08', '2026-09-10', 'consulting_blocked', 'PIPE'),
    ...block('2026-09-11', '2026-09-30', 'consulting_blocked'),
  ],
  'Mousser Kerkeni': [
    ...block('2026-08-03', '2026-08-31', 'consulting_blocked'),
    ...block('2026-09-01', '2026-09-07', 'consulting_blocked'),
    { date: '2026-09-08', type: 'consulting_ordered', label: 'CAFC' },
    ...block('2026-09-09', '2026-09-11', 'consulting_blocked', 'PIPE'),
    ...block('2026-09-14', '2026-09-16', 'travel', 'Teamevent'),
    ...block('2026-09-17', '2026-09-30', 'consulting_blocked'),
  ],
  'Franz Kopecky': [
    ...block('2026-08-04', '2026-08-31', 'consulting_blocked'),
    ...block('2026-09-01', '2026-09-12', 'consulting_blocked'),
    { date: '2026-09-14', type: 'travel', label: 'Teamevent' },
    ...block('2026-09-15', '2026-09-18', 'training_ordered', 'CSW Rezertifizierung'),
    ...block('2026-09-21', '2026-09-25', 'training_ordered', 'CSW eng (Web)'),
    ...block('2026-09-28', '2026-09-30', 'consulting_blocked'),
  ],
  'Emanuel Ivanovic': [
    ...block('2026-08-06', '2026-08-31', 'consulting_blocked'),
    ...block('2026-09-01', '2026-09-07', 'consulting_blocked'),
    ...block('2026-09-08', '2026-09-11', 'consulting_blocked', 'PIPE'),
    ...block('2026-09-14', '2026-09-16', 'travel', 'Teamevent'),
    ...block('2026-09-17', '2026-09-30', 'consulting_blocked'),
  ],
  'Jochen Steindorfer': [
    ...block('2026-08-03', '2026-08-11', 'consulting_blocked'),
    ...block('2026-08-17', '2026-08-31', 'consulting_blocked'),
    ...block('2026-09-01', '2026-09-04', 'consulting_blocked'),
    ...block('2026-09-08', '2026-09-11', 'consulting_blocked', 'PIPE'),
    { date: '2026-09-14', type: 'travel', label: 'Teamevent' },
    ...block('2026-09-15', '2026-09-18', 'consulting_ordered', 'Rittmeyer'),
    ...block('2026-09-21', '2026-09-30', 'consulting_blocked'),
  ],
  'Markus Trummer': [
    ...block('2026-08-03', '2026-08-11', 'consulting_blocked'),
    ...block('2026-08-12', '2026-08-14', 'training_blocked'),
    ...block('2026-08-17', '2026-08-31', 'consulting_blocked'),
    ...block('2026-09-01', '2026-09-07', 'consulting_blocked'),
    ...block('2026-09-08', '2026-09-11', 'consulting_blocked', 'PIPE'),
    ...block('2026-09-14', '2026-09-16', 'travel', 'Teamevent'),
    ...block('2026-09-17', '2026-09-30', 'consulting_blocked'),
  ],
  'Parameshwaran Raju': [
    ...block('2026-08-03', '2026-08-14', 'vacation', 'taking care of database issues - vacation Emanuel'),
    ...block('2026-08-17', '2026-08-21', 'home_office', 'Wife in hospital'),
    ...block('2026-09-14', '2026-09-16', 'travel', 'Teamevent'),
  ],
  'Ahmed Fadl': [
    ...block('2026-08-10', '2026-08-14', 'consulting_blocked'),
    ...block('2026-08-17', '2026-08-21', 'consulting_blocked'),
    ...block('2026-08-24', '2026-08-28', 'consulting_blocked'),
    ...block('2026-09-01', '2026-09-07', 'consulting_blocked'),
    ...block('2026-09-08', '2026-09-11', 'consulting_blocked', 'PIPE'),
    ...block('2026-09-14', '2026-09-16', 'travel', 'Teamevent'),
    ...block('2026-09-17', '2026-09-30', 'consulting_blocked'),
  ],
  'Sofiane Ichira': [
    ...block('2026-08-10', '2026-08-14', 'consulting_blocked'),
    ...block('2026-08-24', '2026-08-28', 'consulting_blocked'),
    ...block('2026-09-08', '2026-09-11', 'consulting_blocked', 'PIPE'),
    ...block('2026-09-14', '2026-09-16', 'travel', 'Teamevent'),
    ...block('2026-09-17', '2026-09-30', 'consulting_blocked'),
  ],
  'Markus Gerstl': [
    ...block('2026-09-08', '2026-09-10', 'consulting_blocked', 'PIPE'),
    ...block('2026-09-14', '2026-09-30', 'consulting_blocked'),
  ],
};

const insert = db.prepare(
  'INSERT OR REPLACE INTO plan_entries (member_id, date, type, label) VALUES (?, ?, ?, ?)'
);

let count = 0;
for (const [name, rows] of Object.entries(DATA)) {
  const id = memberId(name);
  if (!id) continue;
  for (const { date, type, label } of rows) {
    insert.run(id, date, type, label || null);
    count++;
  }
}

console.log(`Inserted ${count} plan_entries for Aug-Sep 2026`);
