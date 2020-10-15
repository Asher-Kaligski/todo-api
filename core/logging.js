const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

module.exports = function () {
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'uncaughtException.log' })
  );

  process.on('unhandledRejection', (e) => {
    throw e;
  });

  winston.add(winston.transports.File, {
    filename: 'error.log',
    level: 'error',
  });

  winston.add(winston.transports.MongoDB, {
    db: 'mongodb://localhost/todo-board',
    level: 'info',
  });
};
