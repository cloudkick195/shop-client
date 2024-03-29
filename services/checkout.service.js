require('dotenv').config({ override: true });
const axios = require('axios');
const qs = require('qs');
const jwt_decode = require('jwt-decode');
const { requestValidate, setNullVal} = require('./../utils/validators/request.validate');
const logger = require('./../utils/logger');
const { CartConstant } = require('./../constants/cart.constant');
const { getListSlidesHome } = require('./../repositories/main-slide.repo');
const { getProductByKeyValue } = require('../repositories/product.repo');
const {  
    getProductInCart,
    getProductInCartByCustomerVip,
    getNewArrivals, 
    getListSaleOff } = require('./../repositories/product.repo');

const {  
    findUserByEmail } = require('./../repositories/customer.repo');
const nodemailerConfig = require('./../configs/nodemailer.config');
const Email = require('email-templates');
const { createImagePath } = require('./../helpers/file.helper');
const { formatWithCommas } = require('./../helpers/currency.helper');
const { sendEmail,sendTransporter } = require('./../helpers/nodemailer.helper');
const { createNewTokenKiotviet } = require('./../helpers/jwt.helper');

const { getAllProvince, getDistricts, getWards, getLocation } = require('./../repositories/location.repo');
const { getAllShipping, getAllPayment, getShipping } = require('./../repositories/config-shipping.repo');
const { getListFeedback } = require('./../repositories/feedback.repo');
const { 
    createOrder, 
    getTokenOrder,
    getOrderByToken } = require('./../repositories/order.repo');
const { createOrdersDetail } = require('./../repositories/order-detail.repo');
const { getCookieCart, getCookieCartForTemplate } = require('./../helpers/cart.helper');
const jwt = require('jsonwebtoken');
const { createApiKiotviet, createOrderApiKiotviet, getApiKiotviet } = require('../utils/apiKiotviet');

const { getSales } = require('./../repositories/sale.repo');

const {
    convertSales,
    checkProductSale
} = require('./../utils/checkProductSale');


const redirectCart = (req, res) => {
    return res.redirect('/cart');
}

const hanldingShipping = (shippings, data) =>{
    const shippingPrice = {};
    for (let valS of shippings) {
        if (handleFunctionShipping[valS.key]) {
            const shippingValue = handleFunctionShipping[valS.key](valS.value, data);
            
            if(shippingValue && (!shippingPrice.hasOwnProperty(valS.type) || shippingPrice[valS.type] > valS.price)){
                shippingPrice[valS.type] = valS.price;
            }
        }
    }
    if(!Object.keys(shippingPrice)[0]) shippingPrice['normal'] = 0;
    
    return shippingPrice
}

const handleFunctionShipping = {
    default: (value) => value,
    total: (value, data) => data.total && data.total >= parseInt(value) ? true : false,
    province: (value, data) => value == 0 ? true : data.location.province && data.location.province == value ? true : false,
    district: (value, data) => data.location.district && data.location.district == value ? true : false,
    ward: (value, data) => data.location.ward && data.location.ward == value ? true : false,
    product: (value, data) => {
        return value == 0 ? true : false
    }
}


const checkout = async (req, res) => {
    try {
        const token = req.params.token;
        
        const tokenSign = token.split('.')[2];
        const listQuery = [
            getAllProvince(), 
            getAllPayment(),
            getTokenOrder(tokenSign),
        ];
            
        let customer = null;
        const cart = getCookieCartForTemplate(req, res);
        if(!req.user) {
            listQuery.push(checkDataInCart(cart, res));
        }else{
            customer = await findUserByEmail(req.user.email);
            if(!customer || !customer.isVip() )
                listQuery.push(checkDataInCart(cart, res));
            else
                listQuery.push(checkDataInCartCustomerVip(cart, res));
        }

        const results = await Promise.all(listQuery);
        
        if(results[2])
            return res.redirect(`/checkout/${token}/thank_you`);

        if(!req.cookies.cart){
            return res.redirect('/cart');
        }

        jwt.verify(token, process.env.CHECKOUT_SECRET || 'CHECKOUTCLOUDKICK892',function(err) {
            if(err){
                return res.redirect('/cart');
            }
        })

        
        
        
        const {getCookiesCart, checkHaveNotExitsProduct} = results[3];
        if(checkHaveNotExitsProduct){
            res.clearCookie('cart');
            res.cookie('cart', JSON.stringify(getCookiesCart), {
                httpOnly: true,
                secure: false,
                maxAge: CartConstant.maxAge
            });
            return res.redirect('/cart');
        }
        
        
        if(!results[1][0]){
            results[1][0] = {
                key: 'receive',
                value: 'Thanh toán khi giao hàng (COD)',
                description: 'Bạn cần thanh toán cho nhân viên giao hàng khi nhận được hàng'
            }
        }

        return res.cRender('checkout.pug', { 
            title: 'Cart', 
            cart: getCookiesCart, 
            user: customer,
            provinces: results[0],
            shipping_price: 0, 
            payments: results[1],
            formatWithCommas: formatWithCommas 
        });
    } catch (error) {
        logger.error(error);
        return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
    }
}

