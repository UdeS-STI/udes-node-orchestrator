/**
 *
 */
export default class AuthPluginInterface {
  constructor () {
    if (!this.authenticate) {
      throw Error('Missing interface method `authenticate`')
    }

    const authFn = this.authenticate
    this.authenticate = async (session, options, retry = true) => {
      const opt = await authFn(session, options, retry)
      return opt
    }
  }
}
