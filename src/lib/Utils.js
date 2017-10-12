import { execSync } from 'child_process'

/**
 * @class
 */
export default class Utils {}

/**
 * Decode a string from base64.
 * @param {String} str - String to decode.
 * @return {String} Decoded string.
 */
Utils.base64Decode = str => Buffer.from(str, 'base64').toString('utf8')

/**
 * Encode a string to base64.
 * @param {String} str - String to encode.
 * @returns {String} Base64 encoded string.
 */
Utils.base64Encode = str => Buffer.from(str).toString('base64')

/**
 * Create an URL from a base url and query parameters.
 * @param {String} url - Base URL with path.
 * @param {Object} queryParams - Parameters to append to url.
 * @param {Boolean} [encode=true] - Whether to encode parameters for URI validation or not.
 * @returns {String} URL with appended parameters.
 */
Utils.buildUrl = (url, queryParams, encode = true) => {
  const params = Object.keys(queryParams)
  const paramsString = params.map((param) => {
    const value = encode ? encodeURIComponent(queryParams[param]) : queryParams[param]
    return `${param}=${value}`
  }).join('&')
  return `${url}?${paramsString}`
}

/**
 * Return appropriate headers based on data type.
 * @param {('CSV'|'JSON'|'PDF')} [type='JSON'] - The type of data.
 * @param {Object} [options] - Additional options for headers.
 * @param {String} [options.filename] - Filename for Content-Disposition, without extension.
 * @returns {Object} Headers.
 */
Utils.getHeaders = (type = 'JSON', options = {}) => {
  switch (type.toUpperCase()) {
    case 'CSV':
      return {
        'Content-Type': 'text/csv; charset=utf-8',
        Accept: 'application/json; charset=utf-8',
      }
    case 'PDF':
      return {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${options.filename}.pdf`,
      }
    case 'JSON':
    default:
      return {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json; charset=utf-8',
      }
  }
}

/**
 * Return the uid of the user starting the node process.
 * @return {Number} userID.
 */
Utils.getUid = () => +execSync('id -u')
