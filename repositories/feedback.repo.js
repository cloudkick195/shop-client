const logger = require('./../utils/logger');

const getListFeedback = async () => {
    try {
        const { model } = db;
        const cacheData = await cacheAction.getKey('feedback');
        if (cacheData && cacheData.length > 0) {
            return { cache: true, data: JSON.parse(cacheData) };
        }
        return { cache: false, data: await model.Feedback.findAll({
            where: { is_archive: false },
            include: [
                { model: model.ProcessImage, as: "Image", attributes: ['path', 'version', 'file_name', 'process_key'] }
            ],
            attributes: ['id']
        })};
    } catch (error) {
        logger.error(error);
        return null;
    }
}

module.exports = { getListFeedback };