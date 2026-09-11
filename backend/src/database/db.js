const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
let database; let databasePath;
function ensure() { if (!database) throw new Error('Database belum diinisialisasi.'); }
async function initDatabase(filePath) {
  databasePath = filePath; const SQL = await initSqlJs();
  database = fs.existsSync(filePath) ? new SQL.Database(await fs.promises.readFile(filePath)) : new SQL.Database();
  database.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT, email TEXT, google_id TEXT, avatar TEXT, xp INTEGER NOT NULL DEFAULT 0, level INTEGER NOT NULL DEFAULT 1, streak INTEGER NOT NULL DEFAULT 0, learning_character TEXT, spotify_playlist_url TEXT, last_login TEXT, created_at TEXT, updated_at TEXT); CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL, option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT, answer TEXT NOT NULL, type TEXT NOT NULL, difficulty TEXT DEFAULT 'easy', stage INTEGER DEFAULT 1, created_at TEXT, updated_at TEXT); CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, score INTEGER NOT NULL, xp INTEGER NOT NULL, grammar_score INTEGER NOT NULL DEFAULT 0, vocabulary_score INTEGER NOT NULL DEFAULT 0, context_score INTEGER NOT NULL DEFAULT 0, character TEXT NOT NULL, total_questions INTEGER DEFAULT 10, date TEXT NOT NULL, created_at TEXT, updated_at TEXT); CREATE TABLE IF NOT EXISTS wrong_answers (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, question_id INTEGER NOT NULL, created_at TEXT, updated_at TEXT, UNIQUE(user_id, question_id)); CREATE TABLE IF NOT EXISTS refresh_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token_hash TEXT UNIQUE NOT NULL, expires_at TEXT NOT NULL, revoked_at TEXT, created_at TEXT NOT NULL);`);
  const users = all('PRAGMA table_info(users)').map((row) => row.name);
  const results = all('PRAGMA table_info(results)').map((row) => row.name);
  if (!users.includes('email')) database.run('ALTER TABLE users ADD COLUMN email TEXT');
  if (!users.includes('google_id')) database.run('ALTER TABLE users ADD COLUMN google_id TEXT');
  if (!results.includes('total_questions')) database.run('ALTER TABLE results ADD COLUMN total_questions INTEGER DEFAULT 10');
  await persist();
}
function all(sql, params = {}) { ensure(); const stmt = database.prepare(sql); stmt.bind(params); const rows=[]; while(stmt.step()) rows.push(stmt.getAsObject()); stmt.free(); return rows; }
function get(sql, params = {}) { return all(sql, params)[0] || null; }
async function persist() { await fs.promises.mkdir(path.dirname(databasePath), { recursive:true }); await fs.promises.writeFile(databasePath, Buffer.from(database.export())); }
async function run(sql, params = {}) { ensure(); database.run(sql, params); const changes = Number(get('SELECT changes() AS count').count); const lastInsertRowid = Number(get('SELECT last_insert_rowid() AS id').id); await persist(); return { changes, lastInsertRowid }; }
function hasColumn(table, column) { return all(`PRAGMA table_info(${table})`).some((item) => item.name === column); }
module.exports = { initDatabase, all, get, run, hasColumn };
