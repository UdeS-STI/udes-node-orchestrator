'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _serverConfig = require('./serverConfig');

var _notFound = require('../lib/notFound');

var _express3 = require('../dependencies/express');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Configure http/https before requiring Request module since Request is also using global config
_http2.default.globalAgent.maxSockets = 25;
_https2.default.globalAgent.options.rejectUnauthorized = false;
_https2.default.globalAgent.options.requestCert = true;
_https2.default.globalAgent.maxSockets = 25;

/**
 * Orchestrator server. Handles routes and HTTP traffic.
 * @class
 * @param {Object} config - Configuration file for server instance.
 * @param {Object[]} [routes] - The server's endpoints.
 * @param {('DELETE'|'GET'|'POST'|'PUT')} routes[].method - The HTTP method of the route.
 * @param {String} routes[].url - The path from the base url.
 * @param {Function} routes[].fn - the function to be called when route is accessed.
 * @throws {Error} If `config` argument is null.
 */

var Orchestrator = function Orchestrator(config, routes) {
  _classCallCheck(this, Orchestrator);

  _initialiseProps.call(this);

  if (!config) {
    throw new Error('new Orchestrator() - Missing argument `config`');
  }

  this.env = process.env.NODE_ENV || 'development';
  this.app = (0, _express2.default)();
  this.config = config;

  (0, _serverConfig.configureExpress)(this.app, this.config, this.env);
  this.server = _http2.default.createServer(this.app);
  (0, _serverConfig.setListeners)(this.app, this.server, this.config);

  if (routes) {
    this.setRoutes(routes);
  }
}

/**
 *
 * @param {Object[]} routes - The server's endpoints.
 * @param {('DELETE'|'GET'|'POST'|'PUT')} routes[].method - The HTTP method of the route.
 * @param {String} routes[].url - The path from the base url.
 * @param {Function} routes[].fn - the function to be called when route is accessed.
 * @param {Object} [options] - Additional options for route configuration.
 * @param {Boolean} [options.handle404=true] - Whether to handle 404 routes automatically or not.
 * @throws {Error} If routes are already set.
 */
;

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.setRoutes = function (routes) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (_this.router) {
      throw new Error('You can only set routes once');
    }

    if (options.handle404 !== false) {
      var methods = ['DELETE', 'GET', 'POST', 'PUT'];
      routes.push.apply(routes, _toConsumableArray(methods.map(function (method) {
        return { method: method, url: '/*', fn: _notFound.notFound };
      })));
    }

    _this.router = (0, _express3.Router)();
    routes.forEach(function (_ref) {
      var method = _ref.method,
          url = _ref.url,
          fn = _ref.fn;
      return _this.router[method.toLowerCase()](url, fn);
    });
    _this.app.use(_this.router);

    // Must handle errors after settings routes or express throws an error.
    (0, _serverConfig.handleErrors)(_this.app);
  };
};

exports.default = Orchestrator;