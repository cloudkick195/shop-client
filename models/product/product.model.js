module.exports = (sequelize, Sequelize) => {
    const Product = sequelize.define('Product', {
        product_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        slug: {
            type: Sequelize.STRING,
            allowNull: false
        },
        id_process_image: {
            type: Sequelize.BIGINT(20),
            allowNull: true,
            defaultValue: null
        },
        category_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
            defaultValue: 0
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        price_sale: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        sku: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null
        },
        archive_by: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        created_by: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'products'
    });

    Product.associate = function(models) {
        Product.hasOne(models.ProcessImage, {
            as: 'Avatar',
            foreignKey: { field: 'id_process_image', allowNull: true },
            sourceKey: 'id_process_image',
            constraints: false 
        });
        Product.hasOne(models.ProductCategory, {
            as: 'ProductCategory',
            foreignKey: 'product_category_id',
            sourceKey: 'category_id',
            constraints: false 
        });
        Product.belongsTo(models.User, {
            as: 'CreatedByUser',
            foreignKey: 'id',
            sourceKey: 'created_by',
            constraints: false 
        });
        Product.belongsTo(models.User, {
            as: 'ArchiveByUser',
            foreignKey: 'id',
            sourceKey: 'archive_by',
            constraints: false 
        });
        Product.hasMany(models.ProductAttributeCombination, {
            as: "ProductAttributeCombination",
            foreignKey: { name: 'product_id', allowNull: true },
            sourceKey: 'product_id',
            constraints: false
        });
        Product.hasMany(models.ProductSlide, {
            as: "ProductSlide",
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false
        });
        Product.hasMany(models.ProductAttributeEntityCombination, {
            as: "ProductAttributeEntityCombination",
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false
        });
        Product.hasMany(models.ProductWholeSale, {
            as: 'ProductWholeSale',
            foreignKey: 'product_id',
            sourceKey: 'product_id',
            constraints: false
        });
        Product.belongsToMany(models.Order, { through: 'order_detail' });
    };

    return Product;
}
