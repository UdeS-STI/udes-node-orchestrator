import request from 'request'

import AuthPluginInterface from './AuthPluginInterface'

/**
 * Obtain session id from API.
 * @private
 * @param {Object} session - Current HTTP session.
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
        const error = { statusCode: 401, message: 'Invalid proxy ticket' }
        reject(error)
      }

      return
    }

    try {
      const { sessionId } = JSON.parse(response.body)
      session.apiSessionId = sessionId
      resolve(sessionId)
    } catch (err) {
      const error = { statusCode: 500, message: 'Cannot get session id' }
      reject(error)
    }
  })
})

/**
 *
 */
export default class SessionIdPlugin extends AuthPluginInterface {
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
