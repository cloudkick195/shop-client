const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');

const getAllAttributeEntityType = async () => {
    try {
        const { model } = db;
        return model.AttributeEntityType.findAll({ 
            attributes: [
                'id_entity_type', 'entity_name'
            ],
            include: [
                { model: model.ProductAttributeEntity, as: 'ProductAttributeEntity', attributes: ['attribute_id', 'attribute_name'], required: false  }
            ],
        })
    } catch (error) {
        logger.error(error);
        return null;
    }
}

module.exports = {  
    getAllAttributeEntityType, 
};