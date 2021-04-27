const logger = require('./../utils/logger');
const { formatWithCommas } = require('./../helpers/currency.helper');
const { createImagePath } = require('./../helpers/file.helper');
const { getCookieCart, getCookieCartForTemplate } = require('./../helpers/cart.helper');
const { CartConstant } = require('./../constants/cart.constant');
const { 
    getProductInCart,
    getProductHaveAttributeInCart,
    getAttributeProductInCart
} = require('./../repositories/product.repo');

const getCart = async (req, res) => {
    try { 
       
        return res.cRender('cart.pug', { title: 'Cart', cart: getCookieCartForTemplate(req, res), formatWithCommas: formatWithCommas });
    } catch (error) {
        logger.error(error);
    }
}

const getCartPartial = async (req, res) => {
    try { 
        if(!req.cookies.cart) 
            return res.status(200).json({ message: 'Hiện chưa có sản phẩm', totalCartItems: {}});

        const getCart = getCookieCart(req, res);
        
        return res.status(200).json({ totalCartItems: getCart});
    } catch (error) {
        logger.error(error);
    }
}


const addToCart = async (req, res) => {
    try { 
        let productQuantity = req.body.productQuantity ? parseInt(req.body.productQuantity) : 1;
        let productId = req.body.productId ? parseInt(req.body.productId) : -1;
        let combinationId = req.body.combinationId ? parseInt(req.body.combinationId) : -1;

        // If maxQuantity set, ensure the quantity doesn't exceed that value
        if(CartConstant.maxQuantity && productQuantity > CartConstant.maxQuantity) 
            return res.status(400).json({ message: 'The quantity exceeds the max amount. Please contact us for larger orders.' });
        
        // Don't allow negative quantity
        if(productQuantity < 1) productQuantity = 1;

        const listQueries = [
            getProductInCart(productId),
            getAttributeProductInCart(combinationId)
        ];

        const result = await Promise.all(listQueries);
        let product = result[0];
        
        if(!product[0]){
            return res.status(400).json({ message: 'There was an error updating the cart'});
        }
        
        if(product[1]){
            const findProductAttribute = product.find(x => x.combination_id === combinationId);
            if(!findProductAttribute) return res.status(400).json({ message: 'Không tìm thấy loại sản phẩm'});
            product = findProductAttribute;
            product.count = findProductAttribute.AttributeCount;
        }else{
            product = product[0];
        }
        
        product['options'] = result[1];

        if(!product.count || product.count < 1) {
            return res.status(400).json({ message: 'Sản phẩm hết hàng'});
        }

        let reqCookiesCart = { items: {} };

        if(req.cookies.cart) 
            reqCookiesCart = JSON.parse(req.cookies.cart);

        const getCart = mapDataProductInCart(reqCookiesCart, productQuantity, product);
        

        if(getCart.errMsg) return res.status(400).json({ message: getCart.errMsg});
        
        res.clearCookie('cart');
        res.cookie('cart', JSON.stringify(getCart), {
            httpOnly: true,
            secure: false,
            maxAge: CartConstant.maxAge
        });

        return res.status(200).json({ message: 'Cart successfully updated', totalCartItems: getCart});

    } catch (error) {
        logger.error(error);
        res.clearCookie('cart');
        return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
    }
}

// Updates a single product quantity
const updateCart = async (req, res) => {
    try {
        let productQuantity = req.body.productQuantity ? parseInt(req.body.productQuantity) : 1;
        let productId = req.body.productId ? parseInt(req.body.productId.split("_")[1]) : -1;
        let combinationId = req.body.combinationId ? parseInt(req.body.combinationId) : -1;
        
        // If maxQuantity set, ensure the quantity doesn't exceed that value
        if(CartConstant.maxQuantity && productQuantity > CartConstant.maxQuantity) 
            return res.status(400).json({ message: 'Sản phẩm đặt quá với số lượng quy định là: ' +  CartConstant.maxQuantity});
        
        // Don't allow negative quantity
        if(productQuantity < 1) productQuantity = 1;

        let product = await getProductInCart(productId);
        
        if(!product[0]){
            return res.status(400).json({ message: 'Không tìm thấy sản phẩm'});
        }

        if(product[1]){
            const findProductAttribute = product.find(x => x.combination_id === combinationId);
            if(!findProductAttribute) return res.status(400).json({ message: 'Không tìm thấy loại sản phẩm'});
            product = findProductAttribute;
            product.count = findProductAttribute.AttributeCount;
        }else{
            product = product[0];
        }

        if(!product.count || product.count < 1) {
            return res.status(400).json({ message: 'Sản phẩm hết hàng'});
        }

        if(productQuantity > product.count){
            return res.status(400).json({ message: 'Mua tối đa ' + (product.count) + ' cái'});
        }


        if(productQuantity < 0){
            // quantity equals zero so we remove the item
            return res.status(400).json({ message: 'Sản phẩm không được nhỏ hơn 1' });
        }

        let cartCookie = getCookieCart(req, res);
        const cartItemId = req.body.productId;
        
        if(!cartCookie.items[cartItemId]){
            return res.status(400).json({ message: 'Không tồn tại sản phẩm trong bộ nhớ'});
        }
        
        res.clearCookie('cart');
        
        // Update the cart
        const productPrice = product.price_sale ? product.price_sale : product.price;
        
        cartCookie.total_qty = (cartCookie.total_qty - cartCookie.items[cartItemId].qty) + productQuantity;

        cartCookie.total_price = (cartCookie.total_price - (cartCookie.items[cartItemId].qty * cartCookie.items[cartItemId].price)) + (productQuantity * productPrice);
        cartCookie.items[cartItemId].qty = productQuantity;
       
        res.cookie('cart', JSON.stringify(cartCookie), {
            httpOnly: true,
            secure: false,
            maxAge: CartConstant.maxAge
        });
   
        return res.status(200).json({ message: 'Cart successfully updated', totalCartItems: cartCookie });
    } catch (error) {
        logger.error(error);
        res.clearCookie('cart');
        return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
    }
}

