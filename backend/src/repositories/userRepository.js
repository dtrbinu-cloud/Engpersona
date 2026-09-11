const db = require('../database/db');
const { nowIso } = require('../utils/date');
const byId = (id) => db.get('SELECT * FROM users WHERE id = :id', { ':id': id });
const byUsername = (username) => db.get('SELECT * FROM users WHERE username = :username', { ':username': username });
const create = (data) => db.run(`INSERT INTO users (username,password,name,email,xp,level,streak,last_login,created_at,updated_at) VALUES (:username,:password,:name,:email,0,1,1,:last_login,:created_at,:updated_at)`, { ':username':data.username, ':password':data.password, ':name':data.name || data.username, ':email':data.email || `${data.username}@engpersona.local`, ':last_login':nowIso(), ':created_at':nowIso(), ':updated_at':nowIso() });
const update = (id, data) => db.run(`UPDATE users SET username=COALESCE(:username,username), name=COALESCE(:name,name), email=COALESCE(:email,email), avatar=COALESCE(:avatar,avatar), spotify_playlist_url=COALESCE(:playlist,spotify_playlist_url), password=COALESCE(:password,password), updated_at=:updated_at WHERE id=:id`, { ':id':id, ':username':data.username||null, ':name':data.name||null, ':email':data.email||null, ':avatar':data.avatar||null, ':playlist':data.playlist||null, ':password':data.password||null, ':updated_at':nowIso() });
module.exports = { byId, byUsername, create, update };
