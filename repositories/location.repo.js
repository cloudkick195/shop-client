const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');

const getAllProvince = async () => {
    try {
        const { model } = db;
        return model.Province.findAll(
            { 
                where: { },
                order: [
                    ['name', 'ASC'],
                ],
                attributes: [
                    'provinceid', 'name'
                ]
            }
        );
    } catch (error) {
        logger.error(error);
        return null;
    }
};
const getDistricts = async (provinceId) => {
    try {
        const { model } = db;
        return model.District.findAll(
            { 
                where: { provinceid: provinceId },
                order: [
                    ['name', 'ASC'],
                ],
                attributes: [
                    'districtid', 'name'
                ]
            }
        );
    } catch (error) {
        logger.error(error);
        return null;
    }
};
const getWards = async (districtId) => {
    try {
        const { model } = db;
        return model.Ward.findAll(
            { 
                where: { districtid: districtId},
                order: [
                    ['name', 'ASC'],
                ],
                attributes: [
                    'wardid', 'name'
                ]
            }
        );
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const getLocation = async (provinceId, districtId, wardId) => {
    try {
        const { model } = db;
        return model.Ward.findOne(
            { 
                attributes: ['name'],
                where: { wardid: wardId },
                include: [
                    { 
                        model: model.District, as: 'District', required: true,attributes: ['name'],
                        include: [
                            { 
                                model: model.Province, as: 'Province', required: true,attributes: ['name'],
                            }
                        ]
                    }
                ],
                
            }
        );
        
    } catch (error) {
        logger.error(error);
        return null;
    }
}; 
module.exports = { 
    getAllProvince, 
    getDistricts,
    getWards,
    getLocation
};