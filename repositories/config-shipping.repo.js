const logger = require('../utils/logger');

const getAllShipping = () => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.ConfigShipping.findAll({
            where: {  }
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}
const getShipping = (type) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.ConfigShipping.findAll({
            where: { type:  type}
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}
const getAllPayment = () => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return model.ConfigShipping.findAll({
            where: { type: [ 'receive', 'transfer'] }
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}

module.exports = { 
    getAllShipping,
    getShipping,
    getAllPayment
};