var express = require('express');
var router = express.Router();
const { resetCacheHeader } = require('../services/cache.service');

router.get('/', resetCacheHeader);

module.exports = router;
