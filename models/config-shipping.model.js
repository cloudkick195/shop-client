module.exports = (sequelize, Sequelize) => {
    const ConfigShipping = sequelize.define('ConfigShipping', {
        key: {
            type: Sequelize.ENUM('default', 'province', 'district', 'ward', 'total', 'product', 'category','receive', 'transfer'),
            allowNull: false
        },
        value: {
            type: Sequelize.STRING(100),
            allowNull: false,
            primaryKey: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        price: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            defaultValue: '0',
        },
        type: {
            type: Sequelize.ENUM('normal', 'fast','receive', 'transfer'),
            allowNull: false,
            primaryKey: true,
        }
    }, {
        underscored: true,
        timestamps: false,
        indexes:[
            {
              unique: true,
              fields:['value']
            }
        ],
        tableName: 'config_shipping'
    });

    ConfigShipping.associate = function(models) {
        ConfigShipping.hasOne(models.Order, {
            as: 'ShippingType',
            foreignKey: 'ship_type',
            sourceKey: 'type',
            constraints: false 
        });
        ConfigShipping.hasOne(models.Order, {
            as: 'ShippingPayment',
            foreignKey: 'ship_payment',
            sourceKey: 'type',
            constraints: false 
        });
    };

    return ConfigShipping;
}
