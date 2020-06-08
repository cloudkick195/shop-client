const express = require('express');
const router = express.Router();
const { productCategoryPage } = require('./../services/product-category.service');
const { productDetailPage,productsPage,
    productSearch } = require('./../services/product.service');
router.get('/', productsPage)
router.get('/:slug', productDetailPage);

module.exports = router;
