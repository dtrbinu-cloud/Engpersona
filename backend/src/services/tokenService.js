const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

function createAccessToken(user) { return jwt.sign({ sub: String(user.id), username: user.username }, config.accessSecret, { expiresIn: config.accessExpiresIn }); }
function verifyAccessToken(token) { return jwt.verify(token, config.accessSecret); }
function createRefreshToken() { return crypto.randomBytes(48).toString('base64url'); }
function hashRefreshToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function refreshExpiry() { const date = new Date(); date.setDate(date.getDate() + config.refreshDays); return date.toISOString(); }
module.exports = { createAccessToken, verifyAccessToken, createRefreshToken, hashRefreshToken, refreshExpiry };
