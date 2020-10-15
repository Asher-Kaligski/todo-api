const winston = require('winston');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
var cors = require('cors');
const app = express();

app.use(cors());

require('./core/logging')();
require('./core/routes')(app);
require('./core/db')();
require('./core/config')();
require('./core/prod')(app);

const port = process.env.PORT || 3000;

app.listen(port, () => winston.info(`Listening on port ${port}`));
