var express = require('express');
var router = express.Router();

const { login } = require('./../services/user.service');

/* GET users listing. */
router.get('/login', function (req, res) {
    res.cRender('auth/login.pug', { message: req.flash('error_messages') });
});

router.post('/login', login);

module.exports = router;
