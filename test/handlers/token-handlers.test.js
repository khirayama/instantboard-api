// Modules
const test = require('ava');
const uuid = require('uuid/v4');

// Test modules
const {createRequest, createResponse} = require('../mock');

// Src modules
const {checkAccessToken} = require('../../src/utils');
const {createTokenHandler} = require('../../src/handlers/token-handlers');

test.cb('createTokenHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(token => {
    const payload = checkAccessToken(token.accessToken);
    t.true(Boolean(token.accessToken));
    t.is('string', typeof token.accessToken);
    t.is('number', typeof payload.sub);
    t.is('number', typeof payload.exp);
    t.is('number', typeof payload.iat);
    t.end();
  });

  req.body.uid = uuid();
  req.body.provider = 'facebook';

  createTokenHandler(req, res);
});
