'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResponseHelper = exports.getRange = exports.formatResponse = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getHeaders = _Utils2.default.getHeaders;

/**
 * Standardize response format.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} data={} - Response data.
 * @returns {Object} Formatted response data.
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
        data: currentData.data || currentData
      })));
    }, {}) : {}
  };
};

/**
 * Get range information from either request headers or query parameters.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} query - Query string data.
 * @returns {Object} Range information or null if none.
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
 * Obtain proxy ticket for CAS authentication.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} renew=false - True to renew proxy ticket.
 * @returns {Promise} Promise object represents proxy ticket.
 */
var getProxyTicket = function getProxyTicket(req, config) {
  var renew = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return new Promise(function (resolve, reject) {
    var targetService = config.cas.targetService;

    req.getProxyTicket(targetService, { renew: renew }, function (err, pt) {
      if (err) {
        return reject(err);
      }

      return resolve(pt);
    });
  });
};

/**
 * Obtain session id from API.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} [retry=true] - True to update PT and retry getting session id from API.
 * @returns {Promise} Promise object represents session id.
 */
var getSessionId = function getSessionId(req, config) {
  var retry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  return new Promise(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
      var options;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.t0 = config.sessionUrl;
              _context2.t1 = _extends;
              _context2.t2 = {};
              _context2.t3 = getHeaders();
              _context2.next = 6;
              return getProxyTicket(req, config, !retry);

            case 6:
              _context2.t4 = _context2.sent;
              _context2.t5 = {
                'x-proxy-ticket': _context2.t4
              };
              _context2.t6 = (0, _context2.t1)(_context2.t2, _context2.t3, _context2.t5);
              options = {
                method: 'GET',
                url: _context2.t0,
                headers: _context2.t6
              };


              (0, _request.request)(options, function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(error, response) {
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (!(error || response.statusCode === 401)) {
                            _context.next = 17;
                            break;
                          }

                          if (!retry) {
                            _context.next = 15;
                            break;
                          }

                          _context.prev = 2;
                          _context.t0 = resolve;
                          _context.next = 6;
                          return getSessionId(false);

                        case 6:
                          _context.t1 = _context.sent;
                          (0, _context.t0)(_context.t1);
                          _context.next = 13;
                          break;

                        case 10:
                          _context.prev = 10;
                          _context.t2 = _context['catch'](2);

                          reject(_context.t2);

                        case 13:
                          _context.next = 16;
                          break;

                        case 15:
                          reject(new _RequestError2.default('Invalid proxy ticket', 401));

                        case 16:
                          return _context.abrupt('return');

                        case 17:

                          req.session.id = response.body;
                          resolve(response.body);

                        case 19:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, undefined, [[2, 10]]);
                }));

                return function (_x6, _x7) {
                  return _ref2.apply(this, arguments);
                };
              }());

            case 11:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x4, _x5) {
      return _ref.apply(this, arguments);
    };
  }());
};

/**
 * @private
 * @param {String} title - Log section title.
 * @returns {String} Formatted log header.
 */
var getLogHeader = function getLogHeader(title) {
  return '\n=============== ' + title.toUpperCase() + ' ===============\n';
};

/**
 * Log request options.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Object} config - Orchestrator configuration.
 * @param {Object} options - Request options.
 */
var logRequest = function logRequest(req, config, options) {
  if (config.log.showCredentialsAsClearText) {
    req.log.info(options, getLogHeader('request'));
  } else {
    req.log.info(_extends({}, options, {
      auth: {
        user: '********',
        pass: '********'
      }
    }), getLogHeader('request'));
  }
};

/**
 * Validate class constructor arguments.
 * @private
 * @param {Object} args - Arguments passed to class constructor.
 * @throws {Error} If an argument is null or undefined.
 */
var checkArgs = function checkArgs(args) {
  Object.keys(args).forEach(function (key) {
    if (!args[key]) {
      throw new Error('new ResponseHelper() - Missing argument ' + key);
    }
  });
};

/**
 * Handles response standardisation as well as http responses and requests.
 * @class
 * @param {Object} req - {@link https://expressjs.com/en/4x/api.html#req HTTP request}.
 * @param {Object} res - {@link https://expressjs.com/en/4x/api.html#res HTTP response}.
 * @param {Config} config - Orchestrator configuration.
 * @throws {Error} If `req`, `res` or `config` argument is null.
 */

