const logger = require('./../utils/logger');

const getAllPolicyPost = async () => {
    try {
        const { model: { PolicyPost } } = db;
        return PolicyPost.findAll({ where: { is_archive: false } });
    } catch (error) {
        logger.error(error);
        return [];
    }
}

const getPolicyPostBySlug = async (slug) => {
    try {
        const { model: { PolicyPost } } = db;
        return PolicyPost.findOne({ where: { post_slug: slug } });
    } catch (error) {
        logger.error(error);
        return [];
    }
}

module.exports = { getAllPolicyPost, getPolicyPostBySlug };