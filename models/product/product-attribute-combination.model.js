module.exports = (sequelize, Sequelize) => {
    const ProductAttributeCombination = sequelize.define('ProductAttributeCombination', {
        combination_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        product_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        process_image: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'product_attribute_combinations'
    });

    ProductAttributeCombination.associate = function(models) {
        ProductAttributeCombination.belongsTo(models.Product, {
            as: 'Product',
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false 
        });
        ProductAttributeCombination.hasMany(models.ProductAttributeEntityCombination, {
            as: 'ProductAttributeEntityCombination',
            foreignKey: 'combination_id',
            sourceKey: 'combination_id',
            constraints: false
        });
        ProductAttributeCombination.hasOne(models.ProcessImage, {
            as: 'ProcessImage',
            foreignKey: 'id_process_image',
            sourceKey: 'process_image',
            constraints: false
        });
        ProductAttributeCombination.belongsToMany(models.Order, { through: 'order_detail' });
    };

    return ProductAttributeCombination;
}
