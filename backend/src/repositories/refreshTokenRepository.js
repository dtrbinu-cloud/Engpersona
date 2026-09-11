const db = require('../database/db');
const { nowIso } = require('../utils/date');
const create = (userId, tokenHash, expiresAt) => db.run('INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES (:user_id,:token_hash,:expires_at,:created_at)', { ':user_id':userId, ':token_hash':tokenHash, ':expires_at':expiresAt, ':created_at':nowIso() });
const activeByHash = (tokenHash) => db.get("SELECT * FROM refresh_tokens WHERE token_hash=:token_hash AND revoked_at IS NULL AND julianday(expires_at) > julianday('now')", { ':token_hash':tokenHash });
const revoke = (id) => db.run('UPDATE refresh_tokens SET revoked_at=:revoked_at WHERE id=:id', { ':id':id, ':revoked_at':nowIso() });
module.exports = { create, activeByHash, revoke };
