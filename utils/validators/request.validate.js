//const { body, check } = require('express-validator');
const isEmail = require('validator/lib/isEmail');
const isISO8601 = require('validator/lib/isISO8601');
const isIn = require('validator/lib/isIn');
const escape = require('validator/lib/escape');
const trim = require('validator/lib/trim');
const normalizeEmail = require('validator/lib/normalizeEmail');
const toDate = require('validator/lib/toDate');


// const validateRegisterUser = () => {
//     return [ 
//         body('last_name', 'Vui lòng nhập Họ và tên đệm').not().isEmpty().trim().escape(), 
//         body('first_name', 'Vui lòng nhập tên').not().isEmpty().trim().escape(),
//         body('gender', 'Vui lòng chọn giới tính').isIn(['F', 'M', 'O']),
//         body('birthday').custom((value) => {
//             return validateDate(value);
//         } ),
//         body('email', 'Vui lòng nhập đúng định dạng Email').trim().isEmail().normalizeEmail(),
//         body('phone', 'Vui lòng nhập đúng số điện thoại').matches(/^\+?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/),
//         body('password', 'Vui lòng nhập đủ kí tự').trim().isLength({ min: 5 }),
//     ]; 
// }

// const validateLogin = () => {
//   return [ 
//     check('user.email', 'Invalid does not Empty').not().isEmpty(),
//     check('user.email', 'Invalid email').isEmail(),
//     check('user.password', 'password more than 6 degits').isLength({ min: 6 })
//   ]; 
// }





const requestValidate = (validation, data)=> {
    try {
        const result = {};
        Object.keys(validation).map((key) => {
            const vl = typeof data[key] == 'number' ? data[key] : (data[key] || null);
            
            const validateResults = validateWithKey(key, validation[key], vl).filter((item) => item);
            if (validateResults && validateResults.length > 0) {
                result[key] = validateResults;
            }
        });
        return {
            errors: result,
            success: !Object.keys(result)[0]
        };
    }
    catch (err) {
        throw new Error(err.message);
    }
}
const reqValidator = (validation, data) => {
    try {
        const errors = {};
        for (const key in validation) {
            for (const type of validation[key].type) {
                handleValidator[type](key, validation[key].name || key, errors, data);
            }
        }
        return errors
    }catch (err) {
        throw new Error(err.message);
    }
}
const textError = {
    missing: (name) => `Vui lòng nhập ${ name }`,
    format: (name, format) => `Vui lòng nhập đúng định dạng ${ name }`,
    short: (name, min) => `Vui lòng nhập ${ name } tối thiểu ${ min } kí tự`,
    long: (name, max) => `Vui lòng nhập ${ name } ít hơn ${ max } kí tự`,
    radio: (name, radio) => `Vui lòng chọn ${ name } là ${ radio }`,
}

const messError = {
    required: (name) => textError.missing(name),
    in: (name) => textError.radio(name, 'Nam hoặc nữ hoặc giới tính khác'),
    date: (name) => textError.format('ngày/tháng/năm'),
    email: (name) => textError.format(name, 'Email'),
    phone: (name) => textError.format(name),
    password: (name) => textError.short(name, 5),
}

const handleValidator = {
    required: (key, name, errors, data) => !data[key] ?  errors[key] = messError.required(name) : data[key] = escape(trim(data[key])),
    in: (key, name, errors, data) => {
        if(!data[key])
            return data[key] = undefined;

        if(!isIn(data[key], ['F', 'M', 'O']))
            return errors[key] = messError.in(name)

        data[key] = escape(trim(data[key]))
    },
    date: (key, name, errors, data) => {
        let date = data[key];
        if(!date)
            return data[key] = undefined;
        
        if( date.split("/").length == 3){
            const dataSplit = date.split("/");
            date = dataSplit[2] + '-' + dataSplit[1] + '-' + dataSplit[0]
        }else if(data[key].split("-").length == 3){
            const dataSplit = date.split("-");
            date = dataSplit[2] + '-' + dataSplit[1] + '-' + dataSplit[0]
        }
        
        if(!isISO8601(date))
        {
            return errors[key] = messError.date(name)
        }

            
        data[key] = toDate(trim(date));

    },
    email: (key, name, errors, data) => {
        if(!data[key])
            return data[key] = undefined;

        if(!isEmail(data[key]))
            return errors[key] = messError.email(name)

        data[key] = normalizeEmail(trim(data[key]))
    },
    password: (key, name, errors, data) => {
        if(!data[key])
            return data[key] = undefined;

        if(data[key].length < 5)
            return errors[key] = messError.password(name)

        data[key] = trim(data[key])
    },
    phone: (key, name, errors, data) => {
        if(!data[key])
            return data[key] = undefined;

        if(!validatePhone(data[key]))
            return errors[key] = messError.phone(name)

        data[key] = trim(data[key])
    },
    text: (key, name, errors, data) => {
        if(!data[key])
            return data[key] = "";

        data[key] = trim(data[key])
    },
}


const setNullVal = (data, valSet)=> {
    try {
        for (const vlS of valSet) {
            if(!data[vlS]) data[vlS] = null;
        }

    }
    catch (err) {
        throw new Error(err.message);
    }
}

const validateWithKey = (name, validations, data) => {
    if (validations) {
        return validations.map((item) => {    
            const keySplitted = item.split(":");
            const keyName = keySplitted.length > 1 ? keySplitted[0].toString() : item;
            const length = keySplitted.length > 1 ? parseInt(keySplitted[1].toString()) : 0;
            name = keySplitted.length > 1 &&  keySplitted[0] == 'required' ? keySplitted[1] : `${ name } là bắt buộc`;
            if (handleFunction[keyName]) {
                return handleFunction[keyName](name, data, length);
            }
            else {
                throw new Error("Không xác minh được " + item);
            }
        });
    }
}

const message = {
    required: (name) => `${ name }`,
    minLength: (name, length) => `${ name } có độ dài hơn ${ length } kí tự`,
    maxLength: (name, length) => `${ name } có độ dài dưới ${ length } kí tự`,
    email: (value) => `Vui lòng nhập đúng định dạng Email`,
    phone: (value) => `Vui lòng nhập đúng định dạng số điện thoại`,
}

const handleFunction = {
    required: (key, value, length) => value && value != 'null' ? null : message.required(key),
    minLength: (key, value, minLength) => value && value.length >= minLength ? null : message.minLength(key, minLength),
    maxLength: (key, value, length) => value && value.length <= length ? null : message.minLength(key, length),
    email: (key, value, length) => value && validateEmail(value) ? null : message.email(value),
    phone: (key, value, length) => value && validatePhone(value) ? null : message.phone(value)
}

const validateEmail = (email) => {
    var reGex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reGex.test(email);
}

const validatePhone = (phone) => {
    var reGex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
    return reGex.test(phone);
}

module.exports = { 
    requestValidate,
    setNullVal,
    reqValidator
};  