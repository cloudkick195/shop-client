module.exports = (sequelize, Sequelize) => {
    const ProductAttributeEntityBackground = sequelize.define('ProductAttributeEntityBackground', {
        id_attribute_entity_background: {
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
        entity_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'product_attribute_entity_background'
    });

    ProductAttributeEntityBackground.associate = function(models) {
        ProductAttributeEntityBackground.belongsTo(models.Product, {
            as: 'Product',
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false 
        });
        ProductAttributeEntityBackground.hasMany(models.AttributeEntityType, {
            as: 'AttributeEntityType',
            foreignKey: 'id_entity_type',
            sourceKey: 'entity_id',
            constraints: false
        });
        ProductAttributeEntityBackground.hasOne(models.ProcessImage, {
            as: 'ProcessImage',
            foreignKey: 'id_process_image',
            sourceKey: 'process_image',
            constraints: false
        });
    };

    return ProductAttributeEntityBackground;
}
