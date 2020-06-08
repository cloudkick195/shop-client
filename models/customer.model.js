const bcrypt = require('bcryptjs');

module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define('Customer', {
        customer_id: {
            type: Sequelize.BIGINT(20),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(200),
            allowNull: false
        },
        gender: {
            type: Sequelize.DataTypes.ENUM('M', 'F', 'O'),
            allowNull: true
        },
        birth_day: {
            type: Sequelize.DATE,
            allowNull: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        phone: {
            type: Sequelize.STRING(20),
            unique: true,
            allowNull: true,
        },
        phone_temporary: {
            type: Sequelize.STRING(20),
            allowNull: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        creation_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        },
        remember_token: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status:{
            type: Sequelize.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0',
        },
        type:{
            type: Sequelize.ENUM('normal', 'vip'),
            allowNull: false,
            defaultValue: 'normal',
        }
    }, {
        underscored: true,
        hooks: {
            beforeCreate: (customer) => {
                const salt = bcrypt.genSaltSync(10);
                customer.password = bcrypt.hashSync(customer.password, salt);
            }
        },
        indexes:[
            {
              unique: true,
              fields:['email', 'phone']
            }
        ],
        timestamps: false,
        tableName: 'customer'
    });

    Customer.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    Customer.prototype.isVip= function () {
        return !!(this.type == 'vip');
    };
    Customer.associate = function(models) {
        Customer.hasMany(models.Order, {
            as: 'Order',
            foreignKey: 'customer_id',
            sourceKey: 'customer_id',
            constraints: false
        });
    };

    return Customer;
}
