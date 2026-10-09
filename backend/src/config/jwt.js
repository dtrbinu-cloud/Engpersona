const crypto = require('crypto');
const accessSecret = process.env.JWT_ACCESS_SECRET;
if (!accessSecret) {
  console.warn('[SECURITY] JWT_ACCESS_SECRET belum dikonfigurasi. Menggunakan random secret (token tidak bertahan setelah restart).');
}
const effectiveSecret = accessSecret || crypto.randomBytes(32).toString('hex');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET wajib dikonfigurasi pada production.');
}

module.exports = {
  accessSecret: effectiveSecret,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshDays: Number(process.env.JWT_REFRESH_DAYS || 30),
};
