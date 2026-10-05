const secret = process.env.SESSION_SECRET || 'engpersona-secret';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET wajib dikonfigurasi pada production.');
}

module.exports = {
  secret,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  resave: false,
  saveUninitialized: false,
};
