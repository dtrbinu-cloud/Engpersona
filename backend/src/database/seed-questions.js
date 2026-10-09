/**
 * seed-questions.js — menyinkronkan bank soal (backend/src/questions/*.js) ke database.
 *
 *   npm run questions:seed      -> validasi lalu sinkron ke data/database.sqlite
 *   npm run questions:check     -> hanya validasi + ringkasan jumlah soal (tidak menyentuh database)
 *
 * Aman dijalankan berulang: soal dikenali lewat kolom `code` (mis. E2-03), jadi
 * soal tidak dihapus-lalu-dibuat-ulang dan id soal (dipakai wrong_answers) tetap stabil.
 */
const path = require('path');
const db = require('./db');
const bank = require('../questions');

function printSummary({ errors, warnings, stats }) {
  console.log('\nRingkasan bank soal');
  console.log('───────────────────────────────────────────');
  for (const s of stats) {
    const flag = s.count === 0 ? '✗ KOSONG' : s.count < s.target ? '… kurang' : '✓';
    console.log(`${String(s.level).padEnd(22)} stage ${s.stage}: ${String(s.count).padStart(3)} / ${s.target}  ${flag}`);
  }
  if (warnings.length) { console.log('\nPeringatan:'); warnings.forEach((w) => console.log('  - ' + w)); }
  if (errors.length) { console.log('\nERROR (harus diperbaiki):'); errors.forEach((e) => console.log('  ✗ ' + e)); }
  console.log('');
}

async function seed() {
  const result = bank.validate();
  printSummary(result);
  if (result.errors.length) {
    console.error('Seed dibatalkan: perbaiki error di atas dulu.');
    process.exit(1);
  }

  const dbPath = path.join(__dirname, '..', '..', '..', 'data', 'database.sqlite');
  await db.initDatabase(dbPath);

  if (!db.hasColumn('questions', 'code')) {
    await db.run('ALTER TABLE questions ADD COLUMN code TEXT');
  }
  await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_code ON questions(code)');

  const rows = bank.loadAll();
  const now = new Date().toISOString();
  let inserted = 0; let updated = 0; let adopted = 0;

  for (const q of rows) {
    const params = {
      ':code': q.code, ':question': q.question,
      ':option_a': q.option_a, ':option_b': q.option_b, ':option_c': q.option_c, ':option_d': q.option_d,
      ':answer': q.answer, ':type': q.type, ':difficulty': q.difficulty, ':stage': q.stage, ':now': now,
    };

    let existing = db.get('SELECT id FROM questions WHERE code = :code', { ':code': q.code });
    if (!existing) {
      // soal lama (dari seed versi sebelumnya) yang belum punya kode: "adopsi" supaya tidak dobel
      existing = db.get(
        'SELECT id FROM questions WHERE code IS NULL AND question = :question AND difficulty = :difficulty',
        { ':question': q.question, ':difficulty': q.difficulty },
      );
      if (existing) adopted += 1;
    }

    if (existing) {
      await db.run(
        `UPDATE questions SET code=:code, question=:question, option_a=:option_a, option_b=:option_b,
           option_c=:option_c, option_d=:option_d, answer=:answer, type=:type, difficulty=:difficulty,
           stage=:stage, updated_at=:now WHERE id=${Number(existing.id)}`,
        params,
      );
      updated += 1;
    } else {
      await db.run(
        `INSERT INTO questions (code, question, option_a, option_b, option_c, option_d, answer, type, difficulty, stage, created_at, updated_at)
         VALUES (:code, :question, :option_a, :option_b, :option_c, :option_d, :answer, :type, :difficulty, :stage, :now, :now)`,
        params,
      );
      inserted += 1;
    }
  }

  // Soal yang kodenya sudah tidak ada di file bank (dihapus dari file) ikut dihapus dari database.
  const keep = new Set(rows.map((r) => r.code));
  const stale = db.all('SELECT id, code FROM questions WHERE code IS NOT NULL').filter((r) => !keep.has(r.code));
  for (const row of stale) {
    await db.run('DELETE FROM wrong_answers WHERE question_id = :id', { ':id': Number(row.id) });
    await db.run('DELETE FROM questions WHERE id = :id', { ':id': Number(row.id) });
  }

  const legacy = Number(db.get('SELECT COUNT(*) AS n FROM questions WHERE code IS NULL').n);
  console.log(`✅ Selesai: ${inserted} baru, ${updated} diperbarui (${adopted} soal lama diberi kode), ${stale.length} dihapus.`);
  if (legacy > 0) console.log(`ℹ️  ${legacy} soal lama tanpa kode masih ada di database (bukan dari bank soal). Hapus manual bila tidak dipakai.`);
  process.exit(0);
}

if (process.argv.includes('--check')) {
  const result = bank.validate();
  printSummary(result);
  process.exit(result.errors.length ? 1 : 0);
} else {
  seed().catch((err) => { console.error('❌ Seed gagal:', err); process.exit(1); });
}
