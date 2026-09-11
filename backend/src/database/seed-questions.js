/**
 * seed-questions.js
 * Run: node src/seed-questions.js
 * Populates the questions table with 45 English practice questions
 * distributed across 4 exercise stages (Latihan 1-4) at easy difficulty.
 */

const path = require('path');
const db = require('./lib/db');

// ── Question bank ──────────────────────────────────────────────────────────────
// type: 'grammar'    → Bagian I – Fill in the Blank (question contains ______)
// type: 'vocabulary' → Bagian II – Multiple Choice (pure MCQ, no blank required)
//
// Distribution:
//   stage 1 : 5 grammar + 5 vocabulary = 10 questions
//   stage 2 : 5 grammar + 5 vocabulary = 10 questions
//   stage 3 : 5 grammar + 5 vocabulary = 10 questions
//   stage 4 : 5 grammar + 10 vocabulary = 15 questions

const questions = [
  // ──────────────────────────── STAGE 1 ────────────────────────────
  // Bagian I – stage 1 (Q1-5)
  {
    stage: 1, type: 'grammar',
    question: 'Good morning! My name ______ Rina.',
    option_a: 'is', option_b: 'am', option_c: 'are', option_d: 'be',
    answer: 'is',
  },
  {
    stage: 1, type: 'grammar',
    question: 'There ______ twenty students in my class.',
    option_a: 'is', option_b: 'am', option_c: 'are', option_d: 'was',
    answer: 'are',
  },
  {
    stage: 1, type: 'grammar',
    question: 'She ______ to school every day by bicycle.',
    option_a: 'go', option_b: 'goes', option_c: 'going', option_d: 'gone',
    answer: 'goes',
  },
  {
    stage: 1, type: 'grammar',
    question: 'I ______ a student at SMK Negeri 1.',
    option_a: 'am', option_b: 'is', option_c: 'are', option_d: 'be',
    answer: 'am',
  },
  {
    stage: 1, type: 'grammar',
    question: 'They ______ playing football now.',
    option_a: 'is', option_b: 'am', option_c: 'are', option_d: 'was',
    answer: 'are',
  },

  // Bagian II – stage 1 (Q21-25)
  {
    stage: 1, type: 'vocabulary',
    question: 'What is the synonym of "happy"?',
    option_a: 'Sad', option_b: 'Glad', option_c: 'Angry', option_d: 'Tired',
    answer: 'Glad',
  },
  {
    stage: 1, type: 'vocabulary',
    question: 'Choose the correct greeting for the evening.',
    option_a: 'Good morning', option_b: 'Good afternoon', option_c: 'Good evening', option_d: 'Good night',
    answer: 'Good evening',
  },
  {
    stage: 1, type: 'vocabulary',
    question: '"Ibu kota provinsi Jawa Timur adalah ______." In English, "ibu kota" means:',
    option_a: 'Village', option_b: 'Capital city', option_c: 'Island', option_d: 'Province',
    answer: 'Capital city',
  },
  {
    stage: 1, type: 'vocabulary',
    question: 'Which word is a profession?',
    option_a: 'Kitchen', option_b: 'Mechanic', option_c: 'Umbrella', option_d: 'Monday',
    answer: 'Mechanic',
  },
  {
    stage: 1, type: 'vocabulary',
    question: 'Choose the correct plural form of "child".',
    option_a: 'Childs', option_b: 'Childes', option_c: 'Children', option_d: 'Childrens',
    answer: 'Children',
  },

  // ──────────────────────────── STAGE 2 ────────────────────────────
  // Bagian I – stage 2 (Q6-10)
  {
    stage: 2, type: 'grammar',
    question: 'My father ______ a teacher.',
    option_a: 'am', option_b: 'is', option_c: 'are', option_d: 'be',
    answer: 'is',
  },
  {
    stage: 2, type: 'grammar',
    question: 'We ______ our homework together yesterday.',
    option_a: 'do', option_b: 'does', option_c: 'did', option_d: 'doing',
    answer: 'did',
  },
  {
    stage: 2, type: 'grammar',
    question: 'This is my book. ______ book is on the table.',
    option_a: 'My', option_b: 'Me', option_c: 'I', option_d: 'Mine',
    answer: 'My',
  },
  {
    stage: 2, type: 'grammar',
    question: 'Look! The dog ______ in the garden.',
    option_a: 'run', option_b: 'runs', option_c: 'is running', option_d: 'ran',
    answer: 'is running',
  },
  {
    stage: 2, type: 'grammar',
    question: 'It is ten ______ nine in the morning.',
    option_a: 'past', option_b: 'to', option_c: 'on', option_d: 'at',
    answer: 'past',
  },

  // Bagian II – stage 2 (Q26-30)
  {
    stage: 2, type: 'vocabulary',
    question: 'What is the antonym of "expensive"?',
    option_a: 'Cheap', option_b: 'Costly', option_c: 'Rich', option_d: 'Heavy',
    answer: 'Cheap',
  },
  {
    stage: 2, type: 'vocabulary',
    question: 'Rina: "______ is your favorite subject?" Budi: "English."',
    option_a: 'Who', option_b: 'What', option_c: 'When', option_d: 'Where',
    answer: 'What',
  },
  {
    stage: 2, type: 'vocabulary',
    question: 'Choose the correct sentence.',
    option_a: 'She don\'t like milk.', option_b: 'She doesn\'t likes milk.', option_c: 'She doesn\'t like milk.', option_d: 'She not like milk.',
    answer: 'She doesn\'t like milk.',
  },
  {
    stage: 2, type: 'vocabulary',
    question: 'Which one is a workshop tool?',
    option_a: 'Screwdriver', option_b: 'Textbook', option_c: 'Umbrella', option_d: 'Envelope',
    answer: 'Screwdriver',
  },
  {
    stage: 2, type: 'vocabulary',
    question: '"I am sorry for being late." This expression shows:',
    option_a: 'Gratitude', option_b: 'Apology', option_c: 'Request', option_d: 'Invitation',
    answer: 'Apology',
  },

  // ──────────────────────────── STAGE 3 ────────────────────────────
  // Bagian I – stage 3 (Q11-15)
  {
    stage: 3, type: 'grammar',
    question: 'Can you tell me the ______ station, please?',
    option_a: 'way to', option_b: 'way for', option_c: 'way at', option_d: 'way in',
    answer: 'way to',
  },
  {
    stage: 3, type: 'grammar',
    question: 'There ______ a pen and two books on the desk.',
    option_a: 'is', option_b: 'are', option_c: 'was', option_d: 'were',
    answer: 'is',
  },
  {
    stage: 3, type: 'grammar',
    question: 'My sister is ______ than me.',
    option_a: 'tall', option_b: 'taller', option_c: 'tallest', option_d: 'more tall',
    answer: 'taller',
  },
  {
    stage: 3, type: 'grammar',
    question: 'Please turn ______ the lights before you leave.',
    option_a: 'off', option_b: 'on', option_c: 'up', option_d: 'in',
    answer: 'off',
  },
  {
    stage: 3, type: 'grammar',
    question: 'He usually ______ breakfast at 6 a.m.',
    option_a: 'have', option_b: 'has', option_c: 'having', option_d: 'had',
    answer: 'has',
  },

  // Bagian II – stage 3 (Q31-35)
  {
    stage: 3, type: 'vocabulary',
    question: 'Choose the correct question tag: "You are a student, ______?"',
    option_a: 'isn\'t it', option_b: 'aren\'t you', option_c: 'don\'t you', option_d: 'do you',
    answer: 'aren\'t you',
  },
  {
    stage: 3, type: 'vocabulary',
    question: '"Please switch off the machine after use." This sentence is a form of:',
    option_a: 'Suggestion', option_b: 'Command/Instruction', option_c: 'Question', option_d: 'Compliment',
    answer: 'Command/Instruction',
  },
  {
    stage: 3, type: 'vocabulary',
    question: 'Choose the correct preposition: "The book is ______ the table."',
    option_a: 'on', option_b: 'in', option_c: 'at', option_d: 'to',
    answer: 'on',
  },
  {
    stage: 3, type: 'vocabulary',
    question: 'What does "procedure text" mean in Indonesian?',
    option_a: 'Teks deskripsi', option_b: 'Teks prosedur', option_c: 'Teks naratif', option_d: 'Teks berita',
    answer: 'Teks prosedur',
  },
  {
    stage: 3, type: 'vocabulary',
    question: 'Choose the correct past tense of "buy".',
    option_a: 'Buyed', option_b: 'Bought', option_c: 'Buying', option_d: 'Buys',
    answer: 'Bought',
  },

  // ──────────────────────────── STAGE 4 ────────────────────────────
  // Bagian I – stage 4 (Q16-20)
  {
    stage: 4, type: 'grammar',
    question: 'The library is ______ the school and the canteen.',
    option_a: 'between', option_b: 'among', option_c: 'under', option_d: 'behind',
    answer: 'between',
  },
  {
    stage: 4, type: 'grammar',
    question: 'I have ______ apple in my bag.',
    option_a: 'a', option_b: 'an', option_c: 'the', option_d: 'some',
    answer: 'an',
  },
  {
    stage: 4, type: 'grammar',
    question: 'Yesterday, we ______ to Malang for a school trip.',
    option_a: 'go', option_b: 'goes', option_c: 'went', option_d: 'going',
    answer: 'went',
  },
  {
    stage: 4, type: 'grammar',
    question: '______ you like tea or coffee?',
    option_a: 'Do', option_b: 'Does', option_c: 'Did', option_d: 'Are',
    answer: 'Do',
  },
  {
    stage: 4, type: 'grammar',
    question: 'This machine is used ______ cutting wood.',
    option_a: 'for', option_b: 'to', option_c: 'on', option_d: 'at',
    answer: 'for',
  },

  // Bagian II – stage 4 (Q36-45)
  {
    stage: 4, type: 'vocabulary',
    question: 'Which sentence expresses an offer?',
    option_a: 'Would you like some coffee?', option_b: 'I went to school.', option_c: 'Close the door!', option_d: 'What time is it?',
    answer: 'Would you like some coffee?',
  },
  {
    stage: 4, type: 'vocabulary',
    question: 'The opposite of "difficult" is ______.',
    option_a: 'Hard', option_b: 'Easy', option_c: 'Complex', option_d: 'Boring',
    answer: 'Easy',
  },
  {
    stage: 4, type: 'vocabulary',
    question: 'Choose the correct sentence for asking permission.',
    option_a: 'May I go to the toilet?', option_b: 'I go to the toilet.', option_c: 'Go to the toilet!', option_d: 'Toilet is there.',
    answer: 'May I go to the toilet?',
  },
  {
    stage: 4, type: 'vocabulary',
    question: '"Congratulations on your graduation!" is an expression of ______.',
    option_a: 'Sympathy', option_b: 'Congratulation', option_c: 'Complaint', option_d: 'Warning',
    answer: 'Congratulation',
  },
  {
    stage: 4, type: 'vocabulary',
    question: 'Which word refers to a workplace document?',
    option_a: 'Invoice', option_b: 'Umbrella', option_c: 'Sandwich', option_d: 'Bicycle',
    answer: 'Invoice',
  },
  {
    stage: 4, type: 'vocabulary',
    question: 'Choose the correct comparative form: "This laptop is ______ than that one."',
    option_a: 'good', option_b: 'gooder', option_c: 'better', option_d: 'best',
    answer: 'better',
  },
  {
    stage: 4, type: 'vocabulary',
    question: '"How often do you check your email?" asks about ______.',
    option_a: 'Time', option_b: 'Frequency', option_c: 'Place', option_d: 'Reason',
    answer: 'Frequency',
  },
  {
    stage: 4, type: 'vocabulary',
    question: 'Which of the following is a safety instruction?',
    option_a: 'Wear your helmet before riding.', option_b: 'I like riding a motorcycle.', option_c: 'The motorcycle is red.', option_d: 'He bought a motorcycle.',
    answer: 'Wear your helmet before riding.',
  },
  {
    stage: 4, type: 'vocabulary',
    question: 'Choose the correct sentence in the passive voice.',
    option_a: 'The teacher checks the exam.', option_b: 'The exam is checked by the teacher.', option_c: 'The teacher checked exam.', option_d: 'Exam checks the teacher.',
    answer: 'The exam is checked by the teacher.',
  },
  {
    stage: 4, type: 'vocabulary',
    question: '"I would like to apply for the internship position." This sentence is commonly used in ______.',
    option_a: 'A love letter', option_b: 'A job application letter', option_c: 'A shopping list', option_d: 'A weather report',
    answer: 'A job application letter',
  },
];

// ── Seed runner ─────────────────────────────────────────────────────────────
async function seed() {
  const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
  await db.initDatabase(dbPath);

  console.log('Clearing existing questions...');
  await db.run('DELETE FROM questions');

  const now = new Date().toISOString();
  let inserted = 0;

  for (const q of questions) {
    await db.run(
      `INSERT INTO questions
        (question, option_a, option_b, option_c, option_d, answer, type, difficulty, stage, created_at, updated_at)
       VALUES
        (:question, :option_a, :option_b, :option_c, :option_d, :answer, :type, :difficulty, :stage, :created_at, :updated_at)`,
      {
        ':question':   q.question,
        ':option_a':   q.option_a,
        ':option_b':   q.option_b,
        ':option_c':   q.option_c,
        ':option_d':   q.option_d,
        ':answer':     q.answer,
        ':type':       q.type,
        ':difficulty': 'easy',
        ':stage':      q.stage,
        ':created_at': now,
        ':updated_at': now,
      },
    );
    inserted++;
    console.log(`  [${inserted}] stage=${q.stage} type=${q.type}: ${q.question.slice(0, 60)}...`);
  }

  console.log(`\n✅ Done! Inserted ${inserted} questions across 4 stages.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
