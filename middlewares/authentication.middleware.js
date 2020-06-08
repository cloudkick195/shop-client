const url = require('../configs/account.config')();
const authenticationMiddlware = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect(url.login);
}
const forwardAuthenticated  = function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/account');      
}

module.exports = { authenticationMiddlware, forwardAuthenticated }