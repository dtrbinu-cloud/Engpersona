const secret = process.env.SESSION_SECRET;
if (!secret) {
  console.warn('[SECURITY] SESSION_SECRET belum dikonfigurasi. Menggunakan random secret (session tidak bertahan setelah restart).');
}
const effectiveSecret = secret || require('crypto').randomBytes(32).toString('hex');

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET wajib dikonfigurasi pada production.');
}

module.exports = {
  secret: effectiveSecret,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
  resave: false,
  saveUninitialized: false,
};
