/* eslint-env mocha */
/* eslint import/no-extraneous-dependencies: 0 */
import 'babel-polyfill';
import { expect } from 'chai';

import RequestError from '../RequestError';

describe('server/lib/RequestError', () => {
  describe('constructor', () => {
    it('should set statusCode value to value of argument', () => {
      const requestError = new RequestError('message', 406);
      expect(requestError.statusCode).to.be.equal(406);
    });

    it('should set message to JSON object if argument is JSON string', () => {
      const json = { body: 'message' };
      const requestError = new RequestError(JSON.stringify(json), 406);
      expect(requestError.message).to.deep.equal(json);
    });

    it('should set message to string if argument is not JSON string', () => {
      const requestError = new RequestError('message', 406);
      expect(requestError.message).to.be.equal('message');
    });
  });
});
