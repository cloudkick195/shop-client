require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const cron = require('node-cron');
const axios = require('axios');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dashboardRouter = require('./routes/dashboard');
const cartRouter = require('./routes/cart');
const customerRouter = require('./routes/customer');
const checkOutRouter = require('./routes/checkout');
var passport = require('passport');
require('./configs/passport.config')(passport);
var flash = require('connect-flash');
const databaseConnect = require('./configs/db.config');
const redisClient = require('./configs/redis.client');
const pageConfig = require('./configs/page.config');
const qs = require('qs');


const listFnHelper = require('./helpers/function');
var app = express();
const requestMiddleware = require('./middlewares/request.middleware');
var productRoute = require('./routes/product');
var categoryRoute = require('./routes/category');
const cacheVerifyRoute = require('./routes/cache');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: process.env.SESSION_SECRET || 'tuananh',
    httpOnly: true,
    secure: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 600000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
const db = databaseConnect();
global.db = db;
db.sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

global.infoPage = pageConfig();

const cacheClient = redisClient();
global.cacheClient = cacheClient.redisClient;
global.cacheAction = cacheClient.client;
global.fn = listFnHelper;
global.pageInformation = {};

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', requestMiddleware, indexRouter);
//app.use('/users', requestMiddleware, usersRouter);
//app.use('/dashboard', requestMiddleware, dashboardRouter);
app.use('/cart', cartRouter);
app.use('/account', customerRouter);
app.use('/checkout', checkOutRouter);
app.use(`${ fn.linkProduct() }`,  productRoute);
app.use(`${ fn.linkCategory() }`, requestMiddleware, categoryRoute);
app.use('/cache-verify', cacheVerifyRoute);

app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.infoPage = infoPage;
    next();
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    res.cRender('error.pug', {
        title: '404'
    });
});

// Run cronjob to get new KIOTVIET access token
cron.schedule("0 0 */12 * * *", function() {
    const data = {
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET,
        "grant_type": process.env.GRANT_TYPE,
        "scopes": process.env.SCOPES,
    }

    axios.post(process.env.KIOTVIET_URL_TOKEN, qs.stringify(data), {
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then((res) => {
        console.log('****** data: ', res.data)
        process.env['KIOTVIET_ACCESS_TOKEN'] = res.data.access_token;
        console.log('new token: ', process.env.KIOTVIET_ACCESS_TOKEN);
    })
    .catch((error) => {
        console.error(error)
    })
});


module.exports = app;
