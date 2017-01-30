'use strict';

//  ./routes/index.js
var util = require('../util');

module.exports = function (app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.pug', {
            notLoggedIn: !req.isAuthenticated(),
            loginMessage: req.flash('loginMessage'),
            signupMessage: req.flash('signupMessage')
        });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/todo', // Redirect to the secure profile section
        failureRedirect: '/', // Redirect back to the signup page if there is an error
        failureFlash: true }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/todo', // Redirect to the secure profile section
        failureRedirect: '/', // Redirect back to the signup page if there is an error
        failureFlash: true }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    app.get('/profile', util.isLoggedIn, function (req, res) {
        res.render('profile.pug', {
            username: req.user.local.name,
            user: req.user
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // HORLOGES ============================
    // =====================================
    app.get('/horloges', util.isLoggedIn, function (req, res) {
        res.render('horloges.pug', {
            username: req.user.local.name
        });
    });

    // =====================================
    // T O D O =============================
    // =====================================
    app.get('/todo', util.isLoggedIn, function (req, res) {
        res.render('todo.pug', {
            username: req.user.local.name
        });
    });
};