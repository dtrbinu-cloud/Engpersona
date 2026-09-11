const users = require('../repositories/userRepository');
const { verifyAccessToken } = require('../services/tokenService');
function requireApiAuth(req, res, next) {
  const token = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  if (token) { try { req.user = users.byId(Number(verifyAccessToken(token[1]).sub)); } catch (_) { return res.status(401).json({ success:false, message:'Access token tidak valid atau kedaluwarsa.' }); } }
  if (!req.user) return res.status(401).json({ success: false, message: 'Autentikasi diperlukan.' }); return next();
}
module.exports = { requireApiAuth };
