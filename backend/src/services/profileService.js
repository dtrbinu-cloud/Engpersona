const users = require('../repositories/userRepository');
const { extractPlaylistId } = require('../utils/spotify');

async function savePlaylist(userId, rawUrl) {
  const playlistId = extractPlaylistId(rawUrl);
  if (!playlistId) throw new Error('URL playlist Spotify tidak valid.');
  await users.update(userId, { playlist: `https://open.spotify.com/playlist/${playlistId}` });
  return users.byId(userId);
}

module.exports = { savePlaylist };
