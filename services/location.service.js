const logger = require('./../utils/logger');
const { formatWithCommas } = require('./../helpers/currency.helper');
const { createImagePath } = require('./../helpers/file.helper');
const { getCookieCart } = require('./../helpers/cart.helper');
const { CartConstant } = require('./../constants/cart.constant');
const { 
    getAllProvince
} = require('./../repositories/location.repo');

const getCart = async (req, res) => {
    try { 
        return res.cRender('cart.pug', { title: 'Cart', cart: getCookieCart(req), formatWithCommas: formatWithCommas });
    } catch (error) {
        logger.error(error);
    }
}

module.exports = { 
    addToCart,
    updateCart,
    removeCartItem,
    getCart

};