// Remove single product from cart
const removeCartItem = async (req, res) => {
    try {
        let productId = req.body.productId ? parseInt(req.body.productId.split("_")[1]) : -1;
        let combinationId = req.body.combinationId ? parseInt(req.body.combinationId) : -1;

        let cartCookie = getCookieCart(req, res);

        const cartItem = cartCookie.items[req.body.productId];
        if(!cartItem)
            return res.status(400).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });

        let product = await getProductInCart(productId);
        
        if(!product[0]){
            product[0] = cartCookie.items[req.body.productId];
        }

        if(product[1]){
            const findProductAttribute = product.find(x => x.combination_id === combinationId);
            if(!findProductAttribute) return res.status(400).json({ message: 'Không tìm thấy loại sản phẩm'});
            product = findProductAttribute;
            product.count = findProductAttribute.AttributeCount;
        }else{
            product = product[0];
        }
        
        const productPrice = product.price_sale ? product.price_sale : product.price;
        cartCookie.total_qty = cartCookie.total_qty - cartItem.qty;
        cartCookie.total_price = cartCookie.total_price - (cartItem.qty * productPrice); 

        delete cartCookie.items[req.body.productId];
        
        if(Object.keys(cartCookie.items).length < 1)
        {
            res.clearCookie('cart');
            return res.status(200).json({ message: 'Giỏ hàng trống' });
        }
    
        res.clearCookie('cart');
        res.cookie('cart', JSON.stringify(cartCookie), {
            httpOnly: true,
            secure: false,
            maxAge: CartConstant.maxAge
        });
        
        return res.status(200).json({ message: 'Cart successfully updated', totalCartItems: cartCookie });

    } catch (error) {
        logger.error(error);
        res.clearCookie('cart');
        return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
    }
}

const mapDataProductInCart= (preqCookiesCart, productQuantity, product) => {
        let reqCookiesCarts = preqCookiesCart;
        reqCookiesCarts.total_qty =  0;
        reqCookiesCarts.total_price = 0;
        reqCookiesCarts.errMsg = '';
        

        // if exists we add to the existing value
        let cartQuantity = 0;
        let productIdInCart = "_"+product.product_id;
        let options = '';
        if(product.combination_id){
            productIdInCart = productIdInCart + '_' + product.combination_id
            product.options.forEach(item => {
                options = options + ' / '+ item.entity_name;
            }); 
        }
        
        for(let [key, value] of Object.entries(reqCookiesCarts.items)){
            reqCookiesCarts.total_qty = reqCookiesCarts.total_qty + value.qty;
            reqCookiesCarts.total_price = reqCookiesCarts.total_price + value.qty * value.price;
        }
        
        if(reqCookiesCarts.items[productIdInCart]){
            cartQuantity = parseInt(reqCookiesCarts.items[productIdInCart].qty) + productQuantity;
            
            if(cartQuantity > product.count){
                reqCookiesCarts.errMsg = 'Mua thêm tối đa ' + (product.count - reqCookiesCarts.items[productIdInCart].qty) + ' cái';
                return reqCookiesCarts;
            }

            reqCookiesCarts.items[productIdInCart].qty = cartQuantity;

        }else{
            
            if(productQuantity > product.count){
                reqCookiesCarts.errMsg = 'Mua tối đa ' + (product.count) + ' cái';
                return reqCookiesCarts;
            }
            cartQuantity = productQuantity;
            reqCookiesCarts.items[productIdInCart] = {
                id: product.product_id,
                name: product.name,
                slug: product.slug,
                combinationId: product.combination_id,
                price: product.price_sale ? product.price_sale : product.price,
                qty: productQuantity,
                oldPrice: product.price,
                avatar: createImagePath({
                    process_key: product.process_key, 
                    path: product.path, 
                    file_name: product.file_name, 
                    version: product.version
                }),
                options: options.substring(3)
            };

            
        }  

        reqCookiesCarts.total_qty = reqCookiesCarts.total_qty + productQuantity;
        reqCookiesCarts.total_price = reqCookiesCarts.total_price + productQuantity * reqCookiesCarts.items[productIdInCart].price;

        return reqCookiesCarts;
}

module.exports = { 
    addToCart,
    updateCart,
    removeCartItem,
    getCart,
    getCartPartial

};