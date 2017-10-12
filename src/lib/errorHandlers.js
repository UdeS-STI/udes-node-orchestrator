import boom from 'boom'

/**
 * Middleware - Error logging.
 * @private
 * @param {Object} err - Error.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Callback function.
 */
export const logErrors = (err, req, res, next) => {
  req.log.error(new Error(err))
  next(err)
}

/**
 * Middleware - Client/API error handling.
 * @private
 * @param {Object} err - Error.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {Function} next - Callback function.
 */
export const clientErrorHandler = (err, req, res, next) => {
  if (req.xhr) {
    res.send(boom.badRequest(`Une erreur avec la requête XHR c'est produite: ${err}`))
  } else {
    next(err)
  }
}

/**
 * Middleware - Server error handling.
 * @private
 * @param {Object} err - Error.
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 */
export const errorHandler = (err, req, res) => {
  res.send(boom.badImplementation(`Une erreur serveur c'est produite: ${err}`))
}
