/**
 * placement.js  —  SOAL TES PENEMPATAN ("Temukan levelku")   (kode soal: P-E1, P-M2, P-H3, ...)
 * Dipakai HANYA saat pengguna memilih "Temukan levelku" di onboarding.
 * Soal di sini tidak muncul di latihan biasa.
 *
 * Kelompokkan per tingkat: easy / medium / hard.
 * Disarankan sama banyak tiap tingkat (default 3). Semua berbentuk pilihan ganda 4 opsi
 * supaya tes cepat dan jawabannya mudah dinilai.
 *
 * Penentuan level awal (aturan ada di PASS_RATIO di bawah):
 *   lulus easy saja            -> mulai Mudah
 *   lulus easy + medium        -> mulai Sedang
 *   lulus easy + medium + hard -> mulai Kompleks
 *   tidak lulus easy           -> mulai Mudah
 * "Lulus" = persentase benar di tingkat itu >= PASS_RATIO.
 */
const PASS_RATIO = 2 / 3;

const tiers = {
  easy: [
    { type: 'grammar', question: 'She ______ a teacher.', options: ['is', 'are', 'am', 'be'], answer: 'is' },
    { type: 'vocabulary', question: 'What is the opposite of "hot"?', options: ['Cold', 'Warm', 'Big', 'Red'], answer: 'Cold' },
    { type: 'vocabulary', question: 'Choose the correct plural of "child".', options: ['Childs', 'Childes', 'Children', 'Childrens'], answer: 'Children' },
  ],
  medium: [
    { type: 'grammar', question: 'He ______ in Surabaya since 2019.', options: ['lives', 'lived', 'has lived', 'is living'], answer: 'has lived' },
    { type: 'vocabulary', question: 'What does "give up" mean?', options: ['Stop trying', 'Start again', 'Give a present', 'Wake up'], answer: 'Stop trying' },
    { type: 'grammar', question: 'If I had more time, I ______ learn another language.', options: ['will', 'would', 'can', 'did'], answer: 'would' },
  ],
  hard: [
    { type: 'grammar', question: 'Despite ______ tired, she finished the report.', options: ['be', 'being', 'been', 'to be'], answer: 'being' },
    { type: 'grammar', question: 'The committee insisted that the report ______ submitted by Friday.', options: ['is', 'was', 'be', 'being'], answer: 'be' },
    { type: 'vocabulary', question: 'The word "reluctant" is closest in meaning to ______.', options: ['unwilling', 'eager', 'careless', 'polite'], answer: 'unwilling' },
  ],
};

module.exports = { PASS_RATIO, tiers };
