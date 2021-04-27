var express = require('express');
var router = express.Router();
const { shopIndex, productSearch, searchPage, salePage } = require('./../services/home.service');
const { getPrivacyPolicyBySlug } = require('./../services/privacy-policy.service');
const Email = require('email-templates');
const nodemailerConfig = require('./../configs/nodemailer.config');
const { sendEmail,sendTransporter } = require('./../helpers/nodemailer.helper');
const { reqValidator } = require('./../utils/validators/request.validate');

/* GET home page. */
router.get('/', shopIndex);
router.get('/search', searchPage);
router.get('/giam-gia', salePage);
router.get('/page/:slug', getPrivacyPolicyBySlug);
router.post('/search', productSearch);
router.post('/newsletter', function (req, res, next) {
    try {
        const validation = {
            'email': {type: ['required', 'email']}
        }

        const data = req.body;

        reqValidator(validation, data);

        const errors = reqValidator(validation, data);

        if(Object.keys(errors)[0]){
            return res.status(200).json({
                status: false,
                msg: "Vui lòng nhập đúng đinh dạng email"
            });
        }
        const email = new Email({
            preview: false,
            send: true,
            transport: sendTransporter()
        });

        email.send({
            template: 'newsletter-success',
            message: {
                from: `PAPAZI <${nodemailerConfig().gmail.emailAddress}>`,
                to: `${nodemailerConfig().gmail.emailAddress}, ${nodemailerConfig().gmail.emailMoreAddress}`
            },
            locals: {
                email: data.email
            }
        })
        return res.status(200).json({
            status: true,
            msg: "Gửi đăng kí thàng công"
        });

    } catch (error) {
        console.log(3, error)
        return res.status(200).json({
            status: false,
            msg: "Gửi đăng kí thất bại"
        });
        logger.error(error);
    }
});


router.get('/home', function (req, res, next) {
    res.render('home/home.pug', { title: 'Shop 160', description: 'hiih', list: [{ title: 'Bai viet 1', view: 2 }, { title: 'Bai viet 2', view: 3 }] });
});

module.exports = router;
