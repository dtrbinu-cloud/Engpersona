const { credentials } = require('../requests/apiAuthRequest');
const apiAuthService = require('../services/apiAuthService');
const jwtConfig = require('../config/jwt');
const { clearCookie, setCookie } = require('../utils/cookie');

function refreshCookieOptions() { return { httpOnly:true, secure:process.env.NODE_ENV === 'production', sameSite:'lax', path:'/api/v1/auth', maxAge:jwtConfig.refreshDays * 86400000 }; }
function readCookie(req, name) { const pair = String(req.headers.cookie || '').split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`)); return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null; }
async function issueTokens(res, user) { const issued = await apiAuthService.issueTokens(user); setCookie(res, 'refresh_token', issued.refreshToken, refreshCookieOptions()); return issued.payload; }
async function register(req, res) { const input = credentials(req.body, true); if (Object.keys(input.errors).length) return res.status(422).json({ success:false, errors:input.errors }); if (apiAuthService.usernameExists(input.username)) return res.status(422).json({ success:false, errors:{ username:'Username sudah dipakai.' } }); const user = await apiAuthService.register(input.username, input.email, input.password); return res.status(201).json({ success:true, data:await issueTokens(res, user) }); }
async function login(req, res) { const input = credentials(req.body); if (!input.username || !input.password) return res.status(422).json({ success:false, message:'Username dan password wajib diisi.' }); const user = await apiAuthService.authenticate(input.username, input.password); if (!user) return res.status(401).json({ success:false, message:'Username atau password salah.' }); return res.json({ success:true, data:await issueTokens(res, user) }); }
async function refresh(req, res) { const raw=readCookie(req, 'refresh_token'); if (!raw) return res.status(401).json({ success:false, message:'Refresh token tidak ditemukan.' }); const issued = await apiAuthService.refresh(raw); if (!issued) return res.status(401).json({ success:false, message:'Refresh token tidak valid atau kedaluwarsa.' }); setCookie(res, 'refresh_token', issued.refreshToken, refreshCookieOptions()); return res.json({ success:true, data:issued.payload }); }
async function logout(req, res) { const raw=readCookie(req, 'refresh_token'); if (raw) await apiAuthService.revoke(raw); clearCookie(res, 'refresh_token', refreshCookieOptions()); return res.status(204).send(); }
module.exports = { register, login, refresh, logout };