const checkoutLocation = async (req, res) => {
    try {

        if(!req.cookies.cart){
            return res.redirect('/cart');
        }
        const token = req.params.token;
        jwt.verify(token, process.env.CHECKOUT_SECRET || 'CHECKOUTCLOUDKICK892',function(err) {
            if(err){
                return res.redirect('/cart');
            }
        })
        if(!req.query.customer_shipping_province || req.query.customer_shipping_province == 'null'){
            return res.status(200).json({ 
                districts: null
            });
        }
            
        if(!req.query.customer_shipping_district || req.query.customer_shipping_district == 'null'){
            return res.status(200).json({ 
                districts: await getDistricts(req.query.customer_shipping_province)
            });
        }

        const locations = await Promise.all([getDistricts(req.query.customer_shipping_province), getWards(req.query.customer_shipping_district), getAllShipping()]);
        const getCookiesCart = JSON.parse(req.cookies.cart); 
        
        
        for(let district of locations[0]){
            if(district.districtid == req.query.customer_shipping_district){
                if(req.query.customer_shipping_ward && req.query.customer_shipping_ward != 'null'){
                    for(let ward of locations[1]){
                        if(ward.wardid == req.query.customer_shipping_ward){
                            const shippings = hanldingShipping(locations[2], 
                                { 
                                    products: getCookiesCart.items,
                                    location: {province: req.query.customer_shipping_province, district: req.query.customer_shipping_district, ward: req.query.customer_shipping_ward},
                                    total: getCookiesCart.total_price
                                }
                            );
                            
                            return res.status(200).json({ 
                                ward: req.query.customer_shipping_ward,
                                shippings: shippings,
                                cartTotal: getCookiesCart.total_price
                            });
                        }
                    }
                }

                const shippings = hanldingShipping(locations[2], 
                    { 
                        products: getCookiesCart.items,
                        location: {
                            province: req.query.customer_shipping_province, 
                            district: req.query.customer_shipping_district, 
                            ward: req.query.customer_shipping_ward
                        },
                        total: getCookiesCart.total_price
                    }
                );
                return res.status(200).json({ 
                    wards: locations[1],
                    shippings: shippings,
                    cartTotal: getCookiesCart.total_price
                });
            }
        }

        return res.status(200).json({ 
            districts: locations[0]
        });
            

    } catch (error) {
        logger.error(error);
        return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
    }
}

