const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, EMAIL_MIN_LENGTH, EMAIL_MAX_LENGTH } = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isValidPassword)
    return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.send({ token: token });
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string()
      .min(EMAIL_MIN_LENGTH)
      .max(EMAIL_MAX_LENGTH)
      .email()
      .required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
      .required(),
  });

  return schema.validate(req);
}

module.exports = router;
