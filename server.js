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

var FacebookStrategy = require('passport-facebook').Strategy;
mongoose.connect('127.0.0.1:27017');

var User = mongoose.model('User', { id:String, access_token:String, firstName: String, lastName: String });

var appId = '944844425616007' ;
var appSecret ='556ed64eca97c120cb06d5479f586455' ;
var callBackUrl ='http://localhost:8000/auth/facebook/callback' ; 


passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use('facebook', new FacebookStrategy({
  clientID        : appId,
  clientSecret    : appSecret,
  callbackURL     : callBackUrl
},
 
  // facebook will send back the tokens and profile

  function(access_token, refresh_token, profile, done) {
    // asynchronous
    process.nextTick(function() {

      // find the user in the database based on their facebook id
      User.findOne({ 'id' : profile.id }, function(err, user) {

        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err)
          return done(err);

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();

            // set all of the facebook information in our user model
            newUser.id    = profile.id; // set the users facebook id                 
            newUser.access_token = access_token; // we will save the token that facebook provides to the user                    
            newUser.firstName  = profile.name.givenName;
            newUser.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          } 
        });
    });
  }));

app.get('/auth/facebook', passport.authenticate('facebook'));


app.get('/auth/facebook/callback', passport.authenticate('facebook', {
                  successRedirect : '/pass',
                  failureRedirect : '/fail'
}));



app.get('/pass', function(req, res){

 res.send('<h1>It is a success!</h1>');

});

app.get('/fail', function(req, res){
 
 res.send('<h1>It is a not a success!</h1>');

});


app.listen(port);
console.log("App's up at " + port);









