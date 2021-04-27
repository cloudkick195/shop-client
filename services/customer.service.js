const { formatWithCommas } = require('./../helpers/currency.helper');
const { createImagePath } = require('./../helpers/file.helper');
const { generateCustomerJwt,
    checkToken } = require('./../helpers/jwt.helper');
const { sendEmail,sendTransporter } = require('./../helpers/nodemailer.helper');
const { getFormattedDate } = require('./../helpers/convert-date.helper');
const { isEmail } = require('validator');
const logger = require('./../utils/logger');
const { reqValidator } = require('./../utils/validators/request.validate');
const {  
    createCustomer,
    findUserByEmail,
    updateUserTokenByEmail,
    updateUserPasswordByToken,
    updateUserByEmail,
    findUserByToken } = require('./../repositories/customer.repo');
const {  
    getOrderByCustomerPhone,
    getShipOrder } = require('./../repositories/order.repo');
    
const {  
    getOrderDetailByOrderId } = require('./../repositories/order-detail.repo');
    
const pageConfig = require('../configs/page.config');    
const url = require('../configs/account.config')();

const Email = require('email-templates');
const nodemailerConfig = require('./../configs/nodemailer.config');

const register = async (req, res) => {
    try {
        const validation = {
            'last_name': {name: 'Họ và tên đệm', type: ['required']},
            'first_name': {name: 'Tên', type: ['required']},
            'gender': {name: 'Giới tính', type: ['in']},
            'birthday': {name: 'Ngày sinh', type: ['date']},
            'phone': {name: 'Số điện thoại', type: ['phone']},
            'email': {type: ['required','email']},
            'password': {name: 'Mật khẩu',type: ['required','password']},
        }
        const data = req.body;
        
        const errors = reqValidator(validation, data);
        if(Object.keys(errors)[0]){
            req.flash('error_messages', errors);
            return res.redirect(url.register);
        }
        const customer = (await createCustomer(data)).toJSON();
        
        delete customer.password;
        req.session.customer = customer;
        req.flash('success_messages', {'success_default': 'Đăng kí thành công'});
        res.redirect(url.login);

    } catch (error) {
        logger.error(error);
       
        if(error.parent.code == 'ER_DUP_ENTRY'){
            if(error.errors[0].path == 'phone_UNIQUE')
                req.flash('error_messages', {'error_default': 'Số điện thoại đã tồn tại, vui lòng thêm số điện thoại khác'});
            else
                req.flash('error_messages', {'error_default': 'Email đã tồn tại. Nếu bạn quên mật khẩu, bạn có thể <a href="/account/login#recover">thiết lập lại mật khẩu tại đây.</a>'});
        }else{
            req.flash('error_messages', {'error_default': 'Vui lòng thực hiện lại'});
        }
        return res.redirect(url.register);
    }
}

const update = async (req, res) => {
    try {
        const validation = {
            'name': {name: 'Họ và tên', type: ['required']},
            'gender': {name: 'Giới tính', type: ['in']},
            'birthday': {name: 'Ngày sinh', type: ['date']},
            'phone': {name: 'Số điện thoại', type: ['phone']},
            'email': {type: ['required', 'email']},
            'password': {name: 'Mật khẩu',type: ['password']},
            'password_comfirm': {name: 'Xác nhận mật khẩu',type: ['password']},
            'address': {type: ['text']}
        }
        req.body.email = req.user.email;
        const data = req.body;
       
        let errors = reqValidator(validation, data);
        if(data.password !== data.password_comfirm){
            errors['password_comfirm'] = 'Xác nhận mật khẩu sai';
        }
        
        if(Object.keys(errors)[0]){
            req.flash('error_messages', errors);
            
            return res.redirect(url.account);
        }
       
        
        const customer = await updateUserByEmail(data);
 
        req.flash('success_messages', {'success_default': 'Cập nhật thành công'});
        res.redirect(url.account);

    } catch (error) {
        logger.error(error);
       
        if(error.parent.code && error.parent.code == 'ER_DUP_ENTRY'){
            if(error.errors[0].path == 'phone_UNIQUE')
                req.flash('error_messages', {'error_default': 'Số điện thoại đã tồn tại, vui lòng thêm số điện thoại khác'});
            else
                req.flash('error_messages', {'error_default': 'Email đã tồn tại. Nếu bạn quên mật khẩu, bạn có thể <a href="/account/login#recover">thiết lập lại mật khẩu tại đây.</a>'});
        }else{
            req.flash('error_messages', {'error_default': 'Vui lòng thực hiện lại'});
        }
        return res.redirect(url.register);
    }
}

