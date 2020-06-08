module.exports = (sequelize, Sequelize) => {
    const District = sequelize.define('District', {
        districtid: {
            type: Sequelize.STRING(20),
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(191),
            allowNull: false
        },
        provinceid: {
            type: Sequelize.STRING(20),
            allowNull: false
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'district'
    });

    District.associate = function(models) {
        District.belongsTo(models.Province, {
            as: 'Province',
            foreignKey: 'provinceid',
            constraints: false 
        });
        District.hasMany(models.Ward, {
            as: 'Ward',
            foreignKey: 'districtid',
            sourceKey: 'districtid',
            constraints: false 
        });
    };

    return District;
}
