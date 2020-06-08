const logger = require('./../utils/logger');

const getAllInfomation = async () => {
    try {
        const { model } = db;
        const cacheData = await cacheAction.getKey('informations');
        if (cacheData && cacheData.length > 0) {
            return { cache: true, data: JSON.parse(cacheData) };
        }
        return { cache: false, data: await model.Information.findAll({
            where: { is_archive: false },
            attributes: ['key', 'value']
        })};
    } catch (error) {
        logger.error(error);
        return null;
    }
}

module.exports = { getAllInfomation };