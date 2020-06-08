const { fetchInformation } = require('./../services/infomation.service');
const { getAllProductCategoryCtrl } = require('./../services/product-category.service');

const resetCacheHeader = async (req, res) => {
    try {
        const data = await Promise.all([fetchInformation(), getAllProductCategoryCtrl()]);
        return res.json({ cache: false, verify: true });
    } catch (error) {
        logger.error(error);
        return res.json({ error: true, verify: false });
    }
}

module.exports = { resetCacheHeader };