module.exports = (sequelize, Sequelize) => {
    const Information = sequelize.define('Information', {
        info_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        key: {
            type: Sequelize.STRING,
            allowNull: false
        },
        value: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'text'
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'informations'
    });

    Information.associate = function(models) {
    };

    return Information;
}
