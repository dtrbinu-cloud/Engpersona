function requireAuth(req,res,next) { if(!req.user) { req.flash('status','Silakan login dulu.'); return res.redirect('/login'); } return next(); }
function requireGuest(req,res,next) { return req.user ? res.redirect('/dashboard') : next(); }
module.exports = { requireAuth, requireGuest };
