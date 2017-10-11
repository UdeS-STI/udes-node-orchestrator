/* eslint-env mocha */
import 'babel-polyfill';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import * as serverConfig from '../serverConfig';
import Orchestrator from '../Orchestrator';

chai.use(sinonChai);

describe('server/Orchestrator', () => {
  before(() => {
    sinon.stub(serverConfig, 'configureExpress');
    sinon.stub(serverConfig, 'handleErrors');
    sinon.stub(serverConfig, 'setListeners');
  });

  after(() => {
    serverConfig.configureExpress.restore();
    serverConfig.handleErrors.restore();
    serverConfig.setListeners.restore();
  });

  it('should match property list', () => {
    const orchestrator = new Orchestrator({});
    const properties = ['setRoutes', 'env', 'app', 'config', 'server'];
    expect(Object.keys(orchestrator)).to.be.deep.equal(properties);
  });
});
