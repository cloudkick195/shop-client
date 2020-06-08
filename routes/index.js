var express = require('express');
var router = express.Router();
const { shopIndex, productSearch, searchPage, salePage } = require('./../services/home.service');
const { getPrivacyPolicyBySlug } = require('./../services/privacy-policy.service');

/* GET home page. */
router.get('/', shopIndex);
router.get('/search', searchPage);
router.get('/giam-gia', salePage);
router.get('/page/:slug', getPrivacyPolicyBySlug);
router.post('/search', productSearch);


router.get('/home', function (req, res, next) {
    res.render('home/home.pug', { title: 'Shop 160', description: 'hiih', list: [{ title: 'Bai viet 1', view: 2 }, { title: 'Bai viet 2', view: 3 }] });
});

module.exports = router;
