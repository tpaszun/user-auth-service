var express = require('express')
  , http = require('http')
  , RedisStore = require('connect-redis')(express)
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , RememberMeStrategy = require('passport-remember-me').Strategy
  , config = require('./config')
  , utils = require('./utils')
  , TokenStore = require('./tokens').TokenStore
  , UsersStore = require('./users').UsersStore
  , users = new UsersStore()
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
  {
    usernameField: 'email',
    passwordField: 'pass'
  },
  function(email, pass, done) {
    users.findByEmail(email, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);

      utils.hash(pass, user.salt, function(err, hash) {
        if (err) return done(err);
        if (user.pass != hash) return done(null, false);
        return done(null, user);
      });
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
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ 
  secret: config.session.secret,
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

function auth(req, res, next) {
  if (req.isAuthenticated()) return next();

  return res.send(401);
}

app.get('/check', auth, function(req, res) {
  return res.json({
    uid: req.user.id
  });
});

app.get('/user', auth, function(req, res) {
  return res.json(req.user);
});

app.post('/login', passport.authenticate('local'), function(req, res, next) {
  // Issue a remember me cookie if the option was checked
  if (!req.body.remember_me) return next();
  
  rememberMe.issue(req.user.id, function(err, token) {
    if (err) return req.send(500);

    res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
    return next();
  });  
}, function(req, res) {
  return res.send(200);
});

app.post('/logout', function(req, res) {

});

app.post('/register', function(req, res) {
  users.add(req.body.email, req.body.fullname, req.body.pass, function(err, user) {
    if (err) return res.send(500);

    return res.json(user);
  })
});

app.get('/activate/:id', function(req, res) {

});

app.post('/resetpass/:id', function(req, res) {

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
