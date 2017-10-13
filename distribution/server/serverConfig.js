'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleErrors = exports.setListeners = exports.configureExpress = undefined;

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _udesConnectCas = require('udes-connect-cas');

var _udesConnectCas2 = _interopRequireDefault(_udesConnectCas);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _connectCouchbase = require('connect-couchbase');

var _connectCouchbase2 = _interopRequireDefault(_connectCouchbase);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _expressPinoLogger = require('express-pino-logger');

var _expressPinoLogger2 = _interopRequireDefault(_expressPinoLogger);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _pino = require('pino');

var _pino2 = _interopRequireDefault(_pino);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _errorHandlers = require('../lib/errorHandlers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */

var CouchbaseStore = new _connectCouchbase2.default(_expressSession2.default);
var orchestrateurDebug = new _debug2.default('orchestrateur');
var pino = new _pino2.default();

var configureExpress = exports.configureExpress = function configureExpress(app, configuration, env) {
  var pinoExpress = new _expressPinoLogger2.default({
    logger: pino,
    name: configuration.log.name,
    level: configuration.log.logLevel,
    prettyPrint: configuration.log.prettyPrint
  });

  // Logging
  orchestrateurDebug('Configuration du log manager');
  app.use(pinoExpress);

  // Enable compression
  app.use((0, _compression2.default)());

  if (env === 'production') {
    // Set trust proxy for secure session cookie
    orchestrateurDebug('Prod: Ajout de trust proxy pour les cookie secure');
    app.set('trust proxy', 1);
    app.set('showStackError', false);
  }

  // Enable HTTP verbs REST.
  app.use((0, _methodOverride2.default)());

  // Enable cross-origin resource sharing.
  if (configuration.enableCORS) {
    orchestrateurDebug('Ajout du support CORS');
    app.all('*', function (req, res, next) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-Disposition, Accept, x-client-ajax, Range');
      next();
    });
  }

  // Session management
  orchestrateurDebug('Configuration couchbase pour les sessions');
  var couchbaseStore = new CouchbaseStore({
    bucket: configuration.database.sessionBucketName,
    connectionTimeout: 10000,
    hosts: configuration.database.couchbaseCluster,
    password: configuration.database.sessionBucketPwd,
    prefix: ''
  });
  couchbaseStore.on('connect', function () {
    pino.info('Connexion au serveur Couchbase de session établie');
  });
  couchbaseStore.on('disconnect', function () {
    pino.error('La connexion au serveur CouchBase de session a été intérompue');
    process.kill(process.pid, 'SIGUSR1');
  });

  // Cookie management
  app.use((0, _cookieParser2.default)());
  app.use((0, _expressSession2.default)({
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    secret: configuration.cookies.secret,
    name: configuration.cookies.name,
    cookie: {
      httpOnly: configuration.cookies.httpOnly,
      secure: configuration.cookies.secure,
      path: configuration.cookies.path
    },
    store: couchbaseStore
  }));

  // CAS configuration
  if (configuration.enableAuth) {
    orchestrateurDebug('Configuration et activation du client CAS');
    app.use(function (req, res, next) {
      req.sn = (0, _v2.default)();

      /**
       * Function that returns logger.
       * @param {String} type - Log type.
       * @param {...*} args - Arguments to log.
       * @returns {Object} Logger
       */
      function getLogger() {
        var _console$log;

        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'log';

        var user = void 0;
        try {
          user = req.session.cas.user;
        } catch (e) {
          user = 'unknown';
        }

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        if (console[type] !== undefined) {
          var _console$type;

          return (_console$type = console[type]).bind.apply(_console$type, [console[type], req.sn + '|' + user].concat(args));
        }
        return (_console$log = console.log).bind.apply(_console$log, [console.log, req.sn + '|' + user].concat(args));
      }

      req.getLogger = getLogger;
      next();
    });
    var casClient = new _udesConnectCas2.default(configuration.cas);
    app.use(casClient.core());
  }

  // Parse application/x-www-form-urlencoded & application/json
  app.use(_bodyParser2.default.urlencoded({
    extended: true
  }));
  app.use(_bodyParser2.default.json({
    limit: '1mb'
  }));

  // Route management
  orchestrateurDebug('Instantiation du gestionnaire de routes');

  // Error management
  orchestrateurDebug('Instantiation des gestionnaires d\'erreurs');
};

var setListeners = exports.setListeners = function setListeners(app, server, config) {
  server.listen(config.socket, function () {
    pino.info('Orchestrateur nodeJS écoute sur le socket %s en mode %s', config.socket, app.settings.env);
  });

  // Log errors
  server.on('error', function (err) {
    return pino.error(new Error(err));
  });

  // Close connections
  process.on('message', function (msg) {
    if (msg === 'shutdown') {
      setTimeout(function () {
        pino.info('Gracefull reload depuis PM2');
        process.exit(0);
      }, 3000);
    }
  });

  // Never ignore an uncaught exception or try to recover
  process.on('uncaughtException', function (err) {
    server.close(function () {
      pino.error(new Error(err.stack));
      pino.error(new Error('uncaughtException:', err.message));
      process.exit(1);
    });
  });

  // Never ignore an uncaught rejection with promises or try to recover
  process.on('unhandledRejection', function (err) {
    server.close(function () {
      pino.error(new Error(err.stack));
      pino.error(new Error('unhandledRejection:', err.message));
      process.exit(1);
    });
  });

  // Normal shutdown
  process.on('SIGTERM', function () {
    server.close(function (err) {
      if (err) {
        pino.error(new Error(err));
        process.exit(1);
      }
    });
    pino.error('Fermeture du serveur: SIGTERM');
    process.exit(0);
  });

  // Graceful shutdown
  process.on('SIGINT', function () {
    server.close(function (err) {
      if (err) {
        pino.error(new Error(err));
        process.exit(1);
      }
    });
    pino.error('Fermeture du serveur: SIGINT');
    process.exit(0);
  });

  // Custom signal used to kill process if there's
  // a connexion error to cache server
  process.on('SIGUSR1', function () {
    server.close(function (err) {
      if (err) {
        pino.error(err);
        process.exit(1);
      }
    });
    pino.error('Fermeture du serveur: SIGUSR1');
    process.exit(0);
  });
};

var handleErrors = exports.handleErrors = function handleErrors(app) {
  app.use(_errorHandlers.logErrors);
  app.use(_errorHandlers.clientErrorHandler);
  app.use(_errorHandlers.errorHandler);
};