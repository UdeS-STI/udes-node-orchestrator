/* eslint-env mocha */
/* eslint no-unused-expressions: 0, standard/no-callback-literal: 0 */
import 'babel-polyfill'
import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import * as HTTP from '../../dependencies/request'
import { getRange, ResponseHelper } from '../ResponseHelper'

chai.use(sinonChai)

let req
const res = {
  send: sinon.spy(),
  set: sinon.spy(),
  status: sinon.spy(() => res),
}
const config = {
  cas: {
    targetService: 'targetService',
  },
  customHeaders: [
    { header: 'foo-count', property: 'count' },
    { header: 'foo-messages', property: 'messages' },
  ],
  log: {},
  apiUrl: 'https://exemple.com',
  sessionUrl: 'https://exemple.com/session',
  debug: true,
}

describe('server/lib/ResponseHelper', () => {
  before(() => {
    sinon.stub(HTTP, 'request')
  })

  beforeEach(() => {
    HTTP.request.reset()
    res.send.reset()
    res.set.reset()
    res.status.reset()

    req = {
      headers: {
        'Content-Type': 'application/json',
      },
      log: {
        debug () {},
        error () {},
        info () {},
        warn () {},
      },
      session: {
        cas: {
          user: 'user',
        },
        apiSessionId: 'apiSessionId',
      },
      url: 'http://exemple.com',
    }
  })

  after(() => {
    HTTP.request.restore()
  })

  describe('constructor', () => {
    it('should set it\'s req property correctly', () => {
      const responseHelper = new ResponseHelper(req, res, config)
      expect(responseHelper.req).to.be.equal(req)
    })

    it('should set it\'s res property correctly', () => {
      const responseHelper = new ResponseHelper(req, res, config)
      expect(responseHelper.res).to.be.equal(res)
    })

    it('should set it\'s config property correctly', () => {
      const responseHelper = new ResponseHelper(req, res, config)
      expect(responseHelper.config).to.be.equal(config)
    })

    it('should match property list', () => {
      const responseHelper = new ResponseHelper(req, res, config)
      const properties = [
        'appendAuthOptions', 'formatRequestOptions', 'getResponseMetaData', 'getResponseData',
        'fetch', 'getFile', 'getQueryParameters', 'getRequestParameters', 'handleError',
        'handleResponse', 'formatResponse', 'req', 'res', 'config',
      ]

      expect(Object.keys(responseHelper)).to.be.deep.equal(properties)
    })
  })

  describe('getRange', () => {
    it('should return null if no range is set', () => {
      const range = getRange(req, {})
      expect(range).to.be.null
    })

    it('should return correct range from headers', () => {
      req.headers.range = 'bytes=1-3'
      const range = getRange(req, {})
      expect(range).to.be.deep.equal({ unit: 'bytes', start: 1, end: 3 })
    })

    it('should return correct range from query params', () => {
      req.url += '?range=bytes1-3'
      const responseHelper = new ResponseHelper(req, res, config)
      const range = getRange(req, responseHelper.getQueryParameters())
      expect(range).to.be.deep.equal({ unit: 'bytes', start: 1, end: 3 })
    })
  })

  describe('getQueryParamters', () => {
    it('should return query string parameters from url', () => {
      req.url += '?param1=value1&param2=value2'
      const responseHelper = new ResponseHelper(req, res, config)
      const params = responseHelper.getQueryParameters()
      expect(params).to.be.deep.equal({
        param1: 'value1',
        param2: 'value2',
      })
    })
  })

  describe('getRequestParameters', () => {
    it('should return query string parameters from url and data from request body', () => {
      req.url += '?param1=value1&param2=value2'
      req.body = { param3: 'value3' }
      const responseHelper = new ResponseHelper(req, res, config)
      const params = responseHelper.getRequestParameters()
      expect(params).to.be.deep.equal({
        param1: 'value1',
        param2: 'value2',
        param3: 'value3',
      })
    })
  })

  describe('handleResponse', () => {
    it('should call `res.send` with response data and a 200 status code', () => {
      const data = { hello: { jp: 'おはよう' } }
      const responseHelper = new ResponseHelper(req, res, config)
      responseHelper.handleResponse(data)
      expect(res.status).to.be.calledWith(200)
      expect(res.send).to.be.calledWith(data)
    })

    it('should call `res.send` with unformatted response data and a 200 status code when the formatData flag is false', () => {
      const data = { hello: { jp: 'おはよう' } }
      const responseHelper = new ResponseHelper(req, res, config)
      responseHelper.handleResponse(data, { formatData: false })
      expect(res.status).to.be.calledWith(200)
      expect(res.send).to.be.calledWith(data)
    })

    it('should call `res.send` with partial response data and a 206 status code when a valid range is sent', () => {
      req.headers.range = 'index=1-2'
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] }
      const responseHelper = new ResponseHelper(req, res, config)
      responseHelper.handleResponse(data)
      expect(res.status).to.be.calledWith(206)
      expect(res.send).to.be.calledWith({ data: ['世界', 'フ'] })
    })

    it('should call `res.send` with partial unformatted response data and a 206 status code when a valid range is sent and the formatData flag is false', () => {
      req.headers.range = 'index=1-2'
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] }
      const responseHelper = new ResponseHelper(req, res, config)
      responseHelper.handleResponse(data, { formatData: false })
      expect(res.status).to.be.calledWith(206)
      expect(res.send).to.be.calledWith({ data: ['世界', 'フ'] })
    })

    it('should call `res.send` with error and a 416 status code when a invalid range is sent', () => {
      req.headers.range = 'index=0-6'
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] }
      const responseHelper = new ResponseHelper(req, res, config)
      responseHelper.handleResponse(data)
      expect(res.status).to.be.calledWith(200)
    })

    it('should call `res.send` with data and a 200 status code when range represents entire response data', () => {
      req.headers.range = 'index=0-3'
      const data = { data: ['おはよう', '世界', 'フ', 'バ'] }
      const responseHelper = new ResponseHelper(req, res, config)
      responseHelper.handleResponse(data)
      expect(res.status).to.be.calledWith(200)
      expect(res.send).to.be.calledWith(data)
    })
  })

  describe('handleError', () => {
    it('should call `res` with correct status code and message when they are set', () => {
      const error = { statusCode: 404, message: 'Page not found' };
      (new ResponseHelper(req, res, config)).handleError(error)
      expect(res.status).to.be.calledWith(error.statusCode)
      expect(res.send).to.be.calledWith(error.message)
    })

    it('should call `res` with default status code when not set', () => {
      const error = { message: 'Error' };
      (new ResponseHelper(req, res, config)).handleError(error)
      expect(res.status).to.be.calledWith(500)
    })

    it('should call `res` with default status code and error when error is a string', () => {
      const error = 'Erorr';
      (new ResponseHelper(req, res, config)).handleError(error)
      expect(res.status).to.be.calledWith(500)
      expect(res.send).to.be.calledWith(error)
    })
  })

  describe('getFile', () => {
    it('should call request\'s `get` and `pipe` methods if there is no error', async () => {
      const pipe = sinon.spy()
      HTTP.request.get = sinon.spy(() => ({ pipe }))

      const responseHelper = new ResponseHelper(req, res, config)
      responseHelper.formatRequestOptions = () => ({ headers: {} })
      await responseHelper.getFile({})

      expect(HTTP.request.get).to.be.called
      expect(pipe).to.be.calledWith(res)
    })
  })

  describe('fetch', () => {
    it('should throw an error if error is returned in callback', async () => {
      HTTP.request.callsFake((options, cb) => cb('error'))
      let error

      try {
        const responseHelper = new ResponseHelper(req, res, config)
        responseHelper.formatRequestOptions = () => {}
        await responseHelper.fetch({})
      } catch (err) {
        error = err
      }

      expect(error).to.be.deep.equal({ statusCode: 500, message: 'error' })
    })

    it('should call `request` if the callback does not return an error', async () => {
      const response = {
        statusCode: 200,
        body: '{}',
        headers: {
          'foo-messages': '',
        },
      }
      HTTP.request.callsFake((options, cb) => cb(null, response))

      try {
        const responseHelper = new ResponseHelper(req, res, config)
        responseHelper.formatRequestOptions = () => {}
        await responseHelper.fetch({ url: 'http://localhost', method: 'GET' })
      } catch (err) {}    // eslint-disable-line

      expect(HTTP.request).to.be.called
    })

    it('should return an Object when response is a JSON string', async () => {
      let response
      const data = { body: 'My beautiful body' }
      HTTP.request.callsFake((options, cb) => cb(null, {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
          'foo-count': '1',
          'foo-messages': 'message',
        },
      }))

      try {
        const responseHelper = new ResponseHelper(req, res, config)
        responseHelper.formatRequestOptions = () => {}
        response = await responseHelper.fetch({ url: 'http://localhost', method: 'GET' })
      } catch (err) {}    // eslint-disable-line

      expect(response).to.be.deep.equal({
        ...data,
        meta: {
          count: '1',
          debug: {
            'x-TempsMs': response.meta.debug['x-TempsMs'],
          },
          messages: 'message',
          status: 200,
        },
      })
    })

    it('should return a String when response is a JSON string', async () => {
      let response
      const data = 'My beautiful body'
      HTTP.request.callsFake((options, cb) => cb(null, {
        statusCode: 200,
        body: data,
        headers: {
          'foo-count': '1',
          'foo-messages': 'message',
        },
      }))

      try {
        const responseHelper = new ResponseHelper(req, res, config)
        responseHelper.formatRequestOptions = () => {}
        response = await responseHelper.fetch({ url: 'http://localhost', method: 'GET' })
      } catch (err) {}    // eslint-disable-line

      expect(response).to.be.deep.equal({
        data,
        meta: {
          count: '1',
          debug: {
            'x-TempsMs': response.meta.debug['x-TempsMs'],
          },
          messages: 'message',
          status: 200,
        },
      })
    })

    it('should return an error when response is an error', async () => {
      let error
      HTTP.request.callsFake((options, cb) => cb('error'))

      try {
        const responseHelper = new ResponseHelper(req, res, config)
        responseHelper.formatRequestOptions = () => {}
        await responseHelper.fetch({ url: 'http://localhost', method: 'GET' })
      } catch (err) {
        error = err
      }

      expect(error).to.be.deep.equal({ statusCode: 500, message: 'error' })
    })

    it('should return an error when response status code is not 2XX', async () => {
      let error
      const response = {
        statusCode: 500,
        body: 'Internal server error',
        headers: {},
      }
      HTTP.request.callsFake((options, cb) => cb(null, response))

      try {
        const responseHelper = new ResponseHelper(req, res, config)
        responseHelper.formatRequestOptions = () => {}
        await responseHelper.fetch({ url: 'http://localhost', method: 'GET' })
      } catch (err) {
        error = err
      }

      expect(error).to.be.deep.equal({
        statusCode: response.statusCode,
        message: response.body,
      })
    })
  })
})
