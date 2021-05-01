require('dotenv').config();
const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');


const getSales = (id) => {
    try {
        const { model } = db;
        return model.Sale.findAll({
            where: { status: 1 },
            order: ['prioritize', 'DESC']
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}



module.exports = { 
    getSales
};