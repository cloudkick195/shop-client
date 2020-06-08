const roleConfig = require('./../configs/role.config');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.User.findOne({ where: { email, role_id: roleConfig.userRole } });
        if (user && user.email) {
            if (!user.validPassword(password)) {
                req.flash('error_messages', 'Wrong password');
                return res.redirect('/users');
            }
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        }
        req.flash('error_messages', 'Can not find any record here');
        return res.redirect('/users');
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = { login };