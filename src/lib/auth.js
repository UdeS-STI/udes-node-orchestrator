import { request } from '../dependencies/request';
import RequestError from './RequestError';
import Utils from './Utils';

const { getHeaders } = Utils;

/**
 * Get current user information from CAS.
 * @private
 * @param {Object} [req] - HTTP request.
 * @returns {Object} User.
 */
export const getUser = (req) => {
  if (req && req.session && req.session.cas && req.session.cas.user) {
    return req.session.cas.user;
  }

  return {};
};

/**
 * Get CAS attributes.
 * @private
 * @param {Object} req - HTTP request.
 * @returns {Object} Attributes.
 */
export const getAttributes = (req) => {
  if (req && req.session && req.session.cas && req.session.cas.attributes) {
    const { attributes } = req.session.cas;
    return Object.keys(attributes).reduce((acc, key) => {
      const accumulation = acc;
      const attribute = attributes[key];
      const getValue = Array.isArray(attribute) && attribute.length === 1;

      accumulation[key] = getValue ? attribute[0] : attribute;

      return accumulation;
    }, {});
  }

  return {};
};

/**
 * Obtain proxy ticket for CAS authentication.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} renew=false - True to renew proxy ticket.
 * @returns {Promise} Promise object represents proxy ticket.
 */
export const getProxyTicket = (req, config, renew = false) => new Promise((resolve, reject) => {
  const { targetService } = config.cas;
  req.getProxyTicket(targetService, { renew }, (err, pt) => {
    if (err) {
      return reject(err);
    }

    return resolve(pt);
  });
});

/**
 * Obtain session id from API.
 * @private
 * @param {Object} req - HTTP request.
 * @param {Config} config - Orchestrator configuration.
 * @param {Boolean} [retry=true] - True to update PT and retry getting session id from API.
 * @returns {Promise} Promise object represents session id.
 */
export const getSessionId = (req, config, retry = true) => new Promise(async (resolve, reject) => {
  let pt;

  try {
    pt = await getProxyTicket(req, config, !retry);
  } catch (error) {
    reject(error);
  }

  const options = {
    method: 'GET',
    url: `${config.sessionUrl}?ticket=${pt}`,
    headers: {
      ...getHeaders(),
      'x-proxy-ticket': pt,
    },
  };

  request(options, async (error, response) => {
    if (error || response.statusCode === 401) {
      if (retry) {
        try {
          resolve(await getSessionId(req, config, false));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new RequestError('Invalid proxy ticket', 401));
      }

      return;
    }

    try {
      const { sessionId } = JSON.parse(response.body);
      req.session.apiSessionId = sessionId;
      resolve(sessionId);
    } catch (err) {
      reject(new RequestError('Cannot get session id', 500));
    }
  });
});
