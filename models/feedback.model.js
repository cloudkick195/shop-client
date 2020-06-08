module.exports = (sequelize, Sequelize) => {
    const Feedback = sequelize.define('Feedback', {
        id: {
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
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'customer_feedbacks'
    });

    Feedback.associate = function(models) {
        Feedback.hasOne(models.ProcessImage, {
            as: 'Image',
            foreignKey: 'id_process_image',
            sourceKey: 'id_process_image',
            constraints: false 
        });
    };

    return Feedback;
}
