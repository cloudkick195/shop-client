module.exports = (sequelize, Sequelize) => {
    const Province = sequelize.define('Province', {
        provinceid: {
            type: Sequelize.STRING(20),
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(191),
            allowNull: false
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'province'
    });

    Province.associate = function(models) {
        Province.hasMany(models.District, {
            as: 'District',
            foreignKey: 'provinceid',
            sourceKey: 'provinceid',
            constraints: false 
        });
    };

    return Province;
}
