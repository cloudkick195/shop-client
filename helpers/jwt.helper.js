const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const axios = require('axios');
const qs = require('qs');
const generateCustomerJwt = function (email) {
    return jwt.sign({email: email},
        process.env.JWT_CUSTOMER_SECRET || 'CLOUDKICK892',
        {expiresIn: process.env.JWT_CUSTOMER_EXPIRE_TIME || 5 * 60}
    );
};

const checkToken =  (token ) =>{
    return jwt.verify(token, process.env.JWT_CUSTOMER_SECRET || 'CLOUDKICK892');
}

const createNewTokenKiotviet = async ( ) =>{

    const kiotvietConfig = {
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET,
        "grant_type": process.env.GRANT_TYPE,
        "scopes": process.env.SCOPES,
    }
   
    const newAccessTokenKiotviet = await axios.post(process.env.KIOTVIET_URL_TOKEN, qs.stringify(kiotvietConfig), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })

    process.env['KIOTVIET_ACCESS_TOKEN'] = newAccessTokenKiotviet.data.access_token;
}

module.exports = { generateCustomerJwt, checkToken, createNewTokenKiotviet };
