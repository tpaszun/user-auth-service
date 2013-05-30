var redis = require('redis')
  , crypto = require('crypto')
  , _ = require('underscore')
  , utils = require('./utils');

/**
 * Initialize UsersStore with given `options`.
 *
 * @param {Object} options
 * @api public
 */

function UsersStore(options) {
  options = options || {};

  this.prefix = null == options.prefix
    ? 'user:'
    : options.prefix;

  this.client = options.client || utils.redisClient();
}

/**
 * Find user by user id.
 *
 * @param {String} uid
 * @param {Function} fn
 * @api public
 */

UsersStore.prototype.findById = function(uid, fn) {
  uid = this.prefix + uid;

  this.client.hgetall(uid, function(err, user) {
    if (err) return fn(err);

    if (!user) return fn(null, user);

    user.active = user.active === 'true';

    return fn(null, user);
  });
};

/**
 * Find user by email address.
 *
 * @param {String} email
 * @param {Function} fn
 * @api public
 */

UsersStore.prototype.findByEmail = function(email, fn) {
  var self = this;

  email = self.prefix + 'email:' + email;

  self.client.get(email, function(err, uid) {
    if (err) return fn(err);
    if (!uid) return fn(null, uid);

    return self.findById(uid, fn);
  });
};

/**
 * Add new user.
 *
 * @param {String} email
 * @param {String} fullname
 * @param {String} pass
 * @param {Function} fn
 * @api public
 */

UsersStore.prototype.add = function(email, fullname, pass, fn) {
  var uid
    , user = {
      id: null,
      email: email,
      fullname: fullname,
      pass: null,
      salt: crypto.randomBytes(16).toString('hex'),
      active: false
    }
    , self = this
    , emailKey;

  emailKey = self.prefix + 'email:' + email;

  self.client.set(emailKey, 1, 'EX', 1, 'NX', function(err, result) {
    if (err) return fn(err);

    if (!result) return fn('Email already registered'); // email address already registered

    function saveUser() {
      var userIdKey;

      user.id = crypto.randomBytes(8).toString('hex');
      userIdKey = self.prefix + user.id;

      self.client.hsetnx(userIdKey, 'id', user.id, function(err, result) {
        if (err) return fn(err);

        if (!result) return saveUser(); // if there is already a user with provided user.id generate a new id and save

        utils.hash(pass, user.salt, function(err, derivedKey) {
          if (err) return fn(err);

          user.pass = derivedKey.toString('hex');

          self.client.hmset(userIdKey, user, function(err) {
            if (err) return fn(err);

            self.client.set(emailKey, user.id, function(err) {
              if (err) return fn(err);

              return fn(null, user);
            });
          });
        });
      });
    }

    saveUser();
  });
};

/**
 * Activate user with given id.
 *
 * @param {String} uid
 * @param {Function} fn
 * @api public
 */

UsersStore.prototype.activate = function(uid, fn) {
  uid = this.prefix + uid;

  this.client.hset(uid, 'active', true, function(err) {
    if (err) return fn(err);

    return fn();
  });
};

/**
 * Delete user with given id.
 *
 * @param {String} uid
 * @param {Function} fn
 * @api public
 */

UsersStore.prototype.del = function(uid, fn) {
  var self = this;

  self.findById(uid, function(err, user) {
    if (!user) return fn(null, user);

    uid = self.prefix + uid;

    self.client.del(uid, function(err) {
      var email = self.prefix + user.email;

      if (err) return fn(err);

      self.client.del(email, function(err) {
        if (err) return fn(err);

        return fn();
      });
    });
  });
};

/**
 * Update user with given uid by `user` object.
 *
 * @param {String} uid
 * @param {Object} user
 * @param {Function} fn
 * @api public
 */

UsersStore.prototype.update = function(uid, user, fn) {
  uid = this.prefix + uid;

  user = _.pick(user, ['email', 'fullname', 'pass']);

};

exports = module.exports;

exports.UsersStore = UsersStore;
