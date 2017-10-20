/**
 * @typedef {Object} CasConfig
 * @param {Object} cache - CAS cache configuration.
 * @param {Boolean} cache.enable - Whether to enable CAS caching or not.
 * @param {[String]} cache.filter - Filter service url for PT cache
 * @param {Number} cache.ttl - Time to live of cache in ms.
 * @param {Boolean} debug - Whether to activate CAS debugging or not.
 * @param {Object} fromAjax - CAS from AJAX configuration.
 * @param {String} fromAjax.header - Default response header for AJAX responses.
 * @param {Number} fromAjax.status - Default status code for AJAX responses.
 * @param {Boolean} gateway - Send all validation requests through the CAS gateway feature.
 * @param {[String]} ignore - Ignore CAS validation on these routes.
 * @param {[String]} match - Filter url for CAS authentication
 * @param {Object} paths - CAS path configuration.
 * @param {String} paths.login - CAS login path.
 * @param {String} paths.logout - CAS logout path.
 * @param {String} paths.proxy - Path to obtain proxy ticket.
 * @param {String} paths.proxyCallback - Path to call once proxy ticket is obtained.
 * @param {String} paths.serviceValidate - Path to validate TGT.
 * @param {String} paths.validate - Validation path.
 * @param {Boolean} redirect -Whether to automatically redirect or not.
 * @param {Boolean} renew - Whether to renew CAS authentication by default or not.
 * @param {String} serverPath - URL to CAS server.
 * @param {String} servicePrefix - URL of the orchestrator endpoint.
 * @param {Boolean} slo - single sign logout feature
 * @param {String} targetService - URI to CAS service.
 */

/**
 * @typedef {Object} Config
 * @param {String} allowedMethods - List of allowed HTTP methods, separated by comas.
 * @param {String} apiUrl - URL of the API instance to call.
 * @param {CasConfig} cas - {@link https://github.com/UdeS-STI/connect-cas CAS configuration}.
 * @param {Object} cookies - Cookie configuration.
 * @param {Number} cookies.maxAge - Time to live (TTL) for the cookie in ms.
 * @param {Boolean} cookies.httpOnly - {@link https://www.owasp.org/index.php/HttpOnly HttpOnly flag}
 * @param {String} cookies.name - Cookie name.
 * @param {String} cookies.path - Path to store cookie.
 * @param {String} cookies.secret - Encryption key for cookie.
 * @param {Boolean} cookies.secure - Whether to encrypt cookie or not.
 * @param {String} customHeaderPrefix - Prefix for retrieving data from custom headers.
 * @param {Object} database - Couchbase configuration.
 * @param {String} database.cacheBucketName - Cache bucket name.
 * @param {String} database.cacheBucketPwd - Cache bucket password.
 * @param {[String]} database.couchbaseCluster - List of Couchbase cluster URLs.
 * @param {String} database.sessionBucketName - Session bucket name.
 * @param {String} database.sessionBucketPwd - Session bucket password.
 * @param {Boolean} enableAuth - Whether to enable CAS authentication or not.
 * @param {Boolean} enableCORS - Whether to enable CORS or not.
 * @param {Object} log - Logger configuration.
 * @param {('trace'|'info'|'debug'|'warn'|'error'|'silent')} log.logLevel - Log level.
 * @param {String} log.name - Logger name.
 * @param {Boolean} log.prettyPrint - Whether to print pretty or raw.
 * @param {Boolean} log.showCredentialsAsClearText - If true credentials will be displayed as clear text in logs.
 * @param {String} nocasPwd - CAS default password when `enableAuth` is false.
 * @param {String} nocasUser - CAS default username when `enableAuth` is false.
 * @param {String} [sessionUrl] - URL for getting session id.
 * @param {String} socket - Relative path to socket.
 */
