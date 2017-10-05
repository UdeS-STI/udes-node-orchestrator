'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResponseHelper = exports.getRange = exports.formatResponse = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint import/prefer-default-export: 0 */


var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _auth = require('./auth');

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _request = require('../dependencies/request');

var _RequestError = require('./RequestError');

var _RequestError2 = _interopRequireDefault(_RequestError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getHeaders = _Utils2.default.getHeaders;

/**
 * Standardize response format.
 * @private
 */

var formatResponse = exports.formatResponse = function formatResponse(req) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return {
    auth: (0, _auth.getAttributes)(req),
    isAuth: true,
    responses: Object.keys(data).length ? Object.keys(data).reduce(function (acc, cur) {
      var currentData = data[cur];
      var meta = currentData.meta;

      delete currentData.meta;

      return _extends({}, acc, _defineProperty({}, cur, _extends({}, meta, {
        data: currentData
      })));
    }, {}) : {
      count: 0,
      debug: {
        'x-tempsMs': 0
      },
      messages: [],
      status: 200
    }
  };
};

/**
 * Get range information from either request headers or query parameters.
 * @private
 */
var getRange = exports.getRange = function getRange(req, query) {
  var headers = req.headers;

  var range = headers.range || query.range;

  if (!range) {
    return null;
  }

  var rangeInfo = /([a-z]+)+\W*(\d*)-(\d*)/gi.exec(range);

  return {
    unit: rangeInfo[1],
    start: +rangeInfo[2] || 0,
    end: +rangeInfo[3] || undefined
  };
};

/**
 * Handles response standardisation as well as http responses and requests.
 * @class
 * @param {Object} req - {@link https://expressjs.com/en/4x/api.html#req HTTP request}.
 * @param {Object} res - {@link https://expressjs.com/en/4x/api.html#res HTTP response}.
 * @param {Object} config - Orchestrator configuration.
 */

var ResponseHelper = exports.ResponseHelper = function ResponseHelper(req, res, config) {
  _classCallCheck(this, ResponseHelper);

  _initialiseProps.call(this);

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


/**
 * Get file from server and send it as response.
 * @param {Object} options - Request options.
 * @param {String} options.url - URL to access the file.
 * @param {Object} [options.headers=getHeaders()] - Request headers.
 */


/**
 * Creates a usable object from the request URL parameters.
 * @returns {Object} Parameters in the request URL.
 */


/**
 * Creates a usable object from the request's URL parameters and body.
 * @returns {Object} Parameters in the request URL and body.
 */


/**
 * Set error status code and send response data.
 * @param {Object|String} error - Error encountered.
 * @param {Number} [error.statusCode=500] - Error status code (3xx-5xx).
 * @param {String} [error.message=error] - Error message. Value of error if it's a string.
 */


/**
 * Set response headers, status code and send response data.
 * @param {Object} data - Data to be sent as response.
 * @param {Object} [options={}] - Additional options for response.
 * @param {Object} [options.headers={}] - Response headers.
 * @param {Boolean} [options.formatData=true] - True to standardise response format.
 */
;

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.fetch = function (options) {
    return new Promise(function (resolve, reject) {
      var body = options.body,
          _options$headers = options.headers,
          headers = _options$headers === undefined ? getHeaders() : _options$headers;

      var opt = _extends({}, options, {
        auth: {
          user: _this.req.session.cas.user,
          pass: _this.req.session.cas.pt
        },
        body: body && (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' ? JSON.stringify(body) : body,
        headers: headers
      });

      var getPT = function getPT(cb) {
        var targetService = _this.config.cas.targetService;


        _this.req.getProxyTicket(targetService, { renew: false }, function (err, pt) {
          if (err) {
            _this.req.log.error('Error when requesting PT, Authentication failed! ', err);
            cb(err);
          } else {
            opt.auth.pass = pt;
            var time = +new Date();

            (0, _request.request)(opt, function (error, response) {
              var callDuration = +new Date() - time;

              if (error) {
                return cb(error);
              }

              if (response.statusCode === 401) {
                return _this.req.getProxyTicket(targetService, { renew: true }, cb);
              }

              var meta = {
                count: response.headers[_this.config.customHeaderPrefix + '-count'] || 0,
                debug: {
                  'x-TempsMs': callDuration
                },
                messages: response.headers[_this.config.customHeaderPrefix + '-messages'],
                status: response.statusCode
              };

              return cb(null, _extends({}, response, { meta: meta }));
            });
          }
        });
      };

      getPT(function (err, res) {
        if (err) {
          reject(new _RequestError2.default(err, 500));
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(_extends({}, JSON.parse(res.body), {
              meta: res.meta
            }));
          } catch (error) {
            resolve({ data: res.body, meta: res.meta });
          }
        } else {
          reject(new _RequestError2.default(res.body || res, res.statusCode || 500));
        }
      });
    });
  };

  this.getFile = function (options) {
    var _options$headers2 = options.headers,
        headers = _options$headers2 === undefined ? getHeaders() : _options$headers2;

    var opt = _extends({}, options, {
      auth: {
        user: _this.req.session.cas.user,
        pass: _this.req.session.cas.pt
      },
      headers: headers
    });

    _this.req.getProxyTicket(_this.config.cas.targetService, { renew: false }, function (err, pt) {
      if (err) {
        _this.req.log.error('Error when requesting PT, Authentication failed! ', err);
      } else {
        opt.auth.pass = pt;
        Object.keys(headers).forEach(function (key) {
          return _this.res.set(key, headers[key]);
        });
        _request.request.get(opt).pipe(_this.res);
      }
    });
  };

  this.getQueryParameters = function () {
    return _url2.default.parse(_this.req.url, true).query;
  };

  this.getRequestParameters = function () {
    return _extends({}, _this.getQueryParameters(), _this.req.body);
  };

  this.handleError = function (error) {
    return _this.res.status(error.statusCode || 500).send(error.message || error);
  };

  this.handleResponse = function (data) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$formatData = options.formatData,
        formatData = _options$formatData === undefined ? true : _options$formatData,
        _options$headers3 = options.headers,
        headers = _options$headers3 === undefined ? {} : _options$headers3;

    var range = getRange(_this.req, _this.getQueryParameters());

    Object.keys(headers).forEach(function (key) {
      return _this.res.set(key, headers[key]);
    });

    if (range) {
      var key = Object.keys(data)[0];
      var values = Object.values(data)[0];
      var size = values.length;
      var start = range.start,
          _range$end = range.end,
          end = _range$end === undefined ? size - 1 : _range$end,
          unit = range.unit;


      if (start > end || start >= size || end >= size) {
        _this.res.set('Content-Range', unit + ' */' + size);
        return _this.handleError({ statusCode: 416, message: 'Cannot get range ' + start + '-' + end + ' of ' + size });
      }

      if (end - start !== size - 1) {
        _this.res.set('Content-Range', unit + ' ' + start + '-' + end + '/' + size);
        var partialData = _defineProperty({}, key, values.splice(start, end));
        var responseData = formatData ? formatResponse(_this.req, partialData) : partialData;
        return _this.res.status(206).send(responseData);
      }
    }

    return _this.res.status(200).send(formatData ? formatResponse(_this.req, data) : data);
  };
};