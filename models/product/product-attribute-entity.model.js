module.exports = (sequelize, Sequelize) => {
    const ProductAttributeEntity = sequelize.define('ProductAttributeEntity', {
        attribute_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        attribute_name: {
            type: Sequelize.STRING,
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
        tableName: 'product_attribute_entities'
    });

    ProductAttributeEntity.associate = function(models) {
        ProductAttributeEntity.hasMany(models.AttributeEntityType, {
            as: 'AttributeEntityType',
            foreignKey: 'attr_id',
            sourceKey: 'attribute_id',
            constraints: false
        });
    };

    return ProductAttributeEntity;
}
