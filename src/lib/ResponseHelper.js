import url from 'url'

import { getAttributes } from './auth'
import Utils from './Utils'
import { request } from '../dependencies/request'
import RequestError from './RequestError'

const { getHeaders } = Utils

/**
 * Standardize response format.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} data={} - Response data.
 * @returns {Object} Formatted response data.
 */
export const formatResponse = (req, data = {}) => ({
  auth: getAttributes(req),
  isAuth: true,
  responses: Object.keys(data).length ? Object.keys(data).reduce((acc, cur) => {
    const currentData = data[cur]
    const { meta } = currentData
    delete currentData.meta

    return {
      ...acc,
      [cur]: {
        ...meta,
        data: currentData.data || currentData,
      },
    }
  }, {}) : {},
})

/**
 * Get range information from either request headers or query parameters.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} query - Query string data.
 * @returns {Object} Range information or null if none.
 */
export const getRange = (req, query) => {
  const { headers } = req
  const range = headers.range || query.range

  if (!range) {
    return null
  }

  const rangeInfo = /([a-z]+)+\W*(\d*)-(\d*)/gi.exec(range)

  return {
    unit: rangeInfo[1],
    start: +rangeInfo[2] || 0,
    end: +rangeInfo[3] || undefined,
  }
}

/**
 * Obtain proxy ticket for CAS authentication.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} renew=false - True to renew proxy ticket.
 * @returns {Promise} Promise object represents proxy ticket.
 */
const getProxyTicket = (req, config, renew = false) => new Promise((resolve, reject) => {
  const { targetService } = config.cas
  req.getProxyTicket(targetService, { renew }, (err, pt) => {
    if (err) {
      return reject(err)
    }

    return resolve(pt)
  })
})

/**
 * @private
 * @param {String} title - Log section title.
 * @returns {String} Formatted log header.
 */
const getLogHeader = title => `\n=============== ${title.toUpperCase()} ===============\n`

/**
 * Log request options.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} config - Orchestrator configuration.
 * @param {Object} options - Request options.
 */
const logRequest = (req, config, options) => {
  if (config.log.showCredentialsAsClearText) {
    req.log.info(options, getLogHeader('request'))
  } else {
    req.log.info({
      ...options,
      auth: {
        user: '********',
        pass: '********',
      },
    }, getLogHeader('request'))
  }
}

/**
 * Validate class constructor arguments.
 * @private
 * @param {Object} args - Arguments passed to class constructor.
 * @throws {Error} If an argument is null or undefined.
 */
const checkArgs = args => {
  Object.keys(args).forEach((key) => {
    if (!args[key]) {
      throw new Error(`new ResponseHelper() - Missing argument ${key}`)
    }
  })
}

/**
 * Handles response standardisation as well as http responses and requests.
 * @class
 * @param {Object} req - {@link https://expressjs.com/en/4x/api.html#req HTTP request}.
 * @param {Object} res - {@link https://expressjs.com/en/4x/api.html#res HTTP response}.
 * @param {Config} config - Orchestrator configuration.
 * @throws {Error} If `req`, `res` or `config` argument is null.
 */
export class ResponseHelper {
  constructor (req, res, config) {
    checkArgs({ req, res, config })
    this.req = req
    this.res = res
    this.config = config
  }

