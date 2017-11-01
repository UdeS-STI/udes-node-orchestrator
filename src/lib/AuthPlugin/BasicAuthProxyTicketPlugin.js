import AuthPluginInterface from './AuthPluginInterface'

/**
 *
 */
export default class BasicAuthProxyTicketPlugin extends AuthPluginInterface {
  async authenticate (session, options, retry) {
    try {
      session.cas.pt = session.cas.pt || await session.getProxyTicket(!retry)
    } catch (err) {}

    return {
      ...options,
      auth: {
        user: session.cas.user,
        pass: session.cas.pt,
      },
    }
  }
}
