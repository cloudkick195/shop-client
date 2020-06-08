const express = require('express');
const router = express.Router();
const { productCategoryPage } = require('./../services/product-category.service');
const { productDetailPage,
    productSearch } = require('./../services/product.service');
router.get('/', function (req, res) {
    return res.json({ a: 2 });
})

router.get(`/:categorySlug`, productCategoryPage);

module.exports = router;