var ResponseHelper = exports.ResponseHelper = function ResponseHelper(req, res, config) {
  var _this = this;

  _classCallCheck(this, ResponseHelper);

  this.fetch = function (options) {
    var auth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var retry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    return new Promise(function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
        var body, _options$headers, headers, opt, time;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                body = options.body, _options$headers = options.headers, headers = _options$headers === undefined ? getHeaders() : _options$headers;
                opt = _extends({}, options, {
                  body: body && (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' ? JSON.stringify(body) : body,
                  headers: headers
                });

                if (!auth) {
                  _context4.next = 17;
                  break;
                }

                if (!_this.config.sessionUrl) {
                  _context4.next = 12;
                  break;
                }

                _context4.t0 = _this.req.session.id;

                if (_context4.t0) {
                  _context4.next = 9;
                  break;
                }

                _context4.next = 8;
                return getSessionId(_this.req, _this.config);

              case 8:
                _context4.t0 = _context4.sent;

              case 9:
                opt.headers['x-sessionid'] = _context4.t0;
                _context4.next = 17;
                break;

              case 12:
                _context4.t1 = _this.req.session.cas.user;
                _context4.next = 15;
                return getProxyTicket(_this.req, _this.config, !retry);

              case 15:
                _context4.t2 = _context4.sent;
                opt.auth = {
                  user: _context4.t1,
                  pass: _context4.t2
                };

              case 17:

                logRequest(_this.req, _this.config, opt);
                time = +new Date();


                (0, _request.request)(opt, function () {
                  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(error, response) {
                    var callDuration, customHeaderPrefix, meta, data;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            callDuration = +new Date() - time;

                            if (!error) {
                              _context3.next = 5;
                              break;
                            }

                            _this.req.log.error(error, getLogHeader('error'));
                            reject(new _RequestError2.default(error, 500));
                            return _context3.abrupt('return');

                          case 5:
                            if (!(response.statusCode === 401)) {
                              _context3.next = 25;
                              break;
                            }

                            if (!retry) {
                              _context3.next = 22;
                              break;
                            }

                            _context3.prev = 7;

                            _this.req.log.warn('Authentication failed, requested new PT');
                            _context3.t0 = resolve;
                            _context3.next = 12;
                            return _this.fetch(options, auth, false);

                          case 12:
                            _context3.t1 = _context3.sent;
                            (0, _context3.t0)(_context3.t1);
                            _context3.next = 20;
                            break;

                          case 16:
                            _context3.prev = 16;
                            _context3.t2 = _context3['catch'](7);

                            _this.req.log.error(_context3.t2, getLogHeader('error'));
                            reject(new _RequestError2.default(_context3.t2, 500));

                          case 20:
                            _context3.next = 24;
                            break;

                          case 22:
                            _this.req.log.error('401 - Unauthorized access', getLogHeader('error'));
                            reject(new _RequestError2.default('Unauthorized', 401));

                          case 24:
                            return _context3.abrupt('return');

                          case 25:
                            customHeaderPrefix = _this.config.customHeaderPrefix;
                            meta = {
                              count: response.headers[customHeaderPrefix + '-count'],
                              debug: {
                                'x-TempsMs': callDuration
                              },
                              messages: response.headers[customHeaderPrefix + '-messages'] || undefined,
                              status: response.statusCode
                            };


                            if (response.statusCode >= 200 && response.statusCode < 300) {
                              try {
                                data = JSON.parse(response.body);

                                _this.req.log.debug(data, getLogHeader('response'));

                                if (Array.isArray(data)) {
                                  resolve({ data: data, meta: meta });
                                } else {
                                  resolve(_extends({}, data, { meta: meta }));
                                }
                              } catch (err) {
                                _this.req.log.debug(response.body, getLogHeader('response'));
                                resolve({ data: response.body, meta: meta });
                              }
                            } else {
                              _this.req.log.error(response.body || response, getLogHeader('error'));
                              reject(new _RequestError2.default(response.body || response, response.statusCode || 500));
                            }

                          case 28:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this, [[7, 16]]);
                  }));

                  return function (_x12, _x13) {
                    return _ref4.apply(this, arguments);
                  };
                }());

              case 20:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this);
      }));

      return function (_x10, _x11) {
        return _ref3.apply(this, arguments);
      };
    }());
  };

  this.getFile = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(options) {
      var _options$headers2, headers, opt;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _options$headers2 = options.headers, headers = _options$headers2 === undefined ? getHeaders() : _options$headers2;
              opt = _extends({}, options, {
                auth: {
                  user: _this.req.session.cas.user,
                  pass: _this.req.session.cas.pt
                },
                headers: headers
              });

              if (opt.auth.pass) {
                _context5.next = 13;
                break;
              }

              _context5.prev = 3;
              _context5.next = 6;
              return getProxyTicket(_this.req, _this.config);

            case 6:
              _this.req.session.cas.pt = opt.auth.pass = _context5.sent;
              _context5.next = 13;
              break;

            case 9:
              _context5.prev = 9;
              _context5.t0 = _context5['catch'](3);

              _this.req.log.error(_context5.t0, getLogHeader('error'));
              return _context5.abrupt('return');

            case 13:

              logRequest(_this.req, _this.config, opt);
              Object.keys(headers).forEach(function (key) {
                return _this.res.set(key, headers[key]);
              });
              _request.request.get(opt).pipe(_this.res);

            case 16:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this, [[3, 9]]);
    }));

    return function (_x14) {
      return _ref5.apply(this, arguments);
    };
  }();

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
        _this.handleError({ statusCode: 416, message: 'Cannot get range ' + start + '-' + end + ' of ' + size });
        return;
      }

      if (end - start !== size - 1) {
        _this.res.set('Content-Range', unit + ' ' + start + '-' + end + '/' + size);
        var partialData = _defineProperty({}, key, values.splice(start, end));
        var responseData = formatData ? formatResponse(_this.req, partialData) : partialData;
        _this.res.status(206).send(responseData);
        return;
      }
    }

    _this.res.status(200).send(formatData ? formatResponse(_this.req, data) : data);
  };

  checkArgs({ req: req, res: res, config: config });
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
 * @param {Boolean} [auth=true] - True to add authentication information to request options.
 * @param {Boolean} [retry=true] - True to renew auth and retry request on 401.
 * @returns {Promise} Promise object represents server response.
 */


/**
 * Get file from server and send it as response.
 * @async
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
 * @returns {null} Nothing.
 */


/**
 * Set response headers, status code and send response data.
 * @param {Object} data - Data to be sent as response.
 * @param {Object} [options={}] - Additional options for response.
 * @param {Object} [options.headers={}] - Response headers.
 * @param {Boolean} [options.formatData=true] - True to standardise response format.
 */
;