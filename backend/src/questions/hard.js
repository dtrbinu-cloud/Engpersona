/**
 * hard.js  —  BANK SOAL LEVEL KOMPLEKS   (kode soal: H<stage>-<nomor>, contoh H4-01)
 * Bentuk soal: ISIAN KETIK (tidak ada options; pengguna mengetik jawabannya).
 *
 * ATURAN PENTING UNTUK SOAL ISIAN
 *  - Kalimat WAJIB memuat ______ (tempat jawaban).
 *  - `answer` hanya SATU jawaban, dibandingkan tanpa peduli huruf besar/kecil dan spasi di tepi.
 *    Jadi pilih soal yang jawabannya satu kata / frasa pendek & tidak ambigu
 *    (hindari soal yang punya dua jawaban benar, mis. "close" vs "shut").
 *  - Jangan pakai `options` di file ini.
 *
 * Saran isi per stage (bebas diganti):
 *   Stage 1 = subjunctive & wish | Stage 2 = phrasal verb lanjut
 *   Stage 3 = vocabulary akademik | Stage 4 = inversion & struktur formal
 *
 * Setelah mengisi:  npm run questions:check   lalu   npm run questions:seed
 * Soal di bawah ini hanya CONTOH. Ganti / tambah sesukamu.
 */
module.exports = {
  // ═════════════ STAGE 1 — Subjunctive & wish ═════════════
  1: [
    { type: 'grammar', question: 'If I ______ you, I would apologize to her.', answer: 'were' },
    { type: 'grammar', question: 'I wish I ______ speak French fluently.', answer: 'could' },
    // ← tambah soal Stage 1 di sini
  ],

  // ═════════════ STAGE 2 — Phrasal verb lanjut ═════════════
  2: [
    { type: 'vocabulary', question: 'Despite the heavy rain, the match went ______ as planned.', answer: 'ahead' },
    { type: 'vocabulary', question: 'The manager asked us to come ______ with a better idea.', answer: 'up' },
    // ← tambah soal Stage 2 di sini
  ],

  // ═════════════ STAGE 3 — Vocabulary akademik ═════════════
  3: [
    { type: 'context', question: 'The opposite of "temporary" is ______.', answer: 'permanent' },
    { type: 'context', question: 'A person who writes books is called an ______.', answer: 'author' },
    // ← tambah soal Stage 3 di sini
  ],

  // ═════════════ STAGE 4 — Inversion & struktur formal ═════════════
  4: [
    { type: 'grammar', question: 'Not only ______ she sing well, but she also dances beautifully.', answer: 'does' },
    { type: 'grammar', question: 'No sooner had he arrived ______ the rain started.', answer: 'than' },
    // ← tambah soal Stage 4 di sini
  ],
};
