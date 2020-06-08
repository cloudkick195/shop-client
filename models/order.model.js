module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
        order_id: {
            type: Sequelize.BIGINT(20),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        customer_id: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        ship_type: {
            type: Sequelize.ENUM('normal', 'fast'),
            allowNull: false,
            defaultValue: 'normal'
        },
        ship_payment: {
            type: Sequelize.ENUM('receive', 'transfer'),
            allowNull: false,
            defaultValue: 'receive'
        },
        ship_address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        ship_price: {
            type: Sequelize.INTEGER(11),
            allowNull: true
        },
        ship_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        ship_ward: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        order_description: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        discount: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: 0
        },
        order_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('process', 'complete', 'cancel'),
            allowNull: false,
            defaultValue: 'process'
        },
        customer_name: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        customer_phone: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        tracking_token: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true
        },
        
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'order'
    });

    Order.associate = function(models) {
        Order.belongsTo(models.Customer, {
            as: 'Customer',
            foreignKey: 'customer_id',
            targetKey: 'customer_id',
            constraints: false 
        });
        Order.belongsTo(models.Ward, {
            as: 'Ward',
            foreignKey: 'ship_ward',
            targetKey: 'wardid',
            constraints: false 
        });
        Order.hasMany(models.OrderDetail, {
            as: 'OrderDetail',
            foreignKey: 'order_id',
            sourceKey: 'order_id',
            constraints: false
        });
        Order.belongsToMany(models.Product, { through: 'order_detail' });
        Order.belongsToMany(models.ProductAttributeCombination, { through: 'order_detail' });
        Order.belongsTo(models.ConfigShipping, {
            as: 'ShippingType',
            foreignKey: 'ship_type',
            targetKey: 'type',
            constraints: false 
        });
        Order.belongsTo(models.ConfigShipping, {
            as: 'ShippingPayment',
            foreignKey: 'ship_payment',
            targetKey: 'type',
            constraints: false 
        });
    };

    return Order;
}
