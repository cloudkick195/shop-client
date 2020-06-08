const express = require('express');
const router = express.Router();
const { 
    addToCart,
    updateCart,
    removeCartItem,
    getCart,
    getCartPartial
} = require('./../services/cart.service');

router.get('/', getCart);
router.get('/cartpartial', getCartPartial);
router.post('/add', addToCart);
router.post('/updatecart', updateCart);
router.post('/removecartitem', removeCartItem);

module.exports = router;