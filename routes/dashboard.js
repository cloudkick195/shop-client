var express = require('express');
var router = express.Router();
const { authenticationMiddlware } = require('./../middlewares/authentication.middleware');

router.get('/', authenticationMiddlware, function (req, res) {
    res.json({ user: req.session.user });
});

module.exports = router;
