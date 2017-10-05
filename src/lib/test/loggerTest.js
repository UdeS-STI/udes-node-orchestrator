/* eslint-env mocha */
/* eslint import/no-extraneous-dependencies: 0 */
import 'babel-polyfill';
import { expect } from 'chai';

import { getLogger } from '../logger';

const config = {
  log: {
    name: 'logger',
    logLevel: 'warn',
    prettyPrint: true,
  },
};

describe('server/lib/logger', () => {
  it('should be an instance of an event emitter', () => {
    expect(getLogger(config).constructor.name).to.be.equal('EventEmitter');
  });
});
