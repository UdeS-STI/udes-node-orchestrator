import url from 'url'

import Utils from './Utils'
import { request } from '../dependencies/request'
import RequestError from './RequestError'

const { getHeaders } = Utils

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
 * Handles response standardisation as well as http responses and requests.
 * @class
 * @param {Object} req - {@link https://expressjs.com/en/4x/api.html#req HTTP request}.
 * @param {Object} res - {@link https://expressjs.com/en/4x/api.html#res HTTP response}.
 * @param {Config} config - Orchestrator configuration.
 * @throws {Error} If `req`, `res` or `config` argument is null.
 */
export class ResponseHelper {
  constructor (req, res, config) {
    this.req = req
    this.res = res
    this.config = config
  }

  /**
   * Add auth information to HTTP request options based on auth method of the called URL.
   * @private
   * @param {Object} options - HTTP request options.
   * @param {Boolean} isFirstAttempt - True if is first HTTP call.
   * @returns {Promise} Promise represents requests options with auth info.
   */
  appendAuthOptions = async (options, isFirstAttempt) => {
    const authPattern = this.config.authPatterns.find(({ path }) => options.url.match(new RegExp(path)))

    if (authPattern) {
      this.req.session.apiSessionUrl = authPattern.sessionUrl
      this.req.session.path = authPattern.path
      this.req.session.targetService = authPattern.targetService

      const Plugin = authPattern.plugin
      return (new Plugin()).authenticate(this.req.session, options, isFirstAttempt)
    }

    return options
  }

  /**
   * Format options for API call.
   * @private
   * @async
   * @param {Object} options - Request options.
   * @param {Boolean} isFirstAttempt - True if is first HTTP call.
   * @returns {Promise} Promise object represents request options.
   */
  formatRequestOptions = (options, isFirstAttempt) => {
    const { body, headers = getHeaders(), url } = options
    return this.appendAuthOptions({
      ...options,
      body: body && typeof body === 'object' ? JSON.stringify(body) : body,
      headers,
      url: /^.+:\/\//.test(url) ? url : `${this.config.apiUrl}${url}`,
    }, isFirstAttempt)
  }

  /**
   * Extract meta-data from response.
   * @private
   * @param {Object} response - HTTP response.
   * @returns {Object} Response meta data
   */
  getResponseMetaData = (response) => {
    const meta = {
      debug: {
        'x-TempsMs': this.callDuration,
      },
      status: response.statusCode,
    }

    this.config.customHeaders.forEach(({ header, property }) => {
      meta[property || header] = response.headers[header]
    })

    return meta
  }

  /**
   * Extract response data from response.
   * @private
   * @param {Object} response - HTTP response.
   * @returns {Object} Response data.
   */
  getResponseData = (response) => {
    const meta = this.getResponseMetaData(response)

    try {
      const data = JSON.parse(response.body)
      return Array.isArray(data) ? { data, meta } : { ...data, meta }
    } catch (err) {
      return { data: response.body, meta }
    }
  }

  /**
   * Get file from server and send it as response.
   * @param {Object} options - Request options.
   * @param {Object} options.body - Request body.
   * @param {('DELETE'|'GET'|'POST'|'PUT')} options.method - Request method.
   * @param {String} options.url - Request URL.
   * @param {Object} [options.headers=getHeaders()] - Request headers.
   * @param {Boolean} [isFirstAttempt=true] - True if is first HTTP call.
   * @returns {Promise} Promise object represents server response.
   */
  fetch = (options, isFirstAttempt = true) => new Promise(async (resolve, reject) => {
    const requestOptions = await this.formatRequestOptions(options, isFirstAttempt)

    logRequest(this.req, this.config, requestOptions)
    this.callTimestamp = +(new Date())

    request(requestOptions, async (error, response) => {
      this.callDuration = +(new Date()) - this.callTimestamp
      const isUnauthorized = () => response.statusCode === 401
      const isStatusOk = () => response.statusCode >= 200 && response.statusCode < 300

      if (error) {
        this.req.log.error(error, getLogHeader('error'))
        reject(new RequestError(error, 500))
      } else if (isStatusOk()) {
        const data = this.getResponseData(response)
        this.req.log.debug(data, getLogHeader('response'))
        resolve(data)
      } else if (isUnauthorized()) {
        if (isFirstAttempt) {
          try {
            resolve(await this.fetch(options, false))
          } catch (error) {
            reject(error)
          }
        } else {
          this.req.log.error('401 - Unauthorized access', getLogHeader('error'))
          reject(new RequestError('Unauthorized', 401))
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
    const requestOptions = await this.formatRequestOptions(options)

    logRequest(this.req, this.config, requestOptions)
    Object.keys(requestOptions.headers).forEach(key => this.res.set(key, requestOptions.headers[key]))
    request.get(requestOptions).pipe(this.res)
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
   */
  handleError = (error) => {
    const ErrorFormatter = this.config.errorFormatter
    const errorData = ErrorFormatter ? (new ErrorFormatter()).format(error) : error.message || error

    this.res.status(error.statusCode || 500).send(errorData)
  }

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

      if (start > end || start >= size) {
        this.res.set('Content-Range', `${unit} */${size}`)
        this.handleError({ statusCode: 416, message: `Cannot get range ${start}-${end} of ${size}` })
        return
      }

      if (end - start > size) {
        this.res.set('Content-Range', `${unit} ${start}-${end}/${size}`)
        const partialData = { [key]: values.splice(start, end) }
        const responseData = formatData ? this.formatResponse(partialData) : partialData
        this.res.status(206).send(responseData)
        return
      }
    }

    this.res.status(200).send(formatData ? this.formatResponse(data) : data)
  }

  /**
   * Standardize response format.
   * @private
   * @param {Object} data={} - Response data.
   * @returns {Object} Formatted response data.
   */
  formatResponse = (data = {}) => {
    const ResponseFormatter = this.config.responseFormatter

    if (ResponseFormatter) {
      return (new ResponseFormatter()).format(data)
    }

    return data
  }
}
