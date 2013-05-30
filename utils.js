var crypto = require('crypto');

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
