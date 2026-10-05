function serializeCookie(name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  }
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);

  return parts.join('; ');
}

function setCookie(res, name, value, options) {
  res.append('Set-Cookie', serializeCookie(name, value, options));
}

function clearCookie(res, name, options = {}) {
  setCookie(res, name, '', { ...options, maxAge: 0 });
}

module.exports = { clearCookie, serializeCookie, setCookie };
