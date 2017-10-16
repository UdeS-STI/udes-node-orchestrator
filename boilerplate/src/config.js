export default {
  apiUrl: 'https://jsonplaceholder.typicode.com',
  customHeaderPrefix: 'foo',
  socket: '../nodejs-sockets/nodejs.sock',
  cookies: {
    maxAge: 14400000, // ms
    secret: 'S3CR3T',
    secure: false,
    httpOnly: true,
    name: 'udes-node-orchestrator',
    path: '/',
  },
  database: {
    couchbaseCluster: ['couchbase.cluster.exemple.ca'],
    cacheBucketName: 'cache-bucket',
    cacheBucketPwd: 'CACHE_BUCKET_PWD',
    sessionBucketName: 'sessions-bucket',
    sessionBucketPwd: 'SESSION_BUCKET_PWD',
  },
  enableAuth: true,
  nocasUser: 'nocas',
  nocasPwd: 'nocas',
  cas: {
    debug: false,
    ignore: [
      '/public',
      '/logout',
    ],
    match: [],
    servicePrefix: 'https://endpoint-base-url-com/path',
    targetService: 'services://foo.service.ca',
    serverPath: 'https://exemple.ca',
    paths: {
      validate: '/validate',
      serviceValidate: '/proxyValidate',
      proxy: '/proxy',
      login: '/login',
      logout: '/logout',
      proxyCallback: '/proxyCallback',
    },
    redirect: false,
    gateway: false,
    renew: false,
    slo: false,
    cache: {
      enable: false,
      ttl: 300000, // ms
      filter: [],
    },
    fromAjax: {
      header: 'x-client-ajax',
      status: 401,
    },
  },
  enableCORS: true,
  allowedMethods: 'GET,POST,OPTIONS,PUT,DELETE',
  log: {
    name: 'udes-node-orchestrator',
    logLevel: 'debug',
    prettyPrint: true,
    showCredentialsAsClearText: false,
  },
}
