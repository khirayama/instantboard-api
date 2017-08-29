module.exports = {
  extends: [
    'xo-space/esnext',
  ],
  env: {
    node: true,
  },
  rules: {
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
  }
};
