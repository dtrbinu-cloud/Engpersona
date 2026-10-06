/**
 * Centralized Auth Validator
 * Digunakan untuk register, login, dan profile setup
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const PASSWORD_MIN_LENGTH = 8;

function validateEmail(email) {
  const trimmedEmail = String(email || '').trim().toLowerCase();
  const errors = {};

  if (!trimmedEmail) {
    errors.email = 'Email wajib diisi.';
    return { email: trimmedEmail, errors };
  }

  if (trimmedEmail.length > 255) {
    errors.email = 'Email terlalu panjang.';
    return { email: trimmedEmail, errors };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Format email tidak valid. Contoh: user@example.com';
    return { email: trimmedEmail, errors };
  }

  return { email: trimmedEmail, errors };
}

function validatePassword(password, confirmPassword = null) {
  const pwd = String(password || '');
  const errors = {};

  if (!pwd) {
    errors.password = 'Password wajib diisi.';
    return { errors };
  }

  if (pwd.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Minimal ${PASSWORD_MIN_LENGTH} karakter.`;
    return { errors };
  }

  if (!/[A-Z]/.test(pwd)) {
    errors.password = 'Harus mengandung minimal 1 huruf besar (A-Z).';
    return { errors };
  }

  if (!/[0-9]/.test(pwd)) {
    errors.password = 'Harus mengandung minimal 1 angka (0-9).';
    return { errors };
  }

  if (confirmPassword !== null) {
    const confirmPwd = String(confirmPassword || '');
    if (!confirmPwd) {
      errors.password_confirmation = 'Konfirmasi password wajib diisi.';
    } else if (pwd !== confirmPwd) {
      errors.password_confirmation = 'Password tidak cocok.';
    }
  }

  return { errors };
}

function validateUsername(username) {
  const trimmedUsername = String(username || '').trim().toLowerCase();
  const errors = {};

  if (!trimmedUsername) {
    errors.username = 'Username wajib diisi.';
    return { username: trimmedUsername, errors };
  }

  if (trimmedUsername.length < 3) {
    errors.username = 'Minimal 3 karakter.';
    return { username: trimmedUsername, errors };
  }

  if (trimmedUsername.length > 20) {
    errors.username = 'Maksimal 20 karakter.';
    return { username: trimmedUsername, errors };
  }

  if (!USERNAME_REGEX.test(trimmedUsername)) {
    errors.username = 'Hanya huruf, angka, garis bawah (_), dan garis (-) diperbolehkan.';
    return { username: trimmedUsername, errors };
  }

  return { username: trimmedUsername, errors };
}

function validateName(name) {
  const trimmedName = String(name || '').trim();
  const errors = {};

  if (!trimmedName) {
    errors.name = 'Nama wajib diisi.';
    return { name: trimmedName, errors };
  }

  if (trimmedName.length < 2) {
    errors.name = 'Minimal 2 karakter.';
    return { name: trimmedName, errors };
  }

  if (trimmedName.length > 50) {
    errors.name = 'Maksimal 50 karakter.';
    return { name: trimmedName, errors };
  }

  return { name: trimmedName, errors };
}

function validateRegisterInput(body) {
  const emailValidation = validateEmail(body.email);
  const passwordValidation = validatePassword(body.password, body.password_confirmation);

  const errors = {
    ...emailValidation.errors,
    ...passwordValidation.errors,
  };

  return {
    email: emailValidation.email,
    password: String(body.password || ''),
    errors,
  };
}

function validateLoginInput(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const errors = {};

  if (!email) {
    errors.email = 'Email wajib diisi.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Format email tidak valid. Contoh: user@example.com';
  }

  if (!password) {
    errors.password = 'Password wajib diisi.';
  }

  return { email, password, errors };
}

function validateProfileSetupInput(body) {
  const nameValidation = validateName(body.display_name || body.name);
  // Username tidak ditampilkan pada halaman ini; akun memakai username lama.
  const errors = { ...nameValidation.errors };

  return {
    name: nameValidation.name,
    username: String(body.username || '').trim().toLowerCase(),
    errors,
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  validateRegisterInput,
  validateLoginInput,
  validateProfileSetupInput,
  EMAIL_REGEX,
  USERNAME_REGEX,
  PASSWORD_MIN_LENGTH,
};
