const users = require('../repositories/userRepository');
const results = require('../repositories/resultRepository');
const questions = require('../repositories/questionRepository');
const userResource = require('../resources/userResource');
const resultResource = require('../resources/resultResource');
const { extractPlaylistId } = require('../utils/spotify');

function me(req, res) { return res.json({ success: true, data: userResource(req.user) }); }
function listResults(req, res) {
  const page = Math.max(Number.parseInt(req.query.page || '1', 10) || 1, 1); const perPage = Math.min(Math.max(Number.parseInt(req.query.per_page || '10', 10) || 10, 1), 100);
  const total = results.count(req.user.id); const data = results.list(req.user.id, perPage, (page - 1) * perPage).map(resultResource);
  return res.json({ success:true, data, meta:{ page, perPage, total, totalPages:Math.max(1, Math.ceil(total / perPage)) } });
}
function latestResult(req, res) { return res.json({ success:true, data:resultResource(results.latest(req.user.id)) }); }
function listQuestions(req, res) {
  const difficulty = String(req.query.difficulty || 'easy'); const stage = Math.max(Number.parseInt(req.query.stage || '1', 10) || 1, 1);
  const ids = questions.idsFor(difficulty, stage); const data = ids.map(questions.byId).filter(Boolean).map(({ answer, ...question }) => question);
  return res.json({ success:true, data });
}
async function updateProfile(req, res) {
  const username=String(req.body.username || '').trim(); const email=String(req.body.email || '').trim(); const avatar=String(req.body.avatar || '').trim();
  if (!username) return res.status(422).json({ success:false, message:'Username wajib diisi.' });
  const existing=users.byUsername(username); if (existing && existing.id !== req.user.id) return res.status(422).json({ success:false, message:'Username sudah dipakai.' });
  await users.update(req.user.id, { username, email, avatar }); return res.json({ success:true, data:userResource(users.byId(req.user.id)) });
}
async function updatePlaylist(req, res) {
  const id=extractPlaylistId(req.body.spotify_playlist_url); if (!id) return res.status(422).json({ success:false, message:'URL playlist Spotify tidak valid.' });
  await users.update(req.user.id, { playlist:`https://open.spotify.com/playlist/${id}` }); return res.json({ success:true, data:userResource(users.byId(req.user.id)) });
}
module.exports = { me, listResults, latestResult, listQuestions, updateProfile, updatePlaylist };
