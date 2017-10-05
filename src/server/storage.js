// @ts-check
import { Cluster } from '../dependencies/couchbase';
import { getlogger } from '../lib/logger';

const config = {
  database: {
    couchbaseCluster: '',
    cacheBucketName: '',
    cacheBucketPwd: '',
  },
  log: {
    name: 'logger',
    logLevel: 'trace',
    prettyPrint: true,
  },
};
const { cacheBucketName, cacheBucketPwd, couchbaseCluster } = config.database;
const cluster = new Cluster(couchbaseCluster); // Database connection module.
const logger = getlogger(config);


// Log an error message and kill the process.
const kill = (...args) => {
  logger.error(...args);
  process.kill(process.pid, 'SIGUSR1');
};

// Open applicative cache bucket.
const cacheBucket = cluster.openBucket(cacheBucketName, cacheBucketPwd, (err) => {
  if (err) {
    kill('Une erreur est survenue lors de la connexion au serveur Couchbase de cache: ', err);
    return;
  }

  logger.info('Connexion au serveur Couchbase de cache applicative établie.');
});

cacheBucket.connectionTimeout = 10000;
cacheBucket.on('timeout', () => kill('La tentative de connexion Couchbase(cache) a dépassée la limite de temps'));
cacheBucket.on('error', () => kill('Une erreur c\'est produite avec la connexion Couchbase(cache)'));

export default cacheBucket;
