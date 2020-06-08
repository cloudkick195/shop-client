module.exports = (sequelize, Sequelize) => {
    const ProductCategory = sequelize.define('ProductCategory', {
        product_category_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
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
        parent_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false,
            defaultValue: 0
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        created_by: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        show_tooltip_background: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        position: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        show_home: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        underscored: true,
        timestamps: true,
        tableName: 'product_categories'
    });

    ProductCategory.associate = function(models) {
        ProductCategory.hasOne(models.ProcessImage, {
            as: 'Avatar',
            foreignKey: 'id_process_image',
            sourceKey: 'id_process_image',
            constraints: false
        });
        ProductCategory.belongsTo(models.ProductCategory, {
            as: 'ParentCategory',
            foreignKey: 'parent_id',
            sourceKey: 'product_category_id',
            constraints: false
        });
        ProductCategory.hasMany(models.ProductCategory, {
            as: 'ChildCategory',
            foreignKey: 'parent_id',
            sourceKey: 'product_category_id',
            constraints: false
        });
        ProductCategory.belongsTo(models.User, {
            as: 'User',
            foreignKey: 'id',
            sourceKey: 'created_by',
            constraints: false
        });
        ProductCategory.hasMany(models.Product, {
            as: 'Product',
            foreignKey: 'category_id',
            sourceKey: 'product_category_id',
            constraints: false
        });
    };

    return ProductCategory;
}
