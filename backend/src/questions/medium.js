/**
 * medium.js  —  BANK SOAL LEVEL SEDANG   (kode soal: M<stage>-<nomor>, contoh M3-02)
 * Bentuk soal: PILIHAN GANDA (4 opsi).
 *
 * Saran isi per stage (bebas diganti):
 *   Stage 1 = tenses dasar   | Stage 2 = vocabulary & phrasal verb
 *   Stage 3 = conditional & percakapan | Stage 4 = passive voice & reported speech
 *
 * CARA MENGISI
 *  1. Tambah satu blok { ... } di DALAM list stage yang dituju.
 *  2. Tambah di PALING BAWAH list supaya kode soal lama tidak bergeser.
 *  3. Field:
 *       type     : 'grammar' | 'vocabulary' | 'context'
 *       question : teks soal (boleh memuat ______)
 *       options  : TEPAT 4 pilihan
 *       answer   : harus sama persis dengan salah satu isi options
 *  4. Cek & masukkan ke database:  npm run questions:check   lalu   npm run questions:seed
 *
 * Soal di bawah ini hanya CONTOH agar tiap stage tidak kosong. Ganti / tambah sesukamu.
 */
module.exports = {
  // ═════════════ STAGE 1 — Tenses dasar ═════════════
  1: [
    { type: 'grammar', question: 'I ______ my homework before dinner yesterday.', options: ['finish', 'finished', 'finishing', 'finishes'], answer: 'finished' },
    { type: 'grammar', question: 'She has lived in Malang ______ 2015.', options: ['since', 'for', 'during', 'ago'], answer: 'since' },
    // ← tambah soal Stage 1 di sini
  ],

  // ═════════════ STAGE 2 — Vocabulary & phrasal verb ═════════════
  2: [
    { type: 'vocabulary', question: 'What does the phrasal verb "give up" mean?', options: ['Stop trying', 'Start again', 'Give a present', 'Wake up'], answer: 'Stop trying' },
    { type: 'vocabulary', question: 'Choose the antonym of "ancient".', options: ['Old', 'Modern', 'Huge', 'Silent'], answer: 'Modern' },
    // ← tambah soal Stage 2 di sini
  ],

  // ═════════════ STAGE 3 — Conditional & percakapan ═════════════
  3: [
    { type: 'grammar', question: 'If it rains tomorrow, we ______ the picnic.', options: ['cancel', 'will cancel', 'would cancel', 'cancelled'], answer: 'will cancel' },
    { type: 'context', question: 'Dina: "Could you lend me your pen?" Rani: "______"', options: ['Sure, here you are.', 'Yes, I am a pen.', 'No, it is Monday.', 'I like lending.'], answer: 'Sure, here you are.' },
    // ← tambah soal Stage 3 di sini
  ],

  // ═════════════ STAGE 4 — Passive voice & reported speech ═════════════
  4: [
    { type: 'grammar', question: 'The letter ______ by the secretary yesterday.', options: ['wrote', 'was written', 'is writing', 'has write'], answer: 'was written' },
    { type: 'grammar', question: 'He said, "I am tired." → He said that he ______ tired.', options: ['is', 'was', 'were', 'has been'], answer: 'was' },
    // ← tambah soal Stage 4 di sini
  ],
};
