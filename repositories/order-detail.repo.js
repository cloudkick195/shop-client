const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');

const createOrdersDetail = async (orderId, data, transac) => {
    try {
        const { model } = db;
        const dataOrderDetail = [];
        for (const item in data) {
            dataOrderDetail.push(
                {
                    order_id: orderId,
                    product_id: data[item].id,
                    combination_id: data[item].combinationId,
                    qty: data[item].qty,
                    product_price: data[item].price,
                    product_old_price: data[item].oldPrice,
                    product_name: data[item].name,
                    product_option: data[item].options,
                    avatar: data[item].avatar,
                }
            )
        }
                
        return model.OrderDetail.bulkCreate(dataOrderDetail, { transaction: transac });
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