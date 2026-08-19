// Version: 0.1.3 — uses node:sqlite (built-in Node 22, no native build needed)
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/board.db');

let db;

function getDb() {
  if (db) return db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  try { db.exec('ALTER TABLE tasks ADD COLUMN due_date TEXT'); } catch (_) { /* column exists */ }
  return db;
}

module.exports = { getDb };
