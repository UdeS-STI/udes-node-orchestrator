/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import 'babel-polyfill';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import * as Auth from '../auth';
import * as HTTP from '../../dependencies/request';
import { formatResponse, getRange, ResponseHelper } from '../ResponseHelper';

chai.use(sinonChai);

let req;
const getProxyTicket = sinon.stub();
const res = {
  send: sinon.spy(),
  set: sinon.spy(),
  status: sinon.spy(() => res),
};
const config = {
  cas: {
    targetService: 'targetService',
  },
  customHeaderPrefix: 'foo',
};

describe('server/lib/ResponseHelper', () => {
  before(() => {
    sinon.spy(Auth, 'getAttributes');
    sinon.stub(HTTP, 'request');
  });

  beforeEach(() => {
    Auth.getAttributes.reset();
    HTTP.request.reset();
    getProxyTicket.reset();
    res.send.reset();
    res.set.reset();
    res.status.reset();

    req = {
      getProxyTicket,
      headers: {
        'Content-Type': 'application/json',
      },
      log: {
        error() {},
      },
      session: {
        cas: {
          user: 'user',
          pt: 'pt',
        },
      },
      url: 'http://exemple.com',
    };
  });

  after(() => {
    Auth.getAttributes.restore();
    HTTP.request.restore();
  });

  describe('constructor', () => {
    it('should throw error if `req` argument is missing', () => {
      let error = null;

      try {
        new ResponseHelper(); // eslint-disable-line no-new
      } catch (err) {
        error = err;
      }

      expect(error).to.be.not.null;
    });

    it('should throw error if `res` argument is missing', () => {
      let error = null;

      try {
        new ResponseHelper(req); // eslint-disable-line no-new
      } catch (err) {
        error = err;
      }

      expect(error).to.be.not.null;
    });

    it('should throw error if `config` argument is missing', () => {
      let error = null;

      try {
        new ResponseHelper(req, res); // eslint-disable-line no-new
      } catch (err) {
        error = err;
      }

      expect(error).to.be.not.null;
    });

    it('should set it\'s req property correctly', () => {
      const responseHelper = new ResponseHelper(req, res, config);
      expect(responseHelper.req).to.be.equal(req);
    });

    it('should set it\'s res property correctly', () => {
      const responseHelper = new ResponseHelper(req, res, config);
      expect(responseHelper.res).to.be.equal(res);
    });

    it('should set it\'s config property correctly', () => {
      const responseHelper = new ResponseHelper(req, res, config);
      expect(responseHelper.config).to.be.equal(config);
    });

    it('should match property list', () => {
      const responseHelper = new ResponseHelper(req, res, config);
      const properties = ['fetch', 'getFile', 'getQueryParameters', 'getRequestParameters', 'handleError', 'handleResponse', 'req', 'res', 'config'];
      expect(Object.keys(responseHelper)).to.be.deep.equal(properties);
    });
  });

  describe('formatResponse', () => {
    it('should return an object with proper keys', () => {
      const data = formatResponse(req, {});
      expect(data).to.have.all.keys('auth', 'isAuth', 'responses');
    });

    it('should call `auth.getAttributes` with the given request object', () => {
      formatResponse(req, {});
      expect(Auth.getAttributes).to.be.calledWith(req);
    });

    it('should return correctly formatted response', () => {
      const data = {
        service: {
          body: 'My sexy body',
          meta: {
            count: 0,
            debug: {
              'x-tempsMs': 0,
            },
            messages: '',
            status: 200,
          },
        },
      };
      const body = formatResponse(req, data);
      const responses = {
        service: {
          count: 0,
          data: data.service,
          debug: {
            'x-tempsMs': 0,
          },
          messages: '',
          status: 200,
        },
      };
      expect(body.responses).to.be.deep.equal(responses);
    });
  });

  describe('getRange', () => {
    it('should return null if no range is set', () => {
      const range = getRange(req, {});
      expect(range).to.be.null;
    });

    it('should return correct range from headers', () => {
      req.headers.range = 'bytes=1-3';
      const range = getRange(req, {});
      expect(range).to.be.deep.equal({ unit: 'bytes', start: 1, end: 3 });
    });

    it('should return correct range from query params', () => {
      req.url += '?range=bytes1-3';
      const responseHelper = new ResponseHelper(req, res, config);
      const range = getRange(req, responseHelper.getQueryParameters());
      expect(range).to.be.deep.equal({ unit: 'bytes', start: 1, end: 3 });
    });
  });

  describe('getQueryParamters', () => {
    it('should return query string parameters from url', () => {
      req.url += '?param1=value1&param2=value2';
      const responseHelper = new ResponseHelper(req, res, config);
      const params = responseHelper.getQueryParameters();
      expect(params).to.be.deep.equal({
        param1: 'value1',
        param2: 'value2',
      });
    });
  });

  describe('getRequestParameters', () => {
    it('should return query string parameters from url and data from request body', () => {
      req.url += '?param1=value1&param2=value2';
      req.body = { param3: 'value3' };
      const responseHelper = new ResponseHelper(req, res, config);
      const params = responseHelper.getRequestParameters();
      expect(params).to.be.deep.equal({
        param1: 'value1',
        param2: 'value2',
        param3: 'value3',
      });
    });
  });

  describe('handleResponse', () => {
    it('should call `res.send` with response data and a 200 status code', () => {
      const data = { hello: { jp: 'おはよう' } };
      const responseHelper = new ResponseHelper(req, res, config);
      responseHelper.handleResponse(data);
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledWith(formatResponse(req, data));
    });

    it('should call `res.send` with unformatted response data and a 200 status code when the formatData flag is false', () => {
      const data = { hello: { jp: 'おはよう' } };
      const responseHelper = new ResponseHelper(req, res, config);
      responseHelper.handleResponse(data, { formatData: false });
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledWith(data);
    });

    it('should call `res.send` with partial response data and a 206 status code when a valid range is sent', () => {
      req.headers.range = 'index=1-2';
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] };
      const responseHelper = new ResponseHelper(req, res, config);
      responseHelper.handleResponse(data);
      expect(res.status).to.be.calledWith(206);
      expect(res.send).to.be.calledWith(formatResponse(req, { data: ['世界', 'フ'] }));
    });

    it('should call `res.send` with partial unformatted response data and a 206 status code when a valid range is sent and the formatData flag is false', () => {
      req.headers.range = 'index=1-2';
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] };
      const responseHelper = new ResponseHelper(req, res, config);
      responseHelper.handleResponse(data, { formatData: false });
      expect(res.status).to.be.calledWith(206);
      expect(res.send).to.be.calledWith({ data: ['世界', 'フ'] });
    });

    it('should call `res.send` with error and a 416 status code when a invalid range is sent', () => {
      req.headers.range = 'index=1-6';
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] };
      const responseHelper = new ResponseHelper(req, res, config);
      responseHelper.handleResponse(data);
      expect(res.status).to.be.calledWith(416);
    });

    it('should call `res.send` with data and a 200 status code when range represents entire response data', () => {
      req.headers.range = 'index=0-3';
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] };
      const responseHelper = new ResponseHelper(req, res, config);
      responseHelper.handleResponse(data);
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.calledWith(formatResponse(req, data));
    });
  });

  describe('handleError', () => {
    it('should call `res` with correct status code and message when they are set', () => {
      const error = { statusCode: 404, message: 'Page not found' };
      (new ResponseHelper(req, res, config)).handleError(error);
      expect(res.status).to.be.calledWith(error.statusCode);
      expect(res.send).to.be.calledWith(error.message);
    });

    it('should call `res` with default status code when not set', () => {
      const error = { message: 'Error' };
      (new ResponseHelper(req, res, config)).handleError(error);
      expect(res.status).to.be.calledWith(500);
    });

    it('should call `res` with default status code and error when error is a string', () => {
      const error = 'Erorr';
      (new ResponseHelper(req, res, config)).handleError(error);
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.calledWith(error);
    });
  });

  describe('getFile', () => {
    it('should call `req.getProxyTicket`', async () => {
      (new ResponseHelper(req, res, config)).getFile({});
      expect(getProxyTicket).to.be.called;
    });

    it('should call `request.get` if there is no error', async () => {
      const opt = {
        auth: { pass: 'pt', user: 'user' },
        headers: {
          Accept: 'application/json; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8',
        },
      };
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      HTTP.request.get = sinon.spy(() => ({ pipe() {} }));
      await (new ResponseHelper(req, res, config)).getFile({});
      expect(HTTP.request.get).to.be.calledWith(opt);
    });

    it('should call `pipe` if there is no error', async () => {
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      const pipe = sinon.spy();
      HTTP.request.get = () => ({ pipe });
      await (new ResponseHelper(req, res, config)).getFile({});
      expect(pipe).to.be.calledWith(res);
    });

    it('should not call `request.get` if there is an error', async () => {
      getProxyTicket.callsFake((targetService, options, cb) => cb('error', null));
      HTTP.request.get = sinon.spy(() => ({ pipe() {} }));
      await (new ResponseHelper(req, res, config)).getFile({});
      expect(HTTP.request.get).not.to.be.called;
    });
  });

  describe('fetch', () => {
    it('should call `req.getProxyTicket`', () => {
      (new ResponseHelper(req, res, config)).fetch({});
      expect(getProxyTicket).to.be.called;
    });

    it('should throw an error if error is returned in callback', async () => {
      let error;
      getProxyTicket.callsFake((targetService, options, cb) => cb('error'));

      try {
        await (new ResponseHelper(req, res, config)).fetch({});
      } catch (err) {
        error = err;
      }

      expect(error).to.be.deep.equal({ statusCode: 500, message: 'error' });
    });

    it('should call `request` if the callback does not return an error', async () => {
      const response = {
        statusCode: 200,
        body: '{}',
        headers: {
          'foo-messages': '',
        },
      };
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      HTTP.request.callsFake((options, cb) => cb(null, response));

      try {
        await (new ResponseHelper(req, res, config)).fetch({ url: 'http://localhost', method: 'GET' });
      } catch (err) {}    // eslint-disable-line

      expect(HTTP.request).to.be.called;
    });

    it('should return an Object when response is a JSON string', async () => {
      let response;
      const data = { body: 'My beautiful body' };
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      HTTP.request.callsFake((options, cb) => cb(null, {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          'foo-messages': '',
        },
      }));

      try {
        response = await (new ResponseHelper(req, res, config)).fetch(req, { url: 'http://localhost', method: 'GET' });
      } catch (err) {}    // eslint-disable-line

      expect(response).to.be.deep.equal({
        ...data,
        meta: {
          count: 0,
          debug: {
            'x-TempsMs': 0,
          },
          messages: '',
          status: 200,
        },
      });
    });

    it('should return a String when response is a JSON string', async () => {
      let response;
      const data = 'My beautiful body';
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      HTTP.request.callsFake((options, cb) => cb(null, {
        statusCode: 200,
        body: data,
        headers: {
          'foo-messages': '',
        },
      }));

      try {
        response = await (new ResponseHelper(req, res, config)).fetch(req, { url: 'http://localhost', method: 'GET' });
      } catch (err) {}    // eslint-disable-line

      expect(response).to.be.deep.equal({
        data,
        meta: {
          count: 0,
          debug: {
            'x-TempsMs': 0,
          },
          messages: '',
          status: 200,
        },
      });
    });

    it('should return an error when response is an error', async () => {
      let error;
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      HTTP.request.callsFake((options, cb) => cb('error'));

      try {
        await (new ResponseHelper(req, res, config)).fetch(req, { url: 'http://localhost', method: 'GET' });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.deep.equal({ statusCode: 500, message: 'error' });
    });

    it('should return an error when response status code is not 2XX', async () => {
      let error;
      const response = {
        statusCode: 500,
        body: 'Internal server error',
        headers: {},
      };
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      HTTP.request.callsFake((options, cb) => cb(null, response));

      try {
        await (new ResponseHelper(req, res, config)).fetch(req, { url: 'http://localhost', method: 'GET' });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.deep.equal({
        statusCode: response.statusCode,
        message: response.body,
      });
    });

    it('should call `req.getProxyTicket` twice when response status code is 401', async () => {
      getProxyTicket.callsFake((targetService, options, cb) => cb(null, 'pt'));
      HTTP.request.callsFake((options, cb) => cb(null, {
        statusCode: 401,
        body: '',
      }));

      try {
        await (new ResponseHelper(req, res, config)).fetch(req, { url: 'http://localhost', method: 'GET' });
      } catch (err) {} // eslint-disable-line no-empty

      expect(req.getProxyTicket).to.be.calledTwice;
    });
  });
});
