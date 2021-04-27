const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');

const createOrder = async (data, transac) => {
    try {
        const { model } = db;
        
        return model.Order.create(
            { 
                customer_id: data.customer_id,
                ship_type: data.shipping_field,
                ship_payment: data.payment_field,
                ship_address: data.address1_field,
                ship_price: data.ship_price,
                ship_date: data.ship_date,
                order_description: data.note,
                discount: data.discount,
                customer_name: data['full-name_field'],
                customer_phone: data.phone_field,
                ship_ward: data.ward_field,
                tracking_token: data.tracking_token
            }, { transaction: transac }
        );
    } catch (error) {
        logger.error(error);
        return null;
    }
};
const getTokenOrder = (tokenSign) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.Order.findOne({
            where: { tracking_token: tokenSign},
            attributes: ['tracking_token'],
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getOrderByToken = (tokenSign) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.Order.findOne({
            where: { tracking_token: tokenSign },
            include: [
                { 
                    model: model.OrderDetail, as: 'OrderDetail', required: true,
                    attributes: [
                        ['product_id', 'id'],
                        ['combination_id', 'combinationId'],
                        ['product_name', 'name'],
                        'qty',
                        'avatar',
                        ['product_old_price', 'oldPrice'],
                        ['product_price', 'price'],
                        ['product_option', 'options']
                    ]
                },
                {
                    model: model.Ward, as: 'Ward', required: true,attributes: ['name'],
                    include: [
                        { 
                            model: model.District, as: 'District', required: true,attributes: ['name'],
                            include: [
                                { 
                                    model: model.Province, as: 'Province', required: true,attributes: ['name'],
                                }
                            ]
                        }
                    ]
                },
                { 
                    model: model.ConfigShipping, as: 'ShippingPayment', required: true,
                },
                { 
                    model: model.ConfigShipping, as: 'ShippingType', required: true,
                }
            ],
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getShipOrder = (id) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.Order.findOne({
            where: { order_id: id },
            attributes: ['ship_price'],
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getOrderByCustomerPhone = (phone) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.Order.findAll({
            where: { customer_phone: phone },
            include: [
                { 
                    model: model.OrderDetail, as: 'OrderDetail', required: true,
                    attributes: [
                        ['product_id', 'id'],
                        ['combination_id', 'combinationId'],
                        ['product_name', 'name'],
                        'qty',
                        ['product_old_price', 'oldPrice'],
                        ['product_price', 'price'],
                        ['product_option', 'options']
                    ]
                },
                {
                    model: model.Ward, as: 'Ward', required: true,attributes: ['name'],
                    include: [
                        { 
                            model: model.District, as: 'District', required: true,attributes: ['name'],
                            include: [
                                { 
                                    model: model.Province, as: 'Province', required: true,attributes: ['name'],
                                }
                            ]
                        }
                    ]
                },
                { 
                    model: model.ConfigShipping, as: 'ShippingPayment', required: true,
                },
                { 
                    model: model.ConfigShipping, as: 'ShippingType', required: true,
                }
            ],
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}


module.exports = { 
    createOrder,
    getTokenOrder,
    getOrderByToken,
    getOrderByCustomerPhone,
    getShipOrder
};