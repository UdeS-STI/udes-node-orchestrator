/**
 *
 */
export default class AuthPluginInterface {
  constructor () {
    if (!this.authenticate) {
      throw Error('Missing interface method `authenticate`')
    }

    const authFn = this.authenticate
    this.authenticate = (session, options, retry = true) => authFn(session, options, retry)
  }
}
