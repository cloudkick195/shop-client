const { fetchInformation } = require('./../services/infomation.service');
const { getAllProductCategoryCtrl } = require('./../services/product-category.service');
const { getAllPrivacyPolicy } = require('./../services/privacy-policy.service');
const { QueryConstant } = require('./../constants/query.constant');
const { getCookieCartTotalQty, getCookieCartForTemplate } = require('./../helpers/cart.helper');
const logger = require('./../utils/logger');

const getPaginationInformation = (req) => {
    const queryPath = req.path.split("/");
    
    const paginationData = { page: 1, count: 0, limit: QueryConstant.defaultLimit, totalPage: 0, listPage: [], link: queryPath[2] ||queryPath[1]};
    const queries = req.query;
    if (queries && parseInt(queries.page) > 1 && !isNaN(parseInt(queries.page))) {
        paginationData.page = parseInt(queries.page);
    }
    if (queries && parseInt(queries.limit) > 1 && !isNaN(parseInt(queries.limit))) {
        paginationData.limit = parseInt(queries.limit);
    }
    
    return paginationData;
}

const emitPaginationData = (paginationData, templateVariable) => {
    
    if (templateVariable && 'count' in templateVariable) {
        paginationData.count = templateVariable.count;
    }
    paginationData.totalPage = Math.ceil(paginationData.count / paginationData.limit);
    paginationData.listPage = [...Array(paginationData.totalPage).keys()]
    
    return paginationData;
}

module.exports = async (req, res, next) => {
    try {
        const data = await Promise.all([fetchInformation(), getAllProductCategoryCtrl(), getAllPrivacyPolicy()]);
        const defaultPaginationData = getPaginationInformation(req);
        req.paginationData = defaultPaginationData;
        res.cRender = (urlTemplate, templateVariable) => {
            let paginationData = defaultPaginationData;
           
            if (templateVariable.pagination) {
                paginationData = emitPaginationData(defaultPaginationData, templateVariable);
            }
            
            
            return res.render(urlTemplate, {cart: getCookieCartForTemplate(req, res), totalQty: getCookieCartTotalQty(req, res), ...templateVariable, pageCategories: data[1], fn, pageInfo: {...data[0]}, policies: [...data[2]], paginationData, query: req.query});

        }
        
        next();
    } catch (error) {
        logger.error(error);
        return res.json({ error: true, verify: false });
    }
};