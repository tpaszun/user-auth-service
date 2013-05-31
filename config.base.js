/**
 * Author: Tymoteusz Paszun
 * Date: 31.05.2013
 * Time: 02:10
 */

/**
 * Base configuration
 */

exports = module.exports = config = {
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  session: {
    secret: 'YOUR_SECRET_PASSWORD_TO_PROTECT_SESSIONS'
  }
};
