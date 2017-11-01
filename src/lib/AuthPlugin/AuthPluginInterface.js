import { request } from '../../dependencies/request'
import RequestError from './../RequestError'

/**
 * Obtain proxy ticket for CAS authentication.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} renew=false - True to renew proxy ticket.
 * @returns {Promise} Promise object represents proxy ticket.
 */
export const getProxyTicket = (req, config, renew = false) => new Promise((resolve, reject) => {
  const { targetService } = config.cas
  req.getProxyTicket(targetService, { renew }, (err, pt) => {
    if (err) {
      return reject(err)
    }

    return resolve(pt)
  })
})

/**
 * Obtain session id from API.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} [retry=true] - True to update PT and retry getting session id from API.
 * @returns {Promise} Promise object represents session id.
 */
export const getSessionId = (session, retry = true) => new Promise(async (resolve, reject) => {
  let pt

  try {
    pt = await session.getProxyTicket(!retry)
  } catch (error) {
    reject(error)
  }

  const options = {
    method: 'GET',
    url: `${session.apiSessionUrl}?ticket=${pt}`,
    headers: {
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json; charset=utf-8',
      'x-proxy-ticket': pt,
    },
  }

  request(options, async (error, response) => {
    if (error || response.statusCode === 401) {
      if (retry) {
        try {
          resolve(await getSessionId(session, false))
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new RequestError('Invalid proxy ticket', 401))
      }

      return
    }

    try {
      const { sessionId } = JSON.parse(response.body)
      session.apiSessionId = sessionId
      resolve(sessionId)
    } catch (err) {
      reject(new RequestError('Cannot get session id', 500))
    }
  })
})

/**
 *
 */
class AuthPluginInterface {
  constructor () {
    if (!this.authenticate) {
      throw Error('Missing interface method `authenticate`')
    }

    const authFn = this.authenticate
    this.authenticate = async (session, options, retry) => {
      await authFn(session, options, retry)
    }
  }
}

/**
 *
 */
export class BasicAuthPlugin extends AuthPluginInterface {
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

/**
 *
 */
export class BasicAuthProxyTicketPlugin extends AuthPluginInterface {
  async authenticate (session, options, retry) {
    return {
      ...options,
      auth: {
        user: session.cas.user,
        pass: await getProxyTicket(session, !retry),
      },
    }
  }
}

/**
 *
 */
export class SessionIdPlugin extends AuthPluginInterface {
  async authenticate (session, options) {
    return {
      ...options,
      headers: {
        ...(options.headers || {}),
        'x-sessionid': session.apiSessionId || await getSessionId(session),
      },
    }
  }
}
