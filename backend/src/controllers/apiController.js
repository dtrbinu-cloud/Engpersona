const apiService = require('../services/apiService');
const userResource = require('../resources/userResource');
const resultResource = require('../resources/resultResource');

function me(req, res) { return res.json({ success: true, data: userResource(req.user) }); }
function listResults(req, res) {
  const page = Math.max(Number.parseInt(req.query.page || '1', 10) || 1, 1);
  const perPage = Math.min(Math.max(Number.parseInt(req.query.per_page || '10', 10) || 10, 1), 100);
  const result = apiService.listResults(req.user.id, page, perPage);
  return res.json({ success: true, data: result.data.map(resultResource), meta: { page, perPage, total: result.total, totalPages: result.totalPages } });
}
function latestResult(req, res) { return res.json({ success: true, data: resultResource(apiService.latestResult(req.user.id)) }); }
function listQuestions(req, res) {
  const rawDifficulty = String(req.query.difficulty || 'easy');
  const difficulty = ['easy', 'medium', 'hard'].includes(rawDifficulty) ? rawDifficulty : 'easy';
  const stage = Math.max(Number.parseInt(req.query.stage || '1', 10) || 1, 1);
  const data = apiService.listQuestions(difficulty, stage);
  return res.json({ success: true, data });
}
async function updateProfile(req, res) {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const avatar = String(req.body.avatar || '').trim();

  if (!username) return res.status(422).json({ success: false, message: 'Username wajib diisi.' });
  if (username.length < 3 || username.length > 30) return res.status(422).json({ success: false, message: 'Username harus 3-30 karakter.' });
  if (apiService.usernameExists(username, req.user.id)) return res.status(422).json({ success: false, message: 'Username sudah dipakai.' });

  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(422).json({ success: false, message: 'Format email tidak valid.' });
    }
    if (apiService.emailExists(email, req.user.id)) {
      return res.status(422).json({ success: false, message: 'Email sudah dipakai akun lain.' });
    }
  }

  const allowedAvatars = ['icon1.jpg', 'icon2.jpg', 'icon3.jpg'];
  const finalAvatar = allowedAvatars.includes(avatar) ? avatar : req.user.avatar || 'icon2.jpg';

  const updated = await apiService.updateProfile(req.user.id, { username, email: email || req.user.email, avatar: finalAvatar });
  return res.json({ success: true, data: userResource(updated) });
}
async function updatePlaylist(req, res) {
  const user = await apiService.updatePlaylist(req.user.id, req.body.spotify_playlist_url);
  if (!user) return res.status(422).json({ success: false, message: 'URL playlist Spotify tidak valid.' });
  return res.json({ success: true, data: userResource(user) });
}
module.exports = { me, listResults, latestResult, listQuestions, updateProfile, updatePlaylist };
