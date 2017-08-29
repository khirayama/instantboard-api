const SECRET_KEY = 'asdfghjkl';

const errorMessages = {
  UNKNOWN_ERROR: 'Unknown error',
  NO_ACCESS_TOKEN: 'Please set access token to header.Authorization as Bearer.',
  NOT_EXISTED_USER: 'Not existed user',
  ALREADY_EXISTED_USER: 'Already existed user',
};

module.exports = {
  SECRET_KEY,
  errorMessages,
};
