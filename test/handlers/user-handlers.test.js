const test = require('ava');
const uuid = require('uuid/v4');

const {
  createRequest,
  createResponse,
} = require('../mock');

const {errorMessages} = require('../../src/constants');
const {User} = require('../../src/models');
const {
  showUserHandler,
  updateUserHandler,
} = require('../../src/handlers/user-handlers');

test.cb('showUserHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(user => {
    t.is(user.id, req.user.id);
    t.is(user.name, 'test user');
    t.end();
  });

  req.user = {
    id: uuid(),
    name: 'test user',
  };

  showUserHandler(req, res);
});

test.cb('showUserHandler > work with error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(err => {
    t.is(err.message, errorMessages.NO_ACCESS_TOKEN);
    t.end();
  });

  req.user = null;

  showUserHandler(req, res);
});

test.cb('updateUserHandler > set name without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(user => {
    t.is(user.id, req.user.id);
    t.is(user.name, req.body.name);
    t.end();
  });

  User.create({
    uid: uuid(),
    provider: 'facebook',
  }).then(user => {
    req.user = user.dataValues;
    req.body.name = `test user ${uuid()}`;

    updateUserHandler(req, res);
  });
});

test.cb('updateUserHandler > set name with error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(err => {
    t.is(err.message, errorMessages.ALREADY_EXISTED_USER);
    t.end();
  });

  const uid = uuid();

  User.bulkCreate([{
    uid,
    name: `test user ${uid}`,
    provider: 'facebook',
  }, {
    uid: uuid(),
    provider: 'facebook',
  }], {
    individualHooks: true,
  }).then(users => {
    req.user = users[1].dataValues;
    req.body.name = `test user ${uid}`;

    updateUserHandler(req, res);
  });
});
