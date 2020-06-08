const express = require('express');
const router = express.Router();
const { authenticationMiddlware, forwardAuthenticated } = require('../middlewares/authentication.middleware');
const requestMiddleware = require('../middlewares/request.middleware');
const passport = require('passport');
const url = require('../configs/account.config')();

const { 
    register,
    login,
    loginPage,
    registerPage,
    recover,
    recoverPage,
    reset,
    accountPage,
    update,
    orderPage,
    orderPageDetail
} = require('./../services/customer.service');

router.get('/', authenticationMiddlware, accountPage);
router.post('/update', authenticationMiddlware, update);
router.get('/orders', authenticationMiddlware, orderPage);
router.get('/orders/:id', authenticationMiddlware, orderPageDetail);
router.get('/login', forwardAuthenticated, loginPage);
router.get('/register', registerPage);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(url.login);
});
router.get('/recover', recoverPage);
router.get('/reset', (req, res) => {
  res.redirect(url.login);
});
router.post('/reset/:token/save', reset);
router.get('/reset/:token', recoverPage);
router.post('/recover', recover);
router.post('/login', (req, res, next) => {
    passport.authenticate('local-login', {
      successRedirect: url.account,
      failureRedirect: url.login,
      failureFlash: true
    })(req, res, next);
});

router.post('/register',register);

router.get('/auth/fb', passport.authenticate('facebook', {scope: ['email']}));
router.get('/auth/fb/cb', passport.authenticate('facebook', { successRedirect: url.account,
failureRedirect: url.login }));
router.get('/auth/gg', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/auth/gg/cb', passport.authenticate('google', { successRedirect: url.account,
failureRedirect: url.login }));
module.exports = router;