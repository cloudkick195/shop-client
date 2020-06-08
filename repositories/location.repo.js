const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');

const getAllProvince = async () => {
    try {
        const { model } = db;
        return model.Province.findAll(
            { 
                where: { },
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
        return model.Province.findOne(
            { 
                attributes: [
                    'provinceid', 'name'
                ],
                include: [
                    { 
                        model: model.District, as: 'District', required: true,
                        attributes: [
                            'districtid', 'name'
                        ],
                        include: [
                            { 
                                model: model.Ward, as: 'Ward', required: true,
                                where: { wardid: wardId},  
                                attributes: [
                                    'wardid', 'name'
                                ]
                            }
                        ]
                    },
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