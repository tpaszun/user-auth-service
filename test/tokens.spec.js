var tokens = require('../tokens')
  , expect = require('chai').expect;

describe('TokenStore', function() {
  var tokenStore = new tokens.TokenStore()
    , token
    , userId = 'test123asdqwerty';

  it('should issue a token', function(done) {
    tokenStore.issue(userId, function(err, tok) {
      expect(err).to.not.exist;
      expect(tok).to.exist;

      token = tok;
      return done();
    })
  });

  it('should consume issued token', function(done) {
    tokenStore.consume(token, function(err, uid) {
      expect(err).to.not.exist;
      expect(uid).to.exist;

      expect(uid).to.be.equal(userId);
      return done();
    })
  });

  it('should not consume issued token more than once', function(done) {
  	tokenStore.consume(token, function(err, uid) {
      expect(err).to.not.exist;
      expect(uid).to.not.exist;

      return done();
  	});
  })

  it('should not consume not issued token', function(done) {
    tokenStore.consume('someRandomString', function(err, uid) {
      expect(err).to.not.exist;
      expect(uid).to.not.exist;

      return done();
    });
  });
});
