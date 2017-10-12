module.exports = {
  parser: 'babel-eslint',
  extends: ['eslint-config-udes'],
  rules: {
    'valid-jsdoc': ['error', { requireReturn: false }],
    'require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: false,
        ClassDeclaration: true,
      }
    }]
  },
}