const orderPage = async (req, res) => {
    try {
        const orders = await getOrderByCustomerPhone(req.user.phone);
        if(!orders)
            return res.cRender('account/order.pug', { 
                infos: orders, 
                cart: null,
                title: 'Order', formatWithCommas: formatWithCommas,
                formatDate: getFormattedDate
            });

        return res.cRender('account/order.pug', { 
            infos: orders,
            title: 'Order', formatWithCommas: formatWithCommas,
            formatDate: getFormattedDate
        });
    } catch (error) {
        logger.error(error);
        return res.json({ error: true, verify: false });
    }
}

const orderPageDetail = async (req, res) => {
    try {

        const result = await Promise.all([getShipOrder(req.params.id), getOrderDetailByOrderId(req.params.id)])
        
        
        if(!result[1])
            return res.cRender('account/order-detail.pug', { 
                shipping_price: result[0].ship_price, 
                orderId: req.params.id,
                cart: null,
                title: 'Order Detail', formatWithCommas: formatWithCommas,
                formatDate: getFormattedDate
            });

        const cart = {
            items: [],
            total_qty: 0,
            total_price: 0,
        }
        
        for (let val of result[1]) {
            cart.items.push(val.dataValues);
            cart.total_qty += val.dataValues.qty;
            cart.total_price += val.dataValues.price * val.dataValues.qty;
        }
            

        return res.cRender('account/order-detail.pug', { 
            shipping_price: result[0].ship_price, 
            cart: cart,
            orderId: req.params.id,
            title: 'Order Detail', formatWithCommas: formatWithCommas,
            formatDate: getFormattedDate
        });
    } catch (error) {
        logger.error(error);
        return res.json({ error: true, verify: false });
    }
}

const registerPage = async (req, res) => {
    try {
        return res.cRender('auth/register.pug', { message:  req.flash('error_messages')[0] || [],title: 'Register', formatWithCommas: formatWithCommas });
    } catch (error) {
        logger.error(error);
        return res.json({ error: true, verify: false });
    }
}

const accountPage = async (req, res) => {
    try {
        let message = req.flash('error_messages')[0] || [];
        const successMessages = req.flash('success_messages')[0];
       
        if(successMessages){
            message = successMessages;
        }
        const birthDay = req.user.birth_day;
        req.user.birth_day = getFormattedDate(birthDay);
        
        return res.cRender('account/account.pug', { message:  message, user: req.user, title: 'Login', formatWithCommas: formatWithCommas });
    } catch (error) {
        logger.error(error);
        return res.redirect(url.login);
    }
}

const loginPage = async (req, res) => {
    try {
        let message = req.flash('error_messages')[0] || [];
        const successMessages = req.flash('success_messages')[0];
       
        if(successMessages){
            message = successMessages;
        }
        
        return res.cRender('auth/login.pug', { message:  message,title: 'Login', formatWithCommas: formatWithCommas });
    } catch (error) {
        logger.error(error);
        return res.redirect(url.login);
    }
}


const recoverPage= async (req, res) => {
    try {

        let message = req.flash('error_messages')[0] || [];
        const successMessages = req.flash('success_messages')[0];
       
        if(successMessages){
            message = successMessages;
        }

        const token = req.params.token;
        const checkJwt = await checkToken(token);
        
        if(!checkJwt){
            req.flash('error_messages', {'error_default': 'Link đặt lại mật khẩu hết hạn, vui lòng gửi lại'});
            return res.redirect(url.loginRecover);
        }
        
        if(!(await findUserByToken(token))){
            req.flash('error_messages', {'error_default': 'Vui lòng thực hiện lại'});
            return res.redirect(url.loginRecover);
        }
        return res.cRender('auth/recover.pug', { message:  message, token:token, title: 'Reset User Password', formatWithCommas: formatWithCommas });
    } catch (error) {
       
        if(error.name == 'TokenExpiredError'){
            req.flash('error_messages', {'error_default': 'Link đặt lại mật khẩu hết hạn, vui lòng gửi lại'});
            
        }else{
            logger.error(error);
        }
        
        return res.redirect(url.loginRecover);
    }
}

