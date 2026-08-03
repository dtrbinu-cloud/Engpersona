const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');

const db = require('./lib/db');
const { requireAuth, requireGuest } = require('./middleware/auth');

const app = express();

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();
const PORT = process.env.PORT || 3000;

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function nowIso() {
  return new Date().toISOString();
}

function googleOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`,
  };
}

function hasGoogleOAuthConfig() {
  const config = googleOAuthConfig();
  return Boolean(config.clientId && config.clientSecret && config.callbackUrl);
}

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const { body: requestBody, ...requestOptions } = options;

    const req = https.request(url, requestOptions, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = body ? JSON.parse(body) : {};
        } catch (error) {
          return reject(new Error(`Google response tidak valid: ${body.slice(0, 200)}`));
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const errMsg = parsed.error_description || parsed.error || `HTTP ${res.statusCode}`;
          return reject(new Error(`Request Google gagal: ${errMsg}`));
        }

        return resolve(parsed);
      });
    });

    req.on('error', reject);

    if (requestBody) {
      req.write(requestBody);
    }

    req.end();
  });
}

async function exchangeGoogleCode(code) {
  const config = googleOAuthConfig();
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.callbackUrl,
    grant_type: 'authorization_code',
  }).toString();

  return requestJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });
}

function getGoogleProfile(accessToken) {
  return requestJson('https://www.googleapis.com/oauth2/v2/userinfo', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

function localDateOnly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((toDate - fromDate) / msPerDay);
}

function normalizeAnswer(answer) {
  return String(answer || '').trim().toLowerCase();
}

function difficultyLabel(difficulty) {
  if (difficulty === 'medium') return 'Medium';
  if (difficulty === 'hard') return 'Hard';
  return 'Easy';
}

function mapDifficultyAndStageFromLevel(level) {
  if (level >= 16) {
    return ['hard', level - 15];
  }
  if (level >= 5) {
    return ['medium', level - 4];
  }
  return ['easy', level];
}

function determineCharacter(grammarScore, vocabularyScore, contextScore) {
  const scores = [
    { name: 'Grammar Learner', score: grammarScore },
    { name: 'Vocabulary Learner', score: vocabularyScore },
    { name: 'Context Learner', score: contextScore },
  ];

  scores.sort((a, b) => b.score - a.score);
  return scores[0].name;
}

function characterMeta(character) {
  if (character === 'Grammar Learner') {
    return [
      'Kamu lebih mudah memahami Bahasa Inggris melalui grammar.',
      ['Belajar tenses', 'Belajar struktur kalimat'],
    ];
  }

  if (character === 'Vocabulary Learner') {
    return [
      'Kamu cepat menangkap arti kata dan kosakata baru.',
      ['Hafalkan kata baru', 'Gunakan flashcard'],
    ];
  }

  return [
    'Kamu lebih mudah memahami Bahasa Inggris melalui konteks.',
    ['Membaca teks Inggris', 'Latihan dialog'],
  ];
}

function extractPlaylistId(url) {
  const value = String(url || '').trim();
  if (!value) return null;

  if (/^[a-zA-Z0-9]{22}$/.test(value)) {
    return value;
  }

  const uriMatch = value.match(/spotify:playlist:([a-zA-Z0-9]{22})/);
  if (uriMatch) return uriMatch[1];

  const linkMatch = value.match(/open\.spotify\.com\/(?:embed\/)?playlist\/([a-zA-Z0-9]{22})/);
  if (linkMatch) return linkMatch[1];

  return null;
}

function buildEmbedUrl(url) {
  const playlistId = extractPlaylistId(url);
  if (!playlistId) return null;
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
}

const onboardingScreens = {
  level: {
    question: 'Kamu ingin belajar Bahasa Inggris dari mana dulu?',
    type: 'level-grid',
    next: '/onboarding/reason',
    options: [
      { icon: '💡', text: 'Lvl Mudah' },
      { icon: '⛑️', text: 'Lvl Kompleks' },
      { icon: '📘', text: 'Lvl Sedang' },
    ],
  },
  reason: {
    question: 'Mengapa ingin belajar bahasa inggris?',
    type: 'reason-grid',
    next: '/onboarding/english-level',
    options: [
      { icon: '🗣️', text: 'Meningkatkan kominikasi' },
      { icon: '🌍', text: 'Ingin Keluar negri' },
      { icon: '🏆', text: 'Untuk Kompetisi' },
      { icon: '•••', text: 'Lainnya...' },
    ],
  },
  'english-level': {
    question: 'Berapa banyak bahasa Inggris yang kamu tahu?',
    type: 'level-list',
    next: '/onboarding/start-point',
    options: [
      { icon: '◇', text: 'Aku baru mulai belajar bahasa inggris' },
      { icon: '◒', text: 'Aku tahu beberapa kata yang umum digunakan' },
      { icon: '◓', text: 'Aku bisa melakukan percakapan sederhana' },
      { icon: '◕', text: 'Aku bisa bicara tentang berbagai topik' },
      { icon: '◆', text: 'Aku bisa membahas berbagai topik secara detail' },
    ],
  },
  'start-point': {
    question: 'Sekarang, ayo temukan titik mulaimu!',
    type: 'start-list',
    next: '/dashboard',
    options: [
      {
        icon: '📘',
        iconClass: 'book',
        title: 'Mulai dari awal',
        description: 'Ambil pelajaran termudah dari kursus bahasa Inggris',
      },
      {
        icon: '🧭',
        iconClass: 'compass',
        title: 'Temukan levelku',
        description: 'Biarkan merekomendasikan titik awal belajar untukmu',
      },
    ],
  },
};

function parsePositiveInt(value, fallback) {
  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num) || num < 1) return fallback;
  return num;
}

async function resolveQuestionIds(difficulty, stage) {
  if (db.hasColumn('questions', 'difficulty') && db.hasColumn('questions', 'stage')) {
    const exactQuestionIds = db
      .all(
        `SELECT id FROM questions WHERE difficulty = :difficulty AND stage = :stage ORDER BY RANDOM()`,
        { ':difficulty': difficulty, ':stage': stage },
      )
      .map((row) => Number(row.id));

    if (exactQuestionIds.length > 0) {
      return exactQuestionIds;
    }

    return db.all('SELECT id FROM questions ORDER BY RANDOM()').map((row) => Number(row.id));
  }

  const type = difficulty === 'medium' ? 'vocabulary' : difficulty === 'hard' ? 'context' : 'grammar';
  const allIds = db
    .all('SELECT id FROM questions WHERE type = :type ORDER BY id', { ':type': type })
    .map((row) => Number(row.id));

  const chunkSize = 3;
  const chunks = [];
  for (let index = 0; index < allIds.length; index += chunkSize) {
    chunks.push(allIds.slice(index, index + chunkSize));
  }

  const selected = chunks[stage - 1] || [];
  for (let i = selected.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'engpersona-secret',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(flash());

app.use(
  asyncHandler(async (req, res, next) => {
    res.locals.path = req.path;
    res.locals.statusMessage = req.flash('status')[0] || null;
    res.locals.exerciseMessage = req.flash('exercise_message')[0] || null;
    res.locals.feedbackMessage = req.flash('feedback_message')[0] || null;
    res.locals.feedbackType = req.flash('feedback_type')[0] || 'info';
    res.locals.formError = req.flash('form_error')[0] || null;
    res.locals.fieldErrors = req.flash('field_errors')[0] || {};
    res.locals.oldInput = req.flash('old_input')[0] || {};

    if (req.session.userId) {
      req.user = db.get('SELECT * FROM users WHERE id = :id', { ':id': req.session.userId });
    } else {
      req.user = null;
    }

    res.locals.currentUser = req.user;
    next();
  }),
);

app.get(
  '/',
  asyncHandler(async (req, res) => {
    let lang = req.session.site_lang || 'id';
    if (!['id', 'en'].includes(lang)) {
      lang = 'id';
    }

    const copy = {
      id: {
        site_language: 'Bahasa situs',
        language_name: 'Bahasa Indonesia',
        headline: 'Cara gratis, seru, dan efektif untuk belajar bahasa!',
        start: 'MULAI',
        have_account: 'AKU SUDAH PUNYA AKUN',
        showcase_1: 'Bahasa Inggris',
        showcase_2: 'Bahasa Indonesia',
      },
      en: {
        site_language: 'Site language',
        language_name: 'English',
        headline: 'The free, fun, and effective way to learn a language!',
        start: 'GET STARTED',
        have_account: 'I ALREADY HAVE AN ACCOUNT',
        showcase_1: 'English',
        showcase_2: 'Indonesian',
      },
    };

    res.render('landing', { layout: false, lang, copy: copy[lang] });
  }),
);

app.get('/language/:lang', (req, res) => {
  const { lang } = req.params;
  if (['id', 'en'].includes(lang)) {
    req.session.site_lang = lang;
  }

  res.redirect('/');
});

app.get('/register', requireGuest, (req, res) => {
  res.render('auth/register', { layout: false });
});

app.post(
  '/register',
  requireGuest,
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const passwordConfirmation = String(req.body.password_confirmation || '');

    const fieldErrors = {};
    if (!username) {
      fieldErrors.username = 'Username wajib diisi.';
    } else if (username.length > 50) {
      fieldErrors.username = 'Maksimal 50 karakter.';
    }

    if (!password) {
      fieldErrors.password = 'Password wajib diisi.';
    } else if (password.length < 6) {
      fieldErrors.password = 'Minimal 6 karakter.';
    }

    if (password !== passwordConfirmation) {
      fieldErrors.password_confirmation = 'Konfirmasi password tidak cocok.';
    }

    const existing = username
      ? db.get('SELECT id FROM users WHERE username = :username', { ':username': username })
      : null;
    if (existing) {
      fieldErrors.username = 'Username sudah dipakai.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      req.flash('field_errors', fieldErrors);
      req.flash('old_input', { username });
      return res.redirect('/register');
    }

    const hashed = await bcrypt.hash(password, 10);
    const createdAt = nowIso();

    const columns = ['username', 'password', 'xp', 'level', 'streak', 'last_login', 'created_at', 'updated_at'];
    const values = {
      ':username': username,
      ':password': hashed,
      ':xp': 0,
      ':level': 1,
      ':streak': 1,
      ':last_login': createdAt,
      ':created_at': createdAt,
      ':updated_at': createdAt,
    };

    if (db.hasColumn('users', 'name')) {
      columns.push('name');
      values[':name'] = username;
    }

    if (db.hasColumn('users', 'email')) {
      columns.push('email');
      values[':email'] = `${username}@engpersona.local`;
    }

    if (db.hasColumn('users', 'spotify_playlist_url')) {
      columns.push('spotify_playlist_url');
      values[':spotify_playlist_url'] = null;
    }

    const placeholders = columns.map((column) => `:${column}`).join(', ');
    await db.run(`INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`, values);

    const user = db.get('SELECT id FROM users WHERE username = :username', { ':username': username });
    req.session.userId = user.id;

    res.redirect('/profile-setup');
  }),
);

app.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', { layout: false });
});

app.post(
  '/login',
  requireGuest,
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
      req.flash('form_error', 'Username dan password wajib diisi.');
      req.flash('old_input', { username });
      return res.redirect('/login');
    }

    const user = db.get('SELECT * FROM users WHERE username = :username', { ':username': username });
    const isValid = user ? await bcrypt.compare(password, user.password) : false;

    if (!isValid) {
      req.flash('form_error', 'Username atau password salah.');
      req.flash('old_input', { username });
      return res.redirect('/login');
    }

    const today = startOfDay(new Date());
    let streak = Number(user.streak || 0);

    if (!user.last_login) {
      streak = 1;
    } else {
      const lastLoginDate = new Date(user.last_login);
      if (!Number.isNaN(lastLoginDate.valueOf())) {
        const lastDay = startOfDay(lastLoginDate);
        const days = diffInDays(lastDay, today);
        if (days >= 1) {
          streak += 1;
        }
      }
    }

    await db.run(
      'UPDATE users SET streak = :streak, last_login = :last_login, updated_at = :updated_at WHERE id = :id',
      { ':streak': streak, ':last_login': nowIso(), ':updated_at': nowIso(), ':id': user.id },
    );

    req.session.userId = user.id;
    res.redirect('/dashboard');
  }),
);

app.get('/auth/google', requireGuest, (req, res) => {
  if (!hasGoogleOAuthConfig()) {
    req.flash('form_error', 'Konfigurasi Google OAuth belum lengkap.');
    return res.redirect('/login');
  }

  const config = googleOAuthConfig();
  const state = crypto.randomBytes(24).toString('hex');
  req.session.googleOAuthState = state;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Pastikan session tersimpan sebelum redirect ke Google
  req.session.save((err) => {
    if (err) {
      console.error('[OAuth] Gagal menyimpan session:', err);
      req.flash('form_error', 'Terjadi kesalahan. Silakan coba lagi.');
      return res.redirect('/login');
    }
    return res.redirect(redirectUrl);
  });
});

app.get(
  '/auth/google/callback',
  requireGuest,
  asyncHandler(async (req, res) => {
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const expectedState = req.session.googleOAuthState;
    delete req.session.googleOAuthState;

    if (!code || !state || !expectedState || state !== expectedState) {
      req.flash('form_error', 'Login Google tidak valid. Silakan coba lagi.');
      return res.redirect('/login');
    }

    const token = await exchangeGoogleCode(code);
    const profile = await getGoogleProfile(token.access_token);
    const googleId = String(profile.id || '').trim();
    const email = String(profile.email || '').trim().toLowerCase();
    const name = String(profile.name || email || 'Pengguna Google').trim();

    if (!googleId || !email) {
      req.flash('form_error', 'Akun Google tidak mengirim email yang valid.');
      return res.redirect('/login');
    }

    let user = db.get('SELECT * FROM users WHERE google_id = :google_id', { ':google_id': googleId });
    if (!user) {
      user = db.get('SELECT * FROM users WHERE email = :email OR username = :email', { ':email': email });
    }

    const timestamp = nowIso();

    if (user) {
      await db.run(
        `UPDATE users
         SET google_id = :google_id,
             email = :email,
             name = COALESCE(NULLIF(name, ''), :name),
             last_login = :last_login,
             updated_at = :updated_at
         WHERE id = :id`,
        {
          ':google_id': googleId,
          ':email': email,
          ':name': name,
          ':last_login': timestamp,
          ':updated_at': timestamp,
          ':id': user.id,
        },
      );
    } else {
      const fallbackPassword = await bcrypt.hash(`google:${googleId}:${crypto.randomBytes(16).toString('hex')}`, 10);
      await db.run(
        `INSERT INTO users (
          username, password, name, email, google_id, xp, level, streak, last_login, created_at, updated_at
        ) VALUES (
          :username, :password, :name, :email, :google_id, :xp, :level, :streak, :last_login, :created_at, :updated_at
        )`,
        {
          ':username': email,
          ':password': fallbackPassword,
          ':name': name,
          ':email': email,
          ':google_id': googleId,
          ':xp': 0,
          ':level': 1,
          ':streak': 1,
          ':last_login': timestamp,
          ':created_at': timestamp,
          ':updated_at': timestamp,
        },
      );

      user = db.get('SELECT * FROM users WHERE google_id = :google_id', { ':google_id': googleId });
    }

    req.session.userId = user.id;
    return res.redirect(user.avatar && user.name ? '/dashboard' : '/profile-setup');
  }),
);

app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/profile-setup', requireAuth, (req, res) => {
  res.render('auth/profile-setup', {
    layout: false,
    username: req.user.username,
    formError: req.flash('form_error')[0] || null,
    oldInput: req.flash('old_input')[0] || {},
  });
});

app.post(
  '/profile-setup',
  requireAuth,
  asyncHandler(async (req, res) => {
    const displayName = String(req.body.display_name || '').trim();
    const avatar = String(req.body.avatar || 'icon2.jpg').trim();

    const allowedAvatars = ['icon1.jpg', 'icon2.jpg', 'icon3.jpg'];
    const finalAvatar = allowedAvatars.includes(avatar) ? avatar : 'icon2.jpg';

    if (!displayName) {
      req.flash('form_error', 'Nama wajib diisi.');
      req.flash('old_input', { display_name: '' });
      return res.redirect('/profile-setup');
    }

    if (displayName.length > 50) {
      req.flash('form_error', 'Nama maksimal 50 karakter.');
      req.flash('old_input', { display_name: displayName });
      return res.redirect('/profile-setup');
    }

    await db.run(
      'UPDATE users SET name = :name, avatar = :avatar, updated_at = :updated_at WHERE id = :id',
      {
        ':name': displayName,
        ':avatar': finalAvatar,
        ':updated_at': nowIso(),
        ':id': req.user.id,
      },
    );

    res.redirect('/onboarding/level');
  }),
);

app.get('/onboarding', requireAuth, (req, res) => {
  res.redirect('/onboarding/level');
});

app.get('/onboarding/:screen', requireAuth, (req, res, next) => {
  const screen = onboardingScreens[req.params.screen];
  if (!screen) return next();

  return res.render('onboarding/show', {
    layout: false,
    screen,
  });
});

app.get(
  '/dashboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const latestResult = db.get(
      'SELECT * FROM results WHERE user_id = :user_id ORDER BY id DESC LIMIT 1',
      { ':user_id': req.user.id },
    );

    const totalTrackLevels = Math.max(20, Number(req.user.level || 0) + 5);
    const trackLevels = Array.from({ length: totalTrackLevels }, (_, index) => index + 1);

    res.render('dashboard/index', {
      layout: false,
      user: req.user,
      latestResult,
      trackLevels,
    });
  }),
);

app.get(
  '/exercise/start',
  requireAuth,
  asyncHandler(async (req, res) => {
    const globalLevel = Math.max(Number.parseInt(req.query.level || '0', 10) || 0, 0);

    let difficulty = 'easy';
    let stage = 1;

    if (globalLevel > 0) {
      [difficulty, stage] = mapDifficultyAndStageFromLevel(globalLevel);
    } else {
      const queryDifficulty = String(req.query.difficulty || 'easy').toLowerCase();
      difficulty = ['easy', 'medium', 'hard'].includes(queryDifficulty) ? queryDifficulty : 'easy';
      stage = Math.max(Number.parseInt(req.query.stage || '1', 10) || 1, 1);
    }

    const questionIds = await resolveQuestionIds(difficulty, stage);

    if (questionIds.length === 0) {
      req.flash('status', `Soal untuk ${difficultyLabel(difficulty)} level ${stage} belum tersedia.`);
      return res.redirect('/dashboard');
    }

    req.session.exercise = {
      question_ids: questionIds,
      difficulty,
      stage,
      global_level: globalLevel > 0 ? globalLevel : null,
      current_index: 0,
      correct_count: 0,
      wrong_count: 0,
      xp_earned: 0,
      grammar_score: 0,
      vocabulary_score: 0,
      context_score: 0,
      wrong_question_ids: [],
      result_id: null,
    };

    res.redirect('/exercise');
  }),
);

app.get(
  '/exercise',
  requireAuth,
  asyncHandler(async (req, res) => {
    const exercise = req.session.exercise;
    if (!exercise) {
      return res.redirect('/exercise/start');
    }

    const currentIndex = Number(exercise.current_index || 0);
    const questionIds = exercise.question_ids || [];
    const totalQuestions = questionIds.length;

    if (currentIndex >= totalQuestions) {
      return res.redirect('/result');
    }

    const question = db.get('SELECT * FROM questions WHERE id = :id', { ':id': questionIds[currentIndex] });
    if (!question) {
      req.flash('status', 'Soal tidak ditemukan. Silakan mulai ulang latihan.');
      delete req.session.exercise;
      return res.redirect('/dashboard');
    }

    const progressPercent = Math.floor((currentIndex / Math.max(totalQuestions, 1)) * 100);

    res.render('exercise/index', {
      question,
      currentIndex: currentIndex + 1,
      totalQuestions,
      progressPercent,
      difficultyLabel: difficultyLabel(String(exercise.difficulty || 'easy')),
      stage: Number(exercise.stage || 1),
      globalLevel: Number(exercise.global_level || 0),
      embedUrl: buildEmbedUrl(req.user.spotify_playlist_url || ''),
    });
  }),
);

app.post(
  '/exercise',
  requireAuth,
  asyncHandler(async (req, res) => {
    const exercise = req.session.exercise;
    if (!exercise) {
      return res.redirect('/exercise/start');
    }

    const answer = String(req.body.answer || '').trim();
    if (!answer) {
      req.flash('feedback_type', 'danger');
      req.flash('feedback_message', 'Jawaban wajib diisi.');
      return res.redirect('/exercise');
    }

    const currentIndex = Number(exercise.current_index || 0);
    const questionIds = exercise.question_ids || [];
    const totalQuestions = questionIds.length;

    if (currentIndex >= totalQuestions) {
      return res.redirect('/result');
    }

    const question = db.get('SELECT * FROM questions WHERE id = :id', { ':id': questionIds[currentIndex] });
    if (!question) {
      req.flash('status', 'Soal tidak ditemukan. Silakan mulai ulang latihan.');
      delete req.session.exercise;
      return res.redirect('/dashboard');
    }

    const userAnswer = normalizeAnswer(answer);
    const correctAnswer = normalizeAnswer(question.answer);
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      exercise.correct_count += 1;
      exercise.xp_earned += 10;
      const scoreKey = `${question.type}_score`;
      exercise[scoreKey] = Number(exercise[scoreKey] || 0) + 1;
    } else {
      exercise.wrong_count += 1;
      if (!exercise.wrong_question_ids.includes(question.id)) {
        exercise.wrong_question_ids.push(question.id);
      }
    }

    exercise.current_index += 1;

    if (exercise.current_index >= totalQuestions) {
      const total = Math.max(exercise.question_ids.length, 1);
      const score = Math.round((Number(exercise.correct_count || 0) / total) * 100);
      const character = determineCharacter(
        Number(exercise.grammar_score || 0),
        Number(exercise.vocabulary_score || 0),
        Number(exercise.context_score || 0),
      );

      const now = nowIso();
      const insertResult = await db.run(
        `INSERT INTO results (
          user_id, score, xp, grammar_score, vocabulary_score, context_score, character, total_questions, date, created_at, updated_at
        ) VALUES (
          :user_id, :score, :xp, :grammar_score, :vocabulary_score, :context_score, :character, :total_questions, :date, :created_at, :updated_at
        )`,
        {
          ':user_id': req.user.id,
          ':score': score,
          ':xp': Number(exercise.xp_earned || 0),
          ':grammar_score': Number(exercise.grammar_score || 0),
          ':vocabulary_score': Number(exercise.vocabulary_score || 0),
          ':context_score': Number(exercise.context_score || 0),
          ':character': character,
          ':total_questions': total,
          ':date': localDateOnly(),
          ':created_at': now,
          ':updated_at': now,
        },
      );

      const resultId = insertResult.lastInsertRowid;

      const newXp = Number(req.user.xp || 0) + Number(exercise.xp_earned || 0);
      const newLevel = Math.floor(newXp / 100) + 1;

      await db.run(
        'UPDATE users SET xp = :xp, level = :level, learning_character = :learning_character, updated_at = :updated_at WHERE id = :id',
        {
          ':xp': newXp,
          ':level': newLevel,
          ':learning_character': character,
          ':updated_at': nowIso(),
          ':id': req.user.id,
        },
      );

      for (const questionId of exercise.wrong_question_ids) {
        await db.run(
          'INSERT OR IGNORE INTO wrong_answers (user_id, question_id, created_at, updated_at) VALUES (:user_id, :question_id, :created_at, :updated_at)',
          {
            ':user_id': req.user.id,
            ':question_id': questionId,
            ':created_at': nowIso(),
            ':updated_at': nowIso(),
          },
        );
      }

      exercise.result_id = resultId;
      req.session.exercise = exercise;
      req.flash('exercise_message', 'Latihan selesai.');

      return res.redirect(`/result/${resultId}`);
    }

    req.session.exercise = exercise;

    if (isCorrect) {
      req.flash('feedback_type', 'success');
      req.flash('feedback_message', 'Benar! +10 XP');
    } else {
      req.flash('feedback_type', 'danger');
      req.flash('feedback_message', `Salah! Jawaban benar adalah: ${question.answer}`);
    }

    return res.redirect('/exercise');
  }),
);

async function showResult(req, res) {
  const resultId = Number.parseInt(req.params.resultId || '', 10);

  let result = null;
  if (!Number.isNaN(resultId)) {
    result = db.get('SELECT * FROM results WHERE id = :id AND user_id = :user_id', {
      ':id': resultId,
      ':user_id': req.user.id,
    });
  }

  if (!result) {
    result = db.get('SELECT * FROM results WHERE user_id = :user_id ORDER BY id DESC LIMIT 1', {
      ':user_id': req.user.id,
    });
  }

  if (!result) {
    req.flash('status', 'Belum ada hasil latihan.');
    return res.redirect('/dashboard');
  }

  const [description, recommendations] = characterMeta(result.character);

  return res.render('result/show', {
    result,
    description,
    recommendations,
  });
}

app.get('/result', requireAuth, asyncHandler(showResult));
app.get('/result/:resultId', requireAuth, asyncHandler(showResult));

app.get(
  '/review',
  requireAuth,
  asyncHandler(async (req, res) => {
    const totalResults = db.get('SELECT COUNT(*) AS total FROM results WHERE user_id = :user_id', {
      ':user_id': req.user.id,
    });

    res.render('review/index', {
      layout: false,
      user: req.user,
      totalResults: Number(totalResults.total || 0),
    });
  }),
);

app.post(
  '/review/update-profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || req.user.username || '').trim();
    const email = String(req.body.email || req.user.email || '').trim();
    const avatar = String(req.body.avatar || req.user.avatar || '').trim();

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username tidak boleh kosong.' });
    }

    const existing = db.get('SELECT id FROM users WHERE username = :username AND id != :id', {
      ':username': username,
      ':id': req.user.id,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username sudah dipakai oleh pengguna lain.' });
    }

    const now = nowIso();
    await db.run(
      `UPDATE users SET username = :username, email = :email, avatar = :avatar, updated_at = :updated_at WHERE id = :id`,
      {
        ':username': username,
        ':email': email,
        ':avatar': avatar,
        ':updated_at': now,
        ':id': req.user.id,
      },
    );

    return res.json({
      success: true,
      message: 'Profil berhasil disimpan!',
      user: { username, email, avatar },
    });
  }),
);

app.post(
  '/review/update-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const currentPassword = String(req.body.current_password || '');
    const newPassword = String(req.body.new_password || '');
    const confirmPassword = String(req.body.confirm_password || '');

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Konfirmasi password saat ini (lama) diperlukan.' });
    }

    const isValid = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah! Verifikasi gagal.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Konfirmasi password baru tidak sesuai.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run(
      'UPDATE users SET password = :password, updated_at = :updated_at WHERE id = :id',
      {
        ':password': hashed,
        ':updated_at': nowIso(),
        ':id': req.user.id,
      },
    );

    return res.json({
      success: true,
      message: 'Password baru berhasil dikonfirmasi dan disimpan secara otomatis!',
    });
  }),
);

app.get(
  '/history',
  requireAuth,
  asyncHandler(async (req, res) => {
    const page = parsePositiveInt(req.query.page, 1);
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const totalRow = db.get('SELECT COUNT(*) AS total FROM results WHERE user_id = :user_id', {
      ':user_id': req.user.id,
    });
    const total = Number(totalRow.total || 0);

    const results = db.all(
      'SELECT * FROM results WHERE user_id = :user_id ORDER BY id DESC LIMIT :limit OFFSET :offset',
      {
        ':user_id': req.user.id,
        ':limit': perPage,
        ':offset': offset,
      },
    );

    const formatted = results.map((item) => {
      const date = new Date(item.date || item.created_at || nowIso());
      const dateLabel = Number.isNaN(date.valueOf())
        ? '-'
        : date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

      return {
        ...item,
        dateLabel,
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    res.render('history/index', {
      results: formatted,
      pagination: {
        page,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    });
  }),
);

app.get('/music', requireAuth, (req, res) => {
  const playlistUrl = String(req.user.spotify_playlist_url || '');
  res.render('music/index', {
    playlistUrl,
    embedUrl: buildEmbedUrl(playlistUrl),
  });
});

app.post(
  '/music',
  requireAuth,
  asyncHandler(async (req, res) => {
    const rawInput = String(req.body.spotify_playlist_url || '').trim();

    if (!rawInput) {
      req.flash('field_errors', { spotify_playlist_url: 'Link playlist wajib diisi.' });
      req.flash('old_input', { spotify_playlist_url: '' });
      return res.redirect('/music');
    }

    const playlistId = extractPlaylistId(rawInput);
    if (!playlistId) {
      req.flash('field_errors', {
        spotify_playlist_url:
          'Format tidak dikenali. Pakai link playlist Spotify, link embed playlist, URI spotify, atau ID playlist.',
      });
      req.flash('old_input', { spotify_playlist_url: rawInput });
      return res.redirect('/music');
    }

    await db.run('UPDATE users SET spotify_playlist_url = :url, updated_at = :updated_at WHERE id = :id', {
      ':url': `https://open.spotify.com/playlist/${playlistId}`,
      ':updated_at': nowIso(),
      ':id': req.user.id,
    });

    req.flash('status', 'Playlist berhasil disimpan.');
    res.redirect('/music');
  }),
);

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.use((error, req, res, next) => {
  console.error('[SERVER ERROR]', error.message);
  console.error(error.stack);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).send(
    isDev
      ? `Terjadi kesalahan pada server.<br><pre style="font-size:12px;text-align:left;padding:16px">${error.stack}</pre>`
      : 'Terjadi kesalahan pada server.'
  );
});

(async () => {
  await db.initDatabase(path.join(__dirname, '..', 'data', 'database.sqlite'));
  app.listen(PORT, () => {
    console.log(`EngPersona Node.js running at http://localhost:${PORT}`);
  });
})();
