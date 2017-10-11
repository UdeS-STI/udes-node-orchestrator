'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class
 */
var Utils = function Utils() {
  _classCallCheck(this, Utils);
};

/**
 * Decode a string from base64.
 * @param {String} str - String to decode.
 * @return {String} Decoded string.
 */


exports.default = Utils;
Utils.base64Decode = function (str) {
  return Buffer.from(str, 'base64').toString('utf8');
};

/**
 * Encode a string to base64.
 * @param {String} str - String to encode.
 * @returns {String} Base64 encoded string.
 */
Utils.base64Encode = function (str) {
  return Buffer.from(str).toString('base64');
};

/**
 * Create an URL from a base url and query parameters.
 * @param {String} url - Base URL with path.
 * @param {Object} queryParams - Parameters to append to url.
 * @param {Boolean} [encode=true] - Whether to encode parameters for URI validation or not.
 * @returns {String} URL with appended parameters.
 */
Utils.buildUrl = function (url, queryParams) {
  var encode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var params = Object.keys(queryParams);
  var paramsString = params.map(function (param) {
    var value = encode ? encodeURIComponent(queryParams[param]) : queryParams[param];
    return param + '=' + value;
  }).join('&');
  return url + '?' + paramsString;
};

/**
 * Return appropriate headers based on data type.
 * @param {('CSV'|'JSON'|'PDF')} [type='JSON'] - The type of data.
 * @param {Object} [options] - Additional options for headers.
 * @param {String} [options.filename] - Filename for Content-Disposition, without extension.
 * @returns {Object} Headers.
 */
Utils.getHeaders = function () {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'JSON';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  switch (type.toUpperCase()) {
    case 'CSV':
      return {
        'Content-Type': 'text/csv; charset=utf-8',
        Accept: 'application/json; charset=utf-8'
      };
    case 'PDF':
      return {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=' + options.filename + '.pdf'
      };
    case 'JSON':
    default:
      return {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json; charset=utf-8'
      };
  }
};

/**
 * Return the uid of the user starting the node process.
 * @return {Number} userID.
 */
Utils.getUid = function () {
  return +(0, _child_process.execSync)('id -u');
};