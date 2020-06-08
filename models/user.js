const bcrypt = require('bcryptjs');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        role_id: {
            type: Sequelize.INTEGER,
            unique: false,
            allowNull: false
        },
        id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        email_verified_at: {
            type: Sequelize.DATE,
            allowNull: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        remember_token: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        underscored: true,
        hooks: {
            beforeCreate: (user) => {
                const salt = bcrypt.genSaltSync(10);
                user.password = bcrypt.hashSync(user.password, salt);
            }
        },
        timestamps: false,
        tableName: 'users'
    });

    User.prototype.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    }

    User.associate = function(models) {
    };

    return User;
}
