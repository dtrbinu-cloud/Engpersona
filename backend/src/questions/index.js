/**
 * index.js — memuat semua bank soal, memvalidasi, dan menyiapkan baris untuk database.
 * Tidak perlu diubah saat menambah soal; cukup edit easy.js / medium.js / hard.js / placement.js.
 */
const config = require('./levelConfig');
const placement = require('./placement');

const FILES = { easy: './easy', medium: './medium', hard: './hard' };
const TYPES = ['grammar', 'vocabulary', 'context'];
const pad = (n) => String(n).padStart(2, '0');

function toRow({ code, difficulty, stage, item }) {
  const [a, b, c, d] = item.options || [];
  return {
    code,
    difficulty,
    stage,
    type: item.type,
    question: item.question,
    option_a: a ?? null,
    option_b: b ?? null,
    option_c: c ?? null,
    option_d: d ?? null,
    answer: item.answer,
    _options: item.options,
  };
}

/** Semua soal level biasa + soal placement, sebagai baris siap-masuk-DB. */
function loadAll() {
  const rows = [];

  for (const level of config.LEVELS) {
    const bank = require(FILES[level.key]);
    for (const stageKey of Object.keys(bank)) {
      const stage = Number(stageKey);
      (bank[stageKey] || []).forEach((item, index) => {
        rows.push(toRow({ code: `${level.code}${stage}-${pad(index + 1)}`, difficulty: level.key, stage, item }));
      });
    }
  }

  placement.tiers && Object.keys(placement.tiers).forEach((tier) => {
    const stage = config.LEVELS.findIndex((l) => l.key === tier) + 1; // easy=1, medium=2, hard=3
    const letter = (config.byKey(tier) || {}).code || '?';
    placement.tiers[tier].forEach((item, index) => {
      rows.push(toRow({ code: `P-${letter}${index + 1}`, difficulty: 'placement', stage, item }));
    });
  });

  return rows;
}

/** Cek semua soal. Mengembalikan { errors, warnings, stats }. */
function validate(rows = loadAll()) {
  const errors = [];
  const warnings = [];
  const seenCodes = new Set();
  const seenText = new Map();

  for (const row of rows) {
    const where = row.code;
    const isPlacement = row.difficulty === 'placement';
    const level = isPlacement ? null : config.byKey(row.difficulty);
    const opts = row._options;

    if (seenCodes.has(row.code)) errors.push(`${where}: kode ganda`);
    seenCodes.add(row.code);

    if (!TYPES.includes(row.type)) errors.push(`${where}: type "${row.type}" tidak valid (pilih: ${TYPES.join(', ')})`);
    if (!row.question || !String(row.question).trim()) errors.push(`${where}: question kosong`);
    if (!row.answer || !String(row.answer).trim()) errors.push(`${where}: answer kosong`);

    if (level && (row.stage < 1 || row.stage > level.stages)) {
      errors.push(`${where}: stage ${row.stage} di luar batas (level ${level.label} hanya punya ${level.stages} stage — ubah di levelConfig.js)`);
    }

    const wantFormat = isPlacement ? 'mcq' : level && level.format;
    if (wantFormat === 'mcq') {
      if (!Array.isArray(opts) || opts.length !== 4) {
        errors.push(`${where}: soal pilihan ganda harus punya TEPAT 4 options`);
      } else {
        if (new Set(opts.map((o) => String(o).trim().toLowerCase())).size !== 4) errors.push(`${where}: ada options yang kembar`);
        if (!opts.includes(row.answer)) errors.push(`${where}: answer "${row.answer}" tidak ada di options (harus sama persis)`);
      }
    } else if (wantFormat === 'fill') {
      if (opts) errors.push(`${where}: level ${level.label} berbentuk isian — hapus options`);
      if (!String(row.question).includes('______')) errors.push(`${where}: soal isian wajib memuat ______`);
      if (/\s{2,}/.test(String(row.answer)) || /[,/;]/.test(String(row.answer))) warnings.push(`${where}: answer berisi lebih dari satu jawaban? Hanya satu jawaban yang dinilai benar`);
    }

    const key = `${row.difficulty}|${String(row.question).trim().toLowerCase()}`;
    if (seenText.has(key)) warnings.push(`${where}: teks soal sama dengan ${seenText.get(key)}`);
    else seenText.set(key, where);
  }

  // Statistik & stage kosong / kurang
  const stats = [];
  for (const level of config.LEVELS) {
    for (let stage = 1; stage <= level.stages; stage += 1) {
      const count = rows.filter((r) => r.difficulty === level.key && r.stage === stage).length;
      stats.push({ level: level.label, difficulty: level.key, stage, count, target: level.minPerStage });
      if (count === 0) errors.push(`${level.label} stage ${stage}: BELUM ADA soal (pengguna akan tertahan di stage ini)`);
      else if (count < level.minPerStage) warnings.push(`${level.label} stage ${stage}: baru ${count} soal (target ${level.minPerStage})`);
    }
  }
  for (const level of config.LEVELS) {
    const count = rows.filter((r) => r.difficulty === 'placement' && r.stage === config.LEVELS.indexOf(level) + 1).length;
    stats.push({ level: `Placement ${level.label}`, difficulty: 'placement', stage: config.LEVELS.indexOf(level) + 1, count, target: 3 });
    if (count === 0) errors.push(`Placement ${level.label}: belum ada soal tes penempatan`);
  }

  return { errors, warnings, stats };
}

/**
 * Tentukan level awal dari hasil tes penempatan.
 * @param {{easy:number, medium:number, hard:number}} correct  jumlah benar per tingkat
 * @returns {{difficulty:string, globalLevel:number}}
 */
function placementDecision(correct = {}) {
  let chosen = 'easy';
  for (const level of config.LEVELS) {
    const total = (placement.tiers[level.key] || []).length;
    if (total === 0) break;
    const ratio = Number(correct[level.key] || 0) / total;
    if (ratio >= placement.PASS_RATIO) chosen = level.key;
    else break;
  }
  return { difficulty: chosen, globalLevel: config.startGlobalLevel(chosen) };
}

module.exports = { loadAll, validate, placementDecision, config };
