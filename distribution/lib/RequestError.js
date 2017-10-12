"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Instantiate an error object with HTTP status code and message.
 * @class
 * @private
 * @param {String} message - Error message Can be String or JSON String.
 * @param {Number} statusCode - Error status code.
 */
var ResquestError = function ResquestError(message, statusCode) {
  _classCallCheck(this, ResquestError);

  this.statusCode = statusCode;

  try {
    this.message = JSON.parse(message);
  } catch (err) {
    this.message = message;
  }
};

exports.default = ResquestError;