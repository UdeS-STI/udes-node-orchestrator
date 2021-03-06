import express from 'express';
import http from 'http';
import https from 'https';
import _ from 'lodash';

import { configureExpress, handleErrors, setListeners } from './serverConfig';
import defaultConfig from './defaultConfig';
import { notFound } from '../lib/notFound';
import { Router as router } from '../dependencies/express';
import { ResponseHelper } from '../lib/ResponseHelper';

// Configure http/https before requiring Request module since Request is also using global config
http.globalAgent.maxSockets = 25;
https.globalAgent.options.rejectUnauthorized = false;
https.globalAgent.options.requestCert = true;
https.globalAgent.maxSockets = 25;

/**
 * Orchestrator server. Handles routes and HTTP traffic.
 * @class
 * @param {Config} config - Configuration file for server instance.
 * @param {Object[]} [routes] - The server's endpoints.
 * @param {('DELETE'|'GET'|'POST'|'PUT')} routes[].method - The HTTP method of the route.
 * @param {String} routes[].url - The path from the base url.
 * @param {Function} routes[].fn - the function to be called when route is accessed.
 * @throws {Error} If `config` argument is null.
 */
export default class Orchestrator {
  constructor(config, routes) {
    if (!config) {
      throw new Error('new Orchestrator() - Missing argument `config`');
    }

    this.env = process.env.NODE_ENV || 'development';
    this.app = express();
    this.config = _.merge({}, defaultConfig, config);

    configureExpress(this.app, this.config, this.env);
    this.server = http.createServer(this.app);
    setListeners(this.app, this.server, this.config);

    if (routes) {
      this.setRoutes(routes);
    }
  }

  /**
   * Set Orchestrator endpoints
   * @param {Object[]} routes - The server's endpoints.
   * @param {('DELETE'|'GET'|'POST'|'PUT')} routes[].method - The HTTP method of the route.
   * @param {String} routes[].url - The path from the base url.
   * @param {Function} routes[].fn - the function to be called when route is accessed.
   * @param {Object} [options] - Additional options for route configuration.
   * @param {Boolean} [options.handle404=true] - Whether to handle 404 routes automatically or not.
   * @throws {Error} If routes are already set.
   */
  setRoutes = (routes, options = {}) => {
    if (this.router) {
      throw new Error('You can only set routes once');
    }

    if (options.handle404 !== false) {
      const methods = ['DELETE', 'GET', 'POST', 'PUT'];
      routes.push(...methods.map(method => ({ method, url: '/*', fn: notFound })));
    }

    this.router = router();

    routes.forEach(({ method, url, fn }) => {
      this.router[method.toLowerCase()](url, (req, res) => {
        fn(new ResponseHelper(req, res, this.config), req, res);
      });
    });

    this.app.use(this.router);

    // Must handle errors after settings routes or express throws an error.
    handleErrors(this.app);
  }
}
