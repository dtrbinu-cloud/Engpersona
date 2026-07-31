const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let SQL;
let db;
let dbPath;

function ensureInitialized() {
  if (!db) {
    throw new Error('Database is not initialized. Call initDatabase() first.');
  }
}

function normalizeRows(result) {
  if (!result || result.length === 0) {
    return [];
  }

  const first = result[0];
  return first.values.map((row) => {
    const item = {};
    first.columns.forEach((column, index) => {
      item[column] = row[index];
    });
    return item;
  });
}

function exec(sql, params = {}) {
  ensureInitialized();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

async function persist() {
  ensureInitialized();
  const data = db.export();
  await fs.promises.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.promises.writeFile(dbPath, Buffer.from(data));
}

async function initDatabase(filePath) {
  dbPath = filePath;
  SQL = await initSqlJs();

  let fileBuffer = null;
  if (fs.existsSync(filePath)) {
    fileBuffer = await fs.promises.readFile(filePath);
  }

  db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

  await ensureSchema();
}

async function ensureSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      avatar TEXT,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      streak INTEGER NOT NULL DEFAULT 0,
      learning_character TEXT,
      spotify_playlist_url TEXT,
      last_login TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      answer TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT DEFAULT 'easy',
      stage INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      xp INTEGER NOT NULL,
      grammar_score INTEGER NOT NULL DEFAULT 0,
      vocabulary_score INTEGER NOT NULL DEFAULT 0,
      context_score INTEGER NOT NULL DEFAULT 0,
      character TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS wrong_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      created_at TEXT,
      updated_at TEXT,
      UNIQUE(user_id, question_id)
    );
  `);

  const questionColumns = normalizeRows(db.exec('PRAGMA table_info(questions)'));
  if (!questionColumns.some((column) => column.name === 'difficulty')) {
    db.run("ALTER TABLE questions ADD COLUMN difficulty TEXT DEFAULT 'easy'");
  }
  if (!questionColumns.some((column) => column.name === 'stage')) {
    db.run('ALTER TABLE questions ADD COLUMN stage INTEGER DEFAULT 1');
  }

  const userColumns = normalizeRows(db.exec('PRAGMA table_info(users)'));
  if (!userColumns.some((column) => column.name === 'name')) {
    db.run('ALTER TABLE users ADD COLUMN name TEXT');
  }
  if (!userColumns.some((column) => column.name === 'avatar')) {
    db.run('ALTER TABLE users ADD COLUMN avatar TEXT');
  }
  if (!userColumns.some((column) => column.name === 'email')) {
    db.run('ALTER TABLE users ADD COLUMN email TEXT');
  }
  if (!userColumns.some((column) => column.name === 'google_id')) {
    db.run('ALTER TABLE users ADD COLUMN google_id TEXT');
  }

  const resultColumns = normalizeRows(db.exec('PRAGMA table_info(results)'));
  if (!resultColumns.some((column) => column.name === 'total_questions')) {
    db.run('ALTER TABLE results ADD COLUMN total_questions INTEGER DEFAULT 10');
  }

  await persist();
}

function all(sql, params = {}) {
  return exec(sql, params);
}

function get(sql, params = {}) {
  const rows = exec(sql, params);
  return rows[0] || null;
}

async function run(sql, params = {}) {
  ensureInitialized();
  db.run(sql, params);
  const changesRow = get('SELECT changes() AS count');
  const lastIdRow = get('SELECT last_insert_rowid() AS id');
  await persist();

  return {
    changes: changesRow ? Number(changesRow.count) : 0,
    lastInsertRowid: lastIdRow ? Number(lastIdRow.id) : 0,
  };
}

async function transaction(callback) {
  ensureInitialized();
  db.run('BEGIN');
  try {
    const result = await callback();
    db.run('COMMIT');
    await persist();
    return result;
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}

function hasColumn(table, column) {
  const cols = all(`PRAGMA table_info(${table})`);
  return cols.some((item) => item.name === column);
}

module.exports = {
  initDatabase,
  all,
  get,
  run,
  transaction,
  hasColumn,
};
