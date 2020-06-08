module.exports = (sequelize, Sequelize) => {
    const Ward = sequelize.define('Ward', {
        wardid: {
            type: Sequelize.STRING(20),
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(191),
            allowNull: false
        },
        districtid: {
            type: Sequelize.STRING(20),
            allowNull: false
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'ward'
    });

    Ward.associate = function(models) {
        Ward.belongsTo(models.District, {
            as: 'District',
            foreignKey: 'districtid',
            sourceKey: 'districtid',
            constraints: false 
        });
        Ward.hasMany(models.Order, {
            as: 'Order',
            foreignKey: 'ship_ward',
            sourceKey: 'wardid',
            constraints: false 
        });
    };

    return Ward;
}
