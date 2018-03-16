/* eslint no-console: 0 */
import { Cluster } from '../dependencies/couchbase';

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

// Log an error message and kill the process.
const kill = (...args) => {
  console.error(...args);
  process.kill(process.pid, 'SIGUSR1');
};

// Open applicative cache bucket.
const cacheBucket = cluster.openBucket(cacheBucketName, cacheBucketPwd, (err) => {
  if (err) {
    kill('Une erreur est survenue lors de la connexion au serveur Couchbase de cache: ', err);
  }
});

cacheBucket.connectionTimeout = 10000;
cacheBucket.on('timeout', () => kill('La tentative de connexion Couchbase(cache) a dépassée la limite de temps'));
cacheBucket.on('error', () => kill('Une erreur c\'est produite avec la connexion Couchbase(cache)'));

export default cacheBucket;
