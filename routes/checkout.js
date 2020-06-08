const express = require('express');
const router = express.Router();
const { 
    redirectCart,
    checkout,
    postCheckout,
    payment,
    checkoutLocation,
    thankYou
} = require('./../services/checkout.service');


router.get('/', redirectCart);
router.get('/:token', checkout);
router.get('/:token/form_update_location', checkoutLocation);
router.get('/:token/thank_you', thankYou);
router.post('/', postCheckout);
router.post('/:token/payment', payment);


module.exports = router;