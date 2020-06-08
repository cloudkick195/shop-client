const logger = require('./../utils/logger');

const getListSlidesHome = async (req, res) => {
    try {
        const { model } = db;
        return model.MainSlide.findAll(
            {
                where: {
                    is_archive: false
                }, 
                include: [
                    { model: model.ProcessImage, as: 'Avatar', attributes: ['process_key', 'path', 'file_name', 'version'] }
                ],
                attributes: ['link']
            }
        );
    } catch (error) {
        logger.error(error);
    }
}

module.exports = { getListSlidesHome };