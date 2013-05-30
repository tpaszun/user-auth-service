var redis = require('redis')
  , crypto = require('crypto')
  , utils = require('./utils');

/**
 * Initialize TokenStore with given `options`.
 * 
 * @param {Object} options
 * @api public
 */

function TokenStore(options) {
  options = options || {};

  this.prefix = null == options.prefix
    ? 'rmmbr:'
    : options.prefix;

  this.client = options.client || utils.redisClient();

  this.ttl = options.ttl;
}

/**
 * Attempt to fetch user id by the given token
 *
 * @param {String} token
 * @param {Function} fn
 * @api public
 */

TokenStore.prototype.consume = function consume(token, fn) {
  var hash = crypto.createHash('sha256').update(token).digest('hex')
    , self = this;

  hash = self.prefix + hash;

  self.client.get(hash, function(err, data) {
    if (err) return fn(err);
    if (!data) return fn();
    self.client.del(hash, function(err) {
      if (err) return fn(err);
      return fn(null, data);
    });
  });
}

/**
 * Issue remember me token bind to given user id (`uid`).
 *
 * @param {String} uid
 * @param {Function} fn
 * @api public
 */

TokenStore.prototype.issue = function issue(uid, fn) {
  var token = crypto.randomBytes(32).toString('hex')
  	, hash = crypto.createHash('sha256').update(token).digest('hex')
  	, ttl = this.ttl;

  hash = this.prefix + hash;

  ttl = ttl || 86400;

  try {
    this.client.setex(hash, ttl, uid, function(err) {
      fn(null, token);
    });
  } catch (err) {
  	fn(err);
  }
}

exports = module.exports;

exports.TokenStore = TokenStore;
