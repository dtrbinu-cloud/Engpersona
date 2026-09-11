function extractPlaylistId(url) {
  const value = String(url || '').trim();
  if (/^[a-zA-Z0-9]{22}$/.test(value)) return value;
  return (value.match(/spotify:playlist:([a-zA-Z0-9]{22})/) || value.match(/open\.spotify\.com\/(?:embed\/)?playlist\/([a-zA-Z0-9]{22})/) || [])[1] || null;
}
function buildEmbedUrl(url) { const id = extractPlaylistId(url); return id ? `https://open.spotify.com/embed/playlist/${id}?utm_source=generator` : null; }
module.exports = { extractPlaylistId, buildEmbedUrl };
