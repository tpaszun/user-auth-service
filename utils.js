var crypto = require('crypto')
  , redis = require('redis')
  , config = require('./config');

exports = module.exports;

/**
 * Get passwords hash
 *
 * @param {String} pass
 * @param {String} salt
 * @param {Function} fn
 * @api private
 */

exports.hash = function(pass, salt, fn) {
  return crypto.pbkdf2(pass, salt, 4096, 256, function(err, derivedKey) {
    if (err) return fn(err);
    return fn(null, derivedKey.toString('hex'));
  });
};

/**
 * Create configured redis client
 *
 * @param options
 * @returns {RedisClient}
 */

exports.redisClient = function(options) {
  return redis.createClient(config.redis.port, config.redis.host, options);
};
