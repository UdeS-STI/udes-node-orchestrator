import { getSessionId, getProxyTicket } from './auth'
import Utils from './Utils'

const { getHeaders } = Utils

/**
 * Get options needed for API call.
 * @private
 * @async
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Object} options - Request options.
 * @param {Boolean} [auth=true] - True to add authentication information to request options.
 * @param {Boolean} [retry=true] - True to renew auth and retry request on 401.
 * @returns {Promise} Promise object represents request options.
 */
export const getRequestOptions = async (req, config, options, auth, retry) => {
  const { body, headers = getHeaders(), url } = options
  const opt = {
    ...options,
    body: body && typeof body === 'object' ? JSON.stringify(body) : body,
    headers,
    url: /^.+:\/\//.test(url) ? url : `${config.apiUrl}${url}`,
  }

  // If API requires an authentication
  if (auth) {
    try {
      // If API requires using a session id
      if (config.sessionUrl) {
        opt.headers['x-sessionid'] = req.session.apiSessionId || await getSessionId(req, config)
      } else {
        // Without session id, basic auth is used for authentication
        opt.auth = {
          user: req.session.cas.user,
          pass: await getProxyTicket(req, config, !retry),
        }
      }
    } catch (err) {
      req.log.error(err)
    }
  }

  return opt
}
