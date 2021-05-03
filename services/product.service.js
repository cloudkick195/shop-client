const logger = require('./../utils/logger');
const {
    convertSales,
    checkProductSale
} = require('./../utils/checkProductSale');
const { getDetailProduct,
    getProductByKeyValue,
    getListRelatedProduct,
    getProductSlide,
    getProductAttributeCombination,
    getProductAttributeEntityBackground,
    searchProduct } = require('./../repositories/product.repo');
const { createImagePath } = require('./../helpers/file.helper');
const { formatWithCommas } = require('./../helpers/currency.helper');
const { getAllProductAttributeEntity } = require('./../repositories/product-attribute-entity.repo');
const { getSales } = require('./../repositories/sale.repo');
const { reqValidator } = require('./../utils/validators/request.validate');
const { QueryConstant } = require('./../constants/query.constant');


const mapListProduct = (listProducts, sales) => {
    if(sales && sales.length > 0){
        const saleConvert = convertSales(sales);
        return listProducts.map(item => {
            checkProductSale(item, saleConvert)
            return {
                id: item.product_id,
                name: item.name,
                slug: fn.linkId(item.slug),
                price: formatWithCommas(item.price_sale ? item.price_sale : item.price),
                old_price: formatWithCommas(item.price),
                avatar: createImagePath(item.Avatar)
            }
        })
    }
    return listProducts.map(item => {
        return {
            id: item.product_id,
            name: item.name,
            slug: fn.linkId(item.slug),
            price: formatWithCommas(item.price_sale ? item.price_sale : item.price),
            old_price: formatWithCommas(item.price),
            avatar: createImagePath(item.Avatar)
        }
    })
}

const mapProduct = (product) => {
    return {
        id: product.product_id,
        name: product.name,
        slug: fn.linkId(product.slug),
        price: formatWithCommas(product.price_sale ? product.price_sale : product.price),
        old_price: formatWithCommas(product.price),
        avatar: createImagePath(product.Avatar)
    }
}

const productDetailPage = async (req, res) => {
    try {
        const slug = req.params.slug;

        const listQueries = [
            getProductByKeyValue({slug: slug}),
            getListRelatedProduct(slug),
            getSales()
        ];

        const result = await Promise.all(listQueries);
        const product = result[0];

        if(product){
            const attributes = await Promise.all(
                [
                    getProductSlide(product.product_id),
                    getProductAttributeCombination(product.product_id),
                    getProductAttributeEntityBackground(product.product_id)
                ]
            );
            product.ProductSlide = attributes[0];
            product.ProductAttributeCombination = attributes[1];
            product.ProductAttributeEntityBackground = attributes[2];

            if(!req.session.viewedProducts ||  req.session.viewedProducts.length < 1)
                req.session.viewedProducts = [mapProduct(product)];
            else{
                const viewedProducts = req.session.viewedProducts
                const newViewedProducts = viewedProducts.filter(item => item.id != product.product_id)
            
                newViewedProducts.unshift(mapProduct(product))
                if(newViewedProducts.length > 10){
                    newViewedProducts.pop();
                }
                req.session.viewedProducts = newViewedProducts;

            }
        }

        const data = product ? mapDataDetailProduct(product, result[2]) : null;

        /*Chỉ làm tạm, vd: hôm nay sản phẩm có khuyễn mãi và đã xem sản phầm này,
        ngày mai hết khuyến mãi thì sẽ lấy sản phẩm ngày hôm qua
        => sản phẩm bị sai =>  cần request lại id*/



        //
        //
        //
        // if(viewedProducts.length > QueryConstant.defaultLimit)
        //     req.session.viewedProducts.pop();

        return res.cRender('product/product-detail.pug',
            { title: 'Detail', ...data,
                viewedProducts: req.session.viewedProducts || [],
                relatedProducts: mapListProduct(result[1], result[2]) });
    } catch (error) {
        req.session.viewedProducts = [];
        logger.error(error);
    }
}

const productsPage = async (req, res) => {
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
      
        return res.cRender('home/san-pham.pug', {
            dataQuery: dataQuery,
            pagination: true,attributes:result[1], products: mapListProduct(mapProductData.rows, result[2]), count: mapProductData.count, title: "Tất cả sản phẩm" });

    } catch (error) {
        console.log(2, error);
        logger.error(error);
    }
}
const mapDataDetailProduct = (dataProduct, sales) => {
   
    if(sales && sales.length > 0){
        const saleConvert = convertSales(sales);
        
        checkProductSale(dataProduct, saleConvert);
        
    }
    const product = {
        id: dataProduct.product_id,
        category: dataProduct.category_id,
        name: dataProduct.name,
        slug: dataProduct.slug,
        sku: dataProduct.sku,
        description: dataProduct.description,
        price: formatWithCommas(dataProduct.price_sale ? dataProduct.price_sale : dataProduct.price),
        count: dataProduct.count,
        old_price: formatWithCommas(dataProduct.price),
        avatar: createImagePath(dataProduct.Avatar),
    }
    
    const listSlides = dataProduct.ProductSlide.map(item => {
        return {
            link: item.link,
            image: createImagePath(item.ProcessImage)
        }
    });

    const combinationAttribute = {};
    const dataExistCombinationEntityId = {};
    let entityAttribute = {};
    const objEntityBackground = {}

    dataProduct.ProductAttributeEntityBackground.forEach(item => {
        objEntityBackground[item.entity_id] = item
    })

    dataProduct.ProductAttributeCombination.map((item) => {
        let tmpEntityId = '';
        item.ProductAttributeEntityCombination.map((entity) => {
            if (!combinationAttribute[entity.AttributeEntityType.ProductAttributeEntity.attribute_id]) {
                combinationAttribute[entity.AttributeEntityType.ProductAttributeEntity.attribute_id] = {
                    attribute_name: entity.AttributeEntityType.ProductAttributeEntity.attribute_name,
                    attribute_id: entity.AttributeEntityType.ProductAttributeEntity.attribute_id,
                    child: [createDataCombination(
                        entity.AttributeEntityType,
                        objEntityBackground[entity.entity_id] ? createImagePath(objEntityBackground[entity.entity_id].ProcessImage) : null)]
                }
                dataExistCombinationEntityId[entity.AttributeEntityType.id_entity_type] = true;
            } else {
                if (!dataExistCombinationEntityId[entity.AttributeEntityType.id_entity_type]) {
                    dataExistCombinationEntityId[entity.AttributeEntityType.id_entity_type] = true;
                    combinationAttribute[entity.AttributeEntityType.ProductAttributeEntity.attribute_id].child.push(
                        createDataCombination(
                        entity.AttributeEntityType,
                        objEntityBackground[entity.entity_id] ? createImagePath(objEntityBackground[entity.entity_id].ProcessImage) : null
                    ));
                }
            }
            
            tmpEntityId = tmpEntityId + '_' + entity.AttributeEntityType.id_entity_type;
        });
        
        //entityAttribute[tmpEntityId]['combination_id'] = item.combination_id ;
        entityAttribute[tmpEntityId] = {
            'combination_id': item.combination_id,
            'count': item.count
        } ;
    });
    
    entityAttribute = JSON.stringify(entityAttribute);
    return { product,entityAttribute, listSlides, combinationAttribute: Object.keys(combinationAttribute).map((item) => combinationAttribute[item]) };
}

const createDataCombination = (entity, processImage) => {

    if (entity){
        return {
            avatar: processImage,
            entity_name: entity.entity_name,
            entity_id: entity.id_entity_type
        }
    }
}

module.exports = { productDetailPage,productsPage };