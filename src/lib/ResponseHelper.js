import url from 'url';

import { getAttributes } from './auth';
import Utils from './Utils';
import { request } from '../dependencies/request';
import RequestError from './RequestError';

const { getHeaders } = Utils;

/**
 * Standardize response format.
 * @private
 */
export const formatResponse = (req, data = {}) => ({
  auth: getAttributes(req),
  isAuth: true,
  responses: Object.keys(data).length ? Object.keys(data).reduce((acc, cur) => {
    const currentData = data[cur];
    const { meta } = currentData;
    delete currentData.meta;

    return {
      ...acc,
      [cur]: {
        ...meta,
        data: currentData,
      },
    };
  }, {}) : {
    count: 0,
    debug: {
      'x-tempsMs': 0,
    },
    messages: [],
    status: 200,
  },
});

/**
 * Get range information from either request headers or query parameters.
 * @private
 */
export const getRange = (req, query) => {
  const { headers } = req;
  const range = headers.range || query.range;

  if (!range) {
    return null;
  }

  const rangeInfo = /([a-z]+)+\W*(\d*)-(\d*)/gi.exec(range);

  return {
    unit: rangeInfo[1],
    start: +rangeInfo[2] || 0,
    end: +rangeInfo[3] || undefined,
  };
};

/**
 * @private
 * @param req
 * @param config
 * @param renew
 * @returns {Promise} Promise object represents proxy ticket.
 */
const getProxyTicket = (req, config, renew = false) => new Promise((resolve, reject) => {
  const { targetService } = config.cas;
  req.getProxyTicket(targetService, { renew }, (err, pt) => {
    if (err) {
      return reject(err);
    }

    return resolve(pt);
  });
});

/**
 * @private
 * @param args
 */
const checkArgs = args => Object.keys(args).forEach((key) => {
  if (!args[key]) {
    throw new Error(`new ResponseHelper() - Missing argument ${key}`);
  }
});

/**
 * Handles response standardisation as well as http responses and requests.
 * @class
 * @param {Object} req - {@link https://expressjs.com/en/4x/api.html#req HTTP request}.
 * @param {Object} res - {@link https://expressjs.com/en/4x/api.html#res HTTP response}.
 * @param {Config} config - Orchestrator configuration.
 * @throws {Error} If `req`, `res` or `config` argument is null.
 */
export class ResponseHelper {
  constructor(req, res, config) {
    checkArgs({ req, res, config });
    this.req = req;
    this.res = res;
    this.config = config;
  }

  /**
   * Get file from server and send it as response.
   * @param {Object} options - Request options.
   * @param {Object} options.body - Request body.
   * @param {('DELETE'|'GET'|'POST'|'PUT')} options.method - Request method.
   * @param {String} options.url - Request URL.
   * @param {Object} [options.headers=getHeaders()] - Request headers.
   * @returns {Promise} Promise object represents server response.
   */
  fetch = options => new Promise(async (resolve, reject) => {
    const { body, headers = getHeaders() } = options;
    const opt = {
      ...options,
      auth: {
        user: this.req.session.cas.user,
      },
      body: body && typeof body === 'object' ? JSON.stringify(body) : body,
      headers,
    };

    try {
      opt.auth.pass = await getProxyTicket(this.req, this.config);
      const time = +(new Date());

      request(opt, async (error, response) => {
        const callDuration = +(new Date()) - time;

        if (error) {
          reject(new RequestError(error, 500));
          return;
        }

        if (response.statusCode === 401) {
          resolve(await getProxyTicket(this.req, this.config, true));
          return;
        }

        const meta = {
          count: response.headers[`${this.config.customHeaderPrefix}-count`] || 0,
          debug: {
            'x-TempsMs': callDuration,
          },
          messages: response.headers[`${this.config.customHeaderPrefix}-messages`],
          status: response.statusCode,
        };

        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve({
              ...JSON.parse(response.body),
              meta,
            });
          } catch (err) {
            resolve({ data: response.body, meta });
          }
        } else {
          reject(new RequestError(response.body || response, response.statusCode || 500));
        }
      });
    } catch (err) {
      this.req.log.error('Error when requesting PT, Authentication failed! ', err);
      reject(new RequestError(err, 500));
    }
  })

  /**
   * Get file from server and send it as response.
   * @async
   * @param {Object} options - Request options.
   * @param {String} options.url - URL to access the file.
   * @param {Object} [options.headers=getHeaders()] - Request headers.
   */
  getFile = async (options) => {
    const { headers = getHeaders() } = options;
    const opt = {
      ...options,
      auth: {
        user: this.req.session.cas.user,
      },
      headers,
    };

    try {
      opt.auth.pass = await getProxyTicket(this.req, this.config);
      Object.keys(headers).forEach(key => this.res.set(key, headers[key]));
      request.get(opt).pipe(this.res);
    } catch (err) {
      this.req.log.error('Error when requesting PT, Authentication failed! ', err);
    }
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
  handleError = error => this.res.status(error.statusCode || 500).send(error.message || error)

  /**
   * Set response headers, status code and send response data.
   * @param {Object} data - Data to be sent as response.
   * @param {Object} [options={}] - Additional options for response.
   * @param {Object} [options.headers={}] - Response headers.
   * @param {Boolean} [options.formatData=true] - True to standardise response format.
   */
  handleResponse = (data, options = {}) => {
    const { formatData = true, headers = {} } = options;
    const range = getRange(this.req, this.getQueryParameters());

    Object.keys(headers).forEach(key => this.res.set(key, headers[key]));

    if (range) {
      const key = Object.keys(data)[0];
      const values = Object.values(data)[0];
      const size = values.length;
      const { start, end = size - 1, unit } = range;

      if (start > end || start >= size || end >= size) {
        this.res.set('Content-Range', `${unit} */${size}`);
        return this.handleError({ statusCode: 416, message: `Cannot get range ${start}-${end} of ${size}` });
      }

      if (end - start !== size - 1) {
        this.res.set('Content-Range', `${unit} ${start}-${end}/${size}`);
        const partialData = { [key]: values.splice(start, end) };
        const responseData = formatData ? formatResponse(this.req, partialData) : partialData;
        return this.res.status(206).send(responseData);
      }
    }

    return this.res.status(200).send(formatData ? formatResponse(this.req, data) : data);
  }
}
