module.exports = {
  secret: process.env.SESSION_SECRET || 'engpersona-secret',
  resave: false,
  saveUninitialized: false,
};
