'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorHandler = exports.clientErrorHandler = exports.logErrors = undefined;

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _pino = require('pino');

var _pino2 = _interopRequireDefault(_pino);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pino = new _pino2.default();

/**
 * Middleware - Error logging.
 * @private
 * @param err
 * @param req
 * @param res
 * @param next
 */
var logErrors = exports.logErrors = function logErrors(err, req, res, next) {
  pino.error(new Error(err));
  next(err);
};

/**
 * Middleware - Client/API error handling.
 * @private
 * @param err
 * @param req
 * @param res
 * @param next
 */
var clientErrorHandler = exports.clientErrorHandler = function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(_boom2.default.badRequest('Une erreur avec la requ\xEAte XHR c\'est produite: ' + err));
  } else {
    next(err);
  }
};

/**
 * Middleware - Server error handling.
 * @private
 * @param err
 * @param req
 * @param res
 */
var errorHandler = exports.errorHandler = function errorHandler(err, req, res) {
  res.send(_boom2.default.badImplementation('Une erreur serveur c\'est produite: ' + err));
};