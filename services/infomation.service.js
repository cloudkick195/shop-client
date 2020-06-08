const logger = require('./../utils/logger');
const { getAllInfomation } = require('./../repositories/information.repo');

const fetchInformation = async () => {
    try {
        const data = await getAllInfomation();
        if (data && !data.cache && data.data) {
            await cacheAction.setKey('informations', JSON.stringify(data.data));
        }
        return mapListInformation(data.data);
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const mapListInformation = (data) => {
    const result = {};
    data.map(item => {
        result[item.key] = item.value;
    });

    return result;
}

module.exports = { fetchInformation };