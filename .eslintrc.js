module.exports = {
  parser: 'babel-eslint',
  extends: ['eslint-config-udes'],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'require-jsdoc': 'error',
    'valid-jsdoc': 'error',
  },
};
