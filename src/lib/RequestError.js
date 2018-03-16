/**
 * Instantiate an error object with HTTP status code and message.
 * @class
 * @private
 * @param {String} message - Error message Can be String or JSON String.
 * @param {Number} statusCode - Error status code.
 */
export default class ResquestError {
  constructor(message, statusCode) {
    this.statusCode = statusCode;

    try {
      this.message = JSON.parse(message);
    } catch (err) {
      this.message = message;
    }
  }
}
