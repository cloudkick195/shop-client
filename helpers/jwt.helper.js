const jwt = require('jsonwebtoken');
const generateCustomerJwt = function (email) {
    return jwt.sign({email: email},
        process.env.JWT_CUSTOMER_SECRET || 'CLOUDKICK892',
        {expiresIn: process.env.JWT_CUSTOMER_EXPIRE_TIME || 5 * 60}
    );
};

const checkToken = async (token ) =>{
    return jwt.verify(token, process.env.JWT_CUSTOMER_SECRET || 'CLOUDKICK892');
}

module.exports = { generateCustomerJwt, checkToken };
