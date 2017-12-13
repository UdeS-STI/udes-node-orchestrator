/**
 * @typedef {Object} CasConfig
 * @param {Boolean?} [debug=false] - Whether to activate CAS debugging or not.
 * @param {Object?} fromAjax - CAS from AJAX configuration.
 * @param {String?} [fromAjax.header=x-client-ajax] - Default response header for AJAX responses.
 * @param {Number?} [fromAjax.status=401] - Default status code for AJAX responses.
 * @param {Boolean?} [gateway=false] - Send all validation requests through the CAS gateway feature.
 * @param {[String]?} [ignore=[]] - Ignore CAS validation on these routes.
 * @param {[String]?} [match=[]] - Filter url for CAS authentication
 * @param {Object?} paths - CAS path configuration.
 * @param {String?} [paths.login=/login] - CAS login path.
 * @param {String?} [paths.logout=/logout] - CAS logout path.
 * @param {String?} [paths.proxy=/proxy] - Path to obtain proxy ticket.
 * @param {String?} [paths.proxyCallback=/proxyCallback] - Path to call once proxy ticket is obtained.
 * @param {String?} [paths.serviceValidate=/proxyValidate] - Path to validate TGT.
 * @param {String?} [paths.validate=/validate] - Validation path.
 * @param {Boolean?} [redirect=false] - Whether to automatically redirect or not.
 * @param {Boolean?} [renew=false] - Whether to renew CAS authentication by default or not.
 * @param {String} serverPath - URL to CAS server.
 * @param {String} servicePrefix - URL of the orchestrator endpoint.
 * @param {Boolean?} [slo=false] - single sign logout feature
 * @param {String} targetService - URI to CAS service.
 */

/**
 * @typedef {Object} Config
 * @param {[String]?} [allowedMethods=['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']] - List of allowed HTTP methods, separated by comas.
 * @param {String} apiUrl - URL of the API instance to call.
 * @param {[Object]} authPatterns - Set authentication plugin to be used with specific routes.
 * @param {String} authPatterns.path - Regex string to match 1 or more routes.
 * @param {Class} authPatterns.plugin - Auth plugin, must extend AuthHandler interface from udes-auth-plugins.
 * @param {String} [authPatterns.sessionUrl] - URL for getting session id.
 * @param {String} [authPatterns.targetService] - Custom target service. If none specified the target service in CAS config will be used.
 * @param {CasConfig} cas - {@link https://github.com/UdeS-STI/connect-cas CAS configuration}.
 * @param {Object?} cookies - Cookie configuration.
 * @param {Number?} [cookies.maxAge=14400000] - Time to live (TTL) for the cookie in ms.
 * @param {Boolean?} [cookies.httpOnly=true] - {@link https://www.owasp.org/index.php/HttpOnly HttpOnly flag}
 * @param {String?} [cookies.name=udes-node-orchestrator] - Cookie name.
 * @param {String?} [cookies.path=/] - Path to store cookie.
 * @param {String?} [cookies.secret=S3CR3T] - Encryption key for cookie.
 * @param {Boolean?} [cookies.secure=true] - Whether to encrypt cookie or not.
 * @param {[Object]?} [customHeaders=[]] - Retrieve data from custom headers.
 * @param {String} [customHeaders.header] - The custom header to retrieve.
 * @param {String?} [customHeaders.property] - The property name to give to data. Defaults to header if not defined.
 * @param {Object} database - Couchbase configuration.
 * @param {String} database.cacheBucketName - Cache bucket name.
 * @param {String} database.cacheBucketPwd - Cache bucket password.
 * @param {[String]} database.couchbaseCluster - List of Couchbase cluster URLs.
 * @param {String} database.sessionBucketName - Session bucket name.
 * @param {String} database.sessionBucketPwd - Session bucket password.
 * @param {Boolean} [debug=false] - True to return debug data.
 * @param {Boolean?} [enableAuth=true] - Whether to enable CAS authentication or not.
 * @param {Boolean?} [enableCORS=true] - Whether to enable CORS or not.
 * @param {Class?} [errorFormatter] - Class extending the ResponseFormatter interface. Format data on error.
 * @param {Object?} log - Logger configuration.
 * @param {String} loginPath - Url to login page.
 * @param {('trace'|'info'|'debug'|'warn'|'error'|'silent')?} [log.logLevel=error] - Log level.
 * @param {String?} [log.name=udes-node-orchestrator] - Logger name.
 * @param {Boolean?} [log.prettyPrint=true] - Whether to print pretty or raw.
 * @param {Boolean?} [log.showCredentialsAsClearText=false] - If true credentials will be displayed as clear text in logs.
 * @param {String?} [nocasPwd=nocas] - CAS default password when `enableAuth` is false.
 * @param {String?} [nocasUser=nocas] - CAS default username when `enableAuth` is false.
 * @param {Class?} [responseFormatter] - Class extending the ResponseFormatter interface. Format response data.
 * @param {String} socket - Relative path to socket.
 */
