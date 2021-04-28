const Sequelize = require('sequelize');

module.exports = () => {
    const db = {};
    const sequelize = new Sequelize('shop160_db', 'root', 'root', {
        host: '127.0.0.1',
        dialect: 'mysql',
        port: 33065
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    db.model = {};

    db.model.User = require('./../models/user')(sequelize, Sequelize);
    db.model.ProcessImage = require('./../models/process-image')(sequelize, Sequelize);
    db.model.ProductSlide = require('./../models/product/product-slide.model')(sequelize, Sequelize);
    db.model.MainSlide = require('./../models/main-slide')(sequelize, Sequelize);
    db.model.ProductAttributeCombination = require('./../models/product/product-attribute-combination.model')(sequelize, Sequelize);
    db.model.ProductAttributeEntityCombination = require('./../models/product/product-attribute-entity-combination.model')(sequelize, Sequelize);
    db.model.ProductAttributeEntity = require('./../models/product/product-attribute-entity.model')(sequelize, Sequelize);
    db.model.ProductCategory = require('./../models/product/product-category.model')(sequelize, Sequelize);
    db.model.ProductWholeSale = require('./../models/product/product-whole-sale.model')(sequelize, Sequelize);
    db.model.Product = require('./../models/product/product.model')(sequelize, Sequelize);
    db.model.AttributeEntityType = require('./../models/attribute-entity-type.model')(sequelize, Sequelize);
    db.model.Information = require('./../models/information.model')(sequelize, Sequelize);
    db.model.Feedback = require('./../models/feedback.model')(sequelize, Sequelize);
    db.model.ProductAttributeEntityBackground = require('./../models/product/product-attribute-entity-background.model')(sequelize, Sequelize);
    db.model.Province = require('./../models/location/province.model')(sequelize, Sequelize);
    db.model.District = require('./../models/location/district.model')(sequelize, Sequelize);
    db.model.Ward = require('./../models/location/ward.model')(sequelize, Sequelize);
    db.model.Customer = require('./../models/customer.model')(sequelize, Sequelize);
    db.model.Order = require('./../models/order.model')(sequelize, Sequelize);
    db.model.OrderDetail = require('./../models/order-detail.model')(sequelize, Sequelize);
    db.model.ConfigShipping = require('./../models/config-shipping.model')(sequelize, Sequelize);
    db.model.PolicyPost = require('../models/privacy-policy.model')(sequelize, Sequelize);


    Object.keys(db.model).map((item) => {
        if (db.model[item].associate) {
            db.model[item].associate(db.model);
        }
    })

    return db;
}