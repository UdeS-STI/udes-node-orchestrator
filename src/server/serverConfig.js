import bodyParser from 'body-parser'
import Cas from 'udes-connect-cas'
import compress from 'compression'
import cookieParser from 'cookie-parser'
import CouchbaseConnector from 'connect-couchbase'
import Debug from 'debug'
import ExpressPinoLogger from 'express-pino-logger'
import fs from 'fs'
import methodOverride from 'method-override'
import Pino from 'pino'
import session from 'express-session'
import uuidV4 from 'uuid/v4'

import { logErrors, clientErrorHandler, errorHandler } from '../lib/errorHandlers'

const CouchbaseStore = new CouchbaseConnector(session)
const debug = new Debug('orchestrator')
const pino = new Pino()

export const configureExpress = (app, configuration, env) => {
  process.env.isProduction = env === 'production'
  debug.enabled = configuration.debug

  // Logging
  debug('Log manager configuration')
  app.use(new ExpressPinoLogger({
    logger: pino,
    name: configuration.log.name,
    level: configuration.log.logLevel,
    prettyPrint: configuration.log.prettyPrint,
  }))

  // Enable compression
  app.use(compress())

  if (env === 'production') {
    // Set trust proxy for secure session cookie
    debug('Prod: Add trust proxy for secure cookies')
    app.set('trust proxy', 1)
    app.set('showStackError', false)
  }

  // Enable HTTP verbs REST.
  app.use(methodOverride())

  // Enable cross-origin resource sharing.
  if (configuration.enableCORS) {
    debug('Add CORS support')
    app.all('*', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header('Access-Control-Allow-Methods', configuration.allowedMethods.join(','))
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-Disposition, Accept, x-client-ajax, Range')
      next()
    })
  }

  // Session management
  debug('Couchbase configuration for sessions')
  const couchbaseStore = new CouchbaseStore({
    bucket: configuration.database.sessionBucketName,
    connectionTimeout: 10000,
    hosts: configuration.database.couchbaseCluster,
    password: configuration.database.sessionBucketPwd,
    prefix: '',
  })
  couchbaseStore.on('connect', () => {
    pino.info('Connection to couchbase session server established')
  })
  couchbaseStore.on('disconnect', () => {
    pino.error('Connection to Couchbase session server lost')
    process.kill(process.pid, 'SIGUSR1')
  })

  // Cookie management
  app.use(cookieParser())
  app.use(session({
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    secret: configuration.cookies.secret,
    name: configuration.cookies.name,
    cookie: {
      httpOnly: configuration.cookies.httpOnly,
      secure: configuration.cookies.secure,
      path: configuration.cookies.path,
    },
    store: couchbaseStore,
  }))

  // CAS configuration
  if (configuration.enableAuth) {
    debug('CAS client configuration and activation')
    const casConfig = configuration.cas
    casConfig.cache = {
      enable: false,
    }

    app.use((req, res, next) => {
      const casPino = new Pino({ level: configuration.cas.logLevel })

      req.sn = uuidV4()
      req.getLogger = (type = 'log', ...args) => {
        let user = 'unknown'

        try {
          user = req.session.cas.user
        } catch (e) {}

        return casPino[type](`${req.sn}|${user}|${req.ip}|`, ...args)
      }

      casConfig.logger = (req, type) => {
        return req.getLogger(type, '[CONNECT_CAS]: ')
      }

      next()
    })
    const casClient = new Cas(casConfig)
    app.use(casClient.core())
  }

  // Parse application/x-www-form-urlencoded & application/json
  app.use(bodyParser.urlencoded({
    extended: true,
  }))
  app.use(bodyParser.json({
    limit: '1mb',
  }))

  app.use((req, res, next) => {
    const defaultTargetService = configuration.cas.targetService

    if (!req.session.apiSessionIds) {
      req.session.apiSessionIds = {}
    }

    req.session.getProxyTicket = (targetService = defaultTargetService) => new Promise((resolve, reject) => {
      req.getProxyTicket(targetService, { renew: false }, (err, pt) => {
        if (err) {
          return reject(err)
        }

        return resolve(pt)
      })
    })

    next()
  })
}

export const setListeners = (app, server, config) => {
  const listenOn = config.port || config.socket

  server.listen(listenOn, () => {
    if (config.socket) {
      fs.chmodSync(config.socket, '660')
    }

    pino.info(
      'UdeS Node Orchestrator listening on %s %s in %s mode',
      config.port ? 'port' : 'socket',
      listenOn,
      app.settings.env,
    )
  })

  // Log errors
  server.on('error', err => pino.error(new Error(err)))

  // Close connections
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      setTimeout(() => {
        pino.info('Graceful reload from PM2')
        process.exit(0)
      }, 3000)
    }
  })

  // Never ignore an uncaught exception or try to recover
  process.on('uncaughtException', (err) => {
    server.close(() => {
      pino.error(new Error(err.stack))
      pino.error(new Error('uncaughtException:', err.message))
      process.exit(1)
    })
  })

  // Never ignore an uncaught rejection with promises or try to recover
  process.on('unhandledRejection', (err) => {
    server.close(() => {
      pino.error(new Error(err.stack))
      pino.error(new Error('unhandledRejection:', err.message))
      process.exit(1)
    })
  })

  // Normal shutdown
  process.on('SIGTERM', () => {
    server.close((err) => {
      if (err) {
        pino.error(new Error(err))
        process.exit(1)
      }
    })
    pino.error('Server closing: SIGTERM')
    process.exit(0)
  })

  // Graceful shutdown
  process.on('SIGINT', () => {
    server.close((err) => {
      if (err) {
        pino.error(new Error(err))
        process.exit(1)
      }
    })
    pino.error('Server closing: SIGINT')
    process.exit(0)
  })

  // Custom signal used to kill process if there's
  // a connexion error to cache server
  process.on('SIGUSR1', () => {
    server.close((err) => {
      if (err) {
        pino.error(err)
        process.exit(1)
      }
    })
    pino.error('Server closing: SIGUSR1')
    process.exit(0)
  })
}

export const handleErrors = (app) => {
  app.use(logErrors)
  app.use(clientErrorHandler)
  app.use(errorHandler)
}
