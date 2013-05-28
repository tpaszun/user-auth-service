var user = require('../users')
  , expect = require('chai').expect
  , crypto = require('crypto');

describe('UsersStore', function() {
  var users = new user.UsersStore()
    , newUser = {
      email: 'test@examplce.com',
      fullname: 'Test Example',
      pass: 'test'
    }
    , createdUser;

  it('should add a new user', function(done) {
    users.add(newUser.email, newUser.fullname, newUser.pass, function(err, user) {
      expect(err).to.not.exist;
      expect(user).to.exist;

      expect(user.id).to.exist;
      expect(user.active).to.be.false;
      expect(user.email).to.be.equal(newUser.email);
      expect(user.fullname).to.be.equal(newUser.fullname);

      expect(user.pass).to.be.equal(crypto.createHash('sha256').update(newUser.pass).digest('hex'));

      createdUser = user;
      return done();
    });
  });

  it('should find a user by id', function(done) {
    users.findById(createdUser.id, function(err, user) {
      expect(err).to.not.exist;
      expect(user).to.exist;

      expect(user.id).to.exist;
      expect(user.active).to.be.false;
      expect(user.email).to.be.equal(createdUser.email);
      expect(user.fullname).to.be.equal(createdUser.fullname);

      expect(user.pass).to.be.equal(crypto.createHash('sha256').update(newUser.pass).digest('hex'));
      return done();
    });
  });

  it('should find a user by email', function(done) {
  	users.findByEmail(createdUser.email, function(err, user) {
      expect(err).to.not.exist;
      expect(user).to.exist;

      expect(user.id).to.exist;
      expect(user.active).to.be.false;
      expect(user.email).to.be.equal(createdUser.email);
      expect(user.fullname).to.be.equal(createdUser.fullname);

      expect(user.pass).to.be.equal(crypto.createHash('sha256').update(newUser.pass).digest('hex'));
      return done();  		
  	})
  });

  it('should not find a non-existing user', function(done) {
    users.findById('someNonExistingUserID', function(err, user) {
      expect(err).to.not.exist;
      expect(user).to.not.exist;

      return done();
    });
  });

  it('should activate an user', function(done) {
    users.activate(createdUser.id, function(err) {
      expect(err).to.not.exist;

      users.findById(createdUser.id, function(err, user) {
        expect(err).to.not.exist;
        expect(user).to.exist;
        expect(user.active).to.be.true;
      	return done();
      });
    });
  });

  it('should delete an user', function(done) {
  	users.del(createdUser.id, function(err) {
      expect(err).to.not.exist;

      return done();
  	});
  });

  it('should not find deleted user by id', function(done) {
    users.findById(createdUser.id, function(err, user) {
      expect(err).to.not.exist;
      expect(user).to.not.exist;

      return done();
    });
  });

  it('should not find deleted user by email', function(done) {
    users.findByEmail(createdUser.email, function(err, user) {
      expect(err).to.not.exist;
      expect(user).to.not.exist;

      return done();
    });
  });

  it('should update user');

});
