module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    }
    req.flash('error', 'Please log in to access this page');
    res.redirect('/auth/login');
  },

  isAdmin: (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'admin') {
      return next();
    }
    req.flash('error', 'Access denied. Admins only.');
    res.redirect('/auth/login');
  },

  isAdvertiser: (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'advertiser') {
      return next();
    }
    req.flash('error', 'Access denied. Advertisers only.');
    res.redirect('/auth/login');
  },

  setLocals: (req, res, next) => {
    res.locals.currentUser = req.session.userId ? {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail,
      role: req.session.role
    } : null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
  }
};
