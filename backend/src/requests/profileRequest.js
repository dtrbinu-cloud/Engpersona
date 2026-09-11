function profile(body) {
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim();
  const avatar = String(body.avatar || '').trim();
  return { username, email, avatar, errors: username ? {} : { username: 'Username wajib diisi.' } };
}
module.exports = { profile };
