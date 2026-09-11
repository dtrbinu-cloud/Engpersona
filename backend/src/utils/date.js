function nowIso() { return new Date().toISOString(); }
function localDateOnly() { return nowIso().slice(0, 10); }
function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function updateStreak(user) {
  if (!user.last_login) return 1;
  const last = new Date(user.last_login);
  if (Number.isNaN(last.valueOf())) return Number(user.streak || 0);
  const days = Math.floor((startOfDay(new Date()) - startOfDay(last)) / 86400000);
  return days >= 1 ? Number(user.streak || 0) + 1 : Number(user.streak || 0);
}
module.exports = { nowIso, localDateOnly, updateStreak };
