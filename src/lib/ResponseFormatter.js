/**
 * Interface for formatting HTTP response data.
 * @interface
 */
export default class ResponseFormatter {
  constructor() {
    if (this.constructor.name === 'ResponseFormatter') {
      throw Error('Cannot instantiate an interface');
    }

    if (!this.format) {
      throw Error('Missing interface method `format`');
    }

    const formatFn = this.format;
    this.format = data => formatFn(data);
  }
}
