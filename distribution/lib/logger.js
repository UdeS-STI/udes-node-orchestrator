'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogger = undefined;

var _pino = require('pino');

var _pino2 = _interopRequireDefault(_pino);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console, import/prefer-default-export */

var getLogger = exports.getLogger = function getLogger(config) {
  var configuration = {
    logger: _pino2.default,
    name: config.log.name,
    level: config.log.logLevel, // FIXME add support for ENV files from server
    prettyPrint: config.log.prettyPrint
  };

  var logger = new _pino2.default(configuration, new _stream2.default.Writable({ write: function write(chunk) {
      return console.log(chunk);
    } }));

  logger.on('error', function () {
    console.error('pino logger cannot flush on exit due to provided output stream');
    process.exit(1);
  });

  return logger;
};