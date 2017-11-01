'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRequestOptions = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _auth = require('./auth');

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var getHeaders = _Utils2.default.getHeaders;

/**
 * Get options needed for API call.
 * @private
 * @async
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Object} options - Request options.
 * @param {Boolean} [auth=true] - True to add authentication information to request options.
 * @param {Boolean} [retry=true] - True to renew auth and retry request on 401.
 * @returns {Promise} Promise object represents request options.
 */

var getRequestOptions = exports.getRequestOptions = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, config, options, auth, retry) {
    var body, _options$headers, headers, url, opt;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            body = options.body, _options$headers = options.headers, headers = _options$headers === undefined ? getHeaders() : _options$headers, url = options.url;
            opt = _extends({}, options, {
              body: body && (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' ? JSON.stringify(body) : body,
              headers: headers,
              url: /^.+:\/\//.test(url) ? url : '' + config.apiUrl + url

              // If API requires an authentication
            });

            if (!auth) {
              _context.next = 23;
              break;
            }

            _context.prev = 3;

            if (!config.sessionUrl) {
              _context.next = 13;
              break;
            }

            _context.t0 = req.session.apiSessionId;

            if (_context.t0) {
              _context.next = 10;
              break;
            }

            _context.next = 9;
            return (0, _auth.getSessionId)(req, config);

          case 9:
            _context.t0 = _context.sent;

          case 10:
            opt.headers['x-sessionid'] = _context.t0;
            _context.next = 18;
            break;

          case 13:
            _context.t1 = req.session.cas.user;
            _context.next = 16;
            return (0, _auth.getProxyTicket)(req, config, !retry);

          case 16:
            _context.t2 = _context.sent;
            opt.auth = {
              user: _context.t1,
              pass: _context.t2
            };

          case 18:
            _context.next = 23;
            break;

          case 20:
            _context.prev = 20;
            _context.t3 = _context['catch'](3);

            req.log.error(_context.t3);

          case 23:
            return _context.abrupt('return', opt);

          case 24:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[3, 20]]);
  }));

  return function getRequestOptions(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();