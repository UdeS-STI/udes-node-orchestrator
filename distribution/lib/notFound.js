'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notFound = undefined;

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return 404 through HTTP response.
 * @private
 * @param {Object} responseHelper - An instance of ResponseHelper.
 * @param {Object} req - HTTP request.
 * @param {String} req.method - HTTP request Method.
 * @param {String} req.url - HTTP request url.
 */
var notFound = exports.notFound = function notFound(responseHelper, _ref) {
  var method = _ref.method,
      url = _ref.url;

  responseHelper.handleError({
    statusCode: 404,
    message: _boom2.default.notFound('Undefined route - ' + method + ':' + url)
  });
}; /* eslint import/prefer-default-export: 0 */