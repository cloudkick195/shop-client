module.exports = (sequelize, Sequelize) => {
    const ProcessImage = sequelize.define('ProcessImage', {
        id_process_image: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        process_key: {
            type: Sequelize.STRING,
            allowNull: false
        },
        path: {
            type: Sequelize.STRING,
            allowNull: false
        },
        file_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        version: {
            type: Sequelize.STRING,
            allowNull: false
        },
        signature: {
            type: Sequelize.STRING,
            allowNull: true
        },
        resource_type: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'process_images'
    });

    ProcessImage.associate = function(models) {
    };

    return ProcessImage;
}
