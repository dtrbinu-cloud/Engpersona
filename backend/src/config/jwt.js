const accessSecret = process.env.JWT_ACCESS_SECRET || 'development-only-change-jwt-access-secret';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET wajib dikonfigurasi pada production.');
}

module.exports = {
  accessSecret,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshDays: Number(process.env.JWT_REFRESH_DAYS || 30),
};
