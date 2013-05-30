/**
 * Author: Tymoteusz Paszun
 * Date: 30.05.2013
 * Time: 23:13
 */

var utils = require('../utils');

exports = module.exports;

/**
 * Flush all data from redis
 *
 * @param {RedisClient} [client]
 * @param {Function} fn
 * @api private
 */

exports.flushDb = function(client, fn) {
  if (arguments.length === 1) {
    fn = arguments[0];

    client = utils.redisClient();
  }

  client.flushdb(fn);
};
