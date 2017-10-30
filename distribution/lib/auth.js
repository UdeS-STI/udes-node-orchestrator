'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSessionId = exports.getProxyTicket = exports.getAttributes = exports.getUser = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _request = require('../dependencies/request');

var _RequestError = require('./RequestError');

var _RequestError2 = _interopRequireDefault(_RequestError);

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var getHeaders = _Utils2.default.getHeaders;

/**
 * Get current user information from CAS.
 * @private
 * @param {Object} [req] - HTTP request.
 * @returns {Object} User.
 */

var getUser = exports.getUser = function getUser(req) {
  if (req && req.session && req.session.cas && req.session.cas.user) {
    return req.session.cas.user;
  }

  return {};
};

/**
 * Get CAS attributes.
 * @private
 * @param {Object} req - HTTP request.
 * @returns {Object} Attributes.
 */
var getAttributes = exports.getAttributes = function getAttributes(req) {
  if (req && req.session && req.session.cas && req.session.cas.attributes) {
    var attributes = req.session.cas.attributes;

    return Object.keys(attributes).reduce(function (acc, key) {
      var accumulation = acc;
      var attribute = attributes[key];
      var getValue = Array.isArray(attribute) && attribute.length === 1;

      accumulation[key] = getValue ? attribute[0] : attribute;

      return accumulation;
    }, {});
  }

  return {};
};

/**
 * Obtain proxy ticket for CAS authentication.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} renew=false - True to renew proxy ticket.
 * @returns {Promise} Promise object represents proxy ticket.
 */
var getProxyTicket = exports.getProxyTicket = function getProxyTicket(req, config) {
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
var getSessionId = exports.getSessionId = function getSessionId(req, config) {
  var retry = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  return new Promise(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
      var pt, options;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              pt = void 0;
              _context2.prev = 1;
              _context2.next = 4;
              return getProxyTicket(req, config, !retry);

            case 4:
              pt = _context2.sent;
              _context2.next = 10;
              break;

            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2['catch'](1);

              reject(_context2.t0);

            case 10:
              options = {
                method: 'GET',
                url: config.sessionUrl + '?ticket=' + pt,
                headers: _extends({}, getHeaders(), {
                  'x-proxy-ticket': pt
                })
              };


              (0, _request.request)(options, function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(error, response) {
                  var _JSON$parse, sessionId;

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
                          return getSessionId(req, config, false);

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

                          try {
                            _JSON$parse = JSON.parse(response.body), sessionId = _JSON$parse.sessionId;

                            req.session.apiSessionId = sessionId;
                            resolve(sessionId);
                          } catch (err) {
                            reject(new _RequestError2.default('Cannot get session id', 500));
                          }

                        case 18:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, undefined, [[2, 10]]);
                }));

                return function (_x5, _x6) {
                  return _ref2.apply(this, arguments);
                };
              }());

            case 12:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined, [[1, 7]]);
    }));

    return function (_x3, _x4) {
      return _ref.apply(this, arguments);
    };
  }());
};