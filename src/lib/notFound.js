/* eslint import/prefer-default-export: 0 */
import boom from 'boom'

/**
 * Return 404 through HTTP response.
 * @private
 * @param {Object} responseHelper - An instance of ResponseHelper.
 * @param {Object} req - HTTP request.
 * @param {String} req.method - HTTP request Method.
 * @param {String} req.url - HTTP request url.
 */
export const notFound = (responseHelper, { method, url }) => {
  responseHelper.handleError({
    statusCode: 404,
    message: boom.notFound(`Undefined route - ${method}:${url}`),
  })
}
