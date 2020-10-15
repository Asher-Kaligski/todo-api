const winston = require('winston');
const debug = require('debug')('app:routes-err');

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);
  debug(err.message);
  res.status(500).send('Unexpected server error.');
};
