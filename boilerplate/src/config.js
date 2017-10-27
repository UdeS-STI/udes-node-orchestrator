export default {
  apiUrl: 'https://jsonplaceholder.typicode.com',
  customHeaderPrefix: 'foo',
  socket: '../nodejs-sockets/nodejs.sock',
  database: {
    couchbaseCluster: ['couchbase.cluster.exemple.ca'],
    cacheBucketName: 'cache-bucket',
    cacheBucketPwd: 'CACHE_BUCKET_PWD',
    sessionBucketName: 'sessions-bucket',
    sessionBucketPwd: 'SESSION_BUCKET_PWD',
  },
  cas: {
    servicePrefix: 'https://endpoint-base-url-com/path',
    targetService: 'services://foo.service.ca',
    serverPath: 'https://exemple.ca',
  },
}
