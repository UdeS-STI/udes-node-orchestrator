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
