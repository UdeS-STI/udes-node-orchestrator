"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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