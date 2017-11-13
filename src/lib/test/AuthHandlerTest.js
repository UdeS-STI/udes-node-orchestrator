/* eslint-env mocha */
/* eslint require-jsdoc: 0 */
import { expect } from 'chai'
import AuthHandler from '../AuthHandler'

describe('lib/AuthHandler', () => {
  describe('constructor', () => {
    it('should throw error if trying to instantiate directly', () => {
      expect(() => new AuthHandler()).to.throw(Error)
    })

    it('should throw error if class extends interface without `authenticate` method', () => {
      class Plugin extends AuthHandler {}
      expect(() => new Plugin()).to.throw(Error)
    })

    it('should not throw error if class extends interface with `authenticate` method', () => {
      class Plugin extends AuthHandler {
        authenticate () {}
      }
      expect(() => new Plugin()).to.not.throw()
    })
  })
})
