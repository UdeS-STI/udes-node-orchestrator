'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorHandler = exports.clientErrorHandler = exports.logErrors = undefined;

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Middleware - Error logging.
 * @private
 * @param {Object} err - Error.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Callback function.
 */
var logErrors = exports.logErrors = function logErrors(err, req, res, next) {
  req.log.error(new Error(err));
  next(err);
};

/**
 * Middleware - Client/API error handling.
 * @private
 * @param {Object} err - Error.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Callback function.
 */
var clientErrorHandler = exports.clientErrorHandler = function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(_boom2.default.badRequest('An error occurred with the XHR request: ' + err));
  } else {
    next(err);
  }
};

/**
 * Middleware - Server error handling.
 * @private
 * @param {Object} err - Error.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 */
var errorHandler = exports.errorHandler = function errorHandler(err, req, res) {
  res.send(_boom2.default.badImplementation('A server error occurred: ' + err));
};