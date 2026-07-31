function requireAuth(req, res, next) {
  if (!req.user) {
    req.flash('status', 'Silakan login dulu.');
    return res.redirect('/login');
  }

  return next();
}

function requireGuest(req, res, next) {
  if (req.user) {
    return res.redirect('/dashboard');
  }

  return next();
}

module.exports = {
  requireAuth,
  requireGuest,
};
