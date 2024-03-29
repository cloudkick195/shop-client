const logger = require('./../utils/logger');
const { getListSlidesHome } = require('./../repositories/main-slide.repo');
const { getNewArrivals, getListSaleOff, searchProduct, saleProduct } = require('./../repositories/product.repo');
const { createImagePath } = require('./../helpers/file.helper');
const { formatWithCommas } = require('./../helpers/currency.helper');
const { linkId } = require('./../helpers/function');

const { getListProductCategoryInHome, getChildCategoriesByParentId,
    getAllProductCategoriesExclude0} = require('./../repositories/product-category.repo');

const { getAllProductAttributeEntity } = require('./../repositories/product-attribute-entity.repo');
const { getListFeedback } = require('./../repositories/feedback.repo');
const { reqValidator } = require('./../utils/validators/request.validate');
const { getSales } = require('./../repositories/sale.repo');

const {
    convertSales,
    checkProductSale
} = require('./../utils/checkProductSale');


const shopIndex = async (req, res) => {
    try {
        const listQueries = [
            getListSlidesHome(),
            getNewArrivals(),
            getListSaleOff(),
            getAllProductCategoriesExclude0(),
            getListFeedback(),
            getSales()
        ];
        
        const result = await Promise.all(listQueries);
        let sales = result[5];
        if(sales && sales.length > 0){
            sales = convertSales(sales);
        }
        return res.cRender('home/home.pug', { result: remapValueToRenderIndex(result, sales), title: "Express" });
    } catch (error) {
        console.log(error);
        logger.error(error);
    }
}


const productSearch = async (req, res) => {
    try {
        const validation = {
            's': {type: ['text']}
        }
       
        const data = req.body;

        reqValidator(validation, data);
        const results = await Promise.all([
            searchProduct(data),
            getSales()
        ])
        const product = results[0];
        let sales = result[1];
        if(sales && sales.length > 0){
            sales = convertSales(sales);
        }
        return res.status(200).json({ 
            currentUrl: '/search?'+new URLSearchParams(data),
            products: mapDataProduct(product.rows, sales),
            count: product.count
        });

    } catch (error) {
        
        logger.error(error);
    }
}

const searchPage = async (req, res) => {
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
            searchProduct(dataQuery, paginationData.page, paginationData.limit),
            getAllProductAttributeEntity(),
            getSales()
        ];
        
        const result = await Promise.all(listQueries);
        const mapProductData = {
            rows: [],
            count: []
        }
        if(result[0]){
            mapProductData.rows = result[0].rows;
            mapProductData.count = result[0].count;
        }
        let sales = result[2];
        if(sales && sales.length > 0){
            sales = convertSales(sales);
        }
        return res.cRender('home/search.pug', {
            dataQuery: dataQuery,
            pagination: true,attributes:result[1], products: mapDataProduct(mapProductData.rows, sales), count: mapProductData.count, title: "Tìm kiếm" });

    } catch (error) {
        logger.error(error);
    }
}
const salePage = async (req, res) => {
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
            saleProduct(dataQuery, paginationData.page, paginationData.limit),
            getAllProductAttributeEntity(),
            getSales()
        ];
       
       
        const result = await Promise.all(listQueries);
        const mapProductData = {
            rows: [],
            count: []
        }
        if(result[0]){
            mapProductData.rows = result[0].rows;
            mapProductData.count = result[0].count;
        }
        let sales = result[2];
        if(sales && sales.length > 0){
            sales = convertSales(sales);
        }
        
        return res.cRender('home/san-pham.pug', {
            pagination: true,attributes:result[1], products: mapDataProduct(mapProductData.rows, sales), count: mapProductData.count, title: "Khuyến mãi" });

    } catch (error) {
        console.log(error);
        logger.error(error);
    }

}


const mapDataProduct = (products, sales) => {
    const result = [];
    for (const item of products) {
        checkProductSale(item, sales);
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

const remapValueToRenderIndex = (data, sales) => {
    const result = [];
    if (data && data[0]) {
        result.push(
            data[0].map(item => {
        
                return {
                    link: item.link,
                    path: createImagePath(item.Avatar)
                }
            }) || []
        )
    }
    if (data && data[1]) {
        result.push(
            data[1].map(item => {
                checkProductSale(item, sales);
                return {
                    id: item.product_id,
                    name: item.name,
                    slug: item.slug,
                    price: formatWithCommas(item.price_sale ? item.price_sale : item.price ),
                    old_price: formatWithCommas(item.price),
                    avatar: createImagePath(item.Avatar)
                }
            }) || []
        )
    }
    if (data && data[2]) {
        result.push(
            data[2].map(item => {
                checkProductSale(item, sales);
                return {
                    id: item.product_id,
                    name: item.name,
                    slug: item.slug,
                    price: formatWithCommas(item.price_sale ? item.price_sale : item.price),
                    old_price: formatWithCommas(item.price),
                    avatar: createImagePath(item.Avatar)
                }
            }) || []
        )
    }
    if (data && data[3]) {
        result.push(
            data[3].map(item => {

                const itemCategory = {
                    name: item.name,
                    slug: item.slug,
                    avatar: createImagePath(item.Avatar)
                }
                
                return itemCategory;
            }) || []
        )
    }
    if (data && data[4] && data[4].data) {
        result.push(
            data[4].data.map(item => {
                return {
                    image: createImagePath(data[4].cache ? item : item.Image)
                }
            }) || []
        );
    }

    return result;
}

module.exports = { shopIndex, productSearch, searchPage, salePage };