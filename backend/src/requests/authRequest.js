function register(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const username = email;
  const password = String(body.password || '');
  const confirmation = String(body.password_confirmation || '');
  const errors = {};

  if (!email) {
    errors.email = 'Email wajib diisi.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Format email tidak valid.';
  }

  if (!password) {
    errors.password = 'Password wajib diisi.';
  } else if (password.length < 8) {
    errors.password = 'Minimal 8 karakter.';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Harus mengandung minimal 1 huruf besar (A-Z).';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Harus mengandung minimal 1 angka (0-9).';
  }

  if (password !== confirmation) {
    errors.password_confirmation = 'Konfirmasi password tidak cocok.';
  }

  return { username, email, password, errors };
}

module.exports = { register };
