const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const autoincrement = require('simple-mongoose-autoincrement');

const { USER } = require('../constants/roles');

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 30;

const PHONE_MIN_LENGTH = 5;
const PHONE_MAX_LENGTH = 30;

const EMAIL_MIN_LENGTH = 5;
const EMAIL_MAX_LENGTH = 255;

const URL_MIN_LENGTH = 5;
const URL_MAX_LENGTH = 500;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 1024;

const userSchema = new mongoose.Schema({
  roles: {
    type: Array,
    default: [USER],
  },
  firstName: {
    type: String,
    required: true,
    minlength: NAME_MIN_LENGTH,
    maxlength: NAME_MAX_LENGTH,
  },
  lastName: {
    type: String,
    required: true,
    minlength: NAME_MIN_LENGTH,
    maxlength: NAME_MAX_LENGTH,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    minlength: PHONE_MIN_LENGTH,
    maxlength: PHONE_MAX_LENGTH,
  },
  email: {
    type: String,
    required: true,
    minlength: EMAIL_MIN_LENGTH,
    maxlength: EMAIL_MAX_LENGTH,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
  },
  password: {
    type: String,
    required: true,
    minlength: PASSWORD_MIN_LENGTH,
    maxlength: PASSWORD_MAX_LENGTH,
  },
  avatarUrl: {
    type: String,
    minlength: URL_MIN_LENGTH,
    maxlength: URL_MAX_LENGTH,
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      roles: this.roles,
      firstName: this.firstName,
      email: this.email,
    },
    config.get('jwtPrivateKey')
  );
};

userSchema.plugin(autoincrement, { field: 'userId' });
const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    firstName: Joi.string()
      .alphanum()
      .min(NAME_MIN_LENGTH)
      .max(NAME_MAX_LENGTH)
      .required(),
    lastName: Joi.string()
      .alphanum()
      .min(NAME_MIN_LENGTH)
      .max(NAME_MAX_LENGTH)
      .required(),
    phone: Joi.string().min(PHONE_MIN_LENGTH).max(PHONE_MAX_LENGTH).required(),
    email: Joi.string()
      .min(EMAIL_MIN_LENGTH)
      .max(EMAIL_MAX_LENGTH)
      .email()
      .required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{8,15}$'))
      .required(),
    avatarUrl: Joi.string().min(URL_MIN_LENGTH).max(URL_MAX_LENGTH),
  });

  return schema.validate(user);
}

module.exports.EMAIL_MIN_LENGTH = EMAIL_MIN_LENGTH;
module.exports.EMAIL_MAX_LENGTH = EMAIL_MAX_LENGTH;
module.exports.User = User;
module.exports.validate = validateUser;
