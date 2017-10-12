/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import 'babel-polyfill'
import chai, { expect } from 'chai'
import chainInteger from 'chai-integer'

import Utils from '../Utils'

const {
  base64Decode,
  base64Encode,
  buildUrl,
  getHeaders,
  getUid,
} = Utils

chai.use(chainInteger)

describe('server/lib/utils', () => {
  it('should match property list', () => {
    const properties = ['base64Decode', 'base64Encode', 'buildUrl', 'getHeaders', 'getUid']
    expect(Object.keys(Utils)).to.be.deep.equal(properties)
  })

  describe('base64Decode', () => {
    it('should decode given base64 encoded string', () => {
      const stringToDecode = 'R29kJ3Mgb2YgZGVhdGggbG92ZSBhcHBsZXM='
      const decodedString = base64Decode(stringToDecode)
      expect(decodedString).to.be.equal('God\'s of death love apples')
    })
  })

  describe('base64Encode', () => {
    it('should encode given string to base64', () => {
      const stringToEncode = 'God\'s of death love apples'
      const encodedString = base64Encode(stringToEncode)
      expect(encodedString).to.be.equal('R29kJ3Mgb2YgZGVhdGggbG92ZSBhcHBsZXM=')
    })
  })

  describe('getUid', () => {
    it('should return uid of user starting the node process', () => {
      const userId = getUid()
      expect(userId).to.be.a.integer
    })
  })

  describe('buildUrl', () => {
    it('should return an url with appended encoded query params', () => {
      const url = 'http://exemple.com'
      const params = {
        param1: 'value1',
        param2: 42,
        param3: ['email', 'phone', 'lang', 'name', 'sex'],
      }

      expect(buildUrl(url, params)).to.be.equal('http://exemple.com?param1=value1&param2=42&param3=email%2Cphone%2Clang%2Cname%2Csex')
    })

    it('should return an url with appended non-encoded query params', () => {
      const url = 'http://exemple.com'
      const params = {
        param1: 'value1',
        param2: 42,
        param3: '[email, phone, lang, name, sex]',
      }

      expect(buildUrl(url, params, false)).to.be.equal('http://exemple.com?param1=value1&param2=42&param3=[email, phone, lang, name, sex]')
    })
  })

  describe('getHeaders', () => {
    it('should return JSON headers if no type is specified', () => {
      expect(getHeaders()).to.be.deep.equal({
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json; charset=utf-8',
      })
    })

    it('should return JSON headers if JSON type is specified', () => {
      expect(getHeaders('JSON')).to.be.deep.equal({
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json; charset=utf-8',
      })
    })

    it('should return CSV headers if CSV type is specified', () => {
      expect(getHeaders('CSV')).to.be.deep.equal({
        'Content-Type': 'text/csv; charset=utf-8',
        Accept: 'application/json; charset=utf-8',
      })
    })

    it('should return PDF headers if PDF type is specified', () => {
      expect(getHeaders('PDF', { filename: 'myFilename' })).to.be.deep.equal({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=myFilename.pdf',
      })
    })
  })
})
