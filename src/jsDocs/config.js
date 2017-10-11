/**
 * @typedef {Object} Config
 * @property {String} allowedMethods - List of allowed HTTP methods, separated by comas.
 * @property {String} apiUrl - URL of the API instance to call.
 * @property {Object} cas - {@link https://github.com/UdeS-STI/connect-cas CAS configuration}.
 * @property {Object} cas.cache - CAS cache configuration.
 * @property {Boolean} cas.cache.enable - Whether to enable CAS caching or not.
 * @property {[String]} cas.cache.filter - TODO
 * @property {Number} cas.cache.ttl - Time to live of cache in ms.
 * @property {Boolean} cas.debug - Whether to activate CAS debugging or not.
 * @property {Object} cas.fromAjax - CAS from AJAX configuration.
 * @property {String} cas.fromAjax.header - Default response header for AJAX responses.
 * @property {Number} cas.fromAjax.status - Default status code for AJAX responses.
 * @property {Boolean} cas.gateway - Send all validation requests through the CAS gateway feature.
 * @property {[String]} cas.ignore - Ignore CAS validation on these routes.
 * @property {Function} cas.logger - Logger function for CAS.
 * @property {[String]} cas.match - TODO
 * @property {Object} cas.paths - CAS path configuration.
 * @property {String} cas.paths.login - CAS login path.
 * @property {String} cas.paths.logout - CAS logout path.
 * @property {String} cas.paths.proxy - Path to obtain proxy ticket.
 * @property {String} cas.paths.proxyCallback - Path to call once proxy ticket is obtained.
 * @property {String} cas.paths.serviceValidate - Path to validate TGT.
 * @property {String} cas.paths.validate - Validation path.
 * @property {Boolean} cas.redirect -Whether to automatically redirect or not.
 * @property {Boolean} cas.renew - Whether to renew CAS authentication by default or not.
 * @property {String} cas.serverPath - URL to CAS server.
 * @property {String} cas.servicePrefix - URL of the orchestrator endpoint.
 * @property {Boolean} cas.slo - TODO
 * @property {String} cas.targetService - URI to CAS service.
 * @property {Object} cookies - Cookie configuration.
 * @property {Number} cookies.maxAge - Time to live (TTL) for the cookie in ms.
 * @property {Boolean} cookies.httpOnly - {@link https://www.owasp.org/index.php/HttpOnly HttpOnly flag}
 * @property {String} cookies.name - Cookie name.
 * @property {String} cookies.path - Path to store cookie.
 * @property {String} cookies.secret - Encryption key for cookie.
 * @property {Boolean} cookies.secure - Whether to encrypt cookie or not.
 * @property {String} customHeaderPrefix - Prefix for retrieving data from custom headers.
 * @property {Object} database - Couchbase configuration.
 * @property {String} database.cacheBucketName - Cache bucket name.
 * @property {String} database.cacheBucketPwd - Cache bucket password.
 * @property {[String]} database.couchbaseCluster - List of Couchbase cluster URLs.
 * @property {String} database.sessionBucketName - Session bucket name.
 * @property {String} database.sessionBucketPwd - Session bucket password.
 * @property {Boolean} enableAuth - Whether to enable CAS authentication or not.
 * @property {Boolean} enableCORS - Whether to enable CORS or not.
 * @property {Object} log - Logger configuration.
 * @property {('trace'|'info'|'debug'|'warn'|'error'|'silent')} log.logLevel - Log level.
 * @property {String} log.name - Logger name.
 * @property {Boolean} log.prettyPrint - Whether to print pretty or raw.
 * @property {String} nocasPwd - CAS default password when `enableAuth` is false.
 * @property {String} nocasUser - CAS default username when `enableAuth` is false.
 * @property {String} socket - Relative path to socket.
 */
