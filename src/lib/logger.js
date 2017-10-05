/* eslint-disable no-console, import/prefer-default-export */

import Pino from 'pino';
import stream from 'stream';

export const getLogger = (config) => {
  const configuration = {
    logger: Pino,
    name: config.log.name,
    level: config.log.logLevel, // FIXME add support for ENV files from server
    prettyPrint: config.log.prettyPrint,
  };

  const logger = new Pino(
    configuration,
    new stream.Writable({ write: chunk => console.log(chunk) }),
  );

  logger.on('error', () => {
    console.error('pino logger cannot flush on exit due to provided output stream');
    process.exit(1);
  });

  return logger;
};