const checkDataInCart = async (preqCookiesCart, res) => {

    let reqCookiesCarts = { ...preqCookiesCart };
    reqCookiesCarts.total_qty =  0;
    reqCookiesCarts.total_price = 0;

    let arrId = {};
    const arrQueryProduct = [];
    
    for(let keyCookieItem in reqCookiesCarts.items){
        if(reqCookiesCarts.items[keyCookieItem]['qty'] < 1) continue;
        if(!arrId[reqCookiesCarts.items[keyCookieItem]['id']]){
            arrQueryProduct.push( getProductInCart(reqCookiesCarts.items[keyCookieItem]['id']));
        }
        arrId[reqCookiesCarts.items[keyCookieItem]['id']] = reqCookiesCarts.items[keyCookieItem]['id'];
    }
    
    const getArrProduct = await Promise.all(arrQueryProduct);
    let sales = await getSales();
    if(sales && sales.length > 0){
        sales = convertSales(sales);
    }
    
    //Create object from 1-dimensional array Query product
    let objProducts = {};
    for(let valArrProduct of getArrProduct){
        for(let valP of valArrProduct){
            let objKeyProduct = "_" + valP.product_id;
            if(valP.combination_id){
                objKeyProduct = "_" + valP.product_id + "_" + valP.combination_id;
            }
            checkProductSale(valP, sales);
            objProducts[objKeyProduct] = valP;
        }
    }
    
    let checkHaveNotExitsProduct;
    for(let keyCookieItem in reqCookiesCarts.items){
        // check product is exist, combinationId exits, cookie product count < query product count
        if(
            !objProducts[keyCookieItem] || 
            reqCookiesCarts.items[keyCookieItem].id != objProducts[keyCookieItem].product_id ||
            reqCookiesCarts.items[keyCookieItem].combinationId != objProducts[keyCookieItem].combination_id || 
            (objProducts[keyCookieItem].AttributeCount && reqCookiesCarts.items[keyCookieItem].qty > objProducts[keyCookieItem].AttributeCount) ||
            (!objProducts[keyCookieItem].AttributeCount && reqCookiesCarts.items[keyCookieItem].qty > objProducts[keyCookieItem].count)
        ){
            checkHaveNotExitsProduct = true;
            delete reqCookiesCarts.items[keyCookieItem];
        }else{
         
            
            reqCookiesCarts.items[keyCookieItem] = {
                id: objProducts[keyCookieItem].product_id,
                name: objProducts[keyCookieItem].name,
                slug: objProducts[keyCookieItem].slug,
                combinationId: objProducts[keyCookieItem].combination_id,
                combinationSku: objProducts[keyCookieItem].combination_sku,
                price: objProducts[keyCookieItem].price_sale ? 
                    objProducts[keyCookieItem].price_sale :
                    objProducts[keyCookieItem].price,
                qty: reqCookiesCarts.items[keyCookieItem].qty,
                oldPrice: objProducts[keyCookieItem].price,
                avatar: createImagePath({
                    process_key: objProducts[keyCookieItem].process_key, 
                    path: objProducts[keyCookieItem].path, 
                    file_name: objProducts[keyCookieItem].file_name, 
                    version: objProducts[keyCookieItem].version
                }),
                options: reqCookiesCarts.items[keyCookieItem].options
            }

            
            
            reqCookiesCarts.total_qty = reqCookiesCarts.total_qty + reqCookiesCarts.items[keyCookieItem].qty;
            
            reqCookiesCarts.total_price = reqCookiesCarts.total_price + reqCookiesCarts.items[keyCookieItem].qty * reqCookiesCarts.items[keyCookieItem].price;
            
        }
    }
    
    return {
        getCookiesCart: reqCookiesCarts,
        checkHaveNotExitsProduct: checkHaveNotExitsProduct
    }

}

