/**
 * levelConfig.js  —  SATU-SATUNYA tempat pengaturan level.
 *
 * Mau tambah stage? Ubah angka `stages`, lalu isi soalnya di file level yang sama.
 * Mau ganti bentuk soal sebuah level? Ubah `format`:
 *   'mcq'  -> pilihan ganda (4 opsi)
 *   'fill' -> isian ketik (tanpa opsi, kalimat memuat ______)
 *
 * Nomor level global (yang dipakai peta dashboard & users.level) dihitung otomatis:
 *   Mudah   : 1 .. stages(easy)
 *   Sedang  : lanjut setelah Mudah
 *   Kompleks: lanjut setelah Sedang
 */
const LEVELS = [
  { key: 'easy',   code: 'E', label: 'Mudah',    stages: 4, format: 'mcq',  minPerStage: 10 },
  { key: 'medium', code: 'M', label: 'Sedang',   stages: 4, format: 'mcq',  minPerStage: 10 },
  { key: 'hard',   code: 'H', label: 'Kompleks', stages: 4, format: 'fill', minPerStage: 10 },
];

const byKey = (key) => LEVELS.find((l) => l.key === key) || null;

/** Level global pertama milik sebuah tingkat. easy -> 1, medium -> 5, hard -> 9 (jika masing-masing 4 stage). */
function startGlobalLevel(key) {
  let n = 1;
  for (const level of LEVELS) {
    if (level.key === key) return n;
    n += level.stages;
  }
  return 1;
}

function totalGlobalLevels() {
  return LEVELS.reduce((sum, l) => sum + l.stages, 0);
}

/** Nomor level global -> { difficulty, stage }. Melebihi batas = stage terakhir level terakhir. */
function fromGlobalLevel(globalLevel) {
  let remaining = Math.max(Number(globalLevel) || 1, 1);
  for (const level of LEVELS) {
    if (remaining <= level.stages) return { difficulty: level.key, stage: remaining };
    remaining -= level.stages;
  }
  const last = LEVELS[LEVELS.length - 1];
  return { difficulty: last.key, stage: last.stages };
}

function toGlobalLevel(difficulty, stage) {
  return startGlobalLevel(difficulty) + Math.max(Number(stage) || 1, 1) - 1;
}

function difficultyLabel(key) {
  const level = byKey(key);
  return level ? level.label : 'Mudah';
}

module.exports = {
  LEVELS, byKey, startGlobalLevel, totalGlobalLevels,
  fromGlobalLevel, toGlobalLevel, difficultyLabel,
};
