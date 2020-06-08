module.exports = (sequelize, Sequelize) => {
    const MainSlide = sequelize.define('MainSlide', {
        slide_id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        id_process_image: {
            type: Sequelize.BIGINT(20),
            allowNull: true,
            defaultValue: null
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        link: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'main_slides'
    });

    MainSlide.associate = function(models) {
        MainSlide.hasOne(models.ProcessImage, {
            as: 'Avatar',
            foreignKey: 'id_process_image',
            sourceKey: 'id_process_image',
            constraints: false 
        });
    };

    return MainSlide;
}
