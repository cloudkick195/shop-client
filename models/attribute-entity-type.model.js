module.exports = (sequelize, Sequelize) => {
    const AttributeEntityType = sequelize.define('AttributeEntityType', {
        id_entity_type: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        entity_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        attr_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'attr_entity_type'
    });

    AttributeEntityType.associate = function(models) {
        AttributeEntityType.belongsTo(models.ProductAttributeEntity, {
            as: 'ProductAttributeEntity',
            foreignKey: 'attr_id',
            sourceKey: 'attr_id',
            constraints: false 
        });
        AttributeEntityType.hasOne(models.ProductAttributeEntityBackground, {
            as: 'ProductAttributeEntityBackground',
            foreignKey: 'entity_id',
            sourceKey: 'id_entity_type',
            constraints: false
        });
    };

    return AttributeEntityType;
}
