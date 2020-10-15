const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const {
  Todo,
  validateTodo,
  validateTodoStatus,
  validateUpdateFavorite,
} = require('../models/todo');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const todos = await Todo.find();
  res.send(todos);
});

router.get('/reporter/:userId', auth, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId))
    return res.status(400).send('Invalid objectId');

  const todos = await Todo.find({ 'reporter._id': req.params.userId });

  res.send(todos);
});

router.get('/:id', auth, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid objectId');

  const todo = await Todo.findById(req.params.id);

  if (!todo) return res.status(400).send('Invalid Task');

  res.send(todo);
});

router.post('/', auth, async (req, res) => {
  const { error } = validateTodo(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send('Invalid User.');

  const reporter = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const todo = new Todo({
    reporter: reporter,
    ...req.body,
  });

  await todo.save();

  res.send(todo);
});

router.put('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid objectId');

  let todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).send('The task is not found.');

  const { error } = validateTodo(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send('Invalid User.');

  if (req.user._id !== todo.reporter._id.toString())
    return res.status(400).send('Invalid User.');

  const {
    summary,
    description,
    status,
    issueType,
    severity,
    priority,
  } = req.body;

  todo.summary = summary;
  todo.description = description;
  todo.status = status;
  todo.issueType = issueType;
  todo.severity = severity;
  todo.priority = priority;

  await todo.save();

  res.send(todo);
});

router.patch('/change-status', auth, async (req, res) => {
  const { error } = validateTodoStatus(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let todo = await Todo.findById(req.body.taskId);
  if (!todo) return res.status(404).send('The task is not found.');

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send('Invalid User.');

  todo.status = req.body.status;

  await todo.save();

  res.send(todo);
});

router.patch('/update-favorites', auth, async (req, res) => {
  const { error } = validateUpdateFavorite(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let todo = await Todo.findById(req.body.taskId);
  if (!todo) return res.status(404).send('The task is not found.');

  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send('Invalid User.');

  if (!todo.favorites) todo.favorites = [];

  if (req.body.isFavorite) {
    todo.favorites.push(user._id);
  } else {
    if (todo.favorites.length) {
      const index = todo.favorites.findIndex(
        (item) => item === user._id.toString()
      );

      if (index !== -1) todo.favorites.splice(index, 1);
    }
  }

  await todo.save();

  res.send(todo);
});

router.delete('/:id', auth, async (req, res) => {
  let todo = await Todo.findById(req.params.id);
  if (!todo)
    return res.status(404).send('The todo with given ID has not been found');

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send('Invalid User.');

  if (req.user._id !== todo.reporter._id.toString())
    return res.status(400).send('Invalid User.');

  todo = await Todo.findByIdAndDelete(todo._id);

  res.send(todo);
});

module.exports = router;