const recover = async (req, res) => {
    try {
        const validation = {
            'email': {type: ['required','email']},
        }
        const data = req.body;
        
        const errors = reqValidator(validation, data);
        
        if(Object.keys(errors)[0]){
            req.flash('error_messages', errors)
            return  res.redirect(url.loginRecover);;
        }
        const token = generateCustomerJwt(data.email);
        
        const customer = await updateUserTokenByEmail(data.email, token);
        if(!customer || !customer[0]){
            req.flash('error_messages', {'error_default': 'Không tìm thấy email'});
            return  res.redirect(url.loginRecover);;
        }
        
        const email = new Email({
            preview: false,
            send: true,
            transport: sendTransporter()
        });
        
        email.send({
            template: 'password-reset',
            message: {
                from: `PAPAZI <${nodemailerConfig().gmail.emailAddress}>`,
                to: data.email
            },
            locals: {
                url: pageConfig().baseUrl + url.reset,
                token: token
            }
        });

        req.flash('success_messages', {'success_default': 'Vui lòng kiểm tra email để đặt lại mật khẩu'})
        return  res.redirect(url.login);;
          
    } catch (error) {
        logger.error(error);
       
        req.flash('error_messages', {'error_default': 'Vui lòng thực hiện lại'});
        return res.redirect(url.login);
    }
}

const reset = async (req, res) => {
    try {
        
        const token = req.params.token;
        
        const checkJwt = await checkToken(token);
        if(!checkJwt){
            return res.status(400).json({ message: 'Link đặt lại mật khẩu hết hạn, vui lòng gửi lại', url: url.loginRecover});
        }
        const validation = {
            'password': {type: ['required', 'password']},
            'password_confirmation': {type: ['required', 'password']}
        }
        const data = req.body;
        
        const errors = reqValidator(validation, data);

        
        if(Object.keys(errors)[0]){
            return res.status(400).json({ errors: errors});
        }


        if(data.password !== data.password_confirmation){
            return res.status(400).json({ errors: {'password_confirmation': 'Xác nhận mật khẩu sai'}});
        }
        
       
        
        const customer = await updateUserPasswordByToken(token, data.password);
        
        if(!customer || !customer[0]){
            return res.status(400).json({ message: 'Không tìm thấy Vui lòng gửi lại', url: url.loginRecover});
        }
        
        const email = new Email({
            preview: false,
            send: true,
            transport: sendTransporter()
        });
        
        email.send({
            template: 'password-reset-success',
            message: {
                from: `PAPAZI <${nodemailerConfig().gmail.emailAddress}>`,
                to: checkJwt.email
            },
            locals: {
                url: pageConfig().baseUrl + url.reset,
                token: token
            }
        });

        req.flash('success_messages', {'success_default': 'Đổi mật khẩu thành công'});
        
        return res.status(200).json({ url: url.login});
          
    } catch (error) {
        if(error.name == 'TokenExpiredError'){
            req.flash('error_messages', {'error_default': 'Link đặt lại mật khẩu hết hạn, vui lòng gửi lại'});
            
        }else if(error.name == 'JsonWebTokenError'){
            req.flash('error_messages', {'error_default': 'Token không đúng, Vui lòng thực hiện lại'});
        }else{
            req.flash('error_messages', {'error_default': 'Vui lòng thực hiện lại'});
            logger.error(error);
            
        }
        
        return res.redirect(url.loginRecover);
    }
}

module.exports = { 
    register, loginPage, registerPage,
    recoverPage,
    recover,
    reset,
    accountPage,
    update,
    orderPage,
    orderPageDetail
};