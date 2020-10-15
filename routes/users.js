const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/reporter/:name', auth, async (req, res) => {
  const { name: userName } = req.params;

  let arr = [];
  if (/\s/.test(userName)) {
    arr = userName.split(' ');
  }

  let user;
  if (arr.length) {
    const firstName = arr[0];
    const lastName = arr[1];

    user = await User.aggregate([
      {
        $match: { firstName: { $regex: firstName, $options: 'i' } },
      },
      {
        $match: { lastName: { $regex: lastName, $options: 'i' } },
      },
    ]);
  } else {
    user = await User.find({
      firstName: { $regex: userName, $options: 'i' },
    });

    if (!user.length)
      user = await User.find({
        lastName: { $regex: userName, $options: 'i' },
      });
  }

  if (!user.length)
    return res
      .status(404)
      .send('The reporter with given name has not been found');

  res.send(_.pick(user[0], ['_id', 'firstName', 'lastName']));
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user)
    return res.status(404).send('The user with given ID has not been found');

  res.send(
    _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'phone', 'roles'])
  );
});

router.get('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid User.');

  if (req.params.id !== req.user._id)
    return res.status(400).send('Not allowed to update user');

  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send('The user with given ID has not been found');

  res.send(
    _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'phone', 'roles'])
  );
});

router.put('/:id', auth, async (req, res) => {
  const { error } = await validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid User.');

  if (req.params.id !== req.user._id)
    return res.status(400).send('Not allowed to update user');

  let user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send('The user with given ID has not been found');

  if (req.user.email !== req.body.email) {
    let duplicateUser = await User.findOne({ email: req.body.email });
    if (duplicateUser)
      return res
        .status(400)
        .send(`The user with email: ${req.body.email} already exists`);
    else user.email = req.body.email;
  }

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.phone = req.body.phone;
  user.password = req.body.password;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'firstName', 'lastName', 'email', 'roles']));
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(400)
      .send(`The user with email: ${req.body.email} already exists`);

  user = new User(
    _.pick(req.body, ['firstName', 'lastName', 'email', 'phone', 'password'])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'firstName', 'lastName', 'email', 'roles']));
});

module.exports = router;
