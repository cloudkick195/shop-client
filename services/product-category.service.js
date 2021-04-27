const logger = require('./../utils/logger');
const { getAllProductCategories, getAllProductsOfCategory } = require('./../repositories/product-category.repo');
const { reqValidator } = require('./../utils/validators/request.validate');
const { getAllProductAttributeEntity } = require('./../repositories/product-attribute-entity.repo');
const { createImagePath } = require('./../helpers/file.helper');
const { linkId } = require('./../helpers/function');

const getAllProductCategoryCtrl = async () => {
    try {
        const data = await getAllProductCategories();

        return data.cache ? data.data : transformListProductCategory(data.data);
    } catch (error) {
        logger.error(error);
    }
}

const transformListProductCategory = (data) => {
    const dataItemNoParent = [];
    let dataItem = {};

    data.map((item) => {
        const itemInstance = {
            id: item.product_category_id,
            name: item.name,
            slug: item.slug,
            parent_id: item.parent_id,
            is_archive: !!item.is_archive,
            show_tooltip_background: !!item.show_tooltip_background,
            show_home: !!item.show_home,
            child: [],
            avatar: createImagePath(item.Avatar)
        }

        if (itemInstance.parent_id === 0) {
            dataItemNoParent.push(itemInstance);
        }
        if (dataItem[itemInstance.parent_id]) {
            dataItem[itemInstance.parent_id].push(itemInstance);
        } else {
            dataItem[itemInstance.parent_id] = [itemInstance];
        }
        if (!dataItem[itemInstance.id]) {
            dataItem[itemInstance.id] = [];
        }
        itemInstance.child = dataItem[itemInstance.id];
    });
    return dataItemNoParent;
}

const mapDataProduct = (products) => {
    const result = [];
    for (const item of products) {
        
        result.push(
            {
                id: item.product_id,
                name: item.name,
                slug: linkId(item.slug),
                price: formatWithCommas(item.price_sale ? item.price_sale : item.price),
                old_price: formatWithCommas(item.price),
                avatar: createImagePath(item.Avatar)
            }
        );
    }
    return result;
}

const productCategoryPage = async (req, res) => {
    try {
        const { paginationData } = req;
        const validation = {}
        const dataQuery = req.query;

        for (const key in dataQuery) {
            if (dataQuery.hasOwnProperty(key)) {
                validation[key] = {type: ['text']}
            }
        }
        
        reqValidator(validation, dataQuery);
        
        const listQueries = [
            getAllProductsOfCategory(req.params.categorySlug, paginationData.page, paginationData.limit, dataQuery),
            getAllProductAttributeEntity()
        ];
        
        const result = await Promise.all(listQueries);
        const mapProductData = {
            rows: [],
            count: []
        }
        if(result[0] && result[0].products){
            
            mapProductData.rows = result[0].products;
            mapProductData.count = result[0].count;
        }
        res.cRender('product/product-category.pug', {result: result[1], attributes:result[1], products: mapProductData.rows, count: mapProductData.count, title: result[0] && result[0].name, pagination: true });
    } catch (error) {
        console.log(error)
        logger.error(error);
    }
}

module.exports = { getAllProductCategoryCtrl, productCategoryPage };