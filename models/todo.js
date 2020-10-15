const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const autoincrement = require('simple-mongoose-autoincrement');

const {
  Very_Low_Priority,
  Low_Priority,
  Medium_Priority,
  Major,
  Critical,
} = require('./../constants/priorities');
const {
  Very_Low,
  Low,
  Medium,
  High,
  Very_High,
} = require('./../constants/severities');
const {
  New_Development,
  Integration,
  Bug,
  Business_Request,
} = require('./../constants/issue-types');
const {
  New,
  Business_Requirement,
  In_Development,
  Fixed,
  Staging_QA,
  Ready_For_Deploy,
  Production_QA,
  Closed,
  Rejected,
} = require('./../constants/statuses');

const SUMMARY_MIN_LENGTH = 2;
const SUMMARY_MAX_LENGTH = 255;

const DESCRIPTION_MIN_LENGTH = 2;
const DESCRIPTION_MAX_LENGTH = 10000;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 30;

const todoSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true,
    minlength: SUMMARY_MIN_LENGTH,
    maxlength: SUMMARY_MAX_LENGTH,
  },
  description: {
    type: String,
    required: true,
    minlength: DESCRIPTION_MIN_LENGTH,
    maxlength: DESCRIPTION_MAX_LENGTH,
  },
  status: {
    type: String,
    enum: [
      New,
      Business_Requirement,
      In_Development,
      Fixed,
      Staging_QA,
      Ready_For_Deploy,
      Production_QA,
      Closed,
      Rejected,
    ],
    required: true,
  },
  issueType: {
    type: String,
    enum: [New_Development, Integration, Bug, Business_Request],
    required: true,
  },
  severity: {
    type: String,
    enum: [Very_Low, Low, Medium, High, Very_High],
    required: true,
    default: Very_Low_Priority,
  },
  priority: {
    type: String,
    enum: [Very_Low_Priority, Low_Priority, Medium_Priority, Major, Critical],
    required: true,
    default: Very_Low,
  },
  reporter: {
    _id: {
      type: String,
      required: true,
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
  },
  favorites: [String],
});

todoSchema.plugin(autoincrement, { field: 'todoId' });
const Todo = mongoose.model('Todo', todoSchema);

function validateTodo(todo) {
  const schema = Joi.object({
    summary: Joi.string()
      .min(SUMMARY_MIN_LENGTH)
      .max(SUMMARY_MAX_LENGTH)
      .required(),
    description: Joi.string()
      .min(DESCRIPTION_MIN_LENGTH)
      .max(DESCRIPTION_MAX_LENGTH)
      .required(),
    status: Joi.string()
      .valid(
        New,
        Business_Requirement,
        In_Development,
        Fixed,
        Staging_QA,
        Ready_For_Deploy,
        Production_QA,
        Closed,
        Rejected
      )
      .required(),
    issueType: Joi.string()
      .valid(New_Development, Integration, Bug, Business_Request)
      .required(),
    severity: Joi.string()
      .valid(Very_Low, Low, Medium, High, Very_High)
      .required(),
    priority: Joi.string()
      .valid(Very_Low_Priority, Low_Priority, Medium_Priority, Major, Critical)
      .required(),
  });

  return schema.validate(todo);
}

function validateTodoStatus(todo) {
  const schema = Joi.object({
    status: Joi.string()
      .valid(
        New,
        Business_Requirement,
        In_Development,
        Fixed,
        Staging_QA,
        Ready_For_Deploy,
        Production_QA,
        Closed,
        Rejected
      )
      .required(),
    taskId: Joi.string().required(),
  });

  return schema.validate(todo);
}

function validateUpdateFavorite(todo) {
  const schema = Joi.object({
    userId: Joi.string().required(),
    taskId: Joi.string().required(),
    isFavorite: Joi.boolean().required(),
  });

  return schema.validate(todo);
}

module.exports.validateTodoStatus = validateTodoStatus;
module.exports.validateUpdateFavorite = validateUpdateFavorite;
module.exports.validateTodo = validateTodo;
module.exports.Todo = Todo;
