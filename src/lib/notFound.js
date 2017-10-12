/* eslint import/prefer-default-export: 0 */
import boom from 'boom'
import { ResponseHelper } from './ResponseHelper'

/**
 * Return 404 through HTTP response.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 */
export const notFound = (req, res) => {
  const responseHelper = new ResponseHelper(req, res)
  responseHelper.handleError({
    statusCode: 404,
    message: boom.notFound(`Route non implémentée - ${req.method}:${req.url}`),
  })
}
