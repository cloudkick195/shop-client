module.exports = (sequelize, Sequelize) => {
    const ProductAttributeEntityCombination = sequelize.define('ProductAttributeEntityCombination', {
        attribute_type_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        entity_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        product_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        combination_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'product_attribute_entity_combinations'
    });

    ProductAttributeEntityCombination.associate = function(models) {
        ProductAttributeEntityCombination.belongsTo(models.AttributeEntityType, {
            as: 'AttributeEntityType',
            foreignKey: 'entity_id',
            sourceKey: 'entity_id',
            constraints: false
        });
        ProductAttributeEntityCombination.belongsTo(models.Product, {
            as: 'Product',
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false
        });
        ProductAttributeEntityCombination.belongsTo(models.ProductAttributeCombination, {
            as: 'ProductAttributeCombination',
            foreignKey: 'combination_id',
            sourceKey: 'combination_id',
            constraints: false
        });
        ProductAttributeEntityCombination.hasOne(models.ProductAttributeEntityBackground, {
            as: 'ProductAttributeEntityBackground',
            foreignKey: 'entity_id',
            sourceKey: 'entity_id',
            constraints: false
        });
    };

    return ProductAttributeEntityCombination;
}
