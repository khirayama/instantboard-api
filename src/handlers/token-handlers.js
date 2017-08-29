const jwt = require('jwt-simple');
const {SECRET_KEY} = require('../constants');
const {User} = require('../models');

function _transformToken(accessToken) {
  return {accessToken};
}

function createTokenHandler(req, res) {
  const provider = req.body.provider;
  const uid = req.body.uid;
  const username = req.body.username;

  User.findOrCreate({
    where: {provider, uid},
    defaults: {provider, uid, username},
  }).spread(user => {
    const now = new Date();
    const expires = now.setYear(now.getFullYear() + 1);

    // Ref: [JA] https://hiyosi.tumblr.com/post/70073770678/jwt%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E7%B0%A1%E5%8D%98%E3%81%AB%E3%81%BE%E3%81%A8%E3%82%81%E3%81%A6%E3%81%BF%E3%81%9F
    const accessToken = jwt.encode({
      sub: user.id,
      exp: expires,
      iat: now.getTime(),
    }, SECRET_KEY);

    res.json(_transformToken(accessToken));
  });
}

module.exports = {
  createTokenHandler,
};
