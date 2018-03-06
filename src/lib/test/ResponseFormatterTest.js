/* eslint-env mocha */
/* eslint require-jsdoc: 0 */
import { expect } from 'chai';
import ResponseFormatter from '../ResponseFormatter';

describe('lib/ResponseFormatter', () => {
  describe('constructor', () => {
    it('should throw error if trying to instantiate directly', () => {
      expect(() => new ResponseFormatter()).to.throw(Error);
    });

    it('should throw error if class extends interface without `format` method', () => {
      class Plugin extends ResponseFormatter {}
      expect(() => new Plugin()).to.throw(Error);
    });

    it('should not throw error if class extends interface with `format` method', () => {
      class Plugin extends ResponseFormatter {
        format() {}
      }
      expect(() => new Plugin()).to.not.throw();
    });
  });
});
