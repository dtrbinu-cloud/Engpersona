module.exports = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'development-only-change-jwt-access-secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshDays: Number(process.env.JWT_REFRESH_DAYS || 30),
};
