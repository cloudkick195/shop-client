module.exports = (sequelize, Sequelize) => {
    const PolicyPost = sequelize.define('PolicyPost', {
        post_id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true
        },
        post_slug: {
            type: Sequelize.STRING,
        },
        post_content: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        is_archive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        post_name: {
            type: Sequelize.STRING,
        }
    }, {
        underscored: true,
        timestamps: false,
        tableName: 'policy_posts'
    });

    return PolicyPost;
}
