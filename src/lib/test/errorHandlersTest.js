/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import 'babel-polyfill';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  clientErrorHandler,
  errorHandler,
  logErrors,
} from '../errorHandlers';

describe('server/lib/errorHandlers', () => {
  describe('clientErrorHandler', () => {
    it('should call the `res.send` if the value of `req.xhr` is defined', () => {
      const req = { xhr: 'xhr' };
      const res = { send: sinon.spy() };
      clientErrorHandler('error', req, res);
      expect(res.send).to.be.called;
    });

    it('should call `next` with `error` if `req.xhr` is not defined', () => {
      const error = 'error';
      const next = sinon.spy();
      clientErrorHandler(error, {}, {}, next);
      expect(next).to.be.calledWith(error);
    });
  });

  describe('errorHandler', () => {
    it('should call the `res.send`', () => {
      const res = { send: sinon.spy() };
      errorHandler('error', {}, res);
      expect(res.send).to.be.called;
    });
  });

  describe('logErrors', () => {
    it('should call `next` with `error`', () => {
      const req = {
        log: {
          error() {},
        },
      };
      const error = 'error';
      const next = sinon.spy();
      logErrors(error, req, {}, next);
      expect(next).to.be.calledWith(error);
    });
  });
});
