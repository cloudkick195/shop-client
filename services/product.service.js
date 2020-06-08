const logger = require('./../utils/logger');
const { getDetailProduct, getListRelatedProduct,
    searchProduct } = require('./../repositories/product.repo');
const { createImagePath } = require('./../helpers/file.helper');
const { formatWithCommas } = require('./../helpers/currency.helper');
const { getAllProductAttributeEntity } = require('./../repositories/product-attribute-entity.repo');
const { reqValidator } = require('./../utils/validators/request.validate');

const mapListProduct = (listProducts) => {
    return listProducts.map(item => {
        return {
            id: item.product_id,
            name: item.name,
            slug: fn.linkId(item.slug),
            old_price: formatWithCommas(item.price),
            price: formatWithCommas(item.price - (item.price * item.price_sale / 100)),
            avatar: createImagePath(item.Avatar)
        }
    })
}



const productDetailPage = async (req, res) => {
    try {
        console.log(12, req.params);
        const slug = req.params.slug;
        
        
        const listQueries = [
            getDetailProduct(slug),
            getListRelatedProduct(slug)
        ];
        
        const result = await Promise.all(listQueries);
        
        const data = mapDataDetailProduct(result[0]);

        
        return res.cRender('product/product-detail.pug', { title: 'Detail', ...data, relatedProducts: mapListProduct(result[1]) });
    } catch (error) {
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
            getAllProductAttributeEntity()
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
        
        return res.cRender('home/search.pug', {
            pagination: true,attributes:result[1], products: mapListProduct(mapProductData.rows), count: mapProductData.count, title: "Tìm kiếm" });

    } catch (error) {
        logger.error(error);
    }
}
const mapDataDetailProduct = (dataProduct) => {
    
    const product = {
        id: dataProduct.product_id,
        name: dataProduct.name,
        slug: dataProduct.slug,
        description: dataProduct.description,
        price: formatWithCommas(dataProduct.price_sale ? dataProduct.price - (dataProduct.price * dataProduct.price_sale / 100) : dataProduct.price),
        count: dataProduct.count,
        old_price: formatWithCommas(dataProduct.price),
        avatar: createImagePath(dataProduct.Avatar)
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
    
    
    dataProduct.ProductAttributeCombination.map((item) => {
        let tmpEntityId = '';
        item.ProductAttributeEntityCombination.map((entity) => {
            
            if (!combinationAttribute[entity.AttributeEntityType.ProductAttributeEntity.attribute_id]) {
                combinationAttribute[entity.AttributeEntityType.ProductAttributeEntity.attribute_id] = {
                    attribute_name: entity.AttributeEntityType.ProductAttributeEntity.attribute_name,
                    attribute_id: entity.AttributeEntityType.ProductAttributeEntity.attribute_id,
                    child: [createDataCombination(entity.AttributeEntityType)]
                }
                dataExistCombinationEntityId[entity.AttributeEntityType.id_entity_type] = true;
            } else {
                if (!dataExistCombinationEntityId[entity.AttributeEntityType.id_entity_type]) {
                    dataExistCombinationEntityId[entity.AttributeEntityType.id_entity_type] = true;
                    combinationAttribute[entity.AttributeEntityType.ProductAttributeEntity.attribute_id].child.push(createDataCombination(entity.AttributeEntityType));
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

const createDataCombination = (dataCombination) => {
    if (dataCombination) {
        return {
            avatar: dataCombination && dataCombination.ProductAttributeEntityBackground && dataCombination.ProductAttributeEntityBackground.ProcessImage ? createImagePath(dataCombination.ProductAttributeEntityBackground.ProcessImage) : null,
            entity_name: dataCombination.entity_name,
            entity_id: dataCombination.id_entity_type
        }
    }
}

module.exports = { productDetailPage,productsPage };