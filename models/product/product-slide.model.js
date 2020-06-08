module.exports = (sequelize, Sequelize) => {
    const ProductSlide = sequelize.define('ProductSlide', {
        product_slide_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        product_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        link: {
            type: Sequelize.STRING,
            allowNull: true
        },
        id_process_image: {
            type: Sequelize.BIGINT(20),
            allowNull: true,
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'product_slides'
    });

    ProductSlide.associate = function(models) {
        ProductSlide.hasOne(models.ProcessImage, { 
            as: 'ProcessImage',
            foreignKey: 'id_process_image',
            sourceKey: 'id_process_image',
            constraints: false
        });
        ProductSlide.belongsTo(models.Product, {
            as: 'Product',
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false
        });
    };

    return ProductSlide;
}
