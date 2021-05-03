const logger = require('./../utils/logger');
const { QueryConstant } = require('./../constants/query.constant');
 
const getNewArrivals = async () => {
    try {
        const { model } = db;
        return model.Product.findAll(
            { 
                where: {
                    archive_by: null
                },
                attributes: [
                    'product_id', 'name', 'slug', 'price', 'price_sale', 'count', 'category_id'
                ],
                include: [
                    { model: model.ProcessImage, as: 'Avatar', attributes: ['process_key', 'path', 'file_name', 'version'], required: false  }
                ],
                order: [['product_id', 'DESC']], 
                limit: 16,
                group: ['Product.product_id']
            }
        );
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const searchProduct = async (data, page = 1, limit = QueryConstant.defaultLimit) => {
    try {
        const { model, Sequelize: { Op } } = db;

        const {order, objQuery} = handlingFilter(data)

        return model.Product.findAndCountAll(
            {
                where: {
                    ...objQuery.where,
                    archive_by: null
                },
                attributes: [
                    'product_id', 'name', 'slug', 'price', 'price_sale', 'count', 'category_id'
                ],
                include: objQuery.include,
                order: order, 
                offset: page <= 1 ? 0 : (page * limit) - limit,
                limit
            }
        );
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const saleProduct = async (data, page = 1, limit = QueryConstant.defaultLimit) => {
    try {
        const { model, Sequelize: { Op } } = db;

        const {order, objQuery} = handlingFilter(data)
        
        return model.Product.findAndCountAll(
            { 
                where: {
                    ...objQuery.where,
                    price_sale: {
                        [Op.gt]: 0
                    },
                    archive_by: null
                },
                attributes: [
                    'product_id', 'name', 'slug', 'price', 'price_sale', 'count', 'category_id'
                ],
                include: objQuery.include,
                order: order, 
                offset: page <= 1 ? 0 : (page * limit) - limit,
                limit
            }
        );
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const handlingFilter = (data) =>{
    const { model, Sequelize: { Op } } = db;
    const objQuery = {
        where:{

        },
        include: [
            { model: model.ProcessImage, as: 'Avatar', attributes: ['process_key', 'path', 'file_name', 'version'], required: false  }
        ],
    }
    const order = []
    
    if(!data)
        return {
            order: order, 
            objQuery: objQuery
        } 
    switch(data.sort_by) {
        case 'default':
            order[0] = ['product_id', 'DESC']
            break;
        case 'price-ascending':
            order[0] = ['price', 'ASC']
            break;
        case 'price-descending':
            order[0] = ['price', 'DESC']
            break;
        case 'title-ascending':
            order[0] = ['name', 'ASC']
            break;
        case 'title-descending':
            order[0] = ['name', 'DESC']
            break;
        case 'created-ascending':
            order[0] = ['product_id', 'ASC']
            break;
        default:
            order[0] = ['product_id', 'DESC']
    }
    
    
    if(data.s)
        objQuery.where.name ={[Op.like]: '%' + data.s + '%'};

    if(data.price){
        const arrPrice = data.price.split("_");
    
        if(!arrPrice[1])
            objQuery.where = {
                [Op.gte]: arrPrice[0]
            };
        else if(arrPrice[1] && arrPrice[0]=='0')
            objQuery.where.price = {
                [Op.lte]: arrPrice[1]
            };
        else 
            objQuery.where.price = {
                [Op.between]: [arrPrice[0], arrPrice[1]]
            };
    }

    if(data.attribute){
        objQuery.include.push(
            {
                where: 
                {
                    entity_id: data.attribute.split("_")
                },
                model: model.ProductAttributeEntityCombination, as: 'ProductAttributeEntityCombination', attributes: ['entity_id'], required: true
            }
        );
    }
    objQuery.archive_by = null;
    return {
        order: order, 
        objQuery: objQuery
    }
}

const getListSaleOff = async () => {
    try {
        const { model, Sequelize: { Op } } = db;
        return model.Product.findAll({ 
            where: { price_sale: { [Op.gt]: 0 }, archive_by: null },
            attributes: [
                'product_id', 'name', 'slug', 'price', 'price_sale', 'count', 'category_id'
            ],
            include: [
                { model: model.ProcessImage, as: 'Avatar', attributes: ['process_key', 'path', 'file_name', 'version'], required: false  }
            ],
            order: [['product_id', 'DESC']], 
            limit: 15,
            group: ['Product.product_id']
        })
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const getListProductInListProductCategoryIds = async (listCategoryIds, page = 1, limit = QueryConstant.defaultLimit, data) => {
    try {
        const { model, Sequelize: { Op } } = db;
       
        const {order, objQuery} = handlingFilter(data)
        
        return model.Product.findAndCountAll(
            { 
                where: {
                    ...objQuery.where,
                    archive_by: null, category_id: { [Op.in]: listCategoryIds }
                },
                attributes: [
                    'product_id', 'name', 'slug', 'price', 'price_sale', 'count', 'category_id'
                ],
                include: objQuery.include,
                order: order, 
                offset: page <= 1 ? 0 : (page * limit) - limit,
                limit
            }
        );
       
    } catch (error) {
        logger.error(error);
    }
}

const getProductByKeyValue = async (objWhere = {slug: ''}) => {
    const { model } = db;
    return model.Product.findOne({
        where: {...objWhere, archive_by: null},
        include: [
            {
                model: model.ProcessImage,
                as: 'Avatar',
                attributes: ['process_key', 'path', 'file_name', 'version'],
                required: false
            }
        ],
        attributes: ['product_id', 'category_id','name', 'slug', 'price', 'sku','price_sale', 'count', 'description']
    })
}

const getProductSlide = async (productId) => {
    const { model } = db;
    return model.ProductSlide.findAll({
        where: {product_id: productId, is_archive: false},
        attributes: ['link'],
        include: [
            { model: model.ProcessImage, as: 'ProcessImage', attributes: ['process_key', 'path', 'file_name', 'version'] }
        ],
    })
}

const getProductAttributeCombination = async (productId) => {
    const { model } = db;
    return model.ProductAttributeCombination.findAll({
        where: {product_id: productId, is_archive: false},
        attributes: ['combination_id','process_image', 'count'],
        include: [
            {  model: model.ProductAttributeEntityCombination,
                as: 'ProductAttributeEntityCombination',
                attributes: ['entity_id', 'combination_id'],
                required: false,
                include: [
                    {
                        model: model.AttributeEntityType,
                        as: 'AttributeEntityType',
                        attributes: ['entity_name', 'id_entity_type'],
                        required: false,
                        include: [
                            {
                                model: model.ProductAttributeEntity,
                                as: 'ProductAttributeEntity',
                                attributes: ['attribute_name', 'attribute_id'],
                                required: false
                            }
                        ]
                    }
                ]
            }
        ],
    })
}

const getProductAttributeEntityBackground = async (productId) => {
    const { model } = db;
    return model.ProductAttributeEntityBackground.findAll({
        as: 'ProductAttributeEntityBackground',
        where: {product_id: productId, is_archive: false},
        attributes: ['entity_id'],
        include: [
            { model: model.ProcessImage, as: 'ProcessImage', attributes: ['id_process_image', 'process_key', 'path', 'file_name', 'version'], required: false }
        ],
        required: false
    })
}

const getDetailProduct = async (productSlug) => {
    
    try {
        const { model } = db;
        return model.Product.findOne({
            where: { slug: productSlug, archive_by: null },
            include: [
                { 
                    model: model.ProductSlide,
                    as: 'ProductSlide',
                    attributes: ['link'],
                    include: [
                        { model: model.ProcessImage, as: 'ProcessImage', attributes: ['process_key', 'path', 'file_name', 'version'] }
                    ],
                    required: false
                },
                {
                    model: model.ProductAttributeCombination,
                    as: 'ProductAttributeCombination',
                    attributes: ['combination_id','process_image', 'count'],
                    where: { is_archive: false },
                    required: false,
                    include: [
                        //{ model: model.ProcessImage, as: 'ProcessImage', attributes: ['process_key', 'path', 'file_name', 'version'], required: false },
                        {
                            model: model.ProductAttributeEntityCombination,
                            as: 'ProductAttributeEntityCombination', 
                            attributes: ['entity_id', 'combination_id'],
                            required: false,
                            include: [
                                {
                                    model: model.AttributeEntityType, as: 'AttributeEntityType', attributes: ['entity_name', 'id_entity_type'],
                                    required: false,
                                    include: [
                                        { model: model.ProductAttributeEntity, as: 'ProductAttributeEntity', attributes: ['attribute_name', 'attribute_id'], required: false },
                                        {
                                            model: model.ProductAttributeEntityBackground, as: 'ProductAttributeEntityBackground', attributes: ['entity_id'],
                                            include: [
                                                { model: model.ProcessImage, as: 'ProcessImage', attributes: ['id_process_image', 'process_key', 'path', 'file_name', 'version'], required: false }
                                            ],
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: model.ProcessImage,
                    as: 'Avatar',
                    attributes: ['process_key', 'path', 'file_name', 'version'],
                    required: false
                }
            ],
            attributes: ['product_id', 'category_id','name', 'slug', 'price', 'sku','price_sale', 'count', 'description']
        });
    } catch(error) {
        logger.error(error);
    }
}

const getProductHaveAttributeInCart = async (id, combinationId, qty) => {
    try {
        return db.sequelize.query(`
        SELECT 
            p.product_id, 
            p.category_id,
            p.name,
            p.price, 
            p.price_sale, 
            p.slug, 
            pac.count, 
            pws.discount, 
            max(min_qty) as MAXQty,
            process_key,
            path,
            file_name,
            version
        FROM
            products p
                LEFT OUTER JOIN
                    product_attribute_combinations
                AS pac ON pac.product_id = p.product_id AND pac.combination_id = $combinationId
                LEFT OUTER JOIN
                    product_whole_sale
                AS pws ON pws.product_id = p.product_id AND min_qty < $qty
                LEFT OUTER JOIN
                    process_images
                AS pi ON p.id_process_image = pi.id_process_image
        WHERE
            p.product_id = $id
            group by product_id, p.name, p.price, p.price_sale, p.slug, count, discount, process_key, path, file_name, version
            order by MAXQty DESC
        LIMIT 1
        `, 
        { 
            bind: {id: id, combinationId: combinationId, qty: qty},
            type: db.sequelize.QueryTypes.SELECT });
        
    } catch(error) {
        logger.error(error);
    }
}

const getProductInCart = async (id) => {
    try {
        return db.sequelize.query(`
        SELECT 
            p.product_id, 
            p.category_id,
            p.name,
            p.price, 
            p.price_sale, 
            p.slug, 
            p.count,
            pac.combination_id,
            pac.count as AttributeCount,
            pac.combination_sku,
            process_key,
            path,
            file_name,
            version
        FROM
            products p
                LEFT OUTER JOIN
                    product_attribute_combinations
                AS pac ON pac.product_id = p.product_id
                LEFT OUTER JOIN
                    process_images
                AS pi ON p.id_process_image = pi.id_process_image
        WHERE
            p.product_id = $id
            group by product_id, pac.combination_id
        `, 
        { 
            bind: {id: id},
            type: db.sequelize.QueryTypes.SELECT });
        
    } catch(error) {
        logger.error(error);
    }
}

const getProductInCartByCustomerVip = async (id, qty) => {
    try {
        return db.sequelize.query(`
        SELECT 
            p.product_id, 
            p.category_id,
            p.name,
            p.price, 
            p.price_sale, 
            p.slug, 
            p.count,
            pac.combination_id,
            pac.combination_sku,
            pac.count as AttributeCount,
            pws.discount, 
            max(min_qty) as MAXQty,
            process_key,
            path,
            file_name,
            version
        FROM
            products p
                LEFT OUTER JOIN
                    product_attribute_combinations
                AS pac ON pac.product_id = p.product_id
                LEFT OUTER JOIN
                    product_whole_sale
                AS pws ON pws.product_id = p.product_id AND min_qty < $qty
                LEFT OUTER JOIN
                    process_images
                AS pi ON p.id_process_image = pi.id_process_image
        WHERE
            p.product_id = $id
            group by product_id, pac.combination_id, pws.discount
            order by MAXQty DESC
        `, 
        { 
            bind: {id: id, qty: qty},
            type: db.sequelize.QueryTypes.SELECT });
        
    } catch(error) {
        logger.error(error);
    }
}

const getProductsInCart = async (arrId) => {
    try {
        return db.sequelize.query(`
        SELECT 
            p.product_id,
            p.category_id, 
            p.name,
            p.price, 
            p.price_sale, 
            p.slug, 
            p.count,
            pac.combination_id,
            pac.count as AttributeCount,
            pws.discount, 
            max(min_qty) as MAXQty,
            process_key,
            path,
            file_name,
            version
        FROM
            products p
                LEFT OUTER JOIN
                    product_attribute_combinations
                AS pac ON pac.product_id IN(:arrayId)
                LEFT OUTER JOIN
                    product_whole_sale
                AS pws ON pws.product_id IN(:arrayId) AND min_qty < $qty
                LEFT OUTER JOIN
                    process_images
                AS pi ON p.id_process_image = pi.id_process_image
        WHERE
            p.product_id IN(:arrayId)
            group by product_id, pac.combination_id, pws.discount
            order by MAXQty DESC
        `, 
        { 
            replacements: { arrayId: arrId },
            type: db.sequelize.QueryTypes.SELECT });
        
    } catch(error) {
        logger.error(error);
    }
}

const getAttributeProductInCart = async (combinationId) => {
    try {
        const { model } = db;
        return model.ProductAttributeEntityCombination.findAll({
            where: { combination_id: combinationId },
            required: true,
            raw: true,
            include: [
                { 
                    model: model.AttributeEntityType,
                    as: 'AttributeEntityType',
                    attributes: [],
                    required: true,
                }
            ],
            attributes: ['AttributeEntityType.entity_name', 'entity_id']
        });
    } catch(error) {
        logger.error(error);
    }
}

const getListRelatedProduct = (productSlug) => {
    try {
        const { model, sequelize: { fn }, Sequelize: { Op } } = db;
        return model.Product.findAll({
            where: { archive_by: null, slug: { [Op.ne]: productSlug } },
            order: [[fn('RAND')]],
            limit: 10,
            include: [
                {
                    model: model.ProcessImage,
                    as: 'Avatar',
                    attributes: ['process_key', 'path', 'file_name', 'version'],
                    required: false
                }
            ],
            attributes: ['product_id', 'name', 'slug', 'price', 'price_sale', 'count', 'category_id']
        });
    } catch(error) {
        logger.error(error);
    }
}

module.exports = { 
    getNewArrivals, 
    getListSaleOff, 
    getListProductInListProductCategoryIds, 
    getDetailProduct,
    getListRelatedProduct,
    getProductInCart,
    getProductInCartByCustomerVip,
    getProductHaveAttributeInCart,
    getAttributeProductInCart,
    searchProduct,
    saleProduct,
    getProductByKeyValue,
    getProductSlide,
    getProductAttributeCombination,
    getProductAttributeEntityBackground
};