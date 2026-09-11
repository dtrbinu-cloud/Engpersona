const db = require('../database/db');
const latest = (userId) => db.get('SELECT * FROM results WHERE user_id=:user_id ORDER BY id DESC LIMIT 1', { ':user_id':userId });
const byId = (id,userId) => db.get('SELECT * FROM results WHERE id=:id AND user_id=:user_id', { ':id':id, ':user_id':userId });
const list = (userId, limit=10, offset=0) => db.all('SELECT * FROM results WHERE user_id=:user_id ORDER BY id DESC LIMIT :limit OFFSET :offset', { ':user_id':userId, ':limit':limit, ':offset':offset });
const count = (userId) => Number(db.get('SELECT COUNT(*) AS total FROM results WHERE user_id=:user_id', { ':user_id':userId }).total);
module.exports = { latest, byId, list, count };
