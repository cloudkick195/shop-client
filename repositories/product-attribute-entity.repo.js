const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');

const getAllProductAttributeEntity = async () => {
    try {
        const { model } = db;
        return model.ProductAttributeEntity.findAll({ 
            attributes: [
                'attribute_id', 'attribute_name'
            ],
            include: [
                { model: model.AttributeEntityType, as: 'AttributeEntityType', attributes: ['id_entity_type', 'entity_name'], required: false  }
            ],
        })
    } catch (error) {
        logger.error(error);
        return null;
    }
}

module.exports = {  
    getAllProductAttributeEntity, 
};