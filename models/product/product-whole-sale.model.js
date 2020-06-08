module.exports = (sequelize, Sequelize) => {
    const ProductWholeSale = sequelize.define('ProductWholeSale', {
        id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        product_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        min_qty: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        min_qty: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        archive_by: {
            type: Sequelize.BIGINT(20),
            allowNull: true,
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'product_whole_sale'
    });

    ProductWholeSale.associate = function(models) {
        ProductWholeSale.belongsTo(models.Product, {
            as: 'Product',
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false
        });
        ProductWholeSale.hasOne(models.User, {
            as: 'ArchiveUser',
            foreignKey: 'id',
            sourceKey: 'archive_by',
            constraints: false
        });
    };

    return ProductWholeSale;
}
