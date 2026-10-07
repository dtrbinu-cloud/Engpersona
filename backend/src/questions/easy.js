/**
 * easy.js  —  BANK SOAL LEVEL MUDAH   (kode soal: E<stage>-<nomor>, contoh E2-03)
 * Bentuk soal: PILIHAN GANDA (4 opsi).
 *
 * CARA MENGISI
 *  1. Cari stage-nya (1, 2, 3, ...) lalu tambah satu blok { ... } di DALAM list stage itu.
 *  2. Tambah soal baru di PALING BAWAH list supaya kode soal lama tidak bergeser.
 *  3. Field:
 *       type     : 'grammar' | 'vocabulary' | 'context'   (dipakai untuk menentukan "karakter belajar")
 *       question : teks soal. Boleh memuat ______ untuk kalimat rumpang.
 *       options  : TEPAT 4 pilihan.
 *       answer   : harus sama persis dengan salah satu isi options.
 *  4. Setelah selesai:  npm run questions:check   lalu   npm run questions:seed
 */
module.exports = {
  // ═════════════ STAGE 1 ═════════════
  1: [
    { type: 'grammar', question: "Good morning! My name ______ Rina.", options: ["is","am","are","be"], answer: "is" },
    { type: 'grammar', question: "There ______ twenty students in my class.", options: ["is","am","are","was"], answer: "are" },
    { type: 'grammar', question: "She ______ to school every day by bicycle.", options: ["go","goes","going","gone"], answer: "goes" },
    { type: 'grammar', question: "I ______ a student at SMK Negeri 1.", options: ["am","is","are","be"], answer: "am" },
    { type: 'grammar', question: "They ______ playing football now.", options: ["is","am","are","was"], answer: "are" },
    { type: 'vocabulary', question: "What is the synonym of \"happy\"?", options: ["Sad","Glad","Angry","Tired"], answer: "Glad" },
    { type: 'vocabulary', question: "Choose the correct greeting for the evening.", options: ["Good morning","Good afternoon","Good evening","Good night"], answer: "Good evening" },
    { type: 'vocabulary', question: "\"Ibu kota provinsi Jawa Timur adalah ______.\" In English, \"ibu kota\" means:", options: ["Village","Capital city","Island","Province"], answer: "Capital city" },
    { type: 'vocabulary', question: "Which word is a profession?", options: ["Kitchen","Mechanic","Umbrella","Monday"], answer: "Mechanic" },
    { type: 'vocabulary', question: "Choose the correct plural form of \"child\".", options: ["Childs","Childes","Children","Childrens"], answer: "Children" },
  ],

  // ═════════════ STAGE 2 ═════════════
  2: [
    { type: 'grammar', question: "My father ______ a teacher.", options: ["am","is","are","be"], answer: "is" },
    { type: 'grammar', question: "We ______ our homework together yesterday.", options: ["do","does","did","doing"], answer: "did" },
    { type: 'grammar', question: "This is my book. ______ book is on the table.", options: ["My","Me","I","Mine"], answer: "My" },
    { type: 'grammar', question: "Look! The dog ______ in the garden.", options: ["run","runs","is running","ran"], answer: "is running" },
    { type: 'grammar', question: "It is ten ______ nine in the morning.", options: ["past","to","on","at"], answer: "past" },
    { type: 'vocabulary', question: "What is the antonym of \"expensive\"?", options: ["Cheap","Costly","Rich","Heavy"], answer: "Cheap" },
    { type: 'vocabulary', question: "Rina: \"______ is your favorite subject?\" Budi: \"English.\"", options: ["Who","What","When","Where"], answer: "What" },
    { type: 'vocabulary', question: "Choose the correct sentence.", options: ["She don't like milk.","She doesn't likes milk.","She doesn't like milk.","She not like milk."], answer: "She doesn't like milk." },
    { type: 'vocabulary', question: "Which one is a workshop tool?", options: ["Screwdriver","Textbook","Umbrella","Envelope"], answer: "Screwdriver" },
    { type: 'vocabulary', question: "\"I am sorry for being late.\" This expression shows:", options: ["Gratitude","Apology","Request","Invitation"], answer: "Apology" },
  ],

  // ═════════════ STAGE 3 ═════════════
  3: [
    { type: 'grammar', question: "Can you tell me the ______ station, please?", options: ["way to","way for","way at","way in"], answer: "way to" },
    { type: 'grammar', question: "There ______ a pen and two books on the desk.", options: ["is","are","was","were"], answer: "is" },
    { type: 'grammar', question: "My sister is ______ than me.", options: ["tall","taller","tallest","more tall"], answer: "taller" },
    { type: 'grammar', question: "Please turn ______ the lights before you leave.", options: ["off","on","up","in"], answer: "off" },
    { type: 'grammar', question: "He usually ______ breakfast at 6 a.m.", options: ["have","has","having","had"], answer: "has" },
    { type: 'vocabulary', question: "Choose the correct question tag: \"You are a student, ______?\"", options: ["isn't it","aren't you","don't you","do you"], answer: "aren't you" },
    { type: 'vocabulary', question: "\"Please switch off the machine after use.\" This sentence is a form of:", options: ["Suggestion","Command/Instruction","Question","Compliment"], answer: "Command/Instruction" },
    { type: 'vocabulary', question: "Choose the correct preposition: \"The book is ______ the table.\"", options: ["on","in","at","to"], answer: "on" },
    { type: 'vocabulary', question: "What does \"procedure text\" mean in Indonesian?", options: ["Teks deskripsi","Teks prosedur","Teks naratif","Teks berita"], answer: "Teks prosedur" },
    { type: 'vocabulary', question: "Choose the correct past tense of \"buy\".", options: ["Buyed","Bought","Buying","Buys"], answer: "Bought" },
  ],

  // ═════════════ STAGE 4 ═════════════
  4: [
    { type: 'grammar', question: "The library is ______ the school and the canteen.", options: ["between","among","under","behind"], answer: "between" },
    { type: 'grammar', question: "I have ______ apple in my bag.", options: ["a","an","the","some"], answer: "an" },
    { type: 'grammar', question: "Yesterday, we ______ to Malang for a school trip.", options: ["go","goes","went","going"], answer: "went" },
    { type: 'grammar', question: "______ you like tea or coffee?", options: ["Do","Does","Did","Are"], answer: "Do" },
    { type: 'grammar', question: "This machine is used ______ cutting wood.", options: ["for","to","on","at"], answer: "for" },
    { type: 'vocabulary', question: "Which sentence expresses an offer?", options: ["Would you like some coffee?","I went to school.","Close the door!","What time is it?"], answer: "Would you like some coffee?" },
    { type: 'vocabulary', question: "The opposite of \"difficult\" is ______.", options: ["Hard","Easy","Complex","Boring"], answer: "Easy" },
    { type: 'vocabulary', question: "Choose the correct sentence for asking permission.", options: ["May I go to the toilet?","I go to the toilet.","Go to the toilet!","Toilet is there."], answer: "May I go to the toilet?" },
    { type: 'vocabulary', question: "\"Congratulations on your graduation!\" is an expression of ______.", options: ["Sympathy","Congratulation","Complaint","Warning"], answer: "Congratulation" },
    { type: 'vocabulary', question: "Which word refers to a workplace document?", options: ["Invoice","Umbrella","Sandwich","Bicycle"], answer: "Invoice" },
    { type: 'vocabulary', question: "Choose the correct comparative form: \"This laptop is ______ than that one.\"", options: ["good","gooder","better","best"], answer: "better" },
    { type: 'vocabulary', question: "\"How often do you check your email?\" asks about ______.", options: ["Time","Frequency","Place","Reason"], answer: "Frequency" },
    { type: 'vocabulary', question: "Which of the following is a safety instruction?", options: ["Wear your helmet before riding.","I like riding a motorcycle.","The motorcycle is red.","He bought a motorcycle."], answer: "Wear your helmet before riding." },
    { type: 'vocabulary', question: "Choose the correct sentence in the passive voice.", options: ["The teacher checks the exam.","The exam is checked by the teacher.","The teacher checked exam.","Exam checks the teacher."], answer: "The exam is checked by the teacher." },
    { type: 'vocabulary', question: "\"I would like to apply for the internship position.\" This sentence is commonly used in ______.", options: ["A love letter","A job application letter","A shopping list","A weather report"], answer: "A job application letter" },
  ],

};
