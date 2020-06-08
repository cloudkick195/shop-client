const LocalStrategy = require('passport-local').Strategy;
const { reqValidator } = require('./../utils/validators/request.validate');
const { 
    findUserByEmail,
    createCustomerNotPassword } = require('./../repositories/customer.repo');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;  

module.exports = (passport) => {
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, async function(req, email, password, done) {
        
        const validation = {
            'email': {type: ['required','email']},
            'password': {name: 'Mật khẩu',type: ['required','password']},
        }
        const data = {
            email: email,
            password: password
        };
        
        const errors = reqValidator(validation, data);
        
        if(Object.keys(errors)[0]){
            return done(null, false, req.flash('error_messages', errors));
        }
    
        const customer = await findUserByEmail(data.email);
        
        if(!customer || !customer.validPassword(data.password)){
            return done(null, false, req.flash('error_messages', {error_default: 'Thông tin đăng nhập không hợp lệ'}));
        }
        delete customer.dataValues.password;
        
        return done(null, customer);
    }));

    passport.use('facebook',new FacebookStrategy({
	    clientID: '466033864198922',
	    clientSecret: '0552e066aad9e780c911ed5cb091b992',
	    callbackURL: 'http://localhost:3000/account/auth/fb/cb',
        passReqToCallback: true,
        profileFields: ['email', 'displayName', 'gender']
	  },
	  async function(req, accessToken, refreshToken, profile, done) {
            const customer = await createCustomerNotPassword(
                profile.emails[0].value, 
                profile.displayName,
                profile.gender
            );
            
            delete customer[0].dataValues.password;
            return done(null, customer[0].dataValues);
	    }

    ));
    
    passport.use('google',new GoogleStrategy({
	    clientID: '1095222547773-u6v4ko2fvde1ga8orc87kkcugugmstio.apps.googleusercontent.com',
	    clientSecret: 'M8TcojSELZjXsNa1gJl0OMCH',
	    callbackURL: 'http://localhost:3000/account/auth/gg/cb',
        passReqToCallback: true,
        profileFields: ['email', 'displayName', 'gender']
	  },
	  async function(req, accessToken, refreshToken, profile, done) {
          
            const customer = await createCustomerNotPassword(
                profile.emails[0].value, 
                profile.displayName,
                profile.gender
            );
        
            delete customer[0].dataValues.password;
            return done(null, customer[0].dataValues);
	    }

	));

    passport.serializeUser(function(user, done) {
        done(null, user.email);
      });
    
    passport.deserializeUser(async function(email, done) {
        const customer = await findUserByEmail(email);
        
        if(!customer || !customer.dataValues){
            return done(null, false);
        }
        delete customer.dataValues.password;
        done(null, customer.dataValues);
    });
    
}