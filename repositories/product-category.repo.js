const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');
const { getListProductInListProductCategoryIds } = require('./product.repo');
const { createImagePath } = require('./../helpers/file.helper');
const { formatWithCommas } = require('./../helpers/currency.helper');
const { getSales } = require('./../repositories/sale.repo');

const {
    convertSales,
    checkProductSale
} = require('./../utils/checkProductSale');

const getListProductCategoryInHome = () => {
    try {
        const { model } = db;
        return model.ProductCategory.findAll({
            where: { is_archive: false, is_show_in_home: true, parent_id: 0 },
            attributes: [
                'product_category_id', 'name', 'slug'
            ],
            include: [
                { model: model.ProcessImage, as: 'Avatar', attributes: ['process_key', 'path', 'file_name', 'version'], required: false  },
                {   
                    model: model.Product, as: 'Product', 
                    attributes: ['product_id', 'slug', 'price', 'price_sale', 'count'],
                    include: [
                        { model: model.ProcessImage, as: 'Avatar', attributes: ['process_key', 'path', 'file_name', 'version'], required: false  },
                    ],
                    where: { archive_by: null },
                    order: [['product_id', 'DESC']],
                    required: false,
                    limit: 8
                }
            ],
            order: [['position', 'DESC']], 
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getAllProductCategories = async () => {
    try {
        const { model } = db;

        const cacheData = await cacheAction.getKey('productCategory');

        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        return { cache: false, data: await model.ProductCategory.findAll({
            where: { is_archive: false },
            include: [
                { model: model.ProcessImage, as: "Avatar", attributes: ['path', 'version', 'file_name', 'process_key'] }
            ],
            attributes: ['product_category_id', 'name', 'slug', 'parent_id', 'is_archive', 'show_tooltip_background', 'is_show_in_home']
        })};
    } catch (error) {
        logger.error(error);
        return null;
    }
}
const getAllProductCategoriesExclude0 = async () => {
    try {
        const { model, Sequelize: { Op } } = db;

        return model.ProductCategory.findAll({
            where: {
                'parent_id': {
                    [Op.notIn]:[0]
                }
            },
            include: [
                { model: model.ProcessImage, as: "Avatar", attributes: ['path', 'version', 'file_name', 'process_key'] }
            ],
            attributes: ['product_category_id', 'name', 'slug', 'parent_id', 'is_archive', 'show_tooltip_background', 'is_show_in_home']
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}
const getChildCategoriesByParentId = async (parentId) => {
    try {
        const { model } = db;
       
        return await model.ProductCategory.findAll({
            where: { parent_id: parentId },
            include: [
                { model: model.ProcessImage, as: "Avatar", attributes: ['path', 'version', 'file_name', 'process_key'] }
            ],
            attributes: ['product_category_id', 'product_category_id', 'name', 'slug', 'parent_id', 'is_archive', 'show_tooltip_background', 'is_show_in_home']
        })
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getListChildrenProductCategory = async (productCategorySlug) => {
    try {
        const { model } = db
        
        return model.ProductCategory.findOne({
            where: { is_archive: false, slug: productCategorySlug },
            attributes: [
                'product_category_id', 'name', 'slug'
            ],
            include: [
                { model: model.ProductCategory, as: 'ChildCategory', attributes: ['product_category_id'], require: false },
                { model: model.ProcessImage, as: 'Avatar', attributes: ['path', 'version', 'file_name', 'version'], require: false }
            ]
        })
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const mapReturnListProductCategoryId = (listProductCategories) => {
    return listProductCategories.map((item) => {
        return item.product_category_id;
    });
};

const mapResultGetDetailProductCategory = (item, sales) => {
    const itemCategory = {
        id: item.product_category_id,
        name: item.name,
        slug: item.slug,
        avatar: createImagePath(item.Avatar),
        products: [],
        count: item.Product.count
    }
    if (item && item.Product && item.Product.rows && item.Product.rows.length > 0) {
        itemCategory.products = item.Product.rows.map(dataProduct => {
            checkProductSale(dataProduct, sales);
            return {
                id: dataProduct.product_id,
                name: dataProduct.name,
                slug: dataProduct.slug,
                price: formatWithCommas(dataProduct.price_sale ? dataProduct.price_sale : dataProduct.price),
                old_price: formatWithCommas(dataProduct.price),
                avatar: createImagePath(dataProduct.Avatar)
            }
        });
    }
    return itemCategory;
}

const getAllProductsOfCategory = async (productCategorySlug, page = 1, limit = QueryConstant.defaultLimit, dataQuery) => {
    try {
        
        
        
        const result = await Promise.all([
            getListChildrenProductCategory(productCategorySlug),
            getSales()
        ]);
        const dataProductCategory = result[0];

        let sales = result[1];
        if(sales && sales.length > 0){
            sales = convertSales(sales);
        }
        if (dataProductCategory && dataProductCategory.dataValues) {
            const listProductCategoryIds = [dataProductCategory.product_category_id, ...mapReturnListProductCategoryId(dataProductCategory.ChildCategory)]
            return mapResultGetDetailProductCategory({ ...dataProductCategory.dataValues, Product: await getListProductInListProductCategoryIds(listProductCategoryIds, page, limit, dataQuery) }, sales) 
        }
        return null;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

module.exports = { getListProductCategoryInHome,
    getAllProductCategories,
    getAllProductsOfCategory,
    getChildCategoriesByParentId,
    getAllProductCategoriesExclude0};
