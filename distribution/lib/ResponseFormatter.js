'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Interface for formatting HTTP response data.
 * @interface
 */
var ResponseFormatter = function ResponseFormatter() {
  _classCallCheck(this, ResponseFormatter);

  if (this.constructor.name === 'ResponseFormatter') {
    throw Error('Cannot instantiate an interface');
  }

  if (!this.format) {
    throw Error('Missing interface method `format`');
  }

  var formatFn = this.format;
  this.format = function (data) {
    return formatFn(data);
  };
};

exports.default = ResponseFormatter;