  /**
   * Get file from server and send it as response.
   * @param {Object} options - Request options.
   * @param {Object} options.body - Request body.
   * @param {('DELETE'|'GET'|'POST'|'PUT')} options.method - Request method.
   * @param {String} options.url - Request URL.
   * @param {Object} [options.headers=getHeaders()] - Request headers.
   * @param {Boolean} [retry=true] - True to renew PT and retry request on 401.
   * @returns {Promise} Promise object represents server response.
   */
  fetch = (options, retry = true) => new Promise(async (resolve, reject) => {
    const { body, headers = getHeaders() } = options
    const opt = {
      ...options,
      auth: {
        user: this.req.session.cas.user,
        pass: this.req.session.cas.pt,
      },
      body: body && typeof body === 'object' ? JSON.stringify(body) : body,
      headers,
    }

    if (!opt.auth.pass) {
      try {
        this.req.session.cas.pt = opt.auth.pass = await getProxyTicket(this.req, this.config)
      } catch (err) {
        this.req.log.error(err, getLogHeader('error'))
        reject(new RequestError(err, 500))
        return
      }
    }

    logRequest(this.req, this.config, opt)
    const time = +(new Date())

    request(opt, async (error, response) => {
      const callDuration = +(new Date()) - time

      if (error) {
        this.req.log.error(error, getLogHeader('error'))
        reject(new RequestError(error, 500))
        return
      }

      if (response.statusCode === 401) {
        if (retry) {
          try {
            this.req.log.warn('Authentication failed, requested new PT')
            this.req.session.cas.pt = await getProxyTicket(this.req, this.config, true)
            resolve(await this.fetch(options), false)
          } catch (err) {
            this.req.log.error(err, getLogHeader('error'))
            reject(new RequestError(err, 500))
          }
        } else {
          this.req.log.error('401 - Unauthorized access', getLogHeader('error'))
          reject(new RequestError('Unauthorized', 401))
        }

        return
      }

      const { customHeaderPrefix } = this.config
      const meta = {
        count: response.headers[`${customHeaderPrefix}-count`],
        debug: {
          'x-TempsMs': callDuration,
        },
        messages: response.headers[`${customHeaderPrefix}-messages`] || undefined,
        status: response.statusCode,
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        try {
          const data = JSON.parse(response.body)
          this.req.log.debug(data, getLogHeader('response'))

          if (Array.isArray(data)) {
            resolve({ data, meta })
          } else {
            resolve({ ...data, meta })
          }
        } catch (err) {
          this.req.log.debug(response.body, getLogHeader('response'))
          resolve({ data: response.body, meta })
        }
      } else {
        this.req.log.error(response.body || response, getLogHeader('error'))
        reject(new RequestError(response.body || response, response.statusCode || 500))
      }
    })
  })

  /**
   * Get file from server and send it as response.
   * @async
   * @param {Object} options - Request options.
   * @param {String} options.url - URL to access the file.
   * @param {Object} [options.headers=getHeaders()] - Request headers.
   */
  getFile = async (options) => {
    const { headers = getHeaders() } = options
    const opt = {
      ...options,
      auth: {
        user: this.req.session.cas.user,
        pass: this.req.session.cas.pt,
      },
      headers,
    }

    try {
      opt.auth.pass = await getProxyTicket(this.req, this.config)
    } catch (err) {
      this.req.log.error(err, getLogHeader('error'))
      return
    }

    logRequest(this.req, this.config, opt)
    Object.keys(headers).forEach(key => this.res.set(key, headers[key]))
    request.get(opt).pipe(this.res)
  }

  /**
   * Creates a usable object from the request URL parameters.
   * @returns {Object} Parameters in the request URL.
   */
  getQueryParameters = () => url.parse(this.req.url, true).query

  /**
   * Creates a usable object from the request's URL parameters and body.
   * @returns {Object} Parameters in the request URL and body.
   */
  getRequestParameters = () => ({
    ...this.getQueryParameters(),
    ...this.req.body,
  })

  /**
   * Set error status code and send response data.
   * @param {Object|String} error - Error encountered.
   * @param {Number} [error.statusCode=500] - Error status code (3xx-5xx).
   * @param {String} [error.message=error] - Error message. Value of error if it's a string.
   * @returns {null} Nothing.
   */
  handleError = error => this.res.status(error.statusCode || 500).send(error.message || error)

  /**
   * Set response headers, status code and send response data.
   * @param {Object} data - Data to be sent as response.
   * @param {Object} [options={}] - Additional options for response.
   * @param {Object} [options.headers={}] - Response headers.
   * @param {Boolean} [options.formatData=true] - True to standardise response format.
   */
  handleResponse = (data, options = {}) => {
    const { formatData = true, headers = {} } = options
    const range = getRange(this.req, this.getQueryParameters())

    Object.keys(headers).forEach(key => this.res.set(key, headers[key]))

    if (range) {
      const key = Object.keys(data)[0]
      const values = Object.values(data)[0]
      const size = values.length
      const { start, end = size - 1, unit } = range

      if (start > end || start >= size || end >= size) {
        this.res.set('Content-Range', `${unit} */${size}`)
        this.handleError({ statusCode: 416, message: `Cannot get range ${start}-${end} of ${size}` })
        return
      }

      if (end - start !== size - 1) {
        this.res.set('Content-Range', `${unit} ${start}-${end}/${size}`)
        const partialData = { [key]: values.splice(start, end) }
        const responseData = formatData ? formatResponse(this.req, partialData) : partialData
        this.res.status(206).send(responseData)
        return
      }
    }

    this.res.status(200).send(formatData ? formatResponse(this.req, data) : data)
  }
}
