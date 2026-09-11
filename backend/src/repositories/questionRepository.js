const db = require('../database/db');
const byId = (id) => db.get('SELECT * FROM questions WHERE id = :id', { ':id': id });
const idsFor = (difficulty, stage) => db.all('SELECT id FROM questions WHERE difficulty=:difficulty AND stage=:stage ORDER BY RANDOM()', { ':difficulty':difficulty, ':stage':stage }).map(({id}) => Number(id));
const randomIds = () => db.all('SELECT id FROM questions ORDER BY RANDOM()').map(({id}) => Number(id));
module.exports = { byId, idsFor, randomIds };
