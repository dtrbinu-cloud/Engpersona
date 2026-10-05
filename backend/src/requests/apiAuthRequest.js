function credentials(body, requireConfirmation = false) {
  const username = String(body.username || '').trim(); const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || ''); const passwordConfirmation = String(body.password_confirmation || ''); const errors = {};
  if (!username) errors.username = 'Username wajib diisi.'; else if (username.length > 50) errors.username = 'Maksimal 50 karakter.';
  if (requireConfirmation && !email) errors.email = 'Email wajib diisi.'; else if (requireConfirmation && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid.';
  if (!password) errors.password = 'Password wajib diisi.'; else if (password.length < 6) errors.password = 'Minimal 6 karakter.';
  if (requireConfirmation && password !== passwordConfirmation) errors.password_confirmation = 'Konfirmasi password tidak cocok.';
  return { username, email, password, errors };
}
module.exports = { credentials };
