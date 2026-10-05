const users = require('../repositories/userRepository');
const results = require('../repositories/resultRepository');
const questions = require('../repositories/questionRepository');
const { extractPlaylistId } = require('../utils/spotify');

function listResults(userId, page, perPage) {
  const total = results.count(userId);
  const data = results.list(userId, perPage, (page - 1) * perPage);
  return { data, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

function listQuestions(difficulty, stage) {
  return questions
    .idsFor(difficulty, stage)
    .map(questions.byId)
    .filter(Boolean)
    .map(({ answer, ...question }) => question);
}

async function updateProfile(userId, data) {
  const existing = users.byUsername(data.username);
  if (existing && existing.id !== userId) return null;

  await users.update(userId, data);
  return users.byId(userId);
}

async function updatePlaylist(userId, rawUrl) {
  const playlistId = extractPlaylistId(rawUrl);
  if (!playlistId) return null;

  await users.update(userId, { playlist: `https://open.spotify.com/playlist/${playlistId}` });
  return users.byId(userId);
}

function usernameExists(username, userId) {
  const existing = users.byUsername(username);
  return Boolean(existing && existing.id !== userId);
}

module.exports = {
  latestResult: results.latest,
  listQuestions,
  listResults,
  updatePlaylist,
  updateProfile,
  usernameExists,
};
