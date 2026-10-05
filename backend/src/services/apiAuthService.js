const bcrypt = require('bcryptjs');
const users = require('../repositories/userRepository');
const refreshTokens = require('../repositories/refreshTokenRepository');
const userResource = require('../resources/userResource');
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshExpiry,
} = require('./tokenService');
const jwtConfig = require('../config/jwt');

async function issueTokens(user) {
  const refreshToken = createRefreshToken();
  await refreshTokens.create(user.id, hashRefreshToken(refreshToken), refreshExpiry());

  return {
    refreshToken,
    payload: {
      accessToken: createAccessToken(user),
      tokenType: 'Bearer',
      expiresIn: jwtConfig.accessExpiresIn,
      user: userResource(user),
    },
  };
}

async function register(username, email, password) {
  await users.create({ username, email, password: await bcrypt.hash(password, 10) });
  return users.byUsername(username);
}

function usernameExists(username) {
  return Boolean(users.byUsername(username));
}

async function authenticate(username, password) {
  const user = users.byUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) return null;
  return user;
}

async function refresh(rawToken) {
  const stored = refreshTokens.activeByHash(hashRefreshToken(rawToken));
  if (!stored) return null;

  await refreshTokens.revoke(stored.id);
  const user = users.byId(stored.user_id);
  return user ? issueTokens(user) : null;
}

async function revoke(rawToken) {
  const stored = refreshTokens.activeByHash(hashRefreshToken(rawToken));
  if (stored) await refreshTokens.revoke(stored.id);
}

module.exports = { authenticate, issueTokens, refresh, register, revoke, usernameExists };
