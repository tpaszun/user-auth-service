var express = require('express')
  , http = require('http')
  , RedisStore = require('connect-redis')(express)
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , RememberMeStrategy = require('passport-remember-me').Strategy
  , TokenStore = require('./tokens').TokenStore
  , users = require('./users')
  , rememberMe = new TokenStore()
  , activation = new TokenStore()
  , passReset = new TokenStore();

var app = express();

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  users.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(email, password, done) {
    process.nextTick(function () {
      
      users.findByEmail(email, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

passport.use(new RememberMeStrategy(
  function(token, done) {
    rememberMe.consume(token, function(err, uid) {
      if (err) return done(err);
      if (!uid) return done(null, false);
      
      findById(uid, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);

        return done(null, user);
      });
    });
  },
  function(user, done) {
  	rememberMe.issue(user.id, done);
  }
));

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ 
  secret: 'secret',
  store: new RedisStore()
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
