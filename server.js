var express = require("express"); 
var app = express();
var port = process.env.port || 8000;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var passport = require("passport");


var morgan = require('morgan'); 
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); 
var session = require('express-session');

app.use(session({ secret:'ilovepassport' })); 
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

var LocalStrategy = require('passport-local').Strategy;
mongoose.connect('127.0.0.1:27017');

var User = mongoose.model('Users', { username:String, password:String });

var isValidPassword = function(user, password)
{
  return bCrypt.compareSync(password, user.password);
}












passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


















passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false);                 
        }
        // User exists but wrong password, log the error 
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return done(null, false);
        }
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
}));


passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
       







        if (!user) {
          

                 console.log('Creating account');


                        var newUser = new User();
                        newUser.username = username;
                        newUser.password = createHash(password);

                        newUser.save(function(err){
                          if (err)
                          {
                            console.log('Error in Saving user: '+err);  
                            throw err;  
                          }

                          console.log('User Registration succesful');    
                          return done(null, newUser);
                                  


                        });
          












        }
       
      });
}));






var createHash = function(password)
{
     
     return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);

}


app.get('/', function(req,res){
  


  res.send('<h1>Log In</h1>\
  <form action="/login" method="post">\
  <div>\
  <label>Username:</label>\
  <input type="text" name="username"/>\
  </div>\
  <div>\
  <label>Password:</label>\
  <input type="password" name="password"/>\
  </div>\
  <div>\
  <input type="submit" value="Log In"/>\
  </div>\
  </form>\
  <br>\
  <br>\
  <h1>Sign UP</h1>\
  <form action="/signup" method="post">\
  <div>\
  <label>Username:</label>\
  <input type="text" name="username"/>\
  </div>\
  <div>\
  <label>Password:</label>\
  <input type="password" name="password"/>\
  </div>\
  <div>\
  <input type="submit" value="Log In"/>\
  </div>\
  </form>');



            






});

app.post('/login', passport.authenticate('login', {
  successRedirect:'/pass',
  failureRedirect:'/fail',


}) );

app.post('/signup', passport.authenticate('signup', {
  successRedirect:'/pass',
  failureRedirect:'/fail',


}) );


app.get('/pass', function(req, res){
 
 res.send('<h1>It is a success!</h1>');

});

app.get('/fail', function(req, res){
 
 res.send('<h1>It is a not a success!</h1>');

});


app.listen(port);
console.log("App's up at " + port);







