/**
 * @typedef {Object} Config
 * @property {String} allowedMethods -
 * @property {String} apiUrl - URL of the API instance to call.
 * @property {Object} cas - CAS configuration.
 * @property {Object} cas.cache - CAS cache configuration.
 * @property {Boolean} cas.cache.enable - Whether to enable CAS caching or not.
 * @property {[String]} cas.cache.filter -
 * @property {Number} cas.cache.ttl - Time to live of cache in ms.
 * @property {Boolean} cas.debug - Whether to activate CAS debugging or not.
 * @property {Object} cas.fromAjax - CAS from AJAX configuration.
 * @property {String} cas.fromAjax.header -
 * @property {Number} cas.fromAjax.status -
 * @property {Boolean} cas.gateway -
 * @property {[String]} cas.ignore - Ignore CAS validation on these routes.
 * @property {Function} cas.logger - Logger function for CAS.
 * @property {[String]} cas.match -
 * @property {Object} cas.paths - CAS path configuration.
 * @property {String} cas.paths.login - Login path.
 * @property {String} cas.paths.logout - Logout path.
 * @property {String} cas.paths.proxy - Proxy path.
 * @property {String} cas.paths.proxyCallback - Proxy callback path.
 * @property {String} cas.paths.serviceValidate - Service validation path.
 * @property {String} cas.paths.validate - Validation path.
 * @property {Boolean} cas.redirect -Whether to automatically redirect or not.
 * @property {Boolean} cas.renew - Whether to renew CAS authentication by default or not.
 * @property {String} cas.serverPath - URL to CAS server.
 * @property {String} cas.servicePrefix - URL of the orchestrator endpoint.
 * @property {Boolean} cas.slo -
 * @property {String} cas.targetService - URI to CAS service.
 * @property {Object} cookies - Cookie configuration.
 * @property {Number} cookies.maxAge - Time to live (TTL) for the cookie in ms.
 * @property {Boolean} cookies.httpOnly -
 * @property {String} cookies.name -
 * @property {String} cookies.path -
 * @property {String} cookies.secret -
 * @property {Boolean} cookies.secure -
 * @property {String} customHeaderPrefix -
 * @property {Object} database -
 * @property {String} database.cacheBucketName -
 * @property {String} database.cacheBucketPwd -
 * @property {[String]} database.couchbaseCluster -
 * @property {String} database.sessionBucketName -
 * @property {String} database.sessionBucketPwd -
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
