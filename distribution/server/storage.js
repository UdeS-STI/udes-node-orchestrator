'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _couchbase = require('../dependencies/couchbase');

var _logger = require('../lib/logger');

// @ts-check
var config = {
  database: {
    couchbaseCluster: '',
    cacheBucketName: '',
    cacheBucketPwd: ''
  },
  log: {
    name: 'logger',
    logLevel: 'trace',
    prettyPrint: true
  }
};
var _config$database = config.database,
    cacheBucketName = _config$database.cacheBucketName,
    cacheBucketPwd = _config$database.cacheBucketPwd,
    couchbaseCluster = _config$database.couchbaseCluster;

var cluster = new _couchbase.Cluster(couchbaseCluster); // Database connection module.
var logger = (0, _logger.getlogger)(config);

// Log an error message and kill the process.
var kill = function kill() {
  logger.error.apply(logger, arguments);
  process.kill(process.pid, 'SIGUSR1');
};

// Open applicative cache bucket.
var cacheBucket = cluster.openBucket(cacheBucketName, cacheBucketPwd, function (err) {
  if (err) {
    kill('Une erreur est survenue lors de la connexion au serveur Couchbase de cache: ', err);
    return;
  }

  logger.info('Connexion au serveur Couchbase de cache applicative établie.');
});

cacheBucket.connectionTimeout = 10000;
cacheBucket.on('timeout', function () {
  return kill('La tentative de connexion Couchbase(cache) a dépassée la limite de temps');
});
cacheBucket.on('error', function () {
  return kill('Une erreur c\'est produite avec la connexion Couchbase(cache)');
});

exports.default = cacheBucket;