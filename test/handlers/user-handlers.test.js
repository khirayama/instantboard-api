// Modules
const test = require('ava');
const uuid = require('uuid/v4');

// Test modules
const {createRequest, createResponse} = require('../mock');

// Src modules
const {errorMessages} = require('../../src/constants');
const {User} = require('../../src/models');
const {
  showCurrentUserHandler,
  updateCurrentUserHandler,
} = require('../../src/handlers/user-handlers');

test.cb('showCurrentUserHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(user => {
    t.is(user.id, req.user.id);
    t.is(user.username, 'test user');
    t.end();
  });

  req.user = {
    id: uuid(),
    username: 'test user',
  };

  showCurrentUserHandler(req, res);
});

test.cb('showCurrentUserHandler > work with error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(err => {
    t.is(err.message, errorMessages.NO_ACCESS_TOKEN);
    t.end();
  });

  req.user = null;

  showCurrentUserHandler(req, res);
});

test.cb('updateCurrentUserHandler > set username without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(user => {
    t.is(user.id, req.user.id);
    t.is(user.username, req.body.username);
    t.end();
  });

  User.create({
    uid: uuid(),
    provider: 'facebook',
  }).then(user => {
    req.user = user.dataValues;
    req.body.username = `test user ${uuid()}`;

    updateCurrentUserHandler(req, res);
  });
});

test.cb('updateCurrentUserHandler > set username with error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(err => {
    t.is(err.message, errorMessages.ALREADY_EXISTED_USER);
    t.end();
  });

  const uid = uuid();

  User.bulkCreate([{
    uid,
    username: `test user ${uid}`,
    provider: 'facebook',
  }, {
    uid: uuid(),
    provider: 'facebook',
  }], {
    individualHooks: true,
  }).then(users => {
    req.user = users[1].dataValues;
    req.body.username = `test user ${uid}`;

    updateCurrentUserHandler(req, res);
  });
});
