// Version: 0.1.5 — uses node:sqlite (built-in Node 22, no native build needed)
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const { seedPartners } = require('./seed-partners');

function resolveDbPath() {
  if (process.env.DB_PATH) {
    if (path.isAbsolute(process.env.DB_PATH)) return process.env.DB_PATH;
    const fromCwd = path.resolve(process.cwd(), process.env.DB_PATH);
    if (fs.existsSync(fromCwd)) return fromCwd;
    const fromModule = path.resolve(__dirname, '../../', process.env.DB_PATH);
    if (fs.existsSync(fromModule)) return fromModule;
    return fromCwd;
  }
  return path.join(__dirname, '../../data/board.db');
}

const DB_PATH = resolveDbPath();

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
  try { seedPartners(db); } catch (_) { /* ignore if already seeded or table exists */ }
  return db;
}

module.exports = { getDb };
