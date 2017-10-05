/* eslint-env mocha */
/* eslint import/no-extraneous-dependencies: 0 */
import 'babel-polyfill';
import { expect } from 'chai';

import {
  getAttributes,
  getUser,
} from '../auth';

describe('server/lib/auth', () => {
  describe('getAttributes', () => {
    it('should return an empty object if no proper request is given as argument', () => {
      const user = getAttributes();
      expect(user).to.be.deep.equal({});
    });

    it('should return the value of `session.cas.attributes` of the request argument', () => {
      const req = {
        session: {
          cas: {
            attributes: {
              myAttribute: 'My slim figure',
              myAttributes: ['test'],
              myOtherAttributes: ['test1', 'test2'],
            },
          },
        },
      };
      const attributes = {
        myAttribute: 'My slim figure',
        myAttributes: 'test',
        myOtherAttributes: ['test1', 'test2'],
      };
      const user = getAttributes(req);
      expect(user).to.be.deep.equal(attributes);
    });
  });

  describe('getUser', () => {
    it('should return an empty object if no proper request is given as argument', () => {
      const user = getUser();
      expect(user).to.be.deep.equal({});
    });

    it('should return the value of `session.cas.user` of the request argument', () => {
      const req = {
        session: {
          cas: {
            user: 'My Homy!',
          },
        },
      };
      const user = getUser(req);
      expect(user).to.be.equal(req.session.cas.user);
    });
  });
});
