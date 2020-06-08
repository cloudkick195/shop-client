module.exports = (sequelize, Sequelize) => {
    const OrderDetail = sequelize.define('OrderDetail', {
        order_detail_id: {
            type: Sequelize.BIGINT(20),
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        product_id: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        combination_id: {
            type: Sequelize.BIGINT(20),
            allowNull: true
        },
        qty: {
            type: Sequelize.BIGINT(20),
            allowNull: false
        },
        product_price: {
            type: Sequelize.INTEGER(11),
            allowNull: false
        },
        product_old_price: {
            type: Sequelize.INTEGER(11),
            allowNull: false
        },
        product_name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        product_option: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        avatar: {
            type: Sequelize.STRING(255),
            allowNull: false,
        }
        
        
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'order_detail'
    });

    OrderDetail.associate = function(models) {
        
    };

    return OrderDetail;
}