const checkDataInCartCustomerVip = async (preqCookiesCart, res) => {
    
    let reqCookiesCarts = { ...preqCookiesCart };
    reqCookiesCarts.total_qty =  0;
    reqCookiesCarts.total_price = 0;

    let arrId = {};
    const arrQueryProduct = [];
    
    for(let keyCookieItem in reqCookiesCarts.items){
        if(reqCookiesCarts.items[keyCookieItem]['qty'] < 1) continue;
        if(!arrId[reqCookiesCarts.items[keyCookieItem]['id']]){
            arrQueryProduct.push( getProductInCartByCustomerVip(reqCookiesCarts.items[keyCookieItem]['id'], reqCookiesCarts.items[keyCookieItem]['qty']));
        }
        arrId[reqCookiesCarts.items[keyCookieItem]['id']] = reqCookiesCarts.items[keyCookieItem]['id'];
    }
    
    const getArrProduct = await Promise.all(arrQueryProduct);
    
    //Create object from 1-dimensional array Query product
    let objProducts = {};
    for(let valArrProduct of getArrProduct){
        for(let valP of valArrProduct){
            let objKeyProduct = "_" + valP.product_id;
            if(valP.combination_id){
                objKeyProduct = "_" + valP.product_id + "_" + valP.combination_id;
            }
            objProducts[objKeyProduct] = valP;
        }
    }
    
    let checkHaveNotExitsProduct;
    for(let keyCookieItem in reqCookiesCarts.items){
        // check product is exist, combinationId exits, cookie product count < query product count
        if(
            !objProducts[keyCookieItem] || 
            reqCookiesCarts.items[keyCookieItem].id != objProducts[keyCookieItem].product_id ||
            reqCookiesCarts.items[keyCookieItem].combinationId != objProducts[keyCookieItem].combination_id || 
            (objProducts[keyCookieItem].AttributeCount && reqCookiesCarts.items[keyCookieItem].qty > objProducts[keyCookieItem].AttributeCount) ||
            (!objProducts[keyCookieItem].AttributeCount && reqCookiesCarts.items[keyCookieItem].qty > objProducts[keyCookieItem].count)
        ){
            checkHaveNotExitsProduct = true;
            delete reqCookiesCarts.items[keyCookieItem];
        }else{
         
            
            reqCookiesCarts.items[keyCookieItem] = {
                id: objProducts[keyCookieItem].product_id,
                name: objProducts[keyCookieItem].name,
                slug: objProducts[keyCookieItem].slug,
                combinationId: objProducts[keyCookieItem].combination_id,
                combinationSku: objProducts[keyCookieItem].combination_sku,
                price: objProducts[keyCookieItem].discount ? objProducts[keyCookieItem].discount : objProducts[keyCookieItem].price,
                qty: reqCookiesCarts.items[keyCookieItem].qty,
                oldPrice: objProducts[keyCookieItem].price,
                avatar: createImagePath({
                    process_key: objProducts[keyCookieItem].process_key, 
                    path: objProducts[keyCookieItem].path, 
                    file_name: objProducts[keyCookieItem].file_name, 
                    version: objProducts[keyCookieItem].version
                }),
                options: reqCookiesCarts.items[keyCookieItem].options
            }

            
            
            reqCookiesCarts.total_qty = reqCookiesCarts.total_qty + reqCookiesCarts.items[keyCookieItem].qty;
            reqCookiesCarts.total_price = reqCookiesCarts.total_price + reqCookiesCarts.items[keyCookieItem].qty * reqCookiesCarts.items[keyCookieItem].price;
        
        }
    }
    
    return {
        getCookiesCart: reqCookiesCarts,
        checkHaveNotExitsProduct: checkHaveNotExitsProduct
    }

}

const postCheckout = async (req, res) => {
    try {
        // if there is no items in the cart then render a failure
        
        if(!req.cookies.cart){
            res.status(400).json({ message: 'Giỏ hàng trống'});
        }
        const cart = Object.keys(getCookieCart(req, res).items);
        const token = jwt.sign({cart: cart}, process.env.CHECKOUT_SECRET || 'CHECKOUTCLOUDKICK892', { expiresIn: 172800 });
        var { exp } = jwt_decode(process.env.KIOTVIET_ACCESS_TOKEN);
        if (Date.now() >= exp * 1000) {
            await createNewTokenKiotviet();
        }
        
        return res.status(200).json({ token: token});
    } catch (error) {
        logger.error(error);
        res.clearCookie('cart');
        return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
    }
}

