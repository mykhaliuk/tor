'use strict';

module.exports = {

  isLoggedIn: function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) return next();

    req.flash('loginMessage', '<i></i>Access is denied. Login or Signup.');
    res.redirect('/');
  }
};