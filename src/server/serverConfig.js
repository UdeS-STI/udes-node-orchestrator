/* eslint no-console: 0 */

import bodyParser from 'body-parser'
import Cas from 'udes-connect-cas'
import compress from 'compression'
import cookieParser from 'cookie-parser'
import CouchbaseConnector from 'connect-couchbase'
import Debug from 'debug'
import ExpressPinoLogger from 'express-pino-logger'
import methodOverride from 'method-override'
import Pino from 'pino'
import session from 'express-session'
import uuidV4 from 'uuid/v4'

import { logErrors, clientErrorHandler, errorHandler } from '../lib/errorHandlers'

const CouchbaseStore = new CouchbaseConnector(session)
const orchestrateurDebug = new Debug('orchestrateur')
const pino = new Pino()

export const configureExpress = (app, configuration, env) => {
  const pinoExpress = new ExpressPinoLogger({
    logger: pino,
    name: configuration.log.name,
    level: configuration.log.logLevel,
    prettyPrint: configuration.log.prettyPrint,
  })

  // Logging
  orchestrateurDebug('Configuration du log manager')
  app.use(pinoExpress)

  // Enable compression
  app.use(compress())

  if (env === 'production') {
    // Set trust proxy for secure session cookie
    orchestrateurDebug('Prod: Ajout de trust proxy pour les cookie secure')
    app.set('trust proxy', 1)
    app.set('showStackError', false)
  }

  // Enable HTTP verbs REST.
  app.use(methodOverride())

  // Enable cross-origin resource sharing.
  if (configuration.enableCORS) {
    orchestrateurDebug('Ajout du support CORS')
    app.all('*', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Content-Disposition, Accept, x-client-ajax, Range')
      next()
    })
  }

  // Session management
  orchestrateurDebug('Configuration couchbase pour les sessions')
  const couchbaseStore = new CouchbaseStore({
    bucket: configuration.database.sessionBucketName,
    connectionTimeout: 10000,
    hosts: configuration.database.couchbaseCluster,
    password: configuration.database.sessionBucketPwd,
    prefix: '',
  })
  couchbaseStore.on('connect', () => {
    pino.info('Connexion au serveur Couchbase de session établie')
  })
  couchbaseStore.on('disconnect', () => {
    pino.error('La connexion au serveur CouchBase de session a été intérompue')
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
    orchestrateurDebug('Configuration et activation du client CAS')
    app.use((req, res, next) => {
      req.sn = uuidV4()

      function getLogger (type = 'log', ...args) {
        let user
        try {
          ({ user } = req.session.cas)
        } catch (e) {
          user = 'unknown'
        }

        if (console[type] !== undefined) {
          return console[type].bind(console[type], `${req.sn}|${user}`, ...args)
        }
        return console.log.bind(console.log, `${req.sn}|${user}`, ...args)
      }

      req.getLogger = getLogger
      next()
    })
    const casClient = new Cas(configuration.cas)
    app.use(casClient.core())
  }

  // Parse application/x-www-form-urlencoded & application/json
  app.use(bodyParser.urlencoded({
    extended: true,
  }))
  app.use(bodyParser.json({
    limit: '1mb',
  }))

  // Route management
  orchestrateurDebug('Instantiation du gestionnaire de routes')

  // Error management
  orchestrateurDebug('Instantiation des gestionnaires d\'erreurs')
}

export const setListeners = (app, server, config) => {
  server.listen(config.socket, () => {
    pino.info('Orchestrateur nodeJS écoute sur le socket %s en mode %s', config.socket, app.settings.env)
  })

  // Log errors
  server.on('error', err => pino.error(new Error(err)))

  // Close connections
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      setTimeout(() => {
        pino.info('Gracefull reload depuis PM2')
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
    pino.error('Fermeture du serveur: SIGTERM')
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
    pino.error('Fermeture du serveur: SIGINT')
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
    pino.error('Fermeture du serveur: SIGUSR1')
    process.exit(0)
  })
}

export const handleErrors = (app) => {
  app.use(logErrors)
  app.use(clientErrorHandler)
  app.use(errorHandler)
}
