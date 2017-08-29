const jwt = require('jwt-simple');

const {SECRET_KEY} = require('../constants');

function extractAccessTokenFromHeader(authorizationString = '') {
  return authorizationString.replace(/^Bearer/, '').trim();
}

function checkAccessToken(accessToken) {
  try {
    if (!accessToken) {
      return null;
    }
    const payload = jwt.decode(accessToken, SECRET_KEY);
    const now = new Date().getTime();

    if (!payload || payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

module.exports = {
  extractAccessTokenFromHeader,
  checkAccessToken,
};