const payment = async (req, res) => {
    try {
        const token = req.params.token;
        
        if(!token || !req.cookies.cart){
            return res.status(400).json({ message: 'Không tồn tại giỏ hàng, vui lòng load lại trang', url: '/cart'});
        }
        const objPayment = JSON.parse(JSON.stringify(req.body)); 
        const data = {
            'full-name_field': objPayment['billing_address[full_name]'].trim(),
            'phone_field': objPayment['billing_address[phone]'].trim(),
            'address1_field': objPayment['billing_address[address1]'].trim(),
            'province_field': objPayment['customer_shipping_province'],
            'district_field': objPayment['customer_shipping_district'],
            'ward_field': objPayment['customer_shipping_ward'],
            'shipping_field': objPayment['shipping_rate_id'],
            'payment_field': objPayment['payment_method_id'],
            'note': objPayment['note']
        }
        const validation = {
            'full-name_field': ['required: Vui lòng nhập họ tên'],
            'phone_field': ['required: Số điện thoại không được trống', 'phone'],
            'address1_field': ['required: Địa chỉ không được trống'],
            'province_field': ['required: Vui lòng chọn tỉnh thành'],
            'district_field': ['required: Vui lòng chọn quận huyện'],
            'ward_field': ['required: Vui lòng chọn phường xã'],
            'shipping_field': ['required'],
            'payment_field': ['required']     
        }


        const validates = requestValidate(validation, data);
        if (!validates.success) {
            return res.status(400).json({ errors: validates.errors});
        }

       
        jwt.verify(token, process.env.CHECKOUT_SECRET || 'CHECKOUTCLOUDKICK892',function(err) {
            if(err){
                return res.status(400).json({ message: 'Không xác thực được, vui lòng load lại trang', url: '/cart'});
            }
        });
        const tokenSign = token.split('.')[2];
        data['tracking_token'] = tokenSign;
        
        const cart = getCookieCart(req, res);
        const listQuery = [
            null, 
            getLocation(data.province_field, data.district_field, data.ward_field),
            getShipping(data.shipping_field)
        ]

        let customer = null;
        if(!req.user) {
            listQuery[0] = checkDataInCart(cart, res);
        }else{
            customer = await findUserByEmail(req.user.email);
            if(!customer || !customer.isVip() )
                listQuery[0] = checkDataInCart(cart, res);
            else
                listQuery[0] = checkDataInCartCustomerVip(cart, res);
        }

        const results = await Promise.all(listQuery);

        
        if(results[0].checkHaveNotExitsProduct){
            res.clearCookie('cart');
            res.cookie('cart', JSON.stringify(results[0].getCookiesCart), {
                httpOnly: true,
                secure: false,
                maxAge: CartConstant.maxAge
            });
            return res.status(400).json({ message: 'Vui lòng thực hiện lại', url: '/cart'});
        }
        const locationFull = results[1];
        if(!locationFull) {
            res.status(400).json({ message: 'Vui lòng thực hiện load lại trang', url: '/checkout/' + req.params.token});
        }
        const getCookiesCart = results[0].getCookiesCart; 
        
        const shippings = hanldingShipping(
            results[2], 
            { 
                products: getCookiesCart.items,
                location: {
                    province: data.province_field, 
                    district: data.district_field, 
                    ward: data.ward_field
                },
                total: getCookiesCart.total_price
            }
        );
        data['ship_price'] = Object.values(shippings)[0]
        setNullVal(data, ['customer_id', 'discount', 'order_description', 'ship_date'])
        
        const transac = await db.sequelize.transaction({autocommit: false});
        try {
            const newOrder = await createOrder(data, transac);
            const addressFull = `${data['address1_field']}, ${locationFull.name}, ${locationFull.District.name}, ${locationFull.District.Province.name}`;
            const dataCustomer = {
                branchId: process.env.BRANCH_ID,
                name: data['full-name_field'],
                contactNumber: data['phone_field'],
                address: addressFull,
                code: `KH${data['phone_field']}`,
                comment: 'test'
            }
            const dataOrderDetail = [];
            const productForKiotviet = [];
            const dataDetail = getCookiesCart.items;
            for (const itemDetail in dataDetail) {
                dataOrderDetail.push(
                    {
                        order_id: newOrder.order_id,
                        product_id: dataDetail[itemDetail].id,
                        combination_id: dataDetail[itemDetail].combinationId,
                        qty: dataDetail[itemDetail].qty,
                        product_price: dataDetail[itemDetail].price,
                        product_old_price: dataDetail[itemDetail].oldPrice,
                        product_name: dataDetail[itemDetail].name,
                        product_option: dataDetail[itemDetail].options,
                        avatar: dataDetail[itemDetail].avatar,
                    }
                )
                productForKiotviet.push(
                   {
                        productCode: dataDetail[itemDetail].combinationSku,
                        productName: dataDetail[itemDetail].name,
                        quantity: dataDetail[itemDetail].qty,
                        price: dataDetail[itemDetail].price
                   }
                );
            }
            
            const url = `${process.env.KIOTVIET_PUBLIC_API}/customers`
            const urlCheckPhone = `${process.env.KIOTVIET_PUBLIC_API}/customers?contactNumber=${data['phone_field']}`;
            const resultOrder = await Promise.all([
                getApiKiotviet(urlCheckPhone),
                createOrdersDetail(dataOrderDetail, transac)
            ]);
        
            if(resultOrder[0].response && resultOrder[0].response.status == 401){
                await createNewTokenKiotviet();
                resultOrder[0] = await getApiKiotviet(urlCheckPhone);
            }
    
            
            

            const customerExistByPhone = resultOrder[0];
            const dataOrderKiotviet = {
                "branchId": parseInt(process.env.BRANCH_ID),
                "discount": data.discount,
                "description": data.note,
                "orderDelivery": {
                    "address": addressFull,
                    "price": data['ship_price'],
                    "receiver": data['full-name_field'],
                    "contactNumber": data['phone_field']
                },
                "orderDetails": productForKiotviet,
                "makeInvoice": true
            }
            if(customerExistByPhone.length === 0) {
                const dataCustomerSend = JSON.stringify(dataCustomer)
                // Create new customer to Kiotviet 
                console.log('Create new Customer Kiotviet');
                const newCustomerKiotviet = await createApiKiotviet(url, dataCustomerSend)

                dataOrderKiotviet['customer'] = {   
                    "id": newCustomerKiotviet.id,
                    "code": newCustomerKiotviet.code
                }
     
            } else {
                // Số điện thoại đã tồn tại trong hệ thống Kiotviet thì chỉ tạo đặt hàng
                dataOrderKiotviet['customer'] = {   
                    "id": customerExistByPhone[0].id,
                    "code": customerExistByPhone[0].code
                }

            }
            console.log('Create new order Kiotviet');
            const urlOrder = `${process.env.KIOTVIET_PUBLIC_API}/orders`
            const newOrderKiotviet = await createOrderApiKiotviet(urlOrder, dataOrderKiotviet);
            await transac.commit();


            res.clearCookie('cart');

            const order = await getOrderByToken(token.split('.')[2]);

            if(!order)
                return res.redirect('/');

            
            const orderCart = {
                items: [],
                total_qty: 0,
                total_price: 0,
            }

            for (let val of order.OrderDetail) {
                orderCart.items.push(val.dataValues);
                orderCart.total_qty += val.dataValues.qty;
                orderCart.total_price += val.dataValues.price * val.dataValues.qty;
            }


            const email = new Email({
                preview: false,
                send: true,
                transport: sendTransporter()
            });

            email.send({
                template: 'order-success',
                message: {
                    from: `PAPAZI <${nodemailerConfig().gmail.emailAddress}>`,
                    to: `${nodemailerConfig().gmail.emailAddress}, ${nodemailerConfig().gmail.emailMoreAddress}`
                },
                locals: {
                    title: 'Cart',
                    cart: orderCart,
                    info: order,
                    shipping_price: order.ship_price,
                    formatWithCommas: formatWithCommas
                }
            });
            return res.status(200).json({ message: 'Đặt hàng thành công', url: `/checkout/${token}/thank_you`});
            
        } catch (error) {
            await transac.rollback();
            if(error.name == 'SequelizeUniqueConstraintError')
                return res.status(500).json({ message: 'Vui thực hiện lại thanh toán', url: '/cart'});
            throw error;
        }
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Vui lòng load lại trang và thực hiện lại', url: '/checkout/' + req.params.token});
    }
}

