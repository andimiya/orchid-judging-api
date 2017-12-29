const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    username = null;
    return res.redirect('/login');
  }
  return next();
};

module.exports = isAuthenticated;
