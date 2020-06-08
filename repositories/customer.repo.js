const logger = require('./../utils/logger');
const bcrypt = require('bcryptjs');
const generator = require('generate-password');

const findUserByEmail = async (email) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
       
        return model.Customer.findOne({
            where: { email: email}
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}


const findUserByToken = async (token) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
       
        return model.Customer.findOne({
            where: { remember_token: token}
        });
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const updateUserByEmail = async (data) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
        let password = data.password;
        if(password)
            password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10))
        return model.Customer.update(
            { 
                name: data.name,
                gender: data.gender,
                birth_day: data.birthday,
                phone_temporary: data.phone,
                password: password,
                address: data.address,
            },
            { where: { email: data.email } }
          )
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const updateUserTokenByEmail = async (email, token) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
       
        return model.Customer.update(
            { remember_token: token },
            { where: { email: email } }
          )
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const updateUserPasswordByToken = async (token, password) => {
    try {
        const { model } = db;
        // const cacheData = await cacheAction.getKey('informations');
        // if (cacheData && cacheData.length > 0) {
        //     return { cache: true, data: JSON.parse(cacheData) };
        // }
       
        return model.Customer.update(
            { 
                password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                remember_token: null 
            },
            { where: { remember_token: token } }
          )
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const createCustomerNotPassword = async (email, name, gender) => {
    try {
        const { model } = db;
       
        return model.Customer.findOrCreate(
            { 
                where: { email: email },
                defaults: {
                    email: email,
                    name: name,
                    gender: gender,
                    password: generator.generate({
                        length: 10,
                        numbers: true
                    })
                }
            });
    } catch (error) {
        logger.error(error);
        return null;
    }
};

const createCustomer = async (data) => {
    try {
        const { model } = db;
        
        return model.Customer.create(
            { 
                email: data.email,
                name: data.last_name + " " +data.first_name,
                gender: data.gender,
                birth_day: data.birthday,
                phone_temporary: data.phone,
                password: data.password,
            });
    } catch (error) {
        logger.error(error);
        return null;
    }
};

module.exports = { findUserByEmail, createCustomer, updateUserTokenByEmail,
    findUserByToken,
    updateUserPasswordByToken,
    createCustomerNotPassword,
    updateUserByEmail };