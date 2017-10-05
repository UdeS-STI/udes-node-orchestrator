'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notFound = undefined;

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _ResponseHelper = require('./ResponseHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return 404 through HTTP response.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 */
/* eslint import/prefer-default-export: 0 */
var notFound = exports.notFound = function notFound(req, res) {
  return new _ResponseHelper.ResponseHelper(req, res).handleError({
    statusCode: 404,
    message: _boom2.default.notFound('Route non impl\xE9ment\xE9e - ' + req.method + ':' + req.url)
  });
};