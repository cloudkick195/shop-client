const nodemailer = require('nodemailer');
const nodemailerConfig = require('./../configs/nodemailer.config');

const sendEmail = (to, subject, body, res) => {
    const config = nodemailerConfig().gmail;
    
    const emailSettings = {
        host: config.emailHost,
        port: config.emailPort,
        secure: config.emailSecure,
        auth: {
            user: config.emailUser,
            pass: config.emailPassword
        }
    };

    // outlook needs this setting
    if(config.emailHost === 'smtp-mail.outlook.com'){
        emailSettings.tls = { ciphers: 'SSLv3' };
    }

    const transporter = nodemailer.createTransport(emailSettings);

    const mailOptions = {
        from: config.emailAddress, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: cRender('templates/password-reset.pug')
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            return error.message;
        }
        return true;
    });
};

const sendTransporter = (to, subject, body, res) => {
    const config = nodemailerConfig().gmail;
    
    const emailSettings = {
        pool: true,
        host: config.emailHost,
        port: config.emailPort,
        secure: config.emailSecure,
        auth: {
            user: config.emailUser,
            pass: config.emailPassword
        }
    };

    // outlook needs this setting
    if(config.emailHost === 'smtp-mail.outlook.com'){
        emailSettings.tls = { ciphers: 'SSLv3' };
    }

    return nodemailer.createTransport(emailSettings);
};

module.exports = { sendEmail, sendTransporter };