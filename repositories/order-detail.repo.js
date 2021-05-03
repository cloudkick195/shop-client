const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');

const createOrdersDetail = async (data, transac) => {
    try {
        const { model } = db;
                
        return model.OrderDetail.bulkCreate(data, { transaction: transac });
    } catch (error) {
        logger.error(error);
        return null;
    }
};


const getOrderDetailByOrderId = (orderId) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.OrderDetail.findAll({
            where: { order_id: orderId },
            attributes: [
                ['product_id', 'id'],
                ['combination_id', 'combinationId'],
                ['product_name', 'name'],
                'qty',
                ['product_old_price', 'oldPrice'],
                ['product_price', 'price'],
                ['product_option', 'options']
            ]
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}



module.exports = { 
    createOrdersDetail,
    getOrderDetailByOrderId
};