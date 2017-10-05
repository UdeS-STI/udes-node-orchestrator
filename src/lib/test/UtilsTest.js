/* eslint-env mocha */
/* eslint no-unused-expressions: 0, import/no-extraneous-dependencies: 0 */
import 'babel-polyfill';
import chai, { expect } from 'chai';
import chainInteger from 'chai-integer';

import Utils from '../Utils';

const {
  base64Decode,
  base64Encode,
  buildUrl,
  getUid,
} = Utils;

chai.use(chainInteger);

describe('server/lib/utils', () => {
  describe('base64Decode', () => {
    it('should decode given base64 encoded string', () => {
      const stringToDecode = 'R29kJ3Mgb2YgZGVhdGggbG92ZSBhcHBsZXM=';
      const decodedString = base64Decode(stringToDecode);
      expect(decodedString).to.be.equal('God\'s of death love apples');
    });
  });

  describe('base64Encode', () => {
    it('should encode given string to base64', () => {
      const stringToEncode = 'God\'s of death love apples';
      const encodedString = base64Encode(stringToEncode);
      expect(encodedString).to.be.equal('R29kJ3Mgb2YgZGVhdGggbG92ZSBhcHBsZXM=');
    });
  });

  describe('getUid', () => {
    it('should return uid of user starting the node process', () => {
      const userId = getUid();
      expect(userId).to.be.a.integer;
    });
  });

  describe('buildUrl', () => {
    it('should return an url with appended encoded query params', () => {
      const url = 'http://exemple.com';
      const params = {
        param1: 'value1',
        param2: 42,
        param3: ['email', 'phone', 'lang', 'name', 'sex'],
      };

      expect(buildUrl(url, params)).to.be.equal('http://exemple.com?param1=value1&param2=42&param3=email%2Cphone%2Clang%2Cname%2Csex');
    });

    it('should return an url with appended non-encoded query params', () => {
      const url = 'http://exemple.com';
      const params = {
        param1: 'value1',
        param2: 42,
        param3: '[email, phone, lang, name, sex]',
      };

      expect(buildUrl(url, params, false)).to.be.equal('http://exemple.com?param1=value1&param2=42&param3=[email, phone, lang, name, sex]');
    });
  });
});