const thankYou = async (req, res) => {
    try {
        // if there is no items in the cart then render a failure

        const order = await getOrderByToken(req.params.token.split('.')[2]);

        if(!order)
            return res.redirect('/');

        const cart = {
            items: [],
            total_qty: 0,
            total_price: 0,
        }

        for (let val of order.OrderDetail) {
            cart.items.push(val.dataValues);
            cart.total_qty += val.dataValues.qty;
            cart.total_price += val.dataValues.price * val.dataValues.qty;
        }

        return res.cRender('thankyou.pug', {
            title: 'Cart',
            cart: cart,
            info: order,
            shipping_price: order.ship_price,
            formatWithCommas: formatWithCommas
        });
    } catch (error) {
        logger.error(error);
        return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
    }
}
// const thankYou = async (req, res) => {
//     try {
//         // if there is no items in the cart then render a failure
//
//         const order = await getOrderByToken(req.params.token.split('.')[2]);
//
//         if(!order)
//             return res.redirect('/');
//
//         const cart = {
//             items: [],
//             total_qty: 0,
//             total_price: 0,
//         }
//
//         for (let val of order.OrderDetail) {
//             cart.items.push(val.dataValues);
//             cart.total_qty += val.dataValues.qty;
//             cart.total_price += val.dataValues.price * val.dataValues.qty;
//         }
//
//         return res.render('home/html.pug', {
//             title: 'Cart',
//             cart: cart,
//             info: order,
//             shipping_price: order.ship_price,
//             formatWithCommas: formatWithCommas,
//
//         });
//     } catch (error) {
//         logger.error(error);
//         return res.status(400).json({ message: 'Vui lòng load lại trang và thực hiện lại'});
//     }
// }

module.exports = { redirectCart, checkout, postCheckout, payment,
    checkoutLocation,
    thankYou
};