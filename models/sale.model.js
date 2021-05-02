module.exports = (sequelize, Sequelize) => {
    const Sale = sequelize.define('Sale', {
        sale_id: {
            type: Sequelize.BIGINT(20),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(45),
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        type: {
            type: Sequelize.ENUM('percen', 'same_amount', 'minus_amount'),
            allowNull: false,
            defaultValue: 'percen'
        },
        type_select: {
            type: Sequelize.ENUM('all', 'product', 'category'),
            allowNull: false,
            defaultValue: 'all'
        },
        category_select: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        product_select: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        status: {
            type: Sequelize.INTEGER(1),
            allowNull: true,
            defaultValue: 1
        },
        value: {
            type: Sequelize.INTEGER,
            allowNull: false
           
        },
        prioritize:{
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true
        }
        
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'sales'
    });

    Sale.associate = function(models) {

    };

    return Sale;
}
