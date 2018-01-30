export default {
  appendMetaData: true,
  cookies: {
    maxAge: 14400000,
    secret: 'S3CR3T',
    secure: false,
    httpOnly: true,
    name: 'udes-node-orchestrator',
    path: '/',
  },
  customHeaders: [],
  enableAuth: true,
  nocasUser: 'nocas',
  nocasPwd: 'nocas',
  cas: {
    debug: false,
    ignore: [],
    match: [],
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
    fromAjax: {
      header: 'x-client-ajax',
      status: 401,
    },
  },
  enableCORS: true,
  allowedMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  log: {
    name: 'udes-node-orchestrator',
    logLevel: 'error',
    prettyPrint: true,
    showCredentialsAsClearText: false,
  },
}
