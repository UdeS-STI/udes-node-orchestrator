/**
 * Interface for handling various types of authentication.
 * @interface
 */
export default class AuthHandler {
  constructor () {
    if (this.constructor.name === 'AuthHandler') {
      throw Error('Cannot instantiate an interface')
    }

    if (!this.authenticate) {
      throw Error('Missing interface method `authenticate`')
    }

    const authFn = this.authenticate
    this.authenticate = (session, options, retry = true) => authFn(session, options, retry)
  }
}
