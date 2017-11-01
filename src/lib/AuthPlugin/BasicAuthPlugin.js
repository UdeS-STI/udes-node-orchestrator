import AuthPluginInterface from 'AuthPluginInterface'

/**
 *
 */
export default class BasicAuthPlugin extends AuthPluginInterface {
  async authenticate (session, options) {
    return {
      ...options,
      auth: {
        user: session.cas.user,
        pass: session.cas.pass,
      },
    }
  }
